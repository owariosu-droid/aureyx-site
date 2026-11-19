"""Refresh public source snapshots without credentials or expiring stream URLs."""
import argparse
from http.client import IncompleteRead
import socket
import time
from concurrent.futures import ThreadPoolExecutor
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse
from urllib.request import Request, HTTPRedirectHandler, build_opener
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
BANDCAMP = "https://dystofuturemusic.bandcamp.com"
PROFILE = "https://osu.ppy.sh/users/37255712"
TRUSTED_HOSTS = {"dystofuturemusic.bandcamp.com", "f4.bcbits.com", "osu.ppy.sh", "a.ppy.sh", "i.ppy.sh", "assets.ppy.sh"}
MAX_HTML_BYTES = 8 * 1024 * 1024
MAX_IMAGE_BYTES = 12 * 1024 * 1024


def validate_url(url):
    parsed = urlparse(url)
    if (parsed.scheme != "https" or parsed.hostname not in TRUSTED_HOSTS
            or parsed.username or parsed.password or parsed.port not in {None, 443}):
        raise ValueError("Unexpected upstream URL or redirect")


class TrustedRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, new_url):
        validate_url(new_url)
        return super().redirect_request(request, fp, code, message, headers, new_url)


def fetch(url, max_bytes=MAX_HTML_BYTES):
    validate_url(url)
    request = Request(url, headers={"User-Agent": "Aureyx-site-content-sync/1.0"})
    # urllib's default HTTPS handler still verifies certificates and hostnames.
    for attempt in range(3):
        try:
            with build_opener(TrustedRedirects()).open(request, timeout=30) as response:
                length = response.headers.get("Content-Length")
                if length and int(length) > max_bytes:
                    raise ValueError("Upstream response exceeds the size limit")
                data = response.read(max_bytes + 1)
                if len(data) > max_bytes:
                    raise ValueError("Upstream response exceeds the size limit")
                return data
        except HTTPError as error:
            if error.code not in {429, 500, 502, 503, 504} or attempt == 2:
                raise
        except (URLError, TimeoutError, socket.timeout, IncompleteRead):
            if attempt == 2:
                raise
        time.sleep(2 ** attempt)


class Attributes(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.items = []
        self.title = []
        self.in_title = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.items.append(dict(attrs))
        if tag == "title":
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title.append(data)

    def json(self, key):
        for attrs in self.items:
            if key in attrs:
                return json.loads(attrs[key])
        title = " ".join("".join(self.title).split())[:100]
        raise ValueError(f"Source does not contain {key} (page title: {title!r}); keeping the saved snapshot")


def write_json(name, value):
    path = ROOT / "data" / "external" / f"{name}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    temporary = path.with_suffix(".tmp")
    temporary.write_text(content)
    temporary.replace(path)


def image(url, name, assets):
    if not re.fullmatch(r"[a-zA-Z0-9_.-]{1,120}", name) or name in {".", ".."}:
        raise ValueError("Unexpected image filename")
    parsed = urlparse(url)
    validate_url(url)
    if parsed.hostname not in {"f4.bcbits.com", "a.ppy.sh", "i.ppy.sh", "assets.ppy.sh"}:
        raise ValueError("Unexpected image host")
    data = fetch(url, max_bytes=MAX_IMAGE_BYTES)
    if not (data.startswith(b"\xff\xd8\xff") or data.startswith(b"\x89PNG\r\n\x1a\n") or data.startswith(b"RIFF") or data.startswith(b"GIF8")):
        raise ValueError("Source returned an invalid image")
    assets[name] = data
    return f"/external/{name}"


def save_assets(assets):
    directory = ROOT / "public" / "external"
    directory.mkdir(parents=True, exist_ok=True)
    for name, data in assets.items():
        path = directory / name
        temporary = path.with_suffix(".tmp")
        temporary.write_bytes(data)
        temporary.replace(path)


def price(current, currency):
    if current.get("download_pref") == 1:
        return "Free download"
    if current.get("download_pref") != 2:
        return "Listen on Bandcamp"
    amount = current.get("set_price") if current.get("is_set_price") else current.get("minimum_price")
    if amount is None:
        return "View price on Bandcamp"
    if amount == 0:
        return "Name your price"
    prefix = "$" if currency == "USD" else f"{currency} "
    return f"{prefix}{amount:.2f}"


def sync_bandcamp():
    html = fetch(f"{BANDCAMP}/music").decode()
    items = Attributes(html).json("data-client-items")
    if not isinstance(items, list) or not items:
        raise ValueError("Empty catalog; keeping the saved snapshot")
    assets = {}

    def release(item):
        path = item["page_url"]
        if not re.fullmatch(r"/(album|track)/[a-z0-9-]+", path):
            raise ValueError("Unexpected release URL")
        url = BANDCAMP + path
        page = Attributes(fetch(url).decode())
        data = page.json("data-tralbum")
        current = data["current"]
        if data["item_type"] != item["type"] or data["id"] != item["id"]:
            raise ValueError("Release identity changed during sync")
        currency = next((a["data-band-currency"] for a in page.items if "data-band-currency" in a), "USD")
        art = image(f"https://f4.bcbits.com/img/a{item['art_id']}_16.jpg", f"bandcamp-{item['art_id']}.jpg", assets)
        return {"title": current["title"], "link": url, "image": art,
                "price": price(current, currency), "id": item["id"], "type": item["type"],
                "released": current.get("release_date"),
                "preview": f"/previews/{path.rsplit('/', 1)[-1]}.m4a" if (ROOT / "public" / "previews" / f"{path.rsplit('/', 1)[-1]}.m4a").is_file() else None}

    # Preserve Bandcamp's ordering and publish only after every release succeeds.
    with ThreadPoolExecutor(max_workers=4) as pool:
        releases = list(pool.map(release, items))
    if len({r["link"] for r in releases}) != len(releases):
        raise ValueError("Duplicate release URLs")
    save_assets(assets)
    write_json("bandcamp", releases)
    print(f"Bandcamp: refreshed {len(releases)} releases")


MAP_ARTWORK = {
    "Cynthoni of Flames": ("/osu/cynthoni-art.jpg", "2575406"),
    "Death of the Endless": ("/osu/deathoftheendless.png", None),
    "Dork After Dark": ("/osu/dork-after-dark.png", None),
}


class ProfileHTML(HTMLParser):
    """Allow a small formatting subset; never persist source scripts or styles."""
    tags = {"div", "p", "br", "h2", "h3", "strong", "em", "ul", "ol", "li", "span"}

    def __init__(self, assets):
        super().__init__()
        self.output = []
        self.assets = assets
        self.blocked = 0
        self.image_count = 0
        self.anchors = []
        self.beatmap_covers = set()
        self.artwork_shown = set()

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "iframe"}:
            self.blocked += 1
        if self.blocked:
            return
        attrs = dict(attrs)
        if tag in self.tags:
            self.output.append(f"<{tag}>")
        elif tag == "a":
            url = attrs.get("href", "")
            parsed = urlparse(url)
            if parsed.scheme == "https" and parsed.hostname and not parsed.username:
                match = re.fullmatch(r"/beatmapsets/([1-9][0-9]{0,9})", parsed.path)
                if parsed.hostname == "osu.ppy.sh" and match and match[1] not in self.beatmap_covers:
                    self.beatmap_covers.add(match[1])
                    name = f"osu-map-{match[1]}.jpg"
                    selected = next(((title, path) for title, (path, map_id) in MAP_ARTWORK.items() if map_id == match[1]), None)
                    try:
                        local = selected[1] if selected else image(f"https://assets.ppy.sh/beatmaps/{match[1]}/covers/cover.jpg", name, self.assets)
                    except (HTTPError, URLError, OSError, ValueError) as error:
                        print(f"osu!: cover for map {match[1]} unavailable ({type(error).__name__}); keeping map text", file=sys.stderr)
                        local = f"/external/{name}" if (ROOT / "public" / "external" / name).is_file() else None
                    if local:
                        artwork_class = "osu-map-cover osu-map-artwork" if selected else "osu-map-cover"
                        label = f"{selected[0]} mapping artwork" if selected else "osu! beatmap cover"
                        if selected:
                            self.artwork_shown.add(selected[0])
                        self.output.append(f'<a href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer"><img class="{artwork_class}" src="{local}" alt="{escape(label, quote=True)}" loading="lazy" /></a>')
                self.output.append(f'<a href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer">')
                self.anchors.append("a")
            else:
                self.output.append("<span>")
                self.anchors.append("span")
        elif tag == "img":
            self.image_count += 1
            # Name by source URL so refreshed screenshots do not reuse a cached URL.
            import hashlib
            source = attrs.get("src", "")
            name = "osu-" + hashlib.sha256(source.encode()).hexdigest()[:16] + ".jpg"
            try:
                local = image(source, name, self.assets)
            except HTTPError as error:
                if error.code not in {404, 410}:
                    raise
                self.output.append("<p>This screenshot is no longer available on osu!.</p>")
                print("osu!: source screenshot expired; profile text is still refreshed", file=sys.stderr)
                return
            self.output.append(f'<img src="{local}" alt="osu! profile score screenshot" loading="lazy" />')

    def handle_endtag(self, tag):
        if tag in {"script", "style", "iframe"}:
            self.blocked = max(0, self.blocked - 1)
            return
        if self.blocked:
            return
        if tag in self.tags - {"br"}:
            self.output.append(f"</{tag}>")
        elif tag == "a":
            if self.anchors:
                self.output.append(f"</{self.anchors.pop()}>")

    def handle_data(self, data):
        if not self.blocked:
            title = data.strip()
            if title in MAP_ARTWORK and title not in self.artwork_shown:
                self.artwork_shown.add(title)
                path = MAP_ARTWORK[title][0]
                self.output.append(f'<img class="osu-map-cover osu-map-artwork" src="{path}" alt="{escape(title, quote=True)} mapping artwork" loading="lazy" />')
            self.output.append(escape(data))


def normalize_osu_score(score):
    """Keep only display fields; derive trusted links from numeric IDs."""
    import math
    if score.get("user_id") != 37255712 or score.get("ruleset_id") != 0:
        raise ValueError("Unexpected osu! score owner or ruleset")
    beatmap, beatmapset = score["beatmap"], score["beatmapset"]
    ids = [score["id"], beatmap["id"], beatmapset["id"]]
    if any(type(value) is not int or value <= 0 for value in ids):
        raise ValueError("Invalid osu! score IDs")
    accuracy = float(score["accuracy"])
    pp = None if score.get("pp") is None else float(score["pp"])
    if not math.isfinite(accuracy) or not 0 <= accuracy <= 1 or (pp is not None and (not math.isfinite(pp) or pp < 0)):
        raise ValueError("Invalid osu! score statistics")
    mods = []
    for mod in score.get("mods", []):
        acronym = mod["acronym"]
        if not re.fullmatch(r"[A-Z0-9]{1,8}", acronym):
            raise ValueError("Invalid osu! mod acronym")
        mods.append({"acronym": acronym, "settings": mod.get("settings", {})})
    return {"id": ids[0], "beatmapId": ids[1], "beatmapsetId": ids[2],
            "title": str(beatmapset["title"])[:300], "artist": str(beatmapset["artist"])[:300],
            "difficulty": str(beatmap["version"])[:300], "rank": str(score["rank"])[:3],
            "accuracy": accuracy, "pp": pp, "combo": int(score["max_combo"]),
            "misses": int(score.get("statistics", {}).get("miss", 0)),
            "playedAt": score["ended_at"], "mods": mods}


def sync_osu_scores():
    # Fetch both lists before replacing the last verified snapshot.
    lists = {}
    for kind, limit in [("best", 10), ("pinned", 100)]:
        rows = json.loads(fetch(f"{PROFILE}/scores/{kind}?mode=osu&limit={limit}").decode())
        if not isinstance(rows, list) or (kind == "best" and not rows):
            raise ValueError("Unexpected osu! scores response; retaining saved scores")
        lists[kind] = [normalize_osu_score(row) for row in rows]
    assets = {}
    for score in lists["best"] + lists["pinned"]:
        name = f"osu-score-map-{score['beatmapsetId']}.jpg"
        try:
            if name not in assets:
                image(f"https://assets.ppy.sh/beatmaps/{score['beatmapsetId']}/covers/card@2x.jpg", name, assets)
            score["cover"] = f"/external/{name}"
        except Exception as error:
            print(f"osu!: score artwork unavailable ({type(error).__name__})", file=sys.stderr)
            saved = ROOT / "public" / "external" / name
            score["cover"] = f"/external/{name}" if saved.exists() else ""
    save_assets(assets)
    write_json("osu-scores", {"userId": 37255712, "best": lists["best"], "pinned": lists["pinned"]})
    print(f"osu!: refreshed {len(lists['best'])} top and {len(lists['pinned'])} pinned scores")


def sync_osu():
    data = Attributes(fetch(PROFILE).decode()).json("data-initial-data")
    user = data["user"]
    if user["id"] != 37255712 or not user.get("username") or not user.get("page", {}).get("html"):
        raise ValueError("Unexpected or empty osu! profile; keeping the saved snapshot")
    assets = {}
    parser = ProfileHTML(assets)
    parser.feed(user["page"]["html"])
    avatar_name = "osu-avatar-" + str(user["avatar_url"].split("?")[-1]).replace("/", "-")
    if not re.fullmatch(r"[a-zA-Z0-9_.-]+", avatar_name):
        raise ValueError("Unexpected avatar name")
    avatar = image(user["avatar_url"], avatar_name + ".jpg", assets)
    stats = user["statistics"]
    snapshot = {"id": user["id"], "username": user["username"], "url": PROFILE,
                "avatar": avatar, "discord": user.get("discord"),
                "mode": data["current_mode"], "country": user["country"]["name"],
                "statistics": {k: stats[k] for k in ["global_rank", "country_rank", "pp", "hit_accuracy", "play_count"]},
                "html": "".join(parser.output)}
    sync_osu_scores()
    save_assets(assets)
    write_json("osu", snapshot)
    print(f"osu!: refreshed {user['username']}'s profile")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", choices=["bandcamp", "osu", "all"], default="all")
    args = parser.parse_args()
    failed = False
    for name, sync in [("bandcamp", sync_bandcamp), ("osu", sync_osu)]:
        if args.source in {name, "all"}:
            try:
                sync()
            except Exception as error:
                print(f"{name}: sync failed: {error}", file=sys.stderr)
                failed = True
    sys.exit(1 if failed else 0)
