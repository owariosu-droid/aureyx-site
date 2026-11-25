import { albums } from "@/data/albums";
import { bandcampCatalog } from "@/data/bandcamp-catalog";
import type { BandcampRelease } from "@/data/bandcamp-catalog";
import bandcampPreviews from "@/data/external/bandcamp-previews.json";

const knownArtists = ["iyune", "Lyrlvst", "Dysto", "GRiMVEX", "0KAMI", "prod. Jxzz", "Yoru Zenaku"];

export type Release = {
  title: string;
  image: string;
  link: string;
  slug: string;
  artist: string;
  format: "Album" | "Single" | "Pack";
  preview: string | null;
  contributors: string[];
  catalogNumber: string;
  platform: "Bandcamp" | "Spotify";
  embed: string;
  released: string | null;
  access: "supporter" | "free" | "streaming";
};

export function bandcampAccess(source: Pick<BandcampRelease, "price" | "access">): Release["access"] {
  if (source.access === "paid") return "supporter";
  if (source.access === "free" || source.access === "streaming") return source.access;
  if (["Name your price", "Free download"].includes(source.price)) return "free";
  return source.price === "Listen on Bandcamp" ? "streaming" : "supporter";
}

export function shortBandcampPreview(link: string) {
  const saved = (bandcampPreviews as Record<string, { src: string; duration: number }>)[link];
  return saved && /^\/previews\/bandcamp\/[a-zA-Z0-9_.-]+\.m4a$/.test(saved.src) && Number.isFinite(saved.duration) && saved.duration > 0 && saved.duration <= 30 ? saved.src : null;
}

export function releaseSlug(link: string) {
  const url = new URL(link);
  const slug = url.pathname.split("/").filter(Boolean).at(-1) ?? "release";
  // Keep published Aureyx URLs; artist catalogs have their own namespace.
  return url.hostname === "lyrlvst.bandcamp.com" ? `lyrlvst-bandcamp-${slug}` : slug;
}

export function releaseArtist(title: string) {
  const matches = knownArtists.filter((name) => title.toLowerCase().includes(name.toLowerCase()));
  if (matches.length) return matches.join(" & ");
  return "Aureyx";
}

export function releaseFormat(title: string, link: string): Release["format"] {
  if (/pack/i.test(title)) return "Pack";
  return link.includes("/album/") ? "Album" : "Single";
}

export const releases: Release[] = albums.map<Release>((album, index) => {
  const source = bandcampCatalog.find((item) => item.link === album.link);
  const artist = source?.artist || releaseArtist(album.title);
  const access = source ? bandcampAccess(source) : "streaming";
  const contributors = knownArtists.filter((name) =>
    name === source?.artist || album.title.toLowerCase().includes(name.toLowerCase()),
  );
  return {
    ...album,
    slug: releaseSlug(album.link),
    artist,
    format: releaseFormat(album.title, album.link),
    preview: source ? shortBandcampPreview(album.link) : album.preview,
    contributors,
    catalogNumber: `AUR-${String(index + 1).padStart(3,"0")}`,
    platform: source ? "Bandcamp" : "Spotify",
    embed: access === "supporter" ? "" : source
      ? `https://bandcamp.com/EmbeddedPlayer/${source.type}=${source.id}/size=large/bgcol=151314/linkcol=ff3944/artwork=small/tracklist=false/transparent=true/`
      : "https://open.spotify.com/embed/album/6W9618MAoMyOgYcWgx6glU?theme=0",
    released: source?.released || null,
    access,
  };
}).sort((a, b) => (Date.parse(b.released || "") || 0) - (Date.parse(a.released || "") || 0));

export function matchesReleaseArtist(release: Release, artist: string) {
  return release.artist === artist || release.contributors.includes(artist);
}

export function releaseDateLabel(released: string | null) {
  const date = released ? new Date(released) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    : null;
}

export function getRelease(slug: string) {
  return releases.find((release) => release.slug === slug);
}
