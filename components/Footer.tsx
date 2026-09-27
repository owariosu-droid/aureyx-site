import Link from "next/link";
import SocialIcon from "@/components/SocialIcon";
const socials = [
  ["Spotify","https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI"], ["Bandcamp","https://dystofuturemusic.bandcamp.com/"],
  ["Linktree","https://linktr.ee/dystofuturemusic23"], ["YouTube","https://www.youtube.com/@Aureyx-u6c"],
];
export default function Footer() {
  return <footer id="links" className="aureyx-footer"><div className="footer-inner"><div><Link href="/" className="footer-brand">AUREYX</Link><p>Independent electronic music.</p></div><nav aria-label="Footer navigation"><Link href="/artists">Artists</Link><Link href="/music">Music</Link><Link href="/videos">Videos</Link><Link href="/for-fun">For fun</Link><Link href="/publish">Artist publishing</Link></nav><div className="footer-socials">{socials.map(([label,href]) => <a className="social-icon-link" href={href} target="_blank" rel="noopener noreferrer" key={label}><SocialIcon platform={label}/><span>{label}</span></a>)}</div></div><p className="footer-copyright">AUREYX © 2026</p></footer>;
}
