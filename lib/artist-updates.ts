export const artistRepository = "owariosu-droid/aureyx-site";
export const artistLabel = (slug: string) => `artist:${slug}`;

export function submissionUrl(slug: string, name: string) {
  const query = new URLSearchParams({
    title: `${name}: `,
    body: `Category: Update\n\nWrite your update here and drag photos into this box.\n\nArtist: ${name}\nAsk a maintainer to publish this with the ${artistLabel(slug)} label. Categories can be Update, Release, Artwork, or Announcement.`,
  });
  return `https://github.com/${artistRepository}/issues/new?${query}`;
}

export type ArtistUpdate = {
  id: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  labels?: Array<{ name?: string }>;
  pull_request?: unknown;
};

export async function getArtistUpdates(slug: string): Promise<{ posts: ArtistUpdate[]; unavailable: boolean }> {
  const query = new URLSearchParams({ labels: artistLabel(slug), state: "open", sort: "created", direction: "desc", per_page: "30" });
  try {
    const response = await fetch(`https://api.github.com/repos/${artistRepository}/issues?${query}`, {
      headers: { Accept: "application/vnd.github+json", ...(process.env.ARTIST_UPDATES_GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.ARTIST_UPDATES_GITHUB_TOKEN}` } : {}) },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`GitHub status ${response.status}`);
    const issues: ArtistUpdate[] = await response.json();
    if (!Array.isArray(issues)) throw new Error("Invalid issues response");
    return { posts: issues.filter((issue) => !issue.pull_request), unavailable: false };
  } catch {
    return { posts: [], unavailable: true };
  }
}

export function artistUpdateCategory(post: ArtistUpdate) {
  const labeled = post.labels?.map((label) => label.name || "").find((name) => name.toLowerCase().startsWith("type:"));
  if (labeled) return labeled.slice(5).trim() || "Update";
  const match = post.body?.match(/^Category:\s*(Update|Release|Artwork|Announcement)/im);
  return match?.[1] || "Update";
}
