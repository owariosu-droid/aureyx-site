import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import ts from "typescript";

// Load the real shared catalog without Next's path aliases or a generated build.
async function moduleUrl(path) {
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  if (path.endsWith(".json")) return `data:text/javascript;base64,${Buffer.from(`export default ${source}`).toString("base64")}`;
  let { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  for (const [, dependency] of outputText.matchAll(/from "(@\/[^\"]+)"/g)) {
    const target = dependency.slice(2) + (dependency.endsWith(".json") ? "" : ".ts");
    outputText = outputText.replaceAll(`from "${dependency}"`, `from "${await moduleUrl(target)}"`);
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const { releases, releaseSlug, matchesReleaseArtist, releaseDateLabel, getRelease } = await import(await moduleUrl("lib/releases.ts"));
const { releasePrices } = await import(await moduleUrl("data/release-prices.ts"));
const original = JSON.parse(await readFile(new URL("../data/external/bandcamp.json", import.meta.url)));
const lyrlvst = JSON.parse(await readFile(new URL("../data/external/lyrlvst-bandcamp.json", import.meta.url)));

test("every Lyrlvst release has its own artist, artwork, price, player and detail route", async () => {
  assert.ok(lyrlvst.length > 0);
  for (const item of lyrlvst) {
    const release = releases.find((row) => row.link === item.link);
    assert.ok(release, item.title);
    assert.equal(release.artist, "Lyrlvst");
    assert.ok(release.contributors.includes("Lyrlvst"));
    assert.equal(release.platform, "Bandcamp");
    assert.ok(release.embed.includes(`/${item.type}=${item.id}/`));
    assert.ok(release.embed.includes("/tracklist=false/"));
    assert.equal(releasePrices[item.link], item.price);
    assert.equal(getRelease(release.slug), release);
    assert.ok(releaseDateLabel(release.released));
    await access(new URL(`../public${release.image}`, import.meta.url));
    assert.ok(!release.preview || release.preview.startsWith("/previews/lyrlvst-"));
  }
});

test("adding an artist catalog preserves published Aureyx URLs and catalog numbers", () => {
  for (const [index, item] of original.entries()) {
    const release = releases.find((row) => row.link === item.link);
    assert.equal(release.slug, item.link.split("/").at(-1));
    assert.equal(release.catalogNumber, `AUR-${String(index + 1).padStart(3, "0")}`);
  }
  const spotify = releases.find((row) => row.platform === "Spotify");
  assert.equal(spotify.slug, "6W9618MAoMyOgYcWgx6glU");
  assert.equal(spotify.catalogNumber, `AUR-${String(original.length + 1).padStart(3, "0")}`);
  assert.equal(new Set(releases.map((row) => row.slug)).size, releases.length);
  assert.notEqual(releaseSlug("https://lyrlvst.bandcamp.com/track/chasm-of-eternity"), releaseSlug("https://dystofuturemusic.bandcamp.com/track/lyrlvst-chasm-of-eternity"));
});

test("artist filters include the personal catalog and Aureyx collaborations", () => {
  const filtered = releases.filter((row) => matchesReleaseArtist(row, "Lyrlvst"));
  assert.ok(filtered.some((row) => row.link.startsWith("https://lyrlvst.bandcamp.com/")));
  assert.ok(filtered.some((row) => row.link.includes("/lyrlvst-chasm-of-eternity")));
  assert.ok(filtered.every((row) => row.artist === "Lyrlvst" || row.contributors.includes("Lyrlvst")));
  assert.equal(matchesReleaseArtist({ artist: "iyune & Lyrlvst", contributors: ["iyune", "Lyrlvst"] }, "Lyrlvst"), true);
});

test("catalog sorts newest first and handles missing dates without inventing one", () => {
  const timestamps = releases.map((row) => Date.parse(row.released || "") || 0);
  assert.deepEqual(timestamps, [...timestamps].sort((a, b) => b - a));
  assert.equal(releaseDateLabel(null), null);
  assert.equal(releaseDateLabel("invalid"), null);
  assert.equal(releaseDateLabel("24 Oct 2026 00:00:00 GMT"), "Oct 24, 2026");
});
