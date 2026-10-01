"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { releases } from "@/lib/releases";
import { useAudioPlayer } from "@/components/AudioPlayerProvider";
import SocialIcon from "@/components/SocialIcon";

const pageSize = 6;
import { releasePrices } from "@/data/release-prices";

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

function ReleasePreview({ albumTitle, embed, releaseLink }: { albumTitle: string; embed: { platform: "Bandcamp" | "Spotify"; src: string }; releaseLink: string }) {
  const bandcampPreview = releaseLink.includes("bandcamp.com/")
    ? `/previews/${releaseLink.split("/").filter(Boolean).at(-1)}.m4a`
    : null;
  return (
    <div className={`release-inline-player ${embed.platform.toLowerCase()}`}>
      <div>
        <SocialIcon platform={embed.platform} />
        <span>Excerpt preview</span>
        <a href={releaseLink} target="_blank" rel="noopener noreferrer">Full release <ArrowUpRight size={13} /></a>
      </div>
      {bandcampPreview
        ? <audio controls controlsList="nodownload noplaybackrate" preload="metadata" src={bandcampPreview} aria-label={`${albumTitle} excerpt preview`} />
        : <iframe src={embed.src} title={`${albumTitle} ${embed.platform} excerpt preview`} allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" />}
    </div>
  );
}

export default function HomeReleases() {
  const player = useAudioPlayer();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);
  const [artist, setArtist] = useState("All artists");
  const [format, setFormat] = useState("All formats");
  const artistOptions = ["All artists", ...Array.from(new Set(releases.map((release) => release.artist))).sort()];
  const filtered = releases.filter((release) => release.title.toLowerCase().includes(query.toLowerCase().trim()) && (artist === "All artists" || release.artist === artist) && (format === "All formats" || release.format === format));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = page * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <>
      <div className="release-tools"><label className="release-search">Search releases<input type="search" placeholder="Song or artist" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label><label>Artist<select value={artist} onChange={(event) => { setArtist(event.target.value); setPage(0); }}>{artistOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>Format<select value={format} onChange={(event) => { setFormat(event.target.value); setPage(0); }}>{["All formats","Album","Single","Pack"].map((option) => <option key={option}>{option}</option>)}</select></label></div>
      {!filtered.length && <p role="status" className="release-no-results">No releases found. Try another song or artist.</p>}
      <div id="release-catalog" className="transmission-release-grid">
        {visible.map((album, index) => {
          const embed = releaseEmbeds[album.link]!;
          const isPlaying = player.current?.link === album.link && player.playing;
          return (
          <article className={`transmission-release${isPlaying ? " is-previewing" : ""}`} key={album.link}>
            <div className="transmission-release-art">
              <Image src={album.image} alt={`${album.title} cover`} fill sizes="(max-width: 700px) 45vw, (max-width: 1000px) 45vw, 23vw" />
              {album.preview ? <button className="release-preview-button" type="button" aria-pressed={isPlaying} aria-label={`${isPlaying ? "Pause" : "Play"} ${album.title} preview`} onClick={() => player.play({ title:album.title,image:album.image,src:album.preview!,link:album.link,slug:album.slug })}>{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}<span>{isPlaying ? "Pause preview" : "Play preview"}</span></button> : <button className="release-preview-button" type="button" aria-expanded={activeEmbed === album.link} onClick={() => setActiveEmbed(activeEmbed === album.link ? null : album.link)}><Play size={20} fill="currentColor" /><span>Open preview</span></button>}
            </div>
            <div className="transmission-release-title"><h3><Link href={`/music/${album.slug}`}>{album.title}</Link></h3><a href={album.link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${album.title} on ${embed.platform}`}><ArrowUpRight size={18} /></a></div>
            <p>AX / {String(start + index + 1).padStart(3, "0")} <span>{releasePrices[album.link] ?? "Listen"}</span></p>
            {!album.preview && activeEmbed === album.link && <ReleasePreview albumTitle={album.title} embed={embed} releaseLink={album.link} />}
          </article>
        )})}
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
