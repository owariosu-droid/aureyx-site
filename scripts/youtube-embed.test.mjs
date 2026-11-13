import assert from "node:assert/strict";
import { test } from "node:test";
import { videoEmbed, channelEmbed, videoThumbnails } from "../lib/youtube-embed.ts";

test("each video ID produces its own official thumbnail candidates", () => {
  const posters = videoThumbnails("EN6TLOaZOMo", "https://i2.ytimg.com/vi/EN6TLOaZOMo/hqdefault.jpg");
  assert.equal(posters[0], "https://i.ytimg.com/vi/EN6TLOaZOMo/maxresdefault.jpg");
  assert.ok(posters.includes("https://i2.ytimg.com/vi/EN6TLOaZOMo/hqdefault.jpg"));
  assert.equal(posters.at(-1), "https://i.ytimg.com/vi/EN6TLOaZOMo/mqdefault.jpg");
  assert.ok(videoThumbnails("I_-ZQ3-H8LU").every((url) => url.includes("I_-ZQ3-H8LU")));
});

test("deduplicates feed thumbnails and rejects untrusted image URLs", () => {
  const canonical = videoThumbnails("EN6TLOaZOMo");
  assert.deepEqual(videoThumbnails("EN6TLOaZOMo", canonical[1]), canonical);
  for (const source of ["https://evil.test/vi/EN6TLOaZOMo/hqdefault.jpg", "https://i.ytimg.com.evil.test/vi/EN6TLOaZOMo/hqdefault.jpg", "http://i.ytimg.com/vi/EN6TLOaZOMo/hqdefault.jpg", "https://i.ytimg.com/vi/DIFFERENT01/hqdefault.jpg", "https://user:pass@i.ytimg.com/vi/EN6TLOaZOMo/hqdefault.jpg", "https://i.ytimg.com:8443/vi/EN6TLOaZOMo/hqdefault.jpg"]) {
    assert.deepEqual(videoThumbnails("EN6TLOaZOMo", source), canonical);
  }
  assert.deepEqual(videoThumbnails("invalid"), []);
});

test("native video embeds use the privacy-enhanced host without autoplay", () => {
  const embed = videoEmbed("EN6TLOaZOMo");
  const url = new URL(embed.src);
  assert.equal(url.hostname, "www.youtube-nocookie.com");
  assert.equal(url.pathname, "/embed/EN6TLOaZOMo");
  assert.equal(url.searchParams.get("autoplay"), null);
  assert.equal(url.searchParams.get("playsinline"), "1");
  assert.equal(embed.watchUrl, "https://www.youtube.com/watch?v=EN6TLOaZOMo");
});

test("channel embeds use the official auto-updated uploads playlist", () => {
  const embed = channelEmbed("UC7xSxOfYmUlZ8jIp_567M6w");
  const url = new URL(embed.src);
  assert.equal(url.pathname, "/embed/videoseries");
  assert.equal(url.searchParams.get("list"), "UU7xSxOfYmUlZ8jIp_567M6w");
  assert.equal(url.searchParams.get("autoplay"), null);
  assert.equal(embed.watchUrl, "https://www.youtube.com/playlist?list=UU7xSxOfYmUlZ8jIp_567M6w");
});

test("rejects malformed IDs instead of constructing arbitrary iframe URLs", () => {
  for (const value of ["", "https://evil.test/", "../admin", "EN6TLOaZOMo?autoplay=1", 'EN6TLOaZOMo" onload="alert(1)']) {
    assert.equal(videoEmbed(value), null);
    assert.equal(channelEmbed(value), null);
  }
});
