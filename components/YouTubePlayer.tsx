"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

export default function YouTubePlayer({ id, title, thumbnail }: { id: string; title: string; thumbnail?: string }) {
  const [playing, setPlaying] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  if (playing) return <iframe className="aspect-video w-full border-0" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={title} allow="autoplay; encrypted-media; gyroscope; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${title}`} data-protected-image className="group relative block aspect-video w-full cursor-pointer overflow-hidden bg-[#20191b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400">
      {thumbnail && !imageFailed && <Image src={thumbnail} alt={`${title} thumbnail`} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" onError={() => setImageFailed(true)} />}
      <span className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/30" />
      <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/50 bg-black/65 text-white transition-colors group-hover:bg-red-600"><Play aria-hidden="true" size={23} fill="currentColor" /></span></span>
      {(!thumbnail || imageFailed) && <span className="absolute bottom-3 left-3 right-3 text-sm text-white">Watch on YouTube</span>}
    </button>
  );
}
