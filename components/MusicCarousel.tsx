"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, motion, useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type MusicCover = { title: string; image: string; slug: string };
export default function MusicCarousel({ covers, paused, onPauseChange }: { covers: MusicCover[]; paused: boolean; onPauseChange: (paused: boolean) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false), [hidden, setHidden] = useState(false), [selected, setSelected] = useState(0);
  const current = useRef(0);
  const angle = useMotionValue(0);
  const transition = useRef<{ stop: () => void } | null>(null);
  const moving = useRef(false);
  const total = covers.length, step = 360 / Math.max(1, total);
  useEffect(() => {
    const visibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => { document.removeEventListener("visibilitychange", visibility); transition.current?.stop(); };
  }, []);
  useMotionValueEvent(angle, "change", value => {
    const index = ((Math.round(-value / step) % Math.max(1, total)) + total) % Math.max(1, total);
    if (index !== current.current) { current.current = index; setSelected(index); }
  });
  useAnimationFrame((_, delta) => {
    if (!paused && !reduced && !hovered && !hidden && inView && !moving.current && total > 1) angle.set(angle.get() - Math.min(delta, 50) * 360 / 48000);
  });
  function turnTo(index: number) {
    onPauseChange(true);
    transition.current?.stop();
    const normalized = ((index % total) + total) % total;
    const target = -normalized * step + Math.round((angle.get() + normalized * step) / 360) * 360;
    moving.current = true;
    transition.current = animate(angle, target, { duration: reduced ? 0 : .85, ease: [.22, .8, .2, 1], onComplete: () => { moving.current = false; } });
  }
  function toggle() { transition.current?.stop(); moving.current = false; onPauseChange(!paused); }
  if (!total) return null;
  const active = covers[selected] ?? covers[0];
  return <div ref={stage} className="music-carousel" role="region" aria-roledescription="carousel" aria-label="Featured music releases" data-rotation={paused || reduced ? "paused" : "playing"} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <div className="music-carousel-viewport">
      <div className="music-carousel-halo" aria-hidden="true" />
      <div className="music-carousel-tilt"><motion.div className="music-carousel-ring" style={{ rotateY: angle }}>
        {covers.map((cover, index) => <div className="music-carousel-card" key={cover.slug} style={{ transform: `rotateY(${index * step}deg) translateZ(var(--carousel-radius))` }}>
          <Link href={`/music/${cover.slug}`} className="music-carousel-front" aria-label={`${index + 1} of ${total}: Explore ${cover.title}`} onFocus={() => turnTo(index)}>
            <Image src={cover.image} alt={`${cover.title} cover artwork`} fill sizes="(max-width: 700px) 160px, 240px" priority={index === 0} />
            <span><span>{cover.title}</span><ArrowUpRight size={15} /></span>
          </Link>
          <div className="music-carousel-back" aria-hidden="true"><span>A / X</span><small>AUREYX<br />SOUND ARCHIVE</small></div>
        </div>)}
      </motion.div></div>
      <div className="music-carousel-platform" aria-hidden="true" />
    </div>
    <div className="music-carousel-caption" aria-live={paused || reduced ? "polite" : "off"} aria-atomic="true"><p>On the turntable / {String(selected + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}</p><Link href={`/music/${active.slug}`}>{active.title}<ArrowUpRight size={15} /></Link></div>
    <div className="music-carousel-controls">
      <button type="button" aria-label="Previous featured release" disabled={total < 2} onClick={() => turnTo(current.current - 1)}><ChevronLeft size={18} /></button>
      {!reduced && <button type="button" className="music-carousel-toggle" aria-pressed={paused} onClick={toggle}>{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? "Resume rotation" : "Pause rotation"}</button>}
      <button type="button" aria-label="Next featured release" disabled={total < 2} onClick={() => turnTo(current.current + 1)}><ChevronRight size={18} /></button>
    </div>
  </div>;
}
