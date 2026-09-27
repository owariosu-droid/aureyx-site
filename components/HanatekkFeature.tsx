"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Pause, Play, Shuffle } from "lucide-react";

const previews = [
  { title: "MOUSOU REBOOT", src: "/hanatekk-previews/mousoureboot.wav" },
  { title: "HI-TECH CATHEDRIA", src: "/hanatekk-previews/hi-tech-cathedria.wav" },
  { title: "REALITY // SEVERANCE", src: "/hanatekk-previews/reality-severance.wav" },
  { title: "HAPPY SHXTTY LIFE", src: "/hanatekk-previews/happy-shxtty-life.wav" },
  { title: "REJECTION", src: "/hanatekk-previews/rejection.wav" },
];

const artists = [
  { name: "0KAMI", image: "/hanatekk/okami.png", region: "Japan" },
  { name: "luvnozomi", image: "/hanatekk/luvnozomi.jpg", region: "Japan" },
  { name: "Dysto", image: "/hanatekk/dysto.jpg", region: "United States" },
  { name: "iyune", image: "/members/iyune.png", region: "United States" },
];

export default function HanatekkFeature() {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  const playAt = async (index: number) => {
    const player = audio.current;
    if (!player) return;
    setCurrent(index);
    player.src = previews[index].src;
    player.load();
    try {
      await player.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const shuffle = () => {
    const offset = 1 + Math.floor(Math.random() * (previews.length - 1));
    void playAt((current + offset) % previews.length);
  };

  const handleClick = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      const player = audio.current;
      if (!player) return;
      if (player.paused) void player.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      else { player.pause(); setPlaying(false); }
      return;
    }
    shuffle();
  };

  return (
    <section className="transmission-section hanatekk-section" aria-labelledby="hanatekk-heading">
      <div className="hanatekk-player">
        <button type="button" className="hanatekk-logo-wrap" data-protected-image aria-label={`${playing ? "Pause" : "Play"} ${previews[current].title} preview. Hover to shuffle previews.`} onPointerEnter={(event) => { if (event.pointerType === "mouse") shuffle(); }} onClick={handleClick}>
          <Image src="/hanatekk-logo.png" alt="Hanatekk JEDM lotus logo" width={1254} height={1254} sizes="(max-width: 700px) 82vw, 470px" priority={false} />
          <span className="hanatekk-play-state" aria-hidden="true">{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</span>
        </button>
        <div className="hanatekk-preview-status"><Shuffle size={15} aria-hidden="true" /><span>Previewing</span><strong>{previews[current].title}</strong></div>
        <audio ref={audio} src={previews[current].src} controls controlsList="nodownload noplaybackrate" preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} aria-label={`${previews[current].title} excerpt`} />
        <p>Hover the logo to shuffle. Tap it on mobile.</p>
      </div>
      <div className="hanatekk-copy">
        <p className="transmission-eyebrow">04 / Connected label</p>
        <h2 id="hanatekk-heading">Hanatekk<br /><em>JEDM</em></h2>
        <p>Hanatekk JEDM is a Japanese hardcore and EDM label featuring Japanese artists 0KAMI and luvnozomi, alongside American artists Dysto and iyune.</p>
        <div className="hanatekk-artist-row" aria-label="Featured artists">
          <span className="hanatekk-with">with</span>
          {artists.map((artist) => <span className="hanatekk-artist" key={artist.name}><Image src={artist.image} alt="" width={32} height={32} /><span><strong>{artist.name}</strong><small>{artist.region}</small></span></span>)}
        </div>
        <div className="hanatekk-id">{"// HANATEKK // KYOUKI 001"}</div>
      </div>
    </section>
  );
}
