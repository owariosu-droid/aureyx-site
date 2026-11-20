type FavoriteScore = {
  id: string;
  title: string;
  details: string;
  mods?: { acronym: string }[];
  video?: string;
  poster?: string;
};

export const favoriteScores: FavoriteScore[] = [
  {
    id: "girls-rondo-first-dt-a",
    mods: [{"acronym": "DT"}],
    title: "Girls Rondo — my first DT A rank",
    details: "8.53★ · Double Time · A rank",
    video: "/osu/scores/girls-rondo-first-dt-a.mp4",
    poster: "/osu/scores/girls-rondo-first-dt-a.jpg",
  },
  {
    id: "reality-distortion-hdhrnf-b",
    mods: [{"acronym": "HD"}, {"acronym": "HR"}, {"acronym": "NF"}],
    title: "Reality Distortion — my first B rank",
    video: "/osu/scores/reality-distortion-hdhrnf-b.mp4",
    poster: "/osu/scores/reality-distortion-hdhrnf-b.jpg",
    details: "Hidden · Hard Rock · No Fail · B rank",
  },
  {
    id: "arche-vertex-first-hr-b",
    mods: [{"acronym": "HR"}, {"acronym": "NF"}],
    title: "Arche (Vertex) — my first HR B rank",
    video: "/osu/scores/arche-vertex-first-hr-b.mp4",
    poster: "/osu/scores/arche-vertex-first-hr-b.jpg",
    details: "Hard Rock · No Fail · B rank",
  },
  {
    id: "nanawo-akari",
    title: "I think bro likes Nanawo Akari",
    details: "Nanawo Akari · osu! gameplay",
  },
  {
    id: "image-material-scorpiour-hd-a",
    mods: [{"acronym": "HD"}],
    title: "Image Material Scorpiour",
    details: "Hidden · A rank",
  },
  {
    id: "freedom-dive-first-hr-b",
    title: "FREEDOM DIVE (FOUR DIMENSIONS) — my first B rank",
    details: "Hard Rock · No Fail · B rank",
    mods: [{ acronym: "HR" }, { acronym: "NF" }],
    video: "/osu/scores/freedom-dive-first-hr-b.mp4",
    poster: "/osu/scores/freedom-dive-first-hr-b.jpg",
  },
  {
    id: "kaku-mo-yuubi-hdhrnf",
    title: "Kaku mo Yuubi (Illusion)",
    details: "Hidden · Hard Rock · No Fail · 88.78% accuracy",
    mods: [{ acronym: "HD" }, { acronym: "HR" }, { acronym: "NF" }],
    video: "/osu/scores/kaku-mo-yuubi-hdhrnf.mp4",
    poster: "/osu/scores/kaku-mo-yuubi-hdhrnf.jpg",
  },
  {
    id: "lerisia-hdhr-479pp",
    title: "L'erisia (Roll_Pan's SPECIAL)",
    details: "Hidden · Hard Rock · 479 pp recording",
    mods: [{ acronym: "HD" }, { acronym: "HR" }],
    video: "/osu/scores/lerisia-hdhr-479pp.mp4",
    poster: "/osu/scores/lerisia-hdhr-479pp.jpg",
  },
];
