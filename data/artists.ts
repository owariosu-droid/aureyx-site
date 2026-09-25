export type Artist = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  cover?: string;
  youtubeChannelId?: string;
  blog?: boolean;
  albums?: { title: string; image: string; href?: string }[];
  gallery?: { src: string; alt: string }[];
  links?: { label: string; href: string }[];
};

export const artists: Artist[] = [
  {
    slug: "lyrlvst",
    name: "Lyrlvst",
    role: "Artist · Producer",
    bio: "Lyrlvst is a producer who makes breakcore and neo trance/house music.",
    image: "/members/lyrlvst.png",
    cover: "/members/lyrlvst-iliveinagony.png",
    youtubeChannelId: "UC7xSxOfYmUlZ8jIp_567M6w",
    blog: true,
    albums: [{ title: "iliveinagony", image: "/members/lyrlvst-profile.png", href: "https://www.youtube.com/watch?v=EN6TLOaZOMo" }],
    links: [{ label: "YouTube", href: "https://www.youtube.com/@lyrlvst" }],
  },
  {
    slug: "iyune",
    name: "iyune",
    role: "Founder · Artist · Producer",
    bio: "Founder of Aureyx. Electronic music shaped by rhythm-game energy and gothic atmospheres.",
    image: "/members/iyune.png",
    links: [{ label: "YouTube", href: "https://www.youtube.com/@iyuneofficial" }],

  },
  {
    slug: "dysto",
    name: "Dysto",
    role: "Artist · Producer",
    bio: "Cyberpunk-inspired music and collaborations with Aureyx.",
    image: "/members/dysto.png",

  },
  {
    slug: "yoru-zenaku",
    name: "Yoru Zenaku",
    role: "Artist",
    bio: "Music and projects from Yoru Zenaku. More about this artist coming soon.",
    image: "/members/yoru-zenaku-pfp.png",
    cover: "/members/yoru-zenaku-cover.png",
    youtubeChannelId: "UCe5zNYSQ3xVyss4hET5j7Cw",
    blog: true,
    links: [{ label: "YouTube", href: "https://www.youtube.com/@Yoru_zenaku" }],
    gallery: [
      { src: "/members/yoru-zenaku-cover.png", alt: "Yoru cyberpunk crew in a red-lit city" },
      { src: "/members/yoru-zenaku-gallery.png", alt: "Masked figures in black and red artwork selected by Yoru Zenaku" },
    ],

  },
  {
    slug: "grimvex",
    name: "GRiMVEX",
    role: "Artist",
    bio: "Music and projects from GRiMVEX. More about this artist coming soon.",
  },
];
