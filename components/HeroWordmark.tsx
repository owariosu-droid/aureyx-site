"use client";
import { useEffect, useRef } from "react";

export default function HeroWordmark() {
  const mark = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const amount = motion.matches ? 0 : Math.min(1, Math.max(0, window.scrollY / 440));
      mark.current?.style.setProperty("--echo-offset", amount * 16 + "px");
      mark.current?.style.setProperty("--echo-strength", String(amount));
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    motion.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return <a ref={mark} className="hero-echo-mark" href="https://linktr.ee/dystofuturemusic23" target="_blank" rel="noopener noreferrer" aria-label="Open the Aureyx Linktree">
    <span className="wordmark-echo wordmark-echo--far" aria-hidden="true">Aureyx</span>
    <span className="wordmark-echo wordmark-echo--middle" aria-hidden="true">Aureyx</span>
    <span className="wordmark-echo wordmark-echo--near" aria-hidden="true">Aureyx</span>
    <span className="wordmark-face">Aureyx</span>
  </a>;
}
