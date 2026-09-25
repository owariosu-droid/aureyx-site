export type YouTubeVideo = { id: string; title: string; published: string; thumbnail?: string };

function decodeXml(value: string) {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
    if (!entity.startsWith("#")) return entities[entity] || match;
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

export function parseYouTubeFeed(xml: string): YouTubeVideo[] {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].flatMap(([, entry]) => {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const rawThumbnail = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1];
    const thumbnail = rawThumbnail && /^https:\/\/[a-z0-9.-]+\.ytimg\.com\//i.test(rawThumbnail) ? decodeXml(rawThumbnail) : undefined;
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
    return id && /^[\w-]{11}$/.test(id) && title && published && !Number.isNaN(Date.parse(published))
      ? [{ id, title: decodeXml(title), published, thumbnail }] : [];
  }).slice(0, 6);
}

export async function getYouTubeVideos(channelId: string) {
  if (!/^UC[\w-]{22}$/.test(channelId)) return [];
  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    return parseYouTubeFeed(await response.text());
  } catch { return []; }
}
