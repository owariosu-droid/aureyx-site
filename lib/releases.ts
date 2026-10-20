import { albums } from "@/data/albums";
import bandcamp from "@/data/external/bandcamp.json";

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
};

export function releaseSlug(link: string) {
  return link.split("/").filter(Boolean).at(-1) ?? "release";
}

export function releaseArtist(title: string) {
  const known = ["iyune", "Lyrlvst", "Dysto", "GRiMVEX", "0KAMI", "prod. Jxzz"];
  const matches = known.filter((name) => title.toLowerCase().includes(name.toLowerCase()));
  if (matches.length) return matches.join(" & ");
  return "Aureyx";
}

export function releaseFormat(title: string, link: string): Release["format"] {
  if (/pack/i.test(title)) return "Pack";
  return link.includes("/album/") ? "Album" : "Single";
}

export const releases: Release[] = albums.map((album) => ({
  ...album,
  slug: releaseSlug(album.link),
  artist: releaseArtist(album.title),
  format: releaseFormat(album.title, album.link),
  preview: album.preview,
  contributors: ["iyune", "Lyrlvst", "Dysto", "GRiMVEX", "0KAMI", "prod. Jxzz"].filter((name) => album.title.toLowerCase().includes(name.toLowerCase())),
  catalogNumber: `AUR-${String(albums.indexOf(album) + 1).padStart(3,"0")}`,
  platform: album.link.includes("bandcamp.com/") ? "Bandcamp" : "Spotify",
  embed: album.link.includes("bandcamp.com/")
    ? `https://bandcamp.com/EmbeddedPlayer/${bandcamp.find((item) => item.link === album.link)!.type}=${bandcamp.find((item) => item.link === album.link)!.id}/size=large/bgcol=151314/linkcol=ff3944/artwork=small/transparent=true/`
    : "https://open.spotify.com/embed/album/6W9618MAoMyOgYcWgx6glU?theme=0",
}));

export function getRelease(slug: string) {
  return releases.find((release) => release.slug === slug);
}
