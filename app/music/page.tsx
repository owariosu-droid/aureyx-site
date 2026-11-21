import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeReleases from "@/components/HomeReleases";
import MusicCatalogHero from "@/components/MusicCatalogHero";
import { releases } from "@/lib/releases";
import "@/app/home.css";
import "./music.css";

export default function MusicPage() {
  return (
    <div className="transmission-home catalog-page">
      <Navbar />
      <main>
        <MusicCatalogHero count={releases.length} covers={releases.slice(0, 3).map(({ title, image, slug }) => ({ title, image, slug }))} />
        <div className="music-archive-strip" aria-hidden="true"><div>{[0, 1].map(copy => <span key={copy}>AUREYX COLLECTIVE <i>✦</i> INDEPENDENT SOUND <i>✦</i> THE RELEASE ARCHIVE <i>✦</i> MUSIC WITHOUT BOUNDARIES <i>✦</i></span>)}</div></div>
        <section id="release-catalog-section" className="transmission-section catalog-list" aria-labelledby="music-catalog-heading"><div className="music-catalog-heading"><div><p className="transmission-eyebrow">The discography</p><h2 id="music-catalog-heading">Find your frequency.</h2></div><p>Browse. Preview. Discover.</p></div><HomeReleases /></section>
      </main>
      <Footer />
    </div>
  );
}
