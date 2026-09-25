import Image from "next/image";

const profiles = [
  {
    name: "Aureyx",
    handle: "linktr.ee/dystofuturemusic",
    href: "https://linktr.ee/dystofuturemusic",
    image: "/aureyx-space-background.jpg",
    links: [
      ["Instagram", "https://instagram.com/aureyx_music"],
      ["TikTok", "https://tiktok.com/@aureyxmusic"],
      ["YouTube", "https://www.youtube.com/@Aureyx-u6c"],
      ["SoundCloud", "https://soundcloud.com/dystomusic23"],
      ["Spotify", "https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI"],
    ],
  },
  {
    name: "Lyrlvst",
    handle: "linktr.ee/lyrlvst",
    href: "https://linktr.ee/lyrlvst",
    image: "/members/lyrlvst-iliveinagony.png",
    links: [
      ["YouTube", "https://www.youtube.com/@lyrlvst"],
      ["Bandcamp", "https://lyrlvst.bandcamp.com"],
      ["Spotify", "https://open.spotify.com/artist/1rrhBuwyg1lxQpoQDqDUr0"],
      ["SoundCloud", "https://soundcloud.com/user-738144184"],
    ],
  },
];

const directLinks = [
  ["iyune", "https://www.youtube.com/@iyuneofficial"],
  ["Dysto", "https://www.youtube.com/@dystoftmusic23"],
  ["Yoru Zenaku", "https://www.youtube.com/@Yoru_zenaku"],
];

export default function HomeLinks() {
  return (
    <div className="home-links-grid">
      {profiles.map((profile) => (
        <article className="home-linktree-card" key={profile.href}>
          <Image src={profile.image} alt="" fill sizes="(max-width: 800px) 92vw, 44vw" />
          <span className="home-linktree-shade" />
          <div className="home-linktree-content">
            <p className="home-linktree-brand"><b>✱</b> Linktree</p>
            <h3>{profile.name}</h3>
            <a className="home-linktree-handle" href={profile.href} target="_blank" rel="noopener noreferrer">{profile.handle} ↗</a>
            <div className="home-linktree-links">{profile.links.map(([label, href]) => <a href={href} target="_blank" rel="noopener noreferrer" key={label}>{label} ↗</a>)}</div>
          </div>
        </article>
      ))}
      <aside className="home-direct-links"><p>More artist links</p>{directLinks.map(([label, href]) => <a href={href} target="_blank" rel="noopener noreferrer" key={label}>{label}<span>YouTube ↗</span></a>)}</aside>
    </div>
  );
}
