import assert from "node:assert/strict";
import { test } from "node:test";
import { getYouTubeVideos, parseYouTubeFeed } from "../lib/youtube-feed.ts";

const entry = (id, title, published = "2026-10-19T12:00:00Z", thumbnail = "https://i.ytimg.com/vi/test/hqdefault.jpg") => `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>${published}</published><media:thumbnail url="${thumbnail}" /></entry>`;

test("parses titles, validates IDs and dates, deduplicates and orders latest uploads first", () => {
  const xml = entry("EN6TLOaZOMo", "Older &amp; title", "2026-09-01T00:00:00Z")
    + entry("I_-ZQ3-H8LU", "<![CDATA[Latest upload]]>")
    + entry("I_-ZQ3-H8LU", "Duplicate")
    + entry("bad-id", "Invalid ID")
    + entry("12345678901", "Invalid date", "yesterday");
  const videos = parseYouTubeFeed(xml);
  assert.deepEqual(videos.map(({ id, title }) => ({ id, title })), [
    { id: "I_-ZQ3-H8LU", title: "Latest upload" },
    { id: "EN6TLOaZOMo", title: "Older & title" },
  ]);
});

test("ignores challenge pages and untrusted thumbnail URLs", () => {
  assert.deepEqual(parseYouTubeFeed("<html>Access denied</html>"), []);
  assert.equal(parseYouTubeFeed(entry("EN6TLOaZOMo", "title", undefined, "https://evil.test/image"))[0].thumbnail, undefined);
});

test("rejects invalid channels without making a request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Should not fetch"); });
  assert.deepEqual(await getYouTubeVideos("invalid"), []);
  assert.equal(fetch.mock.callCount(), 0);
});

test("requests public feeds with periodic revalidation and handles outages", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response(entry("EN6TLOaZOMo", "Upload")));
  const videos = await getYouTubeVideos("UC7xSxOfYmUlZ8jIp_567M6w");
  assert.equal(videos[0].id, "EN6TLOaZOMo");
  assert.equal(fetch.mock.calls[0].arguments[1].next.revalidate, 1800);
  fetch.mock.mockImplementation(async () => new Response("Unavailable", { status: 503 }));
  assert.deepEqual(await getYouTubeVideos("UC7xSxOfYmUlZ8jIp_567M6w"), []);
});
