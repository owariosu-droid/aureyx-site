import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gamepad2 } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/app/home.css";
import "./tools.css";
import "./bpm-finder/bpm.css";

const apps = [
  { name: "Voice Pitch", description: "Sing or hum to find your note", href: "/for-fun/pitch-detector", image: "/tools/pitch.svg" },
  { name: "BPM Finder", description: "Find the tempo of an audio file", href: "/for-fun/bpm-finder", image: "/tools/bpm.svg" },
  { name: "Nox", description: "Open the sound sanctuary", href: "https://aureyxneuralnetwork.vercel.app", image: "/tools/nox.svg" },
];
export default function ForFunPage() {
  return <div className="fun-portal fun-page"><Navbar /><main><header className="fun-heading"><p className="transmission-eyebrow">Outside the label</p><h1>For Fun</h1><p>Music tools, personal projects, and games.</p></header>
    <section className="fun-apps-section" aria-labelledby="music-tools"><div className="fun-apps-heading"><h2 id="music-tools">Music apps</h2><p>Choose a tool to get started.</p></div><div className="fun-app-grid">{apps.map(app => {
      const content = <><Image src={app.image} alt="" width={160} height={160} className="fun-app-icon" /><span>{app.name}</span><span className="sr-only">{app.description}{app.href.startsWith("https:") ? " (opens in a new tab)" : ""}</span></>;
      return app.href.startsWith("https:") ? <a key={app.name} href={app.href} className="fun-app" target="_blank" rel="noopener noreferrer">{content}</a> : <a key={app.name} href={app.href} className="fun-app">{content}</a>;
    })}</div></section>
    <h2 className="fun-section-title" id="gaming">Personal showcases</h2><section className="fun-grid" aria-labelledby="gaming">
      <Link href="/gaming/osu" className="fun-card"><Image src="/osu/in-game-background-ariisha.png" alt="osu! seasonal artwork" fill sizes="(max-width:800px) 92vw,650px" /><span className="fun-card-shade" /><Image src="/osu/osu-logo.png" alt="osu!" width={64} height={64} className="fun-osu-logo" /><div><Gamepad2 aria-hidden="true" /><p>Rhythm game / Personal profile</p><h2>osu!</h2><span>Maps, scores, goals, and equipment <ArrowUpRight /></span></div></Link>
      <Link href="/gaming/geometry-dash" className="fun-card"><Image src="/tools/geometry-dash.svg" alt="" fill sizes="(max-width:800px) 92vw,650px" className="object-cover" /><span className="fun-card-shade" /><div><Gamepad2 aria-hidden="true" /><p>Rhythm game / Personal showcase</p><h2>Geometry Dash</h2><span>Progress and videos <ArrowUpRight /></span></div></Link>
    </section></main><Footer /></div>;
}
