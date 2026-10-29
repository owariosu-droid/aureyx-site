const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;

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
