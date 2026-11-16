import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gamepad2, Mic, AudioLines } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/app/home.css";
import "./bpm-finder/bpm.css";

export default function ForFunPage() {
  return (
    <div className="transmission-home fun-page">
      <Navbar />
      <main>
        <header className="fun-heading">
          <p className="transmission-eyebrow">Outside the label</p>
          <h1>For Fun</h1>
          <p>Personal projects and things we play. This section isn&apos;t part of Aureyx releases or artist work.</p>
        </header>
        <h2 className="fun-section-title" id="music-tools">Music tools</h2>
        <section className="fun-grid" aria-labelledby="music-tools">
          <Link href="/for-fun/pitch-detector" className="fun-card"><div><Mic aria-hidden="true" /><p>Music tool</p><h2>Voice Pitch Detector</h2><span>Sing or hum to find your note <ArrowUpRight /></span></div></Link>
          <Link href="/for-fun/bpm-finder" className="fun-card"><div><AudioLines aria-hidden="true" /><p>Music tool</p><h2>Audio BPM Finder</h2><span>Choose audio to find its tempo <ArrowUpRight /></span></div></Link>
        </section>
        <h2 className="fun-section-title" id="gaming">Gaming</h2>
        <section className="fun-grid" aria-labelledby="gaming">
          <Link href="/gaming/osu" className="fun-card">
            <Image src="/osu/in-game-background-ariisha.png" alt="osu! seasonal artwork" fill sizes="(max-width: 800px) 92vw, 650px" />
            <span className="fun-card-shade" />
            <Image src="/osu/osu-logo.png" alt="osu!" width={64} height={64} className="fun-osu-logo" />
            <div><Gamepad2 aria-hidden="true" /><p>Rhythm game</p><h2>osu!</h2><span>Maps, scores, goals, and equipment <ArrowUpRight /></span></div>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
