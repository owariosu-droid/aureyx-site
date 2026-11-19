type FavoriteScore = {
  id: string;
  title: string;
  details: string;
  video?: string;
  poster?: string;
};

export const favoriteScores: FavoriteScore[] = [
  {
    id: "girls-rondo-first-dt-a",
    title: "Girls Rondo — my first DT A rank",
    details: "8.53★ · Double Time · A rank",
    video: "/osu/scores/girls-rondo-first-dt-a.mp4",
    poster: "/osu/scores/girls-rondo-first-dt-a.jpg",
  },
  {
    id: "reality-distortion-hdhrnf-b",
    title: "Reality Distortion",
    details: "Hidden · Hard Rock · No Fail · B rank",
  },
  {
    id: "arche-vertex-first-hr-b",
    title: "Arche (Vertex) — my first HR B rank",
    details: "Hard Rock · No Fail · B rank",
  },
  {
    id: "nanawo-akari",
    title: "I think bro likes Nanawo Akari",
    details: "Nanawo Akari · osu! gameplay",
  },
  {
    id: "image-material-scorpiour-hd-a",
    title: "Image Material Scorpiour",
    details: "Hidden · A rank",
  },
];
