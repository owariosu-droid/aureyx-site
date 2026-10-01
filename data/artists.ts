export type Artist = {
  slug: string;
  name: string;
  role: string;
  accent?: string;
  bio: string;
  image?: string;
  cover?: string;
  youtubeChannelId?: string;
  videoFallbackChannelIds?: string[];
  featuredVideos?: { id: string; title: string; published: string; thumbnail: string }[];
  blog?: boolean;
  albums?: { title: string; image: string; href?: string }[];
  gallery?: { src: string; alt: string }[];
  conceptArt?: { src: string; alt: string; width: number; height: number }[];
  links?: { label: string; href: string }[];
};

export const artists: Artist[] = [
  {
    slug: "lyrlvst",
    name: "Lyrlvst",
    role: "Artist · Producer",
    accent: "#f05cae",
    bio: "Lyrlvst is a producer who makes breakcore and neo trance/house music.",
    image: "/members/lyrlvst.png",
    cover: "/members/lyrlvst-iliveinagony-optimized.jpg",
    youtubeChannelId: "UC7xSxOfYmUlZ8jIp_567M6w",
    blog: true,
    albums: [{ title: "iliveinagony", image: "/members/lyrlvst-profile-optimized.jpg", href: "https://www.youtube.com/watch?v=EN6TLOaZOMo" }],
    links: [{ label: "YouTube", href: "https://www.youtube.com/@lyrlvst" }],
  },
  {
    slug: "iyune",
    name: "iyune",
    role: "Founder · Artist · Producer",
    accent: "#9c72e5",
    bio: "Founder of Aureyx. Electronic music shaped by rhythm-game energy and gothic atmospheres.",
    image: "/members/iyune-optimized.jpg",
    youtubeChannelId: "UCrNekfYIdOYln8PP1AcGWvA",
    videoFallbackChannelIds: ["UC2qP_-I9kcrSazQNUWNd6ag", "UCcKq5OXoC-guJU9hBcZjC3w"],
    featuredVideos: [{ id: "I_-ZQ3-H8LU", title: "iyune - Scarlet Oasis (lyrlvst remix)", published: "2026-09-19T07:41:17+00:00", thumbnail: "https://i2.ytimg.com/vi/I_-ZQ3-H8LU/hqdefault.jpg" }],
    links: [{ label: "YouTube", href: "https://www.youtube.com/@iyuneofficial" }],

  },
  {
    slug: "dysto",
    name: "Dysto",
    role: "Artist · Producer",
    accent: "#43b9c7",
    bio: "Cyberpunk-inspired music and collaborations with Aureyx.",
    image: "/members/dysto.png",
    youtubeChannelId: "UCcKq5OXoC-guJU9hBcZjC3w",
    links: [{ label: "YouTube", href: "https://www.youtube.com/@dystoftmusic23" }],

  },
  {
    slug: "yoru-zenaku",
    name: "Yoru Zenaku",
    role: "Artist",
    accent: "#e34b59",
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
    conceptArt: [
      { src: "/members/yoru-concept-01.jpg", alt: "Red and black Death Note and Tokyo Ghoul inspired concept artwork by Yoru Zenaku", width: 1536, height: 1024 },
      { src: "/members/yoru-concept-02.jpg", alt: "Red and purple cyberpunk Berserk concept artwork by Yoru Zenaku", width: 1254, height: 1254 },
      { src: "/members/yoru-concept-03.jpg", alt: "Cyber Berserk swordsman concept artwork by Yoru Zenaku", width: 1254, height: 1254 },
      { src: "/members/yoru-concept-04.jpg", alt: "Red cybernetic Berserk character concept artwork by Yoru Zenaku", width: 1254, height: 1254 },
      { src: "/members/yoru-concept-05.jpg", alt: "Purple Tokyo Ghoul and Berserk character concept artwork by Yoru Zenaku", width: 1254, height: 1254 },
    ],

  },
  {
    slug: "grimvex",
    name: "GRiMVEX",
    role: "Artist",
    accent: "#e9a44f",
    bio: "Music and projects from GRiMVEX. More about this artist coming soon.",
    videoFallbackChannelIds: ["UC2qP_-I9kcrSazQNUWNd6ag"],
    featuredVideos: [
      { id: "DjUsn5p1TD4", title: "GRiMVEX - PHAETHON | FANMADE", published: "2026-08-19T07:45:37+00:00", thumbnail: "https://i1.ytimg.com/vi/DjUsn5p1TD4/hqdefault.jpg" },
      { id: "mRHNXEQZzbQ", title: "GRiMVEX - IONIZE | FANMADE", published: "2026-08-19T07:28:05+00:00", thumbnail: "https://i2.ytimg.com/vi/mRHNXEQZzbQ/hqdefault.jpg" },
    ],
  },
];
