import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gamepad2 } from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/app/home.css";

export default function ForFunPage() {
  return (
    <div className="transmission-home fun-page">
      <Navbar />
      <main>
        <header className="fun-heading">
          <p className="transmission-eyebrow">Outside the label</p>
          <h1>For Fun</h1>
          <p>Personal projects and things we play. This section isn&apos;t part of Aureyx releases or artist work.</p>
        </header>
        <section className="fun-grid" aria-label="For fun projects">
          <Link href="/gaming/osu" className="fun-card">
            <Image src="/osu/in-game-background-ariisha.png" alt="osu! seasonal artwork" fill sizes="(max-width: 800px) 92vw, 650px" />
            <span className="fun-card-shade" />
            <div><Gamepad2 aria-hidden="true" /><p>Rhythm game</p><h2>osu!</h2><span>Maps, scores, goals, and equipment <ArrowUpRight /></span></div>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
