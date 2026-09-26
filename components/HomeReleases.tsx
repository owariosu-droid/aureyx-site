"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { albums } from "@/data/albums";
import SocialIcon from "@/components/SocialIcon";

const pageSize = 6;
const releasePrices: Record<string, string> = {
  "https://dystofuturemusic.bandcamp.com/album/devourer": "$9.99",
  "https://open.spotify.com/album/6W9618MAoMyOgYcWgx6glU": "Streaming",
  "https://dystofuturemusic.bandcamp.com/album/oblivion": "$5.99",
  "https://dystofuturemusic.bandcamp.com/track/dream-barrier": "$0.99",
  "https://dystofuturemusic.bandcamp.com/album/grimvex-prod-jxzz-hollow-zero-echoes-from-the-void-ft-prod-jxzz-album-mini-preview": "$5",
  "https://dystofuturemusic.bandcamp.com/album/iyune-lyrlvst-reverent-blade-original-and-remastered-pack": "$5",
  "https://dystofuturemusic.bandcamp.com/track/iyune-scarlet-oasis-lyrlvst-remix": "$0.99",
  "https://dystofuturemusic.bandcamp.com/track/lyrlvst-nerv-failure-ft-dysto": "$0.99",
  "https://dystofuturemusic.bandcamp.com/track/dysto-reverie-sonic-night-ii-daybreak-track-2": "$0.50",
  "https://dystofuturemusic.bandcamp.com/track/reboot-ft-lyrlvst-0kami-replaced-track-3-for-kyouki-001": "Name your price",
  "https://dystofuturemusic.bandcamp.com/track/dysto-retroverse-sonic-night-ii-daybreak-track-1": "$0.50",
  "https://dystofuturemusic.bandcamp.com/track/dysto-2070-deluxe-edition-voxblade-opening-track": "Name your price",
  "https://dystofuturemusic.bandcamp.com/track/iyune-ultimate-magic": "$0.50",
  "https://dystofuturemusic.bandcamp.com/track/iyune-ultimate-magic-mythic-edition": "$0.50",
  "https://dystofuturemusic.bandcamp.com/album/iyune-lyrlvst-dysto-nocturne-midnight": "Name your price",
  "https://dystofuturemusic.bandcamp.com/track/iyune-empyrean": "$0.50",
  "https://dystofuturemusic.bandcamp.com/track/disassociation-lyrlvsts-kataklysm-remake-ft-dysto-from-voxblade": "$0.99",
  "https://dystofuturemusic.bandcamp.com/album/dysto-voxblade": "$9",
  "https://dystofuturemusic.bandcamp.com/track/iyune-lyrlvst-0kami-dyschronia": "$0.50",
  "https://dystofuturemusic.bandcamp.com/track/lyrlvst-chasm-of-eternity": "$0.50",
};

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
              <span className="transmission-release-play"><SocialIcon platform={album.link.includes("spotify.com") ? "Spotify" : "Bandcamp"} size={22} /> Listen now <ArrowUpRight size={18} /></span>
            </div>
            <div className="transmission-release-title"><h3>{album.title}</h3><ArrowUpRight size={18} /></div>
            <p>AX / {String(start + index + 1).padStart(3, "0")} <span>{releasePrices[album.link] ?? "Listen"}</span></p>
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
