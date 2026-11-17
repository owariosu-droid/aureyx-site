import { test } from "node:test";
import assert from "node:assert/strict";
import { channelIdFromPage } from "./sync-geometry-dash.mjs";
test("resolves only valid channel metadata and rejects unrelated channel links", () => {
  const id = "UC" + "a".repeat(22);
  assert.equal(channelIdFromPage('{"externalId":"' + id + '"}'), id);
  assert.equal(channelIdFromPage('<meta itemprop="channelId" content="' + id + '">'), id);
  assert.equal(channelIdFromPage('<a href="https://www.youtube.com/channel/' + id + '">Recommendation</a>'), null);
  assert.equal(channelIdFromPage('{"externalId":"not-a-channel"}'), null);
});
