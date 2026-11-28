import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomeReleases from "@/components/HomeReleases";
import "@/app/home.css";
import "@/app/music/music.css";
export const metadata = { title: "Your listening list | Aureyx", description: "Return to releases you saved on this device." };
export default function SavedMusic() {
  return <div className="transmission-home catalog-page"><Navbar /><main><header className="catalog-hero"><p className="transmission-eyebrow">Saved music</p><h1>Listening list</h1><p>Save releases as you browse and come back to them here. Your list stays in this browser; no account needed.</p><div><Link href="/music">Browse releases ↗</Link><Link href="/music#free-listening">Free listening ↗</Link></div></header><section className="transmission-section catalog-list" aria-label="Saved releases"><HomeReleases savedOnly /></section></main><Footer /></div>;
}
