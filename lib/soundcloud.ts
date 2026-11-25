import savedTracks from "@/data/external/soundcloud.json";

export const soundCloudSources = [
  { name: "Aureyx", slug: "dysto-music-318311836", userId: 1410628302, image: "/members/youtube-aureyx.jpg" },
  { name: "Lyrlvst", slug: "user-738144184", userId: 718137157, image: "/members/lyrlvst.png" },
] as const;
type Source = (typeof soundCloudSources)[number];
export type SoundCloudTrack = { id: number; title: string; artist: string; link: string; published: string; image: string; policy: string };

const MAX_HTML_BYTES = 2 * 1024 * 1024;
// MONETIZE is public listening with ads; SNIP and BLOCK are not full streams.
const freePolicies = new Set(["ALLOW", "MONETIZE"]);

export function soundCloudTrackUrl(value: unknown, source: Source) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, "https://soundcloud.com");
    return url.protocol === "https:" && url.hostname === "soundcloud.com" && !url.port && !url.username && !url.password && !url.search && !url.hash
      && new RegExp(`^/${source.slug}/[a-z0-9-]{1,200}$`).test(url.pathname)
      && !["tracks", "sets", "likes", "comments", "reposts", "albums", "popular-tracks"].includes(url.pathname.split("/").at(-1)!)
      ? url.href : null;
  } catch { return null; }
}

function hydration(html: string) {
  const data = html.match(/window\.__sc_hydration\s*=\s*(\[[\s\S]*?\]);/)?.[1];
  if (!data) return [];
  try { const rows: unknown = JSON.parse(data); return Array.isArray(rows) ? rows : []; } catch { return []; }
}

export function parseSoundCloudProfile(html: string, source: Source) {
  const owner = hydration(html).find((row) => row?.hydratable === "user")?.data;
  if (owner?.id !== source.userId || owner?.permalink_url !== `https://soundcloud.com/${source.slug}`) return [];
  const links = [...html.matchAll(/<article\b[^>]*itemtype=["']https?:\/\/schema\.org\/MusicRecording["'][^>]*>([\s\S]*?)<\/article>/gi)]
    .flatMap(([, article]) => {
      const href = article.match(/<a\b(?=[^>]*\bitemprop=["']url["'])[^>]*\bhref=["']([^"']+)["']/i)?.[1];
      const url = soundCloudTrackUrl(href, source);
      return url ? [url] : [];
    });
  return [...new Set(links)].slice(0, 3);
}

export function parseSoundCloudTrack(html: string, source: Source): SoundCloudTrack | null {
  const track = hydration(html).find((row) => row?.hydratable === "sound")?.data;
  const link = soundCloudTrackUrl(track?.permalink_url, source);
  if (!link || track?.kind !== "track" || track?.user?.id !== source.userId || track?.sharing !== "public" || track?.public !== true
    || track?.streamable !== true || !freePolicies.has(track?.policy) || !Number.isSafeInteger(track?.id) || track.id <= 0
    || typeof track?.title !== "string" || !track.title.trim() || track.title.length > 300
    || typeof track?.created_at !== "string" || Number.isNaN(Date.parse(track.created_at))) return null;
  const saved = savedTracks.find((row) => row.id === track.id && row.link === link);
  return { id: track.id, title: track.title, artist: source.name, link, published: track.created_at, image: saved?.image || source.image, policy: track.policy };
}

export function soundCloudEmbedUrl(link: string) {
  if (!soundCloudSources.some((source) => soundCloudTrackUrl(link, source))) return null;
  const url = new URL("https://w.soundcloud.com/player/");
  url.search = new URLSearchParams({ url: link, color: "#b66d43", auto_play: "false", hide_related: "true", show_comments: "false", show_reposts: "false", show_teaser: "false", visual: "false" }).toString();
  return url.href;
}

async function readHtml(url: string) {
  const response = await fetch(url, { next: { revalidate: 1800 }, redirect: "error", signal: AbortSignal.timeout(5000) });
  const mime = response.headers.get("content-type")?.split(";")[0].trim();
  if (!response.ok || !response.body || !["text/html", "application/xhtml+xml"].includes(mime || "") || Number(response.headers.get("content-length")) > MAX_HTML_BYTES) {
    await response.body?.cancel();
    throw new Error("SoundCloud page unavailable");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_HTML_BYTES) { await reader.cancel(); throw new Error("SoundCloud page exceeds size limit"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

export async function getSoundCloudTracks(artistName?: string): Promise<SoundCloudTrack[]> {
  const sources = soundCloudSources.filter((source) => !artistName || source.name === artistName);
  const rows = await Promise.all(sources.map(async (source) => {
    const saved = savedTracks.filter((track) => track.artist === source.name && soundCloudTrackUrl(track.link, source) && freePolicies.has(track.policy));
    try {
      const links = parseSoundCloudProfile(await readHtml(`https://soundcloud.com/${source.slug}`), source);
      if (!links.length) return saved;
      const fetched = await Promise.all(links.map(async (link) => {
        try { return parseSoundCloudTrack(await readHtml(link), source); } catch { return saved.find((track) => track.link === link) || null; }
      }));
      return fetched.filter((track): track is SoundCloudTrack => !!track);
    } catch { return saved; }
  }));
  return rows.flat().filter((track, index, all) => all.findIndex((row) => row.id === track.id) === index)
    .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));
}
