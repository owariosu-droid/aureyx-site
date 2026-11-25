import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request
import io

spec = importlib.util.spec_from_file_location("sync_external", Path(__file__).with_name("sync-external.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class SyncTests(unittest.TestCase):
    def score_fixture(self):
        return {"id": 123, "user_id": 37255712, "ruleset_id": 0,
                "beatmap": {"id": 456, "version": "Test difficulty"},
                "beatmapset": {"id": 789, "title": "Test song", "artist": "Artist"},
                "rank": "A", "accuracy": .9876, "pp": None, "max_combo": 100,
                "statistics": {"miss": 2}, "ended_at": "2026-03-17T10:57:37Z",
                "mods": [{"acronym": "DT", "settings": {"speed_change": 1.2}}]}

    def test_score_snapshot_preserves_mod_settings_and_nullable_pp(self):
        score = sync.normalize_osu_score(self.score_fixture())
        self.assertEqual(score["mods"][0]["settings"]["speed_change"], 1.2)
        self.assertIsNone(score["pp"])
        self.assertEqual(score["accuracy"], .9876)
        self.assertEqual(score["misses"], 2)

    def test_score_snapshot_rejects_wrong_owner_invalid_ids_and_statistics(self):
        for key, value in [("user_id", 1), ("ruleset_id", 3), ("id", "../"), ("accuracy", float("nan")), ("pp", -1)]:
            score = self.score_fixture()
            score[key] = value
            with self.subTest(key=key), self.assertRaises(ValueError):
                sync.normalize_osu_score(score)

    def test_failed_score_fetch_keeps_previous_snapshot(self):
        with patch.object(sync, "fetch", side_effect=[json.dumps([self.score_fixture()]).encode(), b"{\"error\":\"unavailable\"}"]), patch.object(sync, "write_json") as write:
            with self.assertRaises(ValueError):
                sync.sync_osu_scores()
            write.assert_not_called()

    def test_rejects_source_controlled_path_traversal(self):
        with patch.object(sync, "fetch") as fetch:
            with self.assertRaisesRegex(ValueError, "filename"):
                sync.image("https://f4.bcbits.com/img/test.jpg", "../outside.jpg", {})
            fetch.assert_not_called()

    def test_rejects_untrusted_urls_before_network_access(self):
        for url in ["http://osu.ppy.sh/users/1", "https://127.0.0.1/", "https://osu.ppy.sh.evil.test/", "https://user:pass@osu.ppy.sh/", "https://osu.ppy.sh:8443/"]:
            with self.subTest(url=url), patch.object(sync, "build_opener") as opener:
                with self.assertRaises(ValueError):
                    sync.fetch(url)
                opener.assert_not_called()

    def test_redirects_cannot_escape_trusted_https_hosts(self):
        handler = sync.TrustedRedirects()
        request = Request("https://osu.ppy.sh/users/37255712")
        for target in ["http://osu.ppy.sh/", "https://169.254.169.254/latest/meta-data/", "https://evil.test/image"]:
            with self.subTest(target=target), self.assertRaises(ValueError):
                handler.redirect_request(request, None, 302, "Found", {}, target)

    def test_caps_response_reads_without_trusting_content_length(self):
        response = io.BytesIO(b"x" * 11)
        response.headers = {}
        with patch.object(sync, "build_opener") as opener:
            opener.return_value.open.return_value = response
            with self.assertRaisesRegex(ValueError, "size limit"):
                sync.fetch("https://osu.ppy.sh/users/37255712", max_bytes=10)

    def test_retries_transient_errors_but_not_access_denials(self):
        response = io.BytesIO(b"valid")
        response.headers = {}
        unavailable = HTTPError("source", 503, "Unavailable", {}, None)
        with patch.object(sync, "build_opener") as opener, patch.object(sync.time, "sleep") as sleep:
            opener.return_value.open.side_effect = [unavailable, response]
            self.assertEqual(sync.fetch("https://osu.ppy.sh/users/37255712"), b"valid")
            self.assertEqual(opener.return_value.open.call_count, 2)
            sleep.assert_called_once_with(1)
        with patch.object(sync, "build_opener") as opener, patch.object(sync.time, "sleep") as sleep:
            opener.return_value.open.side_effect = HTTPError("source", 403, "Denied", {}, None)
            with self.assertRaises(HTTPError):
                sync.fetch("https://osu.ppy.sh/users/37255712")
            self.assertEqual(opener.return_value.open.call_count, 1)
            sleep.assert_not_called()

    def test_embedded_json_decodes_html_entities(self):
        parsed = sync.Attributes('<div data-client-items="[{&quot;title&quot;:&quot;A &amp; B&quot;}]"></div>')
        self.assertEqual(parsed.json("data-client-items"), [{"title": "A & B"}])

    def test_missing_catalog_reports_safe_page_diagnostics(self):
        parsed = sync.Attributes('<html><title>  Access\n denied </title></html>')
        with self.assertRaisesRegex(ValueError, "page title: 'Access denied'"):
            parsed.json("data-client-items")

    def test_prices_use_purchase_rules(self):
        self.assertEqual(sync.price({"download_pref": 2, "minimum_price": .5, "set_price": 1.5}, "USD"), "$0.50")
        self.assertEqual(sync.price({"download_pref": 2, "minimum_price": 0}, "USD"), "Name your price")
        self.assertEqual(sync.price({"download_pref": 2, "is_set_price": 1, "set_price": 9}, "EUR"), "EUR 9.00")
        self.assertEqual(sync.price({"download_pref": 1}, "USD"), "Free download")
        self.assertEqual(sync.price({"download_pref": 0}, "USD"), "Listen on Bandcamp")

    def test_release_access_distinguishes_paid_free_and_streaming(self):
        for current, expected in [
            ({"download_pref": 2, "minimum_price": .5}, "paid"),
            ({"download_pref": 2, "minimum_price": 0}, "free"),
            ({"download_pref": 2, "is_set_price": 1, "set_price": 5, "minimum_price": 0}, "paid"),
            ({"download_pref": 1}, "free"),
            ({"download_pref": 0}, "streaming"),
            ({"download_pref": 2}, "paid"),
            ({"download_pref": 2, "minimum_price": float("nan")}, "paid"),
        ]:
            with self.subTest(current=current):
                self.assertEqual(sync.release_access(current), expected)

    def test_profile_sanitizer_drops_executable_content(self):
        parser = sync.ProfileHTML({})
        parser.feed('<script>alert(1)</script><iframe src="https://evil.test"></iframe><h2 onclick="evil()">Maps &amp; scores</h2><a href="javascript:alert(1)">bad</a><a href="https://osu.ppy.sh/users/37255712" onmouseover="evil()">profile</a>')
        result = "".join(parser.output)
        self.assertNotIn("script", result)
        self.assertNotIn("iframe", result)
        self.assertNotIn("evil", result)
        self.assertIn("<span>bad</span>", result)
        self.assertIn('rel="noopener noreferrer"', result)
        self.assertIn("Maps &amp; scores", result)

    def test_expired_score_screenshot_does_not_erase_profile(self):
        parser = sync.ProfileHTML({})
        with patch.object(sync, "image", side_effect=HTTPError("image", 404, "Not found", {}, None)):
            parser.feed('<strong>My score</strong><img src="https://i.ppy.sh/expired">')
        self.assertIn("My score", "".join(parser.output))
        self.assertIn("no longer available", "".join(parser.output))

    def test_published_map_links_get_one_local_cover(self):
        parser = sync.ProfileHTML({})
        with patch.object(sync, "image", return_value="/external/osu-map-123.jpg") as download:
            parser.feed('<a href="https://osu.ppy.sh/beatmapsets/123#osu/456">Map</a><a href="https://osu.ppy.sh/beatmapsets/123">Again</a><a href="https://evil.test/beatmapsets/999">Other</a>')
        download.assert_called_once_with("https://assets.ppy.sh/beatmaps/123/covers/cover.jpg", "osu-map-123.jpg", {})
        result = "".join(parser.output)
        self.assertEqual(result.count('class="osu-map-cover"'), 1)
        self.assertIn(">Map</a>", result)
        self.assertNotIn("osu-map-999", result)

    def test_selected_map_artwork_survives_refresh_without_fetching_generic_cover(self):
        parser = sync.ProfileHTML({})
        with patch.object(sync, "image") as download:
            parser.feed('<a href="https://osu.ppy.sh/beatmapsets/2575406#osu/5735879">Cynthoni of Flames</a><strong>Death of the Endless</strong><strong>Dork After Dark</strong>')
        download.assert_not_called()
        result = "".join(parser.output)
        for path in ["/osu/cynthoni-art.jpg", "/osu/deathoftheendless.png", "/osu/dork-after-dark.png"]:
            self.assertEqual(result.count('src="' + path + '"'), 1)
        self.assertEqual(result.count("osu-map-artwork"), 3)

    def test_unavailable_map_cover_keeps_link_and_text(self):
        parser = sync.ProfileHTML({})
        with patch.object(sync, "image", side_effect=HTTPError("image", 404, "Not found", {}, None)):
            parser.feed('<a href="https://osu.ppy.sh/beatmapsets/123">My map</a>')
        self.assertIn(">My map</a>", "".join(parser.output))

    def test_unexpected_source_shape_preserves_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data/external").mkdir(parents=True)
            path = root / "data/external/bandcamp.json"
            path.write_text('[{"title":"Saved release"}]\n')
            with patch.object(sync, "ROOT", root), patch.object(sync, "fetch", return_value=b'<html>Blocked</html>'):
                with self.assertRaises(ValueError):
                    sync.sync_bandcamp()
            self.assertEqual(json.loads(path.read_text()), [{"title": "Saved release"}])

    def test_partial_catalog_failure_preserves_snapshot(self):
        items = [{"page_url": "/track/test", "type": "track", "id": 1, "art_id": 1}]
        catalog = '<div data-client-items="' + json.dumps(items).replace('"', '&quot;') + '"></div>'
        with patch.object(sync, "fetch", side_effect=[catalog.encode(), OSError("network down")]), patch.object(sync, "write_json") as write:
            with self.assertRaises(OSError):
                sync.sync_bandcamp()
            write.assert_not_called()

    def test_artist_grid_preserves_order_and_decodes_release_urls(self):
        html = '''<ol id="music-grid"><li class="music-grid-item" data-item-id="album-12">
        <a href="/album/dreams"><img src="https://f4.bcbits.com/img/a34_2.jpg"></a></li>
        <li class="music-grid-item" data-item-id="track-56"><a href="/track/song">
        <img src="/placeholder.jpg" data-original="https://f4.bcbits.com/img/a78_2.jpg"></a></li></ol>
        <li class="music-grid-item" data-item-id="album-999"><a href="/album/not-in-catalog"></a></li>'''
        self.assertEqual(sync.BandcampGrid(html).items, [
            {"type": "album", "id": 12, "page_url": "/album/dreams", "art_id": 34},
            {"type": "track", "id": 56, "page_url": "/track/song", "art_id": 78},
        ])

    def test_incomplete_artist_grid_does_not_publish_partial_catalog(self):
        html = '''<ol id="music-grid"><li class="music-grid-item" data-item-id="album-12">
        <a href="/album/dreams"><img src="https://evil.test/a34_2.jpg"></a></li></ol>'''
        with patch.object(sync, "fetch", return_value=html.encode()), patch.object(sync, "write_json") as write:
            with self.assertRaisesRegex(ValueError, "Incomplete"):
                sync.sync_bandcamp("lyrlvst-bandcamp")
            write.assert_not_called()

    def test_lyrlvst_sync_keeps_artist_snapshot_and_previews_separate(self):
        items = [{"page_url": "/track/test", "type": "track", "id": 1, "art_id": 2}]
        catalog = '<div data-client-items="' + json.dumps(items).replace('"', '&quot;') + '"></div>'
        release = {"item_type": "track", "id": 1, "current": {"title": "No artist in title", "download_pref": 2, "minimum_price": .5, "release_date": "01 Nov 2026 00:00:00 GMT"}}
        page = '<script data-tralbum="' + json.dumps(release).replace('"', '&quot;') + '"></script>'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data/external").mkdir(parents=True)
            original = root / "data/external/bandcamp.json"
            original.write_text('[{"title":"Aureyx release"}]\n')
            (root / "public/previews").mkdir(parents=True)
            # Same slug in the older Aureyx catalog must not select its audio.
            (root / "public/previews/test.m4a").write_bytes(b"audio")
            with patch.object(sync, "ROOT", root), patch.object(sync, "fetch", side_effect=[catalog.encode(), page.encode()]) as fetch, patch.object(sync, "image", return_value="/external/bandcamp-2.jpg"):
                sync.sync_bandcamp("lyrlvst-bandcamp")
            rows = json.loads((root / "data/external/lyrlvst-bandcamp.json").read_text())
            self.assertEqual(json.loads(original.read_text()), [{"title": "Aureyx release"}])
            self.assertEqual(rows[0]["artist"], "Lyrlvst")
            self.assertEqual(rows[0]["link"], "https://lyrlvst.bandcamp.com/track/test")
            self.assertEqual(rows[0]["price"], "$0.50")
            self.assertEqual(rows[0]["released"], "01 Nov 2026 00:00:00 GMT")
            self.assertIsNone(rows[0]["preview"])
            self.assertEqual([call.args[0] for call in fetch.call_args_list], ["https://lyrlvst.bandcamp.com/music", "https://lyrlvst.bandcamp.com/track/test"])

    def test_failed_lyrlvst_sync_retains_both_catalogs(self):
        items = [{"page_url": "/track/test", "type": "track", "id": 1, "art_id": 2}]
        catalog = '<div data-client-items="' + json.dumps(items).replace('"', '&quot;') + '"></div>'
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data/external").mkdir(parents=True)
            for name in ["bandcamp", "lyrlvst-bandcamp"]:
                (root / f"data/external/{name}.json").write_text(f'[{{"title":"Saved {name}"}}]\n')
            with patch.object(sync, "ROOT", root), patch.object(sync, "fetch", side_effect=[catalog.encode(), OSError("network down")]), patch.object(sync, "save_assets") as save:
                with self.assertRaises(OSError):
                    sync.sync_bandcamp("lyrlvst-bandcamp")
                save.assert_not_called()
            for name in ["bandcamp", "lyrlvst-bandcamp"]:
                self.assertEqual(json.loads((root / f"data/external/{name}.json").read_text()), [{"title": f"Saved {name}"}])


if __name__ == "__main__":
    unittest.main()
