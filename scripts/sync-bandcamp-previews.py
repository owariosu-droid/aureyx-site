"""Publish bounded local Bandcamp excerpts; never persist expiring stream URLs."""
import argparse
import hashlib
from html.parser import HTMLParser
from http.client import IncompleteRead
import json
import math
from pathlib import Path
import re
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parents[1]
PAGE_HOSTS = {"dystofuturemusic.bandcamp.com", "lyrlvst.bandcamp.com"}
STREAM_HOSTS = {f"t{number}.bcbits.com" for number in range(1, 10)}
MAX_PAGE_BYTES = 8 * 1024 * 1024
MAX_STREAM_BYTES = 1024 * 1024
MAX_CLIP_BYTES = 1024 * 1024
MAX_SECONDS = 30.0
USER_AGENT = "Aureyx-site-preview-sync/1.0"


def validate_url(url, stream=False):
    parsed = urlparse(url)
    hosts = STREAM_HOSTS if stream else PAGE_HOSTS
    if (parsed.scheme != "https" or parsed.hostname not in hosts or parsed.username
            or parsed.password or parsed.port not in {None, 443}):
        raise ValueError("Unexpected preview source")
    pattern = r"/stream/[a-zA-Z0-9/_-]+" if stream else r"/(album|track)/[a-z0-9-]+"
    if not re.fullmatch(pattern, parsed.path):
        raise ValueError("Unexpected preview source path")


class TrustedRedirects(HTTPRedirectHandler):
    def __init__(self, stream=False):
        super().__init__()
        self.stream = stream

    def redirect_request(self, request, fp, code, message, headers, new_url):
        validate_url(new_url, self.stream)
        return super().redirect_request(request, fp, code, message, headers, new_url)


def fetch(url, stream=False):
    """Streams are intentionally truncated; full recordings never enter public/."""
    validate_url(url, stream)
    cap = MAX_STREAM_BYTES if stream else MAX_PAGE_BYTES
    headers = {"User-Agent": USER_AGENT}
    if stream:
        headers["Range"] = f"bytes=0-{cap - 1}"
    for attempt in range(3):
        try:
            request = Request(url, headers=headers)
            with build_opener(TrustedRedirects(stream)).open(request, timeout=25) as response:
                if not stream:
                    length = response.headers.get("Content-Length")
                    if length and int(length) > cap:
                        raise ValueError("Preview page exceeds the size limit")
                data = response.read(cap if stream else cap + 1)
                if not data or len(data) > cap:
                    raise ValueError("Empty or oversized preview source")
                return data
        except HTTPError as error:
            if error.code not in {429, 500, 502, 503, 504} or attempt == 2:
                raise
        except (URLError, TimeoutError, socket.timeout, IncompleteRead):
            if attempt == 2:
                raise
        time.sleep(2 ** attempt)


class ReleasePage(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.data = None
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "data-tralbum" in attrs:
            self.data = json.loads(attrs["data-tralbum"])


def clip_name(release):
    identity = json.dumps([release["link"], release["type"], release["id"], release["image"]], separators=(",", ":"))
    return "bandcamp-" + hashlib.sha256(identity.encode()).hexdigest()[:24] + ".m4a"


def probe(path, excerpt=False):
    if path.is_symlink() or not path.is_file() or path.stat().st_size == 0:
        raise ValueError("Missing audio file")
    if excerpt and path.stat().st_size > MAX_CLIP_BYTES:
        raise ValueError("Excerpt exceeds the size limit")
    process = subprocess.run([
        "ffprobe", "-v", "error", "-protocol_whitelist", "file,pipe", "-show_entries",
        "format=duration,format_name:stream=codec_type,codec_name,duration", "-of", "json", str(path),
    ], check=True, capture_output=True, text=True, timeout=20)
    info = json.loads(process.stdout)
    duration = float(info.get("format", {}).get("duration", 0))
    streams = info.get("streams", [])
    if not math.isfinite(duration) or duration <= 0 or not any(row.get("codec_type") == "audio" for row in streams):
        raise ValueError("Invalid audio duration or stream")
    if excerpt:
        stream_durations = [float(row.get("duration", duration)) for row in streams]
        if (duration > MAX_SECONDS or len(streams) != 1 or streams[0].get("codec_name") != "aac"
                or streams[0].get("codec_type") != "audio" or "m4a" not in info["format"].get("format_name", "")
                or any(not math.isfinite(value) or value > MAX_SECONDS for value in stream_durations)):
            raise ValueError("File is not a bounded AAC excerpt")
    return duration


def transcode(source, output, seconds=MAX_SECONDS):
    # Leave room for AAC padding so the validated file never exceeds 30 seconds.
    limit = min(MAX_SECONDS - .1, seconds)
    if not math.isfinite(limit) or limit <= 0:
        raise ValueError("Invalid excerpt length")
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
        "-protocol_whitelist", "file,pipe", "-i", str(source), "-t", str(limit),
        "-map", "0:a:0", "-vn", "-map_metadata", "-1", "-c:a", "aac", "-b:a", "96k",
        "-ac", "2", "-ar", "44100", "-fs", str(MAX_CLIP_BYTES), "-movflags", "+faststart", str(output),
    ], check=True, capture_output=True, timeout=40)
    return probe(output, excerpt=True)


def saved_clip(entry):
    if not isinstance(entry, dict):
        return None
    src = entry.get("src", "")
    if not isinstance(src, str) or not re.fullmatch(r"/previews/bandcamp/bandcamp-[a-f0-9]{24}\.m4a", src):
        return None
    path = ROOT / "public" / src.lstrip("/")
    try:
        duration = probe(path, excerpt=True)
        return {"src": src, "duration": round(duration, 3)}
    except (ValueError, OSError, subprocess.SubprocessError):
        return None


def source_track(release):
    page = ReleasePage(fetch(release["link"]).decode())
    data = page.data
    if not isinstance(data, dict) or data.get("id") != release["id"] or data.get("item_type") != release["type"]:
        raise ValueError("Release identity changed")
    for row in data.get("trackinfo", []):
        stream = (row.get("file") or {}).get("mp3-128")
        duration = row.get("duration")
        if stream and isinstance(duration, (int, float)) and math.isfinite(duration) and duration > 0:
            validate_url(stream, stream=True)
            # Very short tracks still receive only an excerpt, never a full copy.
            return stream, min(MAX_SECONDS - .1, duration / 2)
    raise ValueError("No public preview stream")


def generate_clip(release, existing, refresh=False):
    name = clip_name(release)
    src = f"/previews/bandcamp/{name}"
    cached = saved_clip(existing)
    if not refresh and cached and cached["src"] == src:
        return cached, "cached"
    target = ROOT / "public/previews/bandcamp" / name
    with tempfile.TemporaryDirectory(prefix="aureyx-preview-") as directory:
        temporary = Path(directory)
        # Existing Aureyx excerpts use this catalog's original slug namespace.
        legacy = None
        if not refresh and urlparse(release["link"]).hostname == "dystofuturemusic.bandcamp.com":
            slug = urlparse(release["link"]).path.rsplit("/", 1)[-1]
            candidate = ROOT / "public/previews" / f"{slug}.m4a"
            try:
                probe(candidate)
                legacy = candidate
            except (ValueError, OSError, subprocess.SubprocessError):
                pass
        if legacy:
            source, seconds = legacy, MAX_SECONDS
        else:
            stream, seconds = source_track(release)
            source = temporary / "source.mp3"
            source.write_bytes(fetch(stream, stream=True))
        output = temporary / "excerpt.m4a"
        duration = transcode(source, output, seconds)
        target.parent.mkdir(parents=True, exist_ok=True)
        # Only the verified short clip is copied into public/, then atomically exposed.
        staging = target.with_suffix(".tmp")
        staging.write_bytes(output.read_bytes())
        staging.replace(target)
    return {"src": src, "duration": round(duration, 3)}, "generated"


def sync(refresh=False):
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("ffmpeg and ffprobe are required")
    releases = []
    for source in ["bandcamp", "lyrlvst-bandcamp"]:
        releases.extend(json.loads((ROOT / f"data/external/{source}.json").read_text()))
    if not releases or len({row["link"] for row in releases}) != len(releases):
        raise ValueError("Unexpected or duplicate Bandcamp catalog")
    for release in releases:
        validate_url(release["link"])
    manifest_path = ROOT / "data/external/bandcamp-previews.json"
    previous = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    manifest, failed = {}, []
    counts = {"generated": 0, "cached": 0, "retained": 0}
    for release in releases:
        link = release["link"]
        try:
            entry, status = generate_clip(release, previous.get(link), refresh=refresh)
            manifest[link] = entry
            counts[status] += 1
        except Exception as error:
            failed.append(link)
            cached = saved_clip(previous.get(link))
            if cached:
                manifest[link] = cached
                counts["retained"] += 1
            # Never log an exception message: upstream errors can contain signed URLs.
            print(f"Bandcamp excerpt unavailable for {release['title']} ({type(error).__name__}); "
                  + ("retaining verified clip" if cached else "full release link remains available"), file=sys.stderr)
    # Invalid cached entries must not survive when every source is unavailable.
    staging = manifest_path.with_suffix(".tmp")
    staging.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    staging.replace(manifest_path)
    print(f"Bandcamp excerpts: {len(manifest)}/{len(releases)} available; "
          f"{counts['generated']} generated, {counts['cached']} cached, {counts['retained']} retained")
    return 1 if failed else 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="Rebuild from current streams, including tracks edited without new artwork or URLs")
    args = parser.parse_args()
    try:
        sys.exit(sync(refresh=args.refresh))
    except Exception as error:
        print(f"Bandcamp excerpt sync failed ({type(error).__name__}); keeping saved excerpts", file=sys.stderr)
        sys.exit(1)
