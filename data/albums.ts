import bandcamp from "@/data/external/bandcamp.json";

// The daily content workflow refreshes Bandcamp's public catalog and artwork.
// Keep this Spotify-only release alongside the catalog.
export const albums = [
  ...bandcamp,
  {
    title: "iyune - Ouroboros",
    preview: null,
    image: "/ouroboros-optimized.jpg",
    link: "https://open.spotify.com/album/6W9618MAoMyOgYcWgx6glU",
  },
];
