"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SocialIcon from "@/components/SocialIcon";
import "./lyrlvst-world-tree.css";

const links = [
  { name: "Linktree", label: "All worlds", href: "https://linktr.ee/lyrlvst", branch: "crown" },
  { name: "YouTube", label: "Watch & listen", href: "https://www.youtube.com/@lyrlvst", branch: "northwest" },
  { name: "Spotify", label: "Stream the music", href: "https://open.spotify.com/artist/1rrhBuwyg1lxQpoQDqDUr0", branch: "northeast" },
  { name: "SoundCloud", label: "Explore the sound", href: "https://soundcloud.com/user-738144184", branch: "west" },
  { name: "Bandcamp", label: "The release archive", href: "https://lyrlvst.bandcamp.com", branch: "east" },
];
const branches = [
  { name: "crown", path: "M500 495C472 390 533 335 498 240C483 182 504 137 500 82" },
  { name: "northwest", path: "M493 419C441 369 449 298 382 267C302 229 240 257 160 218" },
  { name: "northeast", path: "M506 391C564 362 551 302 623 272C701 238 766 248 840 218" },
  { name: "west", path: "M488 480C440 435 375 464 321 435C263 406 222 422 160 401" },
  { name: "east", path: "M506 462C566 417 609 448 671 423C735 397 779 419 840 401" },
];
export default function LyrlvstWorldTree() {
  const [paused, setPaused] = useState(false);
  return <section className="lyrlvst-tree-section" data-motion={paused ? "paused" : "playing"} aria-labelledby="world-tree-heading">
    <header><p>Lyrlvst / The world tree</p><h2 id="world-tree-heading">Rooted in sound.<br /><em>Connected across worlds.</em></h2><p>Follow a branch into Lyrlvst’s music. A living link archive inspired by Yggdrasil.</p></header>
    <div className="lyrlvst-world-tree">
      <div className="world-tree-aura" aria-hidden="true" />
      <svg className="world-tree-art" viewBox="0 0 1000 680" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <defs><linearGradient id="tree-bark" x1="475" y1="600" x2="520" y2="145" gradientUnits="userSpaceOnUse"><stop stopColor="#73654e" /><stop offset=".5" stopColor="#91aa7a" /><stop offset="1" stopColor="#b9d9ab" /></linearGradient><radialGradient id="tree-root-light"><stop stopColor="#a9ddac" stopOpacity=".35" /><stop offset="1" stopColor="#9ac6a2" stopOpacity="0" /></radialGradient></defs>
        <ellipse cx="500" cy="575" rx="290" ry="73" fill="url(#tree-root-light)" />
        <g className="world-tree-orbits" stroke="#a9c3ac" strokeOpacity=".11"><ellipse cx="500" cy="345" rx="345" ry="263" /><ellipse cx="500" cy="345" rx="318" ry="242" strokeDasharray="2 13" /><path d="M500 26V648M98 345h804" /></g>
        <path className="world-tree-trunk" fill="url(#tree-bark)" d="M455 575C495 533 465 486 484 437C503 387 479 358 493 310C506 266 481 225 497 166C502 231 525 265 511 310C497 357 531 389 513 436C492 487 525 532 549 575L516 570L500 592L484 570Z" />
        <g stroke="url(#tree-bark)" strokeLinecap="round" strokeLinejoin="round">
          {branches.map(branch => <path key={branch.name} className={`world-tree-branch branch-${branch.name}`} d={branch.path} pathLength={1} strokeWidth={6} />)}
          <g className="world-tree-canopy" strokeWidth="2.5">
            <path d="M498 240C452 210 430 184 418 134M494 188C537 163 552 130 553 102M441 366C406 330 363 343 337 310M382 267C350 249 330 217 329 178M301 242C269 223 255 194 254 174M571 321C600 287 629 303 665 285M623 272C646 242 657 205 653 175M703 248C727 225 741 197 742 178M357 449C324 453 297 478 277 485M321 435C292 397 293 377 275 354M641 434C671 456 692 474 724 478M680 421C702 393 704 369 720 351" />
            <path d="M418 134l-19-14m22 32 20-20M553 102l-9-22m1 46 20-8M329 178l-16-16m19 38 18-10M254 174l8-20M653 175l17-17m-17 38-20-10M742 178l-7-20M277 485l-18-5M724 478l20-4M275 354l-18-10M720 351l18-13" />
          </g>
          <g className="world-tree-roots" strokeWidth="3"><path d="M479 565c-48 25-70 15-109 38l-60 4m176-32c-28 39-37 36-58 64m72-50v52m16-68c34 32 41 45 69 60m-53-70c45 27 79 18 114 36l45 10" /><path d="m370 603-5 18m66 13-20 4m174-5 18-3m43-31 15-12" strokeWidth="1.5" /></g>
        </g>
        <g className="world-tree-leaves" fill="#b7d9a6">{[[417,129],[441,130],[551,99],[565,118],[330,177],[311,162],[254,172],[264,155],[653,173],[671,158],[742,176],[736,158],[275,351],[256,342],[722,350],[740,338],[336,310],[665,285],[280,483],[724,477]].map(([x,y],index) => <path key={index} d={`M${x} ${y}q-14-18 0-25q14 18 0 25Z`} className="world-tree-leaf" style={{ animationDelay: `${index * -.37}s` }} />)}</g>
        <g className="world-tree-motes" fill="#e0f8c7">{[[455,240],[555,365],[368,373],[639,359],[407,510],[585,505],[478,119],[592,211],[296,286],[718,286],[460,575],[536,574]].map(([cx,cy],index) => <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 2.5 : 1.6} style={{ animationDelay: `${index * -.6}s` }} />)}</g>
      </svg>
      <nav className="world-tree-links" aria-label="Lyrlvst’s music platforms">{links.map(link => <a key={link.name} className={`world-tree-node node-${link.branch}`} href={link.href} target="_blank" rel="noopener noreferrer"><SocialIcon platform={link.name} size={23} /><span><small>{link.label}</small><strong>{link.name}</strong></span><ArrowUpRight size={15} /><span className="sr-only">(opens in a new tab)</span></a>)}</nav>
      <p className="world-tree-root-label" aria-hidden="true">LYRLVST <span>ᛉ · ᛟ · ᚱ</span></p>
    </div>
    <footer><span>Five branches. One artist.</span><button className="tree-motion-toggle" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume tree motion" : "Pause tree motion"}</button><a href="https://linktr.ee/lyrlvst" target="_blank" rel="noopener noreferrer">Open the original Linktree <ArrowUpRight size={14} /></a></footer>
  </section>;
}
