import { readFile, writeFile, rename } from "node:fs/promises";
import { parseYouTubeFeed } from "../lib/youtube-feed.ts";
const channels = [
  { file: "geometry-dash", handle: "@naga-gd", name: "naga" },
  { file: "osu-side-channel", handle: "@ryvengacha2", name: "ryvengacha2" },
  { file: "iyune-channel", handle: "@iyune2", name: "iyune" },
];
export function channelIdFromPage(html) {
  const id = html.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/)?.[1]
    || html.match(/<meta\s+itemprop="channelId"\s+content="(UC[\w-]{22})"/)?.[1]
;
  return id && /^UC[\w-]{22}$/.test(id) ? id : null;
}
async function fetchText(url, maximum) {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(20000) });
  if (!response.ok || !response.body) throw new Error("YouTube returned HTTP " + response.status);
  const reader = response.body.getReader();
  const chunks = []; let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maximum) { await reader.cancel(); throw new Error("YouTube response exceeded the size limit"); }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}
async function syncChannel(config) {
  const file = new URL("../data/external/" + config.file + ".json", import.meta.url);
  const url = "https://www.youtube.com/" + config.handle;
  const saved = JSON.parse(await readFile(file, "utf8"));
  let channelId = saved.channelId;
  if (!channelId || !/^UC[\w-]{22}$/.test(channelId)) channelId = channelIdFromPage(await fetchText(url, 10 * 1024 * 1024));
  if (!channelId) throw new Error("Could not resolve " + config.handle + "; keeping the saved snapshot");
  const xml = await fetchText("https://www.youtube.com/feeds/videos.xml?channel_id=" + channelId, 1024 * 1024);
  const videos = parseYouTubeFeed(xml);
  if (!videos.length && (saved.videos.length || !xml.includes("yt:channel:" + channelId))) throw new Error("No verified video entries returned; keeping the saved snapshot");
  const snapshot = { name: config.name, handle: config.handle, url, channelId, videos };
  const output = JSON.stringify(snapshot, null, 2) + "\n";
  if (output !== await readFile(file, "utf8")) {
    const temporary = new URL(file.href + ".tmp");
    await writeFile(temporary, output);
    await rename(temporary, file);
  }
  console.log("Refreshed " + config.handle + ", channel " + channelId + ", " + videos.length + " videos");
}
export async function syncGeometryDash() {
  let successes = 0;
  for (const config of channels) {
    try { await syncChannel(config); successes++; }
    catch (error) { console.error("::warning::" + config.handle + ": " + error.message); }
  }
  if (!successes) throw new Error("All linked channels are unavailable; saved snapshots are unchanged");
}
if (process.argv[1]?.endsWith("sync-geometry-dash.mjs")) syncGeometryDash().catch(error => { console.error(error.message); process.exitCode = 1; });
