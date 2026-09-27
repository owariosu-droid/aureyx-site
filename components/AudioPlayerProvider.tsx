"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ExternalLink, Pause, Play, X } from "lucide-react";

type Track = { title: string; image: string; src: string; link: string; slug: string };
type PlayerContextValue = { current: Track | null; playing: boolean; play: (track: Track) => void; toggle: () => void };
const PlayerContext = createContext<PlayerContextValue | null>(null);

export function useAudioPlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return value;
}

export default function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const play = useCallback((track: Track) => {
    if (current?.src === track.src) {
      if (audio.current?.paused) void audio.current.play(); else audio.current?.pause();
      return;
    }
    setCurrent(track);
    setPlaying(true);
  }, [current]);
  const toggle = useCallback(() => {
    if (!audio.current) return;
    if (audio.current.paused) void audio.current.play(); else audio.current.pause();
  }, []);
  useEffect(() => { if (current && playing) void audio.current?.play(); }, [current, playing]);
  return <PlayerContext.Provider value={{ current, playing, play, toggle }}>
    {children}
    {current && <aside className="persistent-player" aria-label="Audio preview player">
      <Image src={current.image} alt="" width={58} height={58} />
      <div><span>Preview</span><Link href={`/music/${current.slug}`}>{current.title}</Link></div>
      <button type="button" onClick={toggle} aria-label={playing ? "Pause preview" : "Play preview"}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
      <a href={current.link} target="_blank" rel="noopener noreferrer" aria-label="Open full release"><ExternalLink /></a>
      <button type="button" onClick={() => { audio.current?.pause(); setCurrent(null); setPlaying(false); }} aria-label="Close player"><X /></button>
      <audio ref={audio} src={current.src} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    </aside>}
  </PlayerContext.Provider>;
}
