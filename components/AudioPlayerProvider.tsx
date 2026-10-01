"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { releases } from "@/lib/releases";

type Track = { title: string; image: string; src: string; link: string; slug: string };
type PlayerContextValue = { current: Track | null; playing: boolean; play: (track: Track) => void; toggle: () => void };
const PlayerContext = createContext<PlayerContextValue | null>(null);
const time = (value: number) => Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2,"0")}` : "0:00";

export function useAudioPlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return value;
}

export default function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(.85);
  const [minimized, setMinimized] = useState(false);
  const playlist = useMemo<Track[]>(() => releases.filter((release) => release.preview).map((release) => ({ title:release.title,image:release.image,src:release.preview!,link:release.link,slug:release.slug })), []);

  const play = useCallback((track: Track) => {
    if (current?.src === track.src) { if (audio.current?.paused) void audio.current.play(); else audio.current?.pause(); return; }
    setCurrent(track); setElapsed(0); setPlaying(true); setMinimized(false);
  }, [current]);
  const toggle = useCallback(() => { if (!audio.current) return; if (audio.current.paused) void audio.current.play(); else audio.current.pause(); }, []);
  const skip = useCallback((step: number) => {
    if (!current || !playlist.length) return;
    const index = playlist.findIndex((track) => track.src === current.src);
    setCurrent(playlist[(Math.max(index,0) + step + playlist.length) % playlist.length]); setElapsed(0); setPlaying(true);
  }, [current, playlist]);
  useEffect(() => { if (current && playing) void audio.current?.play().catch(() => setPlaying(false)); }, [current, playing]);

  return <PlayerContext.Provider value={{ current, playing, play, toggle }}>
    {children}
    {current && <aside className={`persistent-player${minimized ? " is-minimized" : ""}`} aria-label="Audio preview player">
      <Image src={current.image} alt="" width={64} height={64} />
      <div className="player-track"><span>Preview excerpt</span><Link href={`/music/${current.slug}`}>{current.title}</Link></div>
      <div className="player-controls"><button type="button" onClick={() => skip(-1)} aria-label="Previous preview"><SkipBack /></button><button type="button" className="player-primary" onClick={toggle} aria-label={playing ? "Pause preview" : "Play preview"}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button><button type="button" onClick={() => skip(1)} aria-label="Next preview"><SkipForward /></button></div>
      <div className="player-timeline"><span>{time(elapsed)}</span><input aria-label="Preview position" type="range" min="0" max={duration || 0} step="0.1" value={Math.min(elapsed,duration || 0)} onChange={(event) => { const value=Number(event.target.value); if (audio.current) audio.current.currentTime=value; setElapsed(value); }} /><span>{time(duration)}</span></div>
      <label className="player-volume"><Volume2/><span className="sr-only">Volume</span><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => { const value=Number(event.target.value); setVolume(value); if(audio.current) audio.current.volume=value; }} /></label>
      <a className="player-external" href={current.link} target="_blank" rel="noopener noreferrer" aria-label="Open full release"><ExternalLink /></a>
      <button className="player-minimize" type="button" onClick={() => setMinimized(!minimized)} aria-label={minimized ? "Expand player" : "Minimize player"}>{minimized ? <ChevronUp/> : <ChevronDown/>}</button>
      <button className="player-close" type="button" onClick={() => { audio.current?.pause(); setCurrent(null); setPlaying(false); }} aria-label="Close player"><X /></button>
      <audio ref={audio} src={current.src} preload="metadata" onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); event.currentTarget.volume=volume; }} onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => skip(1)} />
    </aside>}
  </PlayerContext.Provider>;
}
