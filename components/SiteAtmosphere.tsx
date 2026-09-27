"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SiteAtmosphere() {
  const progress = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    const targets = document.querySelectorAll<HTMLElement>("main > header, main > section, .artist-directory-card, .artist-profile-card, .osu-panel, .home-video-channel, .transmission-release, .home-linktree-card, .fun-card");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -5%" });
    targets.forEach((target, index) => {
      target.classList.add("site-reveal");
      target.style.setProperty("--reveal-delay", `${(index % 5) * 55}ms`);
      if (reduceMotion) target.classList.add("is-visible");
      else observer.observe(target);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      observer.disconnect();
    };
  }, [pathname]);

  return <div ref={progress} className="site-scroll-progress" aria-hidden="true" />;
}
