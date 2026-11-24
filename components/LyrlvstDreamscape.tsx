"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SocialIcon from "@/components/SocialIcon";
import "./lyrlvst-dreamscape.css";

const links = [
  { name: "Linktree", label: "All worlds", href: "https://linktr.ee/lyrlvst", light: "zenith", path: "M500 350C590 270 405 210 500 82" },
  { name: "YouTube", label: "Watch & wander", href: "https://www.youtube.com/@lyrlvst", light: "dawn", path: "M500 350C355 440 415 168 180 238" },
  { name: "Spotify", label: "Float into sound", href: "https://open.spotify.com/artist/1rrhBuwyg1lxQpoQDqDUr0", light: "dusk", path: "M500 350C675 432 570 150 820 238" },
  { name: "SoundCloud", label: "Follow the echoes", href: "https://soundcloud.com/user-738144184", light: "echo", path: "M500 350C352 305 432 514 240 476" },
  { name: "Bandcamp", label: "Take a dream home", href: "https://lyrlvst.bandcamp.com", light: "tide", path: "M500 350C658 290 578 530 760 476" },
];
export default function LyrlvstDreamscape() {
  const [paused, setPaused] = useState(false);
  return <section className="lyrlvst-dream-section" data-motion={paused ? "paused" : "playing"} aria-labelledby="lyrlvst-dream-heading">
    <header><p>Lyrlvst / After the waking world</p><h2 id="lyrlvst-dream-heading">Somewhere between<br /><em>sound and sleep.</em></h2><p>Drift into Lyrlvst’s music. Follow a light to find your next world.</p></header>
    <div className="lyrlvst-dreamscape">
      <div className="dream-mist mist-violet" aria-hidden="true" /><div className="dream-mist mist-rose" aria-hidden="true" />
      <svg className="dream-constellation" viewBox="0 0 1000 680" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <defs><linearGradient id="lyrlvst-dream-thread" x1="200" y1="80" x2="800" y2="520" gradientUnits="userSpaceOnUse"><stop stopColor="#b8ddf8" /><stop offset=".5" stopColor="#c5b4f0" /><stop offset="1" stopColor="#e9b6d2" /></linearGradient></defs>
        <g className="dream-orbits" stroke="#c7b8eb" strokeOpacity=".14"><ellipse cx="500" cy="350" rx="285" ry="182" transform="rotate(-15 500 350)" /><ellipse cx="500" cy="350" rx="330" ry="211" strokeDasharray="1 14" transform="rotate(12 500 350)" /></g>
        <g stroke="url(#lyrlvst-dream-thread)" strokeLinecap="round">{links.map(link => <g key={link.light}><path className={`dream-thread thread-${link.light}`} d={link.path} pathLength={1} strokeWidth="1.5" /><path className="dream-current" d={link.path} pathLength={1} strokeWidth="2.5" style={{ animationDelay: `${links.indexOf(link) * -1.8}s` }} /></g>)}</g>
        <g className="dream-stars" fill="#e9ddff">{Array.from({ length: 42 }, (_, i) => <circle key={i} cx={85 + ((i * 149) % 830)} cy={30 + ((i * 83) % 575)} r={i % 7 === 0 ? 2.1 : 1} style={{ animationDelay: `${i * -.43}s` }} />)}</g>
        <g stroke="#e5d4fa" strokeWidth="1.2" opacity=".55"><path d="m335 126 0 14m-7-7h14M690 360v18m-9-9h18M330 470v14m-7-7h14" /></g>
        <g className="dream-water" stroke="#b9b2d5" strokeOpacity=".15"><ellipse cx="500" cy="586" rx="170" ry="12" /><ellipse cx="500" cy="590" rx="240" ry="25" /><ellipse cx="500" cy="593" rx="320" ry="42" /></g>
      </svg>
      <div className="dream-portal" aria-hidden="true"><div className="dream-moon" /><span>lyrlvst</span><small>stay a little longer</small></div>
      <nav className="dream-links" aria-label="Lyrlvst’s music platforms">{links.map((link, index) => <div key={link.name} className={`dream-anchor light-${link.light}`}><a className="dream-link" href={link.href} target="_blank" rel="noopener noreferrer" style={{ animationDelay: `${index * -.7}s` }}><SocialIcon platform={link.name} size={22} /><span><small>{link.label}</small><strong>{link.name}</strong></span><ArrowUpRight size={14} /><span className="sr-only">(opens in a new tab)</span></a></div>)}</nav>
      <p className="dream-caption" aria-hidden="true">a small constellation of sound <span>✧</span></p>
    </div>
    <footer><span>Five lights. Endless sound.</span><button className="dream-motion-toggle" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume dream motion" : "Pause dream motion"}</button><a href="https://linktr.ee/lyrlvst" target="_blank" rel="noopener noreferrer">Open the original Linktree <ArrowUpRight size={14} /></a></footer>
  </section>;
}
