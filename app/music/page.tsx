import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeReleases from "@/components/HomeReleases";
import SocialIcon from "@/components/SocialIcon";
import { albums } from "@/data/albums";
import "@/app/home.css";

export default function MusicPage() {
  return (
    <div className="transmission-home catalog-page">
      <Navbar />
      <main>
        <header className="catalog-hero">
          <p className="transmission-eyebrow"><span className="signal-dot" /> Aureyx catalog</p>
          <h1>Music</h1>
          <p>{albums.length} releases from Aureyx and its collaborators.</p>
          <div><a className="social-icon-link" href="https://dystofuturemusic.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Bandcamp" />Bandcamp catalog <ArrowUpRight size={16} /></a><Link href="/artists">Browse artists <ArrowUpRight size={16} /></Link></div>
        </header>
        <section className="transmission-section catalog-list" aria-label="Release catalog"><HomeReleases /></section>
      </main>
      <Footer />
    </div>
  );
}
