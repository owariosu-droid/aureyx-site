"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, AudioLines, ChevronLeft, ChevronRight } from "lucide-react";
import { albums } from "@/data/albums";

const pageSize = 8;

export default function HomeReleases() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const filtered = albums.filter((album) => album.title.toLowerCase().includes(query.toLowerCase().trim()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = page * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <>
      <label className="release-search">Search releases<input type="search" placeholder="Song or artist" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label>
      {!filtered.length && <p role="status" className="release-no-results">No releases found. Try another song or artist.</p>}
      <div id="release-catalog" className="transmission-release-grid">
        {visible.map((album, index) => (
          <a className="transmission-release" key={album.link} href={album.link} target="_blank" rel="noopener noreferrer">
            <div className="transmission-release-art">
              <Image src={album.image} alt={`${album.title} cover`} fill sizes="(max-width: 700px) 45vw, (max-width: 1000px) 45vw, 23vw" />
              <span className="transmission-release-play"><AudioLines size={24} /> Listen now <ArrowUpRight size={18} /></span>
            </div>
            <div className="transmission-release-title"><h3>{album.title}</h3><ArrowUpRight size={18} /></div>
            <p>AX / {String(start + index + 1).padStart(3, "0")} <span>Release</span></p>
          </a>
        ))}
      </div>
      <div className="release-pagination">
        <p aria-live="polite" aria-atomic="true">{filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)} of {filtered.length} releases <span> · Page {page + 1} of {pageCount}</span></p>
        <div>
          <button type="button" aria-controls="release-catalog" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /> Previous</button>
          <button type="button" aria-controls="release-catalog" disabled={page === pageCount - 1} onClick={() => setPage(page + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      </div>
    </>
  );
}
