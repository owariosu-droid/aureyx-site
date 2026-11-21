import { artists } from "@/data/artists";
import { albums } from "@/data/albums";

export const pageDefaults = {
  home: { intro: "Aureyx is an independent electronic music label and collective for growing artists.", about: "Founded by iyune, built together by artists with their own worlds to share." },
  music: { description: `${albums.length} releases from Aureyx and its collaborators.` },
  geometry: { description: "Progress, runs, and videos from naga. More profile details coming soon." },
};
export type PageCopy = typeof pageDefaults;
export type OwnerContent = { artists: Record<string, { bio: string; role: string }>; pages: PageCopy };
export function defaultOwnerContent(): OwnerContent {
  return { artists: Object.fromEntries(artists.map(a => [a.slug, { bio: a.bio, role: a.role }])), pages: structuredClone(pageDefaults) };
}
export function validateOwnerContent(input: unknown): OwnerContent {
  const obj = (value: unknown): Record<string, unknown> => { if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected content fields."); return value as Record<string, unknown>; };
  const text = (value: unknown, limit: number) => { if (typeof value !== "string" || !value.trim() || value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new Error(`Use nonempty text of at most ${limit} characters.`); return value.trim(); };
  const root = obj(input), a = obj(root.artists), pages = obj(root.pages);
  if (Object.keys(root).some(k => !["artists", "pages"].includes(k)) || Object.keys(a).some(k => !artists.some(artist => artist.slug === k)) || Object.keys(pages).some(k => !Object.hasOwn(pageDefaults, k))) throw new Error("Unknown content field.");
  const result = defaultOwnerContent();
  for (const artist of artists) {
    const row = obj(a[artist.slug]);
    if (Object.keys(row).some(k => !["bio", "role"].includes(k))) throw new Error("Unknown artist field.");
    result.artists[artist.slug] = { bio: text(row.bio, 1500), role: text(row.role, 100) };
  }
  for (const key of Object.keys(pageDefaults) as (keyof PageCopy)[]) {
    const row = obj(pages[key]);
    if (Object.keys(row).some(k => !Object.hasOwn(pageDefaults[key], k))) throw new Error("Unknown page field.");
    for (const field of Object.keys(pageDefaults[key])) (result.pages[key] as Record<string, string>)[field] = text(row[field], 1200);
  }
  return result;
}
