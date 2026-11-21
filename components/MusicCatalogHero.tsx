"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import SocialIcon from "@/components/SocialIcon";

type Cover = { title: string; image: string; slug: string };

export default function MusicCatalogHero({ covers, count }: { covers: Cover[]; count: number }) {
  const hero = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [motionPaused, setMotionPaused] = useState(false);
  const still = reduced || motionPaused;
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const frontY = useTransform(scrollYProgress, [0, 1], [0, -65]);
  const backY = useTransform(scrollYProgress, [0, 1], [0, 55]);
  const recordRotation = useTransform(scrollYProgress, [0, 1], [-15, 45]);

  return <header ref={hero} className="music-experience-hero" data-motion={still ? "paused" : "playing"}>
    <div className="music-orbits" aria-hidden="true"><i /><i /><i /></div>
    <div className="music-hero-copy">
      <p className="transmission-eyebrow"><span className="signal-dot" /> Aureyx / Sound archive</p>
      <h1>Music<span>Beyond the ordinary.</span></h1>
      <p className="music-hero-description">Independent sounds. Shared worlds. Explore {count} releases from Aureyx and its collaborators.</p>
      <div className="music-hero-actions"><a href="#release-catalog-section" className="transmission-button primary">Explore releases <ArrowDown size={16} /></a><a className="music-bandcamp-link" href="https://dystofuturemusic.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Bandcamp" /> Bandcamp <ArrowUpRight size={16} /></a></div>
      <div className="music-hero-footnote"><span>{String(count).padStart(2, "0")} releases / One collective</span><Link href="/artists">Meet the artists <ArrowUpRight size={14} /></Link></div>
    </div>
    <div className="music-art-stage" aria-label="Selected release artwork">
      <motion.div className="music-record" aria-hidden="true" style={{ rotate: still ? -15 : recordRotation }}><span>A / X</span></motion.div>
      {covers.map((cover, index) => <motion.div className={`music-floating-cover music-cover-${index}`} key={cover.slug} style={{ y: still ? 0 : index === 1 ? frontY : backY }}>
        <Link href={`/music/${cover.slug}`} aria-label={`Explore ${cover.title}`}><Image src={cover.image} alt={`${cover.title} cover artwork`} fill sizes="(max-width: 700px) 45vw, 300px" priority={index === 1} /><span>{cover.title}<ArrowUpRight size={16} /></span></Link>
      </motion.div>)}
      <div className="music-stage-caption"><span>Selected from the archive</span><div className="music-wave" aria-hidden="true">{Array.from({ length: 17 }, (_, index) => <i key={index} style={{ height: `${8 + ((index * 13) % 27)}px`, animationDelay: `${index * -.15}s` }} />)}</div></div>
    </div>
    <div className="music-scroll-note" aria-hidden="true"><span>Scroll to tune in</span><ArrowDown size={16} /></div>
    {!reduced && <button className="music-motion-toggle" type="button" aria-pressed={motionPaused} onClick={() => setMotionPaused(!motionPaused)}>{motionPaused ? "Resume motion" : "Pause motion"}</button>}
  </header>;
}
