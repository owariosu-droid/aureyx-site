"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import SocialIcon from "@/components/SocialIcon";
import MusicCarousel, { type MusicCover } from "@/components/MusicCarousel";

export default function MusicCatalogHero({ covers, count }: { covers: MusicCover[]; count: number }) {
  const hero = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);
  const still = reduced || motionPaused;
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, -35]);

  return <header ref={hero} className="music-experience-hero" data-motion={still ? "paused" : "playing"}>
    <div className="music-orbits" aria-hidden="true"><i /><i /><i /></div>
    <div className="music-hero-copy">
      <p className="transmission-eyebrow"><span className="signal-dot" /> Aureyx / Sound archive</p>
      <h1>Music<span>Sound in orbit.</span></h1>
      <p className="music-hero-description">Independent sounds. Shared worlds. Explore {count} releases from Aureyx and its collaborators.</p>
      <div className="music-hero-actions"><a href="#release-catalog-section" className="transmission-button primary">Explore releases <ArrowDown size={16} /></a><a className="music-bandcamp-link" href="https://dystofuturemusic.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Bandcamp" /> Bandcamp <ArrowUpRight size={16} /></a></div>
      <div className="music-hero-footnote"><span>{String(count).padStart(2, "0")} releases / One collective</span><Link href="/artists">Meet the artists <ArrowUpRight size={14} /></Link></div>
    </div>
    <motion.div className="music-art-stage music-carousel-stage" style={{ y: still ? 0 : stageY }}>
      <MusicCarousel covers={covers} paused={motionPaused} onPauseChange={setMotionPaused} />
    </motion.div>
    <div className="music-scroll-note" aria-hidden="true"><span>Scroll to tune in</span><ArrowDown size={16} /></div>
  </header>;
}
