import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeReleases from "@/components/HomeReleases";
import SocialIcon from "@/components/SocialIcon";
import { getPublishedContent } from "@/lib/published-content";
import OwnerEditLink from "@/components/OwnerEditControl";
import "@/app/home.css";

export default async function MusicPage() {
  const content = await getPublishedContent();
  return (
    <div className="transmission-home catalog-page">
      <Navbar />
      <main>
        <header className="catalog-hero">
          <p className="transmission-eyebrow"><span className="signal-dot" /> Aureyx catalog</p>
          <h1>Music</h1>
          <p>{content.pages.music.description}</p><OwnerEditLink />
          <div><a className="social-icon-link" href="https://dystofuturemusic.bandcamp.com/music" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Bandcamp" />Bandcamp catalog <ArrowUpRight size={16} /></a><Link href="/artists">Browse artists <ArrowUpRight size={16} /></Link></div>
        </header>
        <section className="transmission-section catalog-list" aria-label="Release catalog"><HomeReleases /></section>
      </main>
      <Footer />
    </div>
  );
}
