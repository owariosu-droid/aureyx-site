import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeReleases from "@/components/HomeReleases";
import { artists } from "@/data/artists";
import { albums } from "@/data/albums";
import "./home.css";


export default function Home() {
  return (
    <div className="transmission-home">
      <Navbar />
      <main>
        <section className="transmission-hero" aria-labelledby="home-title">
          <Image src="/aureyx-girl.png" alt="" fill priority sizes="100vw" className="transmission-backdrop" />
          <div className="transmission-texture" aria-hidden="true" />
          <div className="transmission-topline"><span><i /> Independent frequencies</span><span>Electronic music collective</span></div>
          <div className="transmission-center">
            <p className="transmission-eyebrow"><span className="signal-dot" /> REC <span>· TRANSMISSION / AUREYX</span></p>
            <h1 aria-label="Aureyx" id="home-title" className="transmission-wordmark aureyx-animated-logo"><span className="aureyx-gothic-mark" aria-hidden="true" /></h1>
            <p className="transmission-tagline">A home for the sounds that don’t fit in.</p>
            <div className="transmission-actions"><Link className="transmission-button primary" href="#releases">Enter the sound <ArrowUpRight size={17} /></Link><Link className="transmission-button" href="/artists">Meet the collective <ArrowUpRight size={17} /></Link></div>
          </div>
          <div className="transmission-bottomline"><span>Founded by <Link href="/artists/iyune">iyune ↗</Link></span><a href="#collective">Scroll to discover <ArrowDown size={14} /></a><span>Sound without boundaries.</span></div>
        </section>

        <div className="transmission-ticker" aria-hidden="true"><span>INDEPENDENT ARTISTS</span><b>✳</b><span>UNFILTERED EXPRESSION</span><b>✳</b><span>AUREYX COLLECTIVE</span><b>✳</b><span>BEYOND THE EXPECTED</span></div>

        <section id="collective" className="transmission-section transmission-intro">
          <div><p className="transmission-eyebrow">01 / The collective</p><h2>About Aureyx</h2></div>
          <div className="transmission-intro-copy"><p>Aureyx is an independent electronic music label and collective for growing artists.</p><p>Founded by iyune, built together by artists with their own worlds to share.</p><Link className="transmission-text-link" href="/artists">Explore the collective <ArrowUpRight size={18} /></Link></div>
        </section>

        <section className="transmission-section transmission-founder" aria-labelledby="founder-heading">
          <Link href="/artists/iyune" className="transmission-founder-image"><Image src="/members/iyune.png" alt="iyune, founder of Aureyx" fill sizes="(max-width: 700px) 100vw, 45vw" /></Link>
          <div className="transmission-founder-copy"><h2 id="founder-heading">iyune<span>Founder / Artist / Producer</span></h2><p>iyune makes gothic electronic music. they founded Aureyx to give artists a place to belong.</p><Link className="transmission-button" href="/artists/iyune">View iyune’s profile <ArrowUpRight size={17} /></Link><span className="transmission-founder-mark" aria-hidden="true">A / 01</span></div>
        </section>

        <section id="releases" className="transmission-section" aria-labelledby="releases-heading">
          <div className="transmission-section-heading"><div><p className="transmission-eyebrow">02 / On rotation</p><h2 id="releases-heading">From the archive.</h2></div><p>{albums.length} releases from Aureyx and its connected artists. <a href="https://dystofuturemusic.bandcamp.com/music" target="_blank" rel="noopener noreferrer">Full catalog ↗</a></p></div>
          <HomeReleases />
        </section>

        <section className="transmission-section" aria-labelledby="artists-heading"><div className="transmission-section-heading"><div><p className="transmission-eyebrow">03 / The people</p><h2 id="artists-heading">Artists</h2></div><Link className="transmission-text-link" href="/artists">All artist profiles <ArrowUpRight size={18} /></Link></div><div className="transmission-artists">{artists.map((artist, index) => <Link className="transmission-artist" href={`/artists/${artist.slug}`} key={artist.slug}><span className="transmission-artist-number">0{index + 1}</span><div className="transmission-artist-photo">{artist.image ? <Image src={artist.image} alt="" fill sizes="72px" /> : <span>G</span>}</div><h3>{artist.name}</h3><span className="transmission-artist-role">{artist.role}</span><ArrowUpRight className="transmission-artist-arrow" size={24} /></Link>)}</div></section>

        <section className="transmission-section transmission-explore" aria-label="More from Aureyx"><a className="transmission-explore-card" href="https://nocturnakits.gumroad.com/l/oeveok" target="_blank" rel="noopener noreferrer"><p className="transmission-eyebrow">04 / For the creators</p><ArrowUpRight className="transmission-explore-arrow" /><span className="nocturna-moon" role="img" aria-label="Nocturna crescent moon logo from the cover" /><h2>Nocturna</h2><p>Sounds created by iyune, used interchangeably throughout Aureyx.</p><span>Explore sound kits ↗</span></a><Link className="transmission-explore-card" href="/artists"><p className="transmission-eyebrow">05 / From the collective</p><ArrowUpRight className="transmission-explore-arrow" /><h2>Artist<br /><em>journals.</em></h2><p>Updates, new work, and creative perspectives from the artists behind Aureyx.</p><span>Explore artist updates ↗</span></Link></section>
        <div className="transmission-signoff"><h2 aria-label="Aureyx" className="transmission-endmark aureyx-animated-logo"><span className="aureyx-gothic-mark" aria-hidden="true" /></h2><p>Independent electronic music.</p><div><a href="https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI" target="_blank" rel="noopener noreferrer">Spotify ↗</a><a href="https://dystofuturemusic.bandcamp.com/" target="_blank" rel="noopener noreferrer">Bandcamp ↗</a><a href="https://linktr.ee/dystofuturemusic" target="_blank" rel="noopener noreferrer">Connect ↗</a></div></div>
      </main>
      <Footer />
    </div>
  );
}
