"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
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
  const results = useMemo(() => {
    const value = query.trim().toLowerCase(); if (!value) return [];
    return [
      ...artists.filter((item) => item.name.toLowerCase().includes(value)).map((item) => ({ label:item.name, type:"Artist", href:`/artists/${item.slug}` })),
      ...releases.filter((item) => item.title.toLowerCase().includes(value)).slice(0,8).map((item) => ({ label:item.title, type:item.format, href:`/music/${item.slug}` })),
    ].slice(0,10);
  }, [query]);
  return <>
    <nav aria-label="Main navigation" className={`aureyx-nav${open ? " is-open" : ""}`}>
      <div>
        <Link href="/" aria-label="Aureyx home" className="nav-brand">AUREYX</Link>
        <button className="nav-search" type="button" onClick={() => setSearching(true)} aria-label="Search artists and releases"><Search /> <span>Search</span><kbd>⌘K</kbd></button>
        <button className="nav-menu" type="button" aria-expanded={open} aria-controls="main-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}<span>{open ? "Close" : "Menu"}</span></button>
        <ul id="main-menu">
          {links.map((link) => <li key={link.href}>{link.external ? <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{link.name} ↗</a> : <Link href={link.href} onClick={() => setOpen(false)}><span className="nav-link-label">{link.name}{link.icon && <SocialIcon platform={link.icon} size={15} />}</span></Link>}</li>)}
        </ul>
      </div>
    </nav>
    {searching && <div className="site-search-backdrop" role="dialog" aria-modal="true" aria-label="Search Aureyx" onMouseDown={(event) => { if (event.target === event.currentTarget) setSearching(false); }}>
      <div className="site-search-panel"><div><Search /><input autoFocus type="search" placeholder="Search artists and releases" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="button" onClick={() => setSearching(false)} aria-label="Close search"><X /></button></div>
      <ul>{query && !results.length ? <li className="site-search-empty">No matches</li> : results.map((result) => <li key={result.href}><Link href={result.href} onClick={() => { setSearching(false); setQuery(""); }}><span>{result.label}</span><small>{result.type}</small></Link></li>)}</ul><p>Press Esc to close</p></div>
    </div>}
  </>;
}
