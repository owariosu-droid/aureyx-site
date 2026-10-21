import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../app/api/youtube-thumbnail/[id]/route.ts";

const context = (id = "EN6TLOaZOMo") => ({ params: Promise.resolve({ id }) });

test("rejects invalid video IDs before making an upstream request", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Should not fetch"); });
  const response = await GET(new Request("https://example.test/"), context("../../admin"));
  assert.equal(response.status, 400);
  assert.equal(fetch.mock.callCount(), 0);
});

test("keeps normal thumbnails and disables upstream redirects", async (t) => {
  const bytes = new Uint8Array([255, 216, 255, 1]);
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response(bytes, { headers: { "content-type": "image/jpeg" } }));
  const response = await GET(new Request("https://example.test/"), context());
  assert.equal(response.headers.get("content-type"), "image/jpeg");
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), bytes);
  assert.equal(fetch.mock.calls[0].arguments[1].redirect, "error");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
});

test("never forwards upstream SVG or HTML as a thumbnail", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("<svg onload='alert(1)'/>", { headers: { "content-type": "image/svg+xml" } }));
  const response = await GET(new Request("https://example.test/"), context());
  assert.equal(response.headers.get("content-type"), "image/svg+xml; charset=utf-8");
  const fallback = await response.text();
  assert.ok(fallback.includes("AUREYX VIDEO"));
  assert.ok(!fallback.includes("onload"));
});

test("cancels oversized streams even without a content-length header", async (t) => {
  let cancelled = 0;
  t.mock.method(globalThis, "fetch", async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(5 * 1024 * 1024 + 1)); },
    cancel() { cancelled++; },
  }), { headers: { "content-type": "image/jpeg" } }));
  const response = await GET(new Request("https://example.test/"), context());
  assert.equal(cancelled, 3);
  assert.ok((await response.text()).includes("AUREYX VIDEO"));
});
