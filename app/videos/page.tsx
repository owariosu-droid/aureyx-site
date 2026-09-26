import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeVideoFeeds from "@/components/HomeVideoFeeds";
import SocialIcon from "@/components/SocialIcon";
import "@/app/home.css";

export default function VideosPage() {
  return (
    <div className="transmission-home videos-page">
      <Navbar />
      <main>
        <header className="catalog-hero video-page-hero">
          <p className="transmission-eyebrow"><span className="signal-dot" /> Aureyx channels</p>
          <h1>Videos <SocialIcon platform="YouTube" size={54} /></h1>
          <p>Uploads from Aureyx and its artists.</p>
        </header>
        <section className="transmission-section transmission-videos" aria-label="Artist video channels"><HomeVideoFeeds /></section>
      </main>
      <Footer />
    </div>
  );
}
