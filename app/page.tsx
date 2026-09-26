import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeVideoFeeds from "@/components/HomeVideoFeeds";
import HomeLinks from "@/components/HomeLinks";
import SocialIcon from "@/components/SocialIcon";
import { artists } from "@/data/artists";
import { albums } from "@/data/albums";
import "./home.css";


export default function Home() {
  return (
    <div className="transmission-home">
      <Navbar />
      <main>
        <section className="transmission-hero" aria-labelledby="home-title">
          <Image src="/aureyx-space-background.jpg" alt="" fill priority sizes="100vw" className="transmission-backdrop" />
          <div className="transmission-texture" aria-hidden="true" />
          <div className="transmission-topline"><span><i /> Independent producers</span><span>Electronic music collective</span></div>
          <div className="transmission-center">
            <p className="transmission-eyebrow"><span className="signal-dot" /> REC <span>· TRANSMISSION / AUREYX</span></p>
            <h1 aria-label="Aureyx" id="home-title" className="transmission-wordmark aureyx-animated-logo"><span className="aureyx-gothic-mark" aria-hidden="true" /></h1>
            <p className="transmission-tagline">A home for the sounds that don’t fit in.</p>
            <div className="transmission-actions"><Link className="transmission-button primary" href="/music">Discography <ArrowUpRight size={17} /></Link><Link className="transmission-button" href="/artists">Aureyx Collaborators <ArrowUpRight size={17} /></Link></div>
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

        <section className="transmission-section home-music-gateway" aria-labelledby="music-heading">
          <div className="home-music-copy"><p className="transmission-eyebrow">02 / Music</p><h2 id="music-heading">The catalog has its own room.</h2><p>{albums.length} releases, collaborations, and connected projects in one place.</p><Link className="transmission-button primary" href="/music">Open discography <ArrowUpRight size={17} /></Link></div>
          <Link href="/music" className="home-music-covers" aria-label="Open the Aureyx discography">{albums.slice(0, 3).map((album, index) => <span key={album.link} style={{ "--cover-index": index } as CSSProperties}><Image src={album.image} alt={`${album.title} cover`} fill sizes="240px" /></span>)}</Link>
        </section>

        <section className="transmission-section home-artists-section" aria-labelledby="artists-heading"><div className="transmission-section-heading"><div><p className="transmission-eyebrow">03 / The people</p><h2 id="artists-heading">Artists</h2></div><Link className="transmission-text-link" href="/artists">All artist profiles <ArrowUpRight size={18} /></Link></div><div className="transmission-artists">{artists.map((artist, index) => <Link className="transmission-artist" href={`/artists/${artist.slug}`} key={artist.slug}><div className="transmission-artist-photo">{artist.image ? <Image src={artist.image} alt="" fill sizes="(max-width: 700px) 84vw, 28vw" /> : <span>{artist.name.charAt(0)}</span>}<span className="transmission-artist-number">0{index + 1}</span></div><div className="transmission-artist-info"><span>{artist.role}</span><h3>{artist.name}</h3><p>{artist.bio}</p></div><ArrowUpRight className="transmission-artist-arrow" size={24} /></Link>)}</div></section>

        <section id="videos" className="transmission-section transmission-videos" aria-labelledby="videos-heading">
          <div className="transmission-section-heading"><div><p className="transmission-eyebrow">04 / Watch</p><h2 className="heading-with-brand" id="videos-heading">Videos <SocialIcon platform="YouTube" size={38} /></h2></div><Link className="transmission-text-link" href="/videos">All videos <ArrowUpRight size={18} /></Link></div>
          <HomeVideoFeeds compact />
        </section>

        <section id="links" className="transmission-section transmission-links" aria-labelledby="links-heading">
          <div className="transmission-section-heading"><div><p className="transmission-eyebrow">05 / Links</p><h2 id="links-heading">Find everyone</h2></div><p>Verified Linktrees and direct artist channels.</p></div>
          <HomeLinks />
        </section>

        <section className="transmission-section transmission-explore" aria-label="More from Aureyx"><a className="transmission-explore-card nocturna-card" href="https://nocturnakits.gumroad.com/l/oeveok" target="_blank" rel="noopener noreferrer"><Image src="/nocturna-cover.png" alt="" fill sizes="(max-width: 700px) 92vw, 45vw" className="nocturna-card-art" /><span className="nocturna-card-shade" /><div><p className="transmission-eyebrow">06 / For the creators</p><ArrowUpRight className="transmission-explore-arrow" /><span className="nocturna-moon" role="img" aria-label="Nocturna crescent moon logo from the cover" /><h2>Nocturna</h2><p>Sounds created by iyune, used interchangeably throughout Aureyx.</p><strong>$2</strong><span>Explore sound kits ↗</span></div></a><Link className="transmission-explore-card" href="/artists"><p className="transmission-eyebrow">07 / Updates</p><ArrowUpRight className="transmission-explore-arrow" /><h2>Artist<br /><em>journals.</em></h2><p>Updates and new work from Aureyx artists.</p><span>Explore artist updates ↗</span></Link></section>
        <div className="transmission-signoff"><Image src="/aureyx-space-background.jpg" alt="" fill sizes="(max-width: 1200px) 100vw, 1200px" className="transmission-signoff-art" /><h2 aria-label="Aureyx" className="transmission-endmark aureyx-animated-logo"><span className="aureyx-gothic-mark" aria-hidden="true" /></h2><p>Independent electronic music.</p><div><a className="social-icon-link" href="https://open.spotify.com/artist/1IwiBlGpQaMr8dV7u5LtjI" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Spotify" />Spotify</a><a className="social-icon-link" href="https://dystofuturemusic.bandcamp.com/" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Bandcamp" />Bandcamp</a><a className="social-icon-link" href="https://linktr.ee/dystofuturemusic" target="_blank" rel="noopener noreferrer"><SocialIcon platform="Linktree" />Connect</a></div></div>
      </main>
      <Footer />
    </div>
  );
}
