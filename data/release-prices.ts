import { bandcampCatalog } from "@/data/bandcamp-catalog";

export const releasePrices: Record<string, string> = {
  ...Object.fromEntries(bandcampCatalog.map((release) => [release.link, release.price])),
  "https://open.spotify.com/album/6W9618MAoMyOgYcWgx6glU": "Streaming",
};
