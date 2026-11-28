import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeReleases from "@/components/HomeReleases";
import FreeListening from "@/components/FreeListening";
import SocialIcon from "@/components/SocialIcon";
import { releases } from "@/lib/releases";
import "@/app/home.css";
import "@/app/music/music.css";

export const revalidate = 1800;

export default function MusicPage() {
  return (
    <div className="transmission-home catalog-page">
      <Navbar />
      <main>
        <nav className="music-shortcuts" aria-label="Music sections"><Link href="#supporter-releases">Release previews</Link><Link href="#free-listening">Free listening</Link><Link href="/music/saved">Your listening list</Link><Link href="/for-fun/pitch-detector">Find a note</Link></nav>
        <header className="catalog-hero">
          <p className="transmission-eyebrow"><span className="signal-dot" /> Aureyx catalog</p>
          <h1>Music</h1>
          <p>{releases.length} releases from Aureyx and its artists.</p>
          <div><a className="social-icon-link" href="https://dystofuturemusic.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Bandcamp" />Aureyx Bandcamp <ArrowUpRight size={16} /></a><a className="social-icon-link" href="https://lyrlvst.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Bandcamp" />Lyrlvst Bandcamp <ArrowUpRight size={16} /></a><Link href="/artists">Browse artists <ArrowUpRight size={16} /></Link></div>
        </header>
        <section id="supporter-releases" className="transmission-section catalog-list music-collection" aria-labelledby="supporter-heading">
          <div className="music-collection-heading"><div><p className="transmission-eyebrow">Bandcamp</p><h2 id="supporter-heading">Supporter releases</h2></div><p>Hear a short preview, then buy the full release on Bandcamp to support the artist.</p></div>
          <HomeReleases collection="supporter" catalogId="supporter-catalog" />
        </section>
        <section id="free-listening" className="transmission-section music-collection" aria-labelledby="free-listening-heading">
          <div className="music-collection-heading"><div><p className="transmission-eyebrow">YouTube &amp; SoundCloud</p><h2 id="free-listening-heading">Free listening</h2></div><p>Watch videos and listen to public uploads.</p></div>
          <FreeListening />
          {releases.some((release) => release.access === "free") && <div className="music-platform-section catalog-list"><h3>Free Bandcamp releases</h3><HomeReleases collection="free" catalogId="free-release-catalog" /></div>}
        </section>
        {releases.some((release) => release.access === "streaming") && <section className="transmission-section music-collection catalog-list" aria-labelledby="streaming-heading"><div className="music-collection-heading"><h2 id="streaming-heading">Streaming releases</h2><p>Listen on the artist’s other platforms.</p></div><HomeReleases collection="streaming" catalogId="streaming-release-catalog" /></section>}
      </main>
      <Footer />
    </div>
  );
}
