"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import { videoEmbed, videoThumbnails } from "@/lib/youtube-embed";

export default function YouTubePlayer({ id, title, thumbnail }: { id: string; title: string; thumbnail?: string }) {
  const [playing, setPlaying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const embed = videoEmbed(id);
  if (!embed) return null;
  const posters = videoThumbnails(id, thumbnail);
  const poster = posters[attempt];
  const nextPoster = () => setAttempt((value) => Math.min(value + 1, posters.length));

  return <div className="youtube-embed">
    {playing || !poster ? <div className="youtube-player-shell">
      <iframe src={playing ? `${embed.src}&autoplay=1` : embed.src} title={title} loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div> : <button type="button" className="youtube-player-shell group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400" aria-label={`Play ${title}`} onClick={() => setPlaying(true)}>
      <Image key={poster} src={poster} alt={`${title} thumbnail`} fill unoptimized loading="lazy" referrerPolicy="no-referrer"
        className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
        onError={nextPoster} onLoad={(event) => { if (event.currentTarget.naturalWidth <= 120) nextPoster(); }} />
      <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/30" />
      <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/65 text-white group-hover:bg-red-600"><Play size={23} fill="currentColor" aria-hidden="true" /></span></span>
    </button>}
    <a className="youtube-watch-link" href={embed.watchUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
  </div>;
}
