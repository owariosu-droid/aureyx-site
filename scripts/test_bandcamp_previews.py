import importlib.util
import io
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from urllib.request import Request

spec = importlib.util.spec_from_file_location("sync_bandcamp_previews", Path(__file__).with_name("sync-bandcamp-previews.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class BandcampPreviewTests(unittest.TestCase):
    def release(self, host="lyrlvst.bandcamp.com", **overrides):
        return {"title": "Example", "link": f"https://{host}/track/example", "type": "track", "id": 123, "image": "/external/example.jpg", **overrides}

    def test_clip_identity_uses_entire_source_and_art_revision(self):
        release = self.release()
        name = sync.clip_name(release)
        self.assertEqual(name, sync.clip_name(release))
        self.assertNotEqual(name, sync.clip_name(self.release("dystofuturemusic.bandcamp.com")))
        self.assertNotEqual(name, sync.clip_name(self.release(image="/external/new-art.jpg")))
        self.assertRegex(name, r"^bandcamp-[a-f0-9]{24}\.m4a$")

    def test_network_and_redirects_stay_on_approved_https_source_types(self):
        invalid = ["http://lyrlvst.bandcamp.com/track/example", "https://127.0.0.1/track/example",
                   "https://lyrlvst.bandcamp.com.evil.test/track/example", "https://user:password@lyrlvst.bandcamp.com/track/example",
                   "https://lyrlvst.bandcamp.com:8443/track/example", "https://lyrlvst.bandcamp.com/admin"]
        for url in invalid:
            with self.subTest(url=url), patch.object(sync, "build_opener") as opener:
                with self.assertRaises(ValueError):
                    sync.fetch(url)
                opener.assert_not_called()
        request = Request("https://t4.bcbits.com/stream/hash/mp3-128/123")
        for target in ["https://169.254.169.254/stream/hash", "http://t4.bcbits.com/stream/hash", "https://lyrlvst.bandcamp.com/track/example"]:
            with self.subTest(target=target), self.assertRaises(ValueError):
                sync.TrustedRedirects(stream=True).redirect_request(request, None, 302, "Found", {}, target)

    def test_stream_download_is_bounded_even_when_range_is_ignored(self):
        response = io.BytesIO(b"a" * 100)
        response.headers = {"Content-Length": "100000000"}
        with patch.object(sync, "MAX_STREAM_BYTES", 10), patch.object(sync, "build_opener") as opener:
            opener.return_value.open.return_value = response
            self.assertEqual(sync.fetch("https://t4.bcbits.com/stream/hash/mp3-128/123", stream=True), b"a" * 10)
            request = opener.return_value.open.call_args.args[0]
            self.assertEqual(request.headers["Range"], "bytes=0-9")

    def test_source_identity_and_short_tracks_cannot_publish_full_recordings(self):
        row = {"id": 123, "item_type": "track", "trackinfo": [
            {"file": None, "duration": 200},
            {"file": {"mp3-128": "https://t4.bcbits.com/stream/hash/mp3-128/123?token=secret"}, "duration": 8},
        ]}
        page = '<script data-tralbum="' + json.dumps(row).replace('"', '&quot;') + '"></script>'
        with patch.object(sync, "fetch", return_value=page.encode()):
            stream, seconds = sync.source_track(self.release())
            self.assertIn("/stream/", stream)
            self.assertEqual(seconds, 4)
            with self.assertRaisesRegex(ValueError, "identity"):
                sync.source_track(self.release(id=999))

    def test_manifest_cannot_escape_local_preview_directory(self):
        for src in ["/previews/bandcamp/../../private.m4a", "https://t4.bcbits.com/stream/hash", "/previews/old.m4a"]:
            with self.subTest(src=src), patch.object(sync, "probe") as probe:
                self.assertIsNone(sync.saved_clip({"src": src, "duration": 20}))
                probe.assert_not_called()

    def test_verified_cache_is_reused_without_refetching_streams(self):
        release = self.release()
        cached = {"src": f"/previews/bandcamp/{sync.clip_name(release)}", "duration": 29.9}
        with patch.object(sync, "probe", return_value=29.9), patch.object(sync, "fetch") as fetch, patch.object(sync, "transcode") as transcode:
            self.assertEqual(sync.generate_clip(release, cached), (cached, "cached"))
            fetch.assert_not_called()
            transcode.assert_not_called()

    def test_refresh_bypasses_saved_cache_for_edited_tracks(self):
        release = self.release()
        cached = {"src": f"/previews/bandcamp/{sync.clip_name(release)}", "duration": 29.9}
        with patch.object(sync, "saved_clip", return_value=cached), patch.object(sync, "source_track", side_effect=ValueError("upstream unavailable")) as source:
            with self.assertRaises(ValueError):
                sync.generate_clip(release, cached, refresh=True)
            source.assert_called_once_with(release)

    def test_partial_failure_publishes_success_and_retains_verified_cached_clip(self):
        releases = [self.release(), self.release(link="https://lyrlvst.bandcamp.com/track/second"), self.release(link="https://lyrlvst.bandcamp.com/track/third")]
        old = {"src": "/previews/bandcamp/bandcamp-" + "a" * 24 + ".m4a", "duration": 20}
        new = {"src": "/previews/bandcamp/bandcamp-" + "b" * 24 + ".m4a", "duration": 29.9}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data/external").mkdir(parents=True)
            (root / "data/external/bandcamp.json").write_text(json.dumps(releases))
            (root / "data/external/lyrlvst-bandcamp.json").write_text("[]")
            manifest = root / "data/external/bandcamp-previews.json"
            manifest.write_text(json.dumps({releases[1]["link"]: old}))
            with patch.object(sync, "ROOT", root), patch.object(sync, "generate_clip", side_effect=[(new, "generated"), OSError("signed URL must not be logged"), OSError("unavailable")]), patch.object(sync, "saved_clip", side_effect=[old, None]), patch("sys.stderr", new_callable=io.StringIO) as stderr:
                self.assertEqual(sync.sync(), 1)
                self.assertNotIn("signed URL", stderr.getvalue())
            saved = json.loads(manifest.read_text())
            self.assertEqual(saved, {releases[0]["link"]: new, releases[1]["link"]: old})
            self.assertFalse(manifest.with_suffix(".tmp").exists())

    def test_retained_clip_still_reports_failed_upstream_refresh(self):
        release = self.release()
        cached = {"src": "/previews/bandcamp/bandcamp-" + "a" * 24 + ".m4a", "duration": 20}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data/external").mkdir(parents=True)
            (root / "data/external/bandcamp.json").write_text(json.dumps([release]))
            (root / "data/external/lyrlvst-bandcamp.json").write_text("[]")
            manifest = root / "data/external/bandcamp-previews.json"
            manifest.write_text(json.dumps({release["link"]: cached}))
            with patch.object(sync, "ROOT", root), patch.object(sync, "generate_clip", side_effect=OSError("unavailable")) as generate, patch.object(sync, "saved_clip", return_value=cached), patch("sys.stderr", new_callable=io.StringIO):
                self.assertEqual(sync.sync(refresh=True), 1)
                generate.assert_called_once_with(release, cached, refresh=True)
            self.assertEqual(json.loads(manifest.read_text()), {release["link"]: cached})

    def test_invalid_cached_manifest_is_cleared_when_all_refreshes_fail(self):
        release = self.release()
        invalid = {"src": "/previews/bandcamp/bandcamp-" + "a" * 24 + ".m4a", "duration": 20}
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "data/external").mkdir(parents=True)
            (root / "data/external/bandcamp.json").write_text(json.dumps([release]))
            (root / "data/external/lyrlvst-bandcamp.json").write_text("[]")
            manifest = root / "data/external/bandcamp-previews.json"
            manifest.write_text(json.dumps({release["link"]: invalid}))
            with patch.object(sync, "ROOT", root), patch.object(sync, "generate_clip", side_effect=OSError("unavailable")), patch.object(sync, "probe", side_effect=ValueError("invalid cached audio")), patch("sys.stderr", new_callable=io.StringIO):
                self.assertEqual(sync.sync(refresh=True), 1)
            self.assertEqual(json.loads(manifest.read_text()), {})
            self.assertFalse(manifest.with_suffix(".tmp").exists())

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "ffmpeg and ffprobe required")
    def test_real_transcode_trims_long_audio_to_validated_aac(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "long.wav"
            output = root / "excerpt.m4a"
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-f", "lavfi", "-i", "sine=frequency=440:duration=36", str(source)], check=True, capture_output=True, timeout=20)
            self.assertGreater(sync.probe(source), 30)
            duration = sync.transcode(source, output)
            self.assertGreater(duration, 29)
            self.assertLessEqual(duration, 30)
            self.assertLessEqual(output.stat().st_size, sync.MAX_CLIP_BYTES)
            self.assertEqual(sync.probe(output, excerpt=True), duration)
            repeated = root / "repeated.m4a"
            sync.transcode(source, repeated)
            self.assertEqual(output.read_bytes(), repeated.read_bytes())


if __name__ == "__main__":
    unittest.main()
