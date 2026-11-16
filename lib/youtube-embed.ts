const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;

export function videoThumbnails(id: string, feedThumbnail?: string) {
  if (!VIDEO_ID.test(id)) return [];
  let trustedThumbnail: string | undefined;
  if (feedThumbnail) {
    try {
      const url = new URL(feedThumbnail);
      const trustedHost = /^[a-z0-9-]+\.ytimg\.com$/i.test(url.hostname);
      const trustedPath = url.pathname.startsWith(`/vi/${id}/`) || url.pathname.startsWith(`/vi_webp/${id}/`);
      if (url.protocol === "https:" && trustedHost && trustedPath && !url.username && !url.password && !url.port) trustedThumbnail = url.toString();
    } catch { /* Fall back to official URLs derived from the validated video ID. */ }
  }
  return [...new Set([
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    trustedThumbnail,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  ].filter((url): url is string => Boolean(url)))];
}

export function videoEmbed(id: string) {
  if (!VIDEO_ID.test(id)) return null;
  return {
    src: `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0`,
    watchUrl: `https://www.youtube.com/watch?v=${id}`,
  };
}

export function channelEmbed(id: string) {
  if (!CHANNEL_ID.test(id)) return null;
  const playlist = `UU${id.slice(2)}`;
  return {
    src: `https://www.youtube-nocookie.com/embed/videoseries?list=${playlist}&playsinline=1&rel=0`,
    watchUrl: `https://www.youtube.com/playlist?list=${playlist}`,
  };
}
