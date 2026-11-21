import "server-only";
import { artists } from "@/data/artists";
import { defaultOwnerContent, validateOwnerContent } from "@/lib/owner-content";
import { ownerConfig } from "@/lib/owner-service";
export async function getPublishedContent() {
  const config = ownerConfig();
  if (!config) return defaultOwnerContent();
  try {
    const response = await fetch(`${config.url}/rest/v1/owner_content?id=eq.site&select=content`, { headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, next: { revalidate: 60, tags: ["owner-content"] }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return defaultOwnerContent();
    const rows = await response.json();
    return rows[0]?.content && Object.keys(rows[0].content).length ? validateOwnerContent(rows[0].content) : defaultOwnerContent();
  } catch { return defaultOwnerContent(); }
}
export async function getPublishedArtists() {
  const content = await getPublishedContent();
  return artists.map(artist => ({ ...artist, ...content.artists[artist.slug] }));
}
