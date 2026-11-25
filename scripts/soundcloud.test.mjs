import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../lib/soundcloud.ts", import.meta.url), "utf8");
const saved = JSON.parse(await readFile(new URL("../data/external/soundcloud.json", import.meta.url), "utf8"));
const inline = source.replace('import savedTracks from "@/data/external/soundcloud.json";', `const savedTracks = ${JSON.stringify(saved)};`);
const { outputText } = ts.transpileModule(inline, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { soundCloudSources, soundCloudTrackUrl, soundCloudEmbedUrl, parseSoundCloudProfile, parseSoundCloudTrack, getSoundCloudTracks } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const lyrlvst = soundCloudSources.find((row) => row.name === "Lyrlvst");
const url = `https://soundcloud.com/${lyrlvst.slug}/song`;
const html = (rows) => `<script>window.__sc_hydration = ${JSON.stringify(rows)};</script>`;
const track = () => ({ id: 123, kind: "track", user: { id: lyrlvst.userId }, title: "A real title", permalink_url: url, created_at: "2026-10-29T08:22:45Z", sharing: "public", public: true, streamable: true, policy: "ALLOW" });
const profile = html([{ hydratable: "user", data: { id: lyrlvst.userId, permalink_url: `https://soundcloud.com/${lyrlvst.slug}` } }])
  + `<article itemtype="http://schema.org/MusicRecording"><h2><a itemprop="url" href="/${lyrlvst.slug}/song">Song</a></h2></article>`;

test("SoundCloud track links stay on the configured artist and trusted HTTPS host", () => {
  assert.equal(soundCloudTrackUrl(url, lyrlvst), url);
  for (const value of ["https://soundcloud.com.evil.test/user-738144184/song", "http://soundcloud.com/user-738144184/song", "https://user:pass@soundcloud.com/user-738144184/song", "https://soundcloud.com:8443/user-738144184/song", "https://soundcloud.com/other/song", "https://soundcloud.com/user-738144184/sets", `${url}?secret=private`, "javascript:alert(1)"]) {
    assert.equal(soundCloudTrackUrl(value, lyrlvst), null, value);
    assert.equal(soundCloudEmbedUrl(value), null, value);
  }
  const embed = new URL(soundCloudEmbedUrl(url));
  assert.equal(embed.hostname, "w.soundcloud.com");
  assert.equal(embed.searchParams.get("url"), url);
  assert.equal(embed.searchParams.get("auto_play"), "false");
});

test("profile discovery checks owner identity and ignores unrelated links", () => {
  assert.deepEqual(parseSoundCloudProfile(profile + `<a href="/${lyrlvst.slug}/likes">Likes</a>`, lyrlvst), [url]);
  assert.deepEqual(parseSoundCloudProfile(profile.replace(String(lyrlvst.userId), "1"), lyrlvst), []);
  assert.deepEqual(parseSoundCloudProfile("<html>Access denied</html>", lyrlvst), []);
});

test("only public full-stream tracks are listed, including ad-supported listening", () => {
  for (const policy of ["ALLOW", "MONETIZE"]) {
    const row = parseSoundCloudTrack(html([{ hydratable: "sound", data: { ...track(), policy } }]), lyrlvst);
    assert.equal(row.id, 123);
    assert.equal(row.artist, "Lyrlvst");
    assert.equal(row.policy, policy);
    assert.equal(row.link, url);
  }
  for (const [key, value] of [["policy", "SNIP"], ["policy", "BLOCK"], ["policy", "SUBSCRIBE"], ["public", false], ["sharing", "private"], ["streamable", false], ["id", -1], ["created_at", "yesterday"], ["user", { id: 1 }]]) {
    assert.equal(parseSoundCloudTrack(html([{ hydratable: "sound", data: { ...track(), [key]: value } }]), lyrlvst), null, key);
  }
});

test("live refresh uses public pages, revalidates, and retains verified metadata during outages", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async (requested) => new Response(requested === url ? html([{ hydratable: "sound", data: track() }]) : profile, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
  const rows = await getSoundCloudTracks("Lyrlvst");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].title, "A real title");
  assert.equal(fetch.mock.calls[0].arguments[1].next.revalidate, 1800);
  assert.equal(fetch.mock.calls[0].arguments[1].redirect, "error");
  assert.ok(fetch.mock.calls.every((call) => call.arguments[0].startsWith("https://soundcloud.com/")));
  fetch.mock.mockImplementation(async () => new Response("Unavailable", { status: 503 }));
  const fallback = await getSoundCloudTracks("Lyrlvst");
  assert.deepEqual(fallback.map((row) => row.id), saved.filter((row) => row.artist === "Lyrlvst").map((row) => row.id));
  const before = fetch.mock.callCount();
  assert.deepEqual(await getSoundCloudTracks("unknown artist"), []);
  assert.equal(fetch.mock.callCount(), before);
});

test("oversized or non-HTML pages cannot replace verified saved tracks", async (t) => {
  const fetch = t.mock.method(globalThis, "fetch", async () => new Response("x".repeat(2 * 1024 * 1024 + 1), { headers: { "Content-Type": "text/html" } }));
  assert.equal((await getSoundCloudTracks("Lyrlvst")).length, saved.filter((row) => row.artist === "Lyrlvst").length);
  fetch.mock.mockImplementation(async () => new Response(profile, { headers: { "Content-Type": "application/json" } }));
  assert.equal((await getSoundCloudTracks("Lyrlvst")).length, saved.filter((row) => row.artist === "Lyrlvst").length);
});
