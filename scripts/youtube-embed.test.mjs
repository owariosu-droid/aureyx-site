import assert from "node:assert/strict";
import { test } from "node:test";
import { videoEmbed, channelEmbed } from "../lib/youtube-embed.ts";

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
