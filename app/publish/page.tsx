import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { artists } from "@/data/artists";
import { submissionUrl } from "@/lib/artist-updates";
import "@/app/home.css";
export const metadata = { title:"Artist publishing | Aureyx", description:"Publish an update to an Aureyx artist profile." };
export default function PublishPage(){ return <div className="transmission-home publish-page"><Navbar/><main><header className="catalog-hero"><p className="transmission-eyebrow">Artist tools</p><h1>Publishing</h1><p>Post updates, photos, and project notes without editing the site. Choose Update, Release, Artwork, or Announcement in the issue template.</p></header><section className="publish-grid">{artists.map((artist)=><article key={artist.slug}><span>{artist.role}</span><h2>{artist.name}</h2><p>Write the post, choose its category, attach images, then submit it for review. Approved posts appear on the profile automatically.</p><a href={submissionUrl(artist.slug,artist.name)} target="_blank" rel="noopener noreferrer">Write an update ↗</a><Link href={`/artists/${artist.slug}`}>View profile</Link></article>)}</section></main><Footer/></div> }
