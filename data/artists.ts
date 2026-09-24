export type Artist = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  links?: { label: string; href: string }[];
};

export const artists: Artist[] = [
  {
    slug: "lyrlvst",
    name: "Lyrlvst",
    role: "Artist · Producer",
    bio: "Music and projects from Lyrlvst. More about this artist coming soon.",
    image: "/members/lyrlvst.png",
    links: [{ label: "YouTube", href: "https://www.youtube.com/@lyrlvst" }],
  },
  {
    slug: "iyune",
    name: "iyune",
    role: "Artist",
    bio: "Music and projects from iyune. More about this artist coming soon.",
    image: "/iyune.png",
  },
  {
    slug: "dysto",
    name: "Dysto",
    role: "Artist · Producer",
    bio: "Cyberpunk-inspired music and collaborations with Aureyx.",
  },
  {
    slug: "yoru-zenaku",
    name: "Yoru Zenaku",
    role: "Artist",
    bio: "Music and projects from Yoru Zenaku. More about this artist coming soon.",
  },
  {
    slug: "grimvex",
    name: "GRiMVEX",
    role: "Artist",
    bio: "Music and projects from GRiMVEX. More about this artist coming soon.",
  },
];