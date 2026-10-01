"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SocialIcon from "@/components/SocialIcon";
import { artists } from "@/data/artists";
import { releases } from "@/lib/releases";

const links = [
  { name: "Home", href: "/" }, { name: "Artists", href: "/artists" },
  { name: "Music", href: "/music" }, { name: "Videos", href: "/videos", icon: "YouTube" },
  { name: "For Fun", href: "/for-fun" },
  { name: "Nocturna", href: "https://nocturnakits.gumroad.com/l/oeveok", external: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearching(true); }
      if (event.key === "Escape") { setSearching(false); setOpen(false); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (open || searching) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open, searching]);
  const results = useMemo(() => {
    const value = query.trim().toLowerCase(); if (!value) return [];
    const destinations = [
      { label:"Aureyx videos", type:"Page", href:"/videos", terms:"youtube channels music videos" },
      { label:"Artist posts", type:"Publishing", href:"/publish", terms:"blog updates submit post" },
      { label:"Yoru Zenaku concept art", type:"Artwork", href:"/artists/yoru-zenaku#concept-art", terms:"gallery art yoru" },
      { label:"osu! mapping projects", type:"For fun", href:"/gaming/osu", terms:"gaming maps rhythm" },
      { label:"Nocturna sound kits", type:"Sound design", href:"/#nocturna", terms:"samples sounds iyune" },
    ];
    return [
      ...artists.filter((item) => `${item.name} ${item.role} ${item.bio}`.toLowerCase().includes(value)).map((item) => ({ label:item.name, type:"Artist", href:`/artists/${item.slug}` })),
      ...releases.filter((item) => `${item.title} ${item.artist} ${item.format}`.toLowerCase().includes(value)).slice(0,8).map((item) => ({ label:item.title, type:item.format, href:`/music/${item.slug}` })),
      ...destinations.filter((item) => `${item.label} ${item.terms}`.toLowerCase().includes(value)),
    ].slice(0,12);
  }, [query]);
  return <>
    <nav aria-label="Main navigation" className={`aureyx-nav${open ? " is-open" : ""}`}>
      <div>
        <Link href="/" aria-label="Aureyx home" className="nav-brand">AUREYX</Link>
        <button className="nav-search" type="button" onClick={() => setSearching(true)} aria-label="Search Aureyx"><Search /> <span>Search</span><kbd>⌘K</kbd></button>
        <button className="nav-menu" type="button" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}<span>{open ? "Close" : "Menu"}</span></button>
        <ul id="main-menu">
          {links.map((link) => { const active = !link.external && (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)); return <li key={link.href}>{link.external ? <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{link.name} ↗</a> : <Link href={link.href} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}><span className="nav-link-label">{link.name}{link.icon && <SocialIcon platform={link.icon} size={15} />}</span></Link>}</li>; })}
        </ul>
      </div>
    </nav>
    {searching && <div className="site-search-backdrop" role="dialog" aria-modal="true" aria-label="Search Aureyx" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearching(false); }}>
      <div className="site-search-panel"><div><Search /><input autoFocus type="search" placeholder="Search Aureyx" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" onClick={() => setSearching(false)} aria-label="Close search"><X /></button></div>
      <ul>{query && !results.length ? <li className="site-search-empty">No matches</li> : results.map((result) => <li key={result.href}><Link href={result.href} onClick={() => { setSearching(false); setQuery(""); }}><span>{result.label}</span><small>{result.type}</small></Link></li>)}</ul><p>Press Esc to close</p></div>
    </div>}
  </>;
}
