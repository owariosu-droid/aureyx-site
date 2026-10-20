import bandcamp from "@/data/external/bandcamp.json";

export const releasePrices: Record<string, string> = {
  ...Object.fromEntries(bandcamp.map((release) => [release.link, release.price])),
  "https://open.spotify.com/album/6W9618MAoMyOgYcWgx6glU": "Streaming",
};
