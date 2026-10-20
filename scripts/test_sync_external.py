import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

spec = importlib.util.spec_from_file_location("sync_external", Path(__file__).with_name("sync-external.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class SyncTests(unittest.TestCase):
    def test_embedded_json_decodes_html_entities(self):
        parsed = sync.Attributes('<div data-client-items="[{&quot;title&quot;:&quot;A &amp; B&quot;}]"></div>')
        self.assertEqual(parsed.json("data-client-items"), [{"title": "A & B"}])

    def test_prices_use_purchase_rules(self):
        self.assertEqual(sync.price({"download_pref": 2, "minimum_price": .5, "set_price": 1.5}, "USD"), "$0.50")
        self.assertEqual(sync.price({"download_pref": 2, "minimum_price": 0}, "USD"), "Name your price")
        self.assertEqual(sync.price({"download_pref": 2, "is_set_price": 1, "set_price": 9}, "EUR"), "EUR 9.00")
        self.assertEqual(sync.price({"download_pref": 1}, "USD"), "Free download")
        self.assertEqual(sync.price({"download_pref": 0}, "USD"), "Listen on Bandcamp")

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


if __name__ == "__main__":
    unittest.main()
