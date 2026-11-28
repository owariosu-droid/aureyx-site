"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { matchesReleaseArtist, releaseDateLabel, releases } from "@/lib/releases";
import { useAudioPlayer } from "@/components/AudioPlayerProvider";
import SocialIcon from "@/components/SocialIcon";
import SaveReleaseButton, { useListeningList } from "@/components/SaveReleaseButton";

const pageSize = 6;
import { releasePrices } from "@/data/release-prices";

function ReleasePreview({ albumTitle, embed, releaseLink }: { albumTitle: string; embed: { platform: "Bandcamp" | "Spotify"; src: string }; releaseLink: string }) {
  return (
    <div className={`release-inline-player ${embed.platform.toLowerCase()}`}>
      <div>
        <SocialIcon platform={embed.platform} />
        <span>Listen on {embed.platform}</span>
        <a href={releaseLink} target="_blank" rel="noopener noreferrer">Full release <ArrowUpRight size={13} /></a>
      </div>
      <iframe src={embed.src} title={`${albumTitle} ${embed.platform} preview`} allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" />
    </div>
  );
}

export default function HomeReleases({ artistName, collection = "all", catalogId = "release-catalog", savedOnly = false }: { artistName?: string; collection?: "all" | "supporter" | "free" | "streaming"; catalogId?: string; savedOnly?: boolean }) {
  const saved = useListeningList();
  const player = useAudioPlayer();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);
  const [artist, setArtist] = useState("All artists");
  const [format, setFormat] = useState("All formats");
  const catalog = releases.filter((release) => collection === "all" || release.access === collection);
  const artistOptions = ["All artists", ...Array.from(new Set(catalog.flatMap((release) => [release.artist, ...release.contributors]))).sort()];
  const filtered = catalog.filter((release) =>
    (!savedOnly || saved.includes(release.slug)) &&
    (!artistName || matchesReleaseArtist(release, artistName)) &&
    `${release.title} ${release.artist} ${release.contributors.join(" ")}`.toLowerCase().includes(query.toLowerCase().trim()) &&
    (artist === "All artists" || matchesReleaseArtist(release, artist)) &&
    (format === "All formats" || release.format === format),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <>
      <div className={`release-tools${artistName ? " artist-scoped" : ""}`}><label className="release-search">Search releases<input type="search" placeholder="Song or artist" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label>{!artistName && <label>Artist<select aria-label="Artist" value={artist} onChange={(event) => { setArtist(event.target.value); setPage(0); }}>{artistOptions.map((option) => <option key={option}>{option}</option>)}</select></label>}<label>Format<select aria-label="Format" value={format} onChange={(event) => { setFormat(event.target.value); setPage(0); }}>{["All formats","Album","Single","Pack"].map((option) => <option key={option}>{option}</option>)}</select></label></div>
      {!filtered.length && <p role="status" className="release-no-results">{savedOnly && !saved.length ? "Your list is empty. Save releases from the music page to keep them here." : "No releases found. Try another song or artist."}</p>}
      <div id={catalogId} className="transmission-release-grid">
        {visible.map((album, index) => {
          const embed = { platform: album.platform, src: album.embed };
          const isPlaying = player.current?.link === album.link && player.playing;
          return (
          <article className={`transmission-release${isPlaying ? " is-previewing" : ""}`} key={album.link}>
            <div className="transmission-release-art">
              <Image src={album.image} alt={`${album.title} cover`} fill sizes="(max-width: 700px) 45vw, (max-width: 1000px) 45vw, 23vw" />
              {album.preview ? <button className="release-preview-button" type="button" aria-pressed={isPlaying} aria-label={`${isPlaying ? "Pause" : "Play"} ${album.title} preview`} onClick={() => player.play({ title:album.title,image:album.image,src:album.preview!,link:album.link,slug:album.slug })}>{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}<span>{isPlaying ? "Pause preview" : "Play preview"}</span></button> : album.embed ? <button className="release-preview-button" type="button" aria-expanded={activeEmbed === album.link} onClick={() => setActiveEmbed(activeEmbed === album.link ? null : album.link)}><Play size={20} fill="currentColor" /><span>Open player</span></button> : <a className="release-preview-button" href={album.link} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={20} /><span>View on Bandcamp</span></a>}
            </div>
            <div className="transmission-release-title"><h3><Link href={`/music/${album.slug}`}>{album.title}</Link></h3><a href={album.link} target="_blank" rel="noopener noreferrer" aria-label={`Open ${album.title} on ${embed.platform}`}><ArrowUpRight size={18} /></a></div>
            <p className="release-attribution"><span>{album.artist}</span>{releaseDateLabel(album.released) && <time dateTime={new Date(album.released!).toISOString()}>{releaseDateLabel(album.released)}</time>}</p>
            <SaveReleaseButton slug={album.slug} title={album.title} />
            <p>AX / {String(start + index + 1).padStart(3, "0")} <span>{releasePrices[album.link] ?? "Listen"}</span></p>
            {!album.preview && album.access !== "supporter" && album.embed && activeEmbed === album.link && <ReleasePreview albumTitle={album.title} embed={embed} releaseLink={album.link} />}
          </article>
        )})}
      </div>
      <div className="release-pagination">
        <p aria-live="polite" aria-atomic="true">{filtered.length ? start + 1 : 0}–{Math.min(start + pageSize, filtered.length)} of {filtered.length} releases <span> · Page {currentPage + 1} of {pageCount}</span></p>
        <div>
          <button type="button" aria-controls={catalogId} disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /> Previous</button>
          <button type="button" aria-controls={catalogId} disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next <ChevronRight size={16} /></button>
        </div>
      </div>
    </>
  );
}
