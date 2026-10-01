import { albums } from "@/data/albums";

export type Release = (typeof albums)[number] & {
  slug: string;
  artist: string;
  format: "Album" | "Single" | "Pack";
  preview: string | null;
  contributors: string[];
  catalogNumber: string;
  platform: "Bandcamp" | "Spotify";
};

export function releaseSlug(link: string) {
  return link.split("/").filter(Boolean).at(-1) ?? "release";
}

export function releaseArtist(title: string) {
  const known = ["iyune", "Lyrlvst", "Dysto", "GRiMVEX", "0KAMI", "prod. Jxzz"];
  const matches = known.filter((name) => title.toLowerCase().includes(name.toLowerCase()));
  if (matches.length) return matches.join(" & ");
  const lead = title.split(" - ")[0].trim();
  return lead || "Aureyx";
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
  preview: album.link.includes("bandcamp.com/") ? `/previews/${releaseSlug(album.link)}.m4a` : null,
  contributors: ["iyune", "Lyrlvst", "Dysto", "GRiMVEX", "0KAMI", "prod. Jxzz"].filter((name) => album.title.toLowerCase().includes(name.toLowerCase())),
  catalogNumber: `AUR-${String(albums.indexOf(album) + 1).padStart(3,"0")}`,
  platform: album.link.includes("bandcamp.com/") ? "Bandcamp" : "Spotify",
}));

export function getRelease(slug: string) {
  return releases.find((release) => release.slug === slug);
}
