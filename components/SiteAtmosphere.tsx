"use client";

import { useEffect, useRef } from "react";

export default function SiteAtmosphere() {
  const progress = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const available = document.documentElement.scrollHeight - window.innerHeight;
        const value = available > 0 ? Math.min(1, window.scrollY / available) : 0;
        progress.current?.style.setProperty("--scroll-progress", String(value));
      });
    };
    const updateGlow = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      glow.current?.style.setProperty("--pointer-x", `${event.clientX}px`);
      glow.current?.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    window.addEventListener("pointermove", updateGlow, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("pointermove", updateGlow);
    };
  }, []);

  return <><div ref={progress} className="site-scroll-progress" aria-hidden="true" /><div ref={glow} className="site-pointer-glow" aria-hidden="true" /></>;
}
