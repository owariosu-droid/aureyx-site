"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Play, X } from "lucide-react";
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

const releaseEmbeds: Record<string, { platform: "Bandcamp" | "Spotify"; src: string }> = {
  "https://dystofuturemusic.bandcamp.com/album/devourer": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/album=49285777/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://open.spotify.com/album/6W9618MAoMyOgYcWgx6glU": { platform: "Spotify", src: "https://open.spotify.com/embed/album/6W9618MAoMyOgYcWgx6glU?utm_source=generator&theme=0" },
  "https://dystofuturemusic.bandcamp.com/album/oblivion": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/album=554284494/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/dream-barrier": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=388655618/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/album/grimvex-prod-jxzz-hollow-zero-echoes-from-the-void-ft-prod-jxzz-album-mini-preview": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/album=3544674445/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/album/iyune-lyrlvst-reverent-blade-original-and-remastered-pack": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/album=2844996862/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/iyune-scarlet-oasis-lyrlvst-remix": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=3401585077/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/lyrlvst-nerv-failure-ft-dysto": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=2694153256/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/dysto-reverie-sonic-night-ii-daybreak-track-2": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=3643731840/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/reboot-ft-lyrlvst-0kami-replaced-track-3-for-kyouki-001": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=1374587952/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/dysto-retroverse-sonic-night-ii-daybreak-track-1": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=3886827717/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/dysto-2070-deluxe-edition-voxblade-opening-track": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=3961780529/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/iyune-ultimate-magic": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=1572231806/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/iyune-ultimate-magic-mythic-edition": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=1947828330/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/album/iyune-lyrlvst-dysto-nocturne-midnight": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/album=190471252/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/iyune-empyrean": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=1677371080/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/disassociation-lyrlvsts-kataklysm-remake-ft-dysto-from-voxblade": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=303681340/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/album/dysto-voxblade": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/album=590355496/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/iyune-lyrlvst-0kami-dyschronia": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=3329761273/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
  "https://dystofuturemusic.bandcamp.com/track/lyrlvst-chasm-of-eternity": { platform: "Bandcamp", src: "https://bandcamp.com/EmbeddedPlayer/v=2/track=1143968467/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/" },
};

export default function HomeReleases() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const filtered = albums.filter((album) => album.title.toLowerCase().includes(query.toLowerCase().trim()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = page * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <>
      <label className="release-search">Search releases<input type="search" placeholder="Song or artist" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label>
      {!filtered.length && <p role="status" className="release-no-results">No releases found. Try another song or artist.</p>}
      <div id="release-catalog" className="transmission-release-grid">
        {visible.map((album, index) => {
          const embed = releaseEmbeds[album.link]!;
          const isPlaying = activePreview === album.link;
          return (
          <article className={`transmission-release${isPlaying ? " is-previewing" : ""}`} key={album.link}>
            <div className="transmission-release-art">
              <Image src={album.image} alt={`${album.title} cover`} fill sizes="(max-width: 700px) 45vw, (max-width: 1000px) 45vw, 23vw" />
              <button className="release-preview-button" type="button" aria-expanded={isPlaying} aria-label={`${isPlaying ? "Close" : "Play"} ${album.title} preview`} onClick={() => setActivePreview(isPlaying ? null : album.link)}>{isPlaying ? <X size={20} /> : <Play size={20} fill="currentColor" />}<span>{isPlaying ? "Close player" : "Play preview"}</span></button>
            </div>
            <div className="transmission-release-title"><h3>{album.title}</h3><a href={album.link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${album.title} on ${embed.platform}`}><ArrowUpRight size={18} /></a></div>
            <p>AX / {String(start + index + 1).padStart(3, "0")} <span>{releasePrices[album.link] ?? "Listen"}</span></p>
            {isPlaying && <div className={`release-inline-player ${embed.platform.toLowerCase()}`}><div><SocialIcon platform={embed.platform} /><span>Preview on {embed.platform}</span><a href={album.link} target="_blank" rel="noopener noreferrer">Open release <ArrowUpRight size={13} /></a></div><iframe src={embed.src} title={`${album.title} ${embed.platform} preview`} allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" /></div>}
          </article>
        )})}
      </div>
      <div className="release-pagination">
        <p aria-live="polite" aria-atomic="true">{filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)} of {filtered.length} releases <span> · Page {page + 1} of {pageCount}</span></p>
        <div>
          <button type="button" aria-controls="release-catalog" disabled={page === 0} onClick={() => { setActivePreview(null); setPage(page - 1); }}><ChevronLeft size={16} /> Previous</button>
          <button type="button" aria-controls="release-catalog" disabled={page === pageCount - 1} onClick={() => { setActivePreview(null); setPage(page + 1); }}>Next <ChevronRight size={16} /></button>
        </div>
      </div>
    </>
  );
}
