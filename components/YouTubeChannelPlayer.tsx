"use client";

import { useState } from "react";
import { Play } from "lucide-react";

// YouTube maintains the uploads playlist automatically, even when RSS is unavailable.
export default function YouTubeChannelPlayer({ channelId, name }: { channelId: string; name: string }) {
  const [playing, setPlaying] = useState(false);
  if (!/^UC[\w-]{22}$/.test(channelId)) return null;
  const playlist = `UU${channelId.slice(2)}`;
  return <div>
    {playing ? <div className="youtube-player-shell"><iframe
      src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlist}&autoplay=1&playsinline=1`}
      title={`${name} uploads`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
    /></div> : <button type="button" className="youtube-player-shell flex w-full items-center justify-center gap-3 bg-black/40 p-6 text-white" onClick={() => setPlaying(true)} aria-label={`Play ${name} uploads`}><Play aria-hidden="true" /> Play {name} uploads</button>}
    <p className="home-video-empty">Latest uploads playlist · <a href={`https://www.youtube.com/playlist?list=${playlist}`} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></p>
  </div>;
}
