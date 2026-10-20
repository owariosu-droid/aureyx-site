"""Refresh public source snapshots without credentials or expiring stream URLs."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
BANDCAMP = "https://dystofuturemusic.bandcamp.com"
PROFILE = "https://osu.ppy.sh/users/37255712"


def fetch(url):
    request = Request(url, headers={"User-Agent": "Aureyx-site-content-sync/1.0"})
    with urlopen(request, timeout=30) as response:
        return response.read()


class Attributes(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.items = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.items.append(dict(attrs))

    def json(self, key):
        for attrs in self.items:
            if key in attrs:
                return json.loads(attrs[key])
        raise ValueError(f"Source no longer contains {key}; keeping the saved snapshot")


def write_json(name, value):
    path = ROOT / "data" / "external" / f"{name}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    content = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    temporary = path.with_suffix(".tmp")
    temporary.write_text(content)
    temporary.replace(path)


def image(url, name, assets):
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname not in {"f4.bcbits.com", "a.ppy.sh", "i.ppy.sh", "assets.ppy.sh"}:
        raise ValueError("Unexpected image host")
    data = fetch(url)
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
            self.output.append(escape(data))


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
