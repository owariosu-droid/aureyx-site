import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import profile from "@/data/external/osu.json";
import "@/app/home.css";
import "./osu.css";

const number = (value: number) => value.toLocaleString("en-US");

export default function OsuPage() {
  const stats = profile.statistics;
  return (
    <div className="transmission-home osu-theme">
      <Navbar />
      <div className="osu-page-art" aria-hidden="true" />
      <main className="relative z-10 mx-auto min-h-screen max-w-6xl px-6 py-16 sm:py-24">
        <header className="osu-header">
          <p className="transmission-eyebrow">For fun / osu!</p>
          <div className="osu-profile-row">
            <Image src={profile.avatar} alt={`${profile.username}'s osu! avatar`} width={112} height={112} priority className="osu-avatar" />
            <div><h1>{profile.username}</h1><p>Mapping projects, scores, and profile updates from osu!. Separate from Aureyx.</p></div>
            <Image src="/osu/osu-logo.png" alt="osu!" width={80} height={80} className="osu-badge" />
          </div>
          <div className="osu-profile-links">
            <a href={profile.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm">View osu! profile <ExternalLink size={16} /></a>
            {profile.discord && <span>Discord <strong className="select-all">{profile.discord}</strong></span>}
          </div>
          <dl className="osu-overview" aria-label={`${profile.mode} profile statistics`}>
            {[
              ["Global rank", stats.global_rank == null ? "Unranked" : `#${number(stats.global_rank)}`],
              ["Performance", `${number(stats.pp)} pp`],
              ["Accuracy", `${stats.hit_accuracy.toFixed(2)}%`],
              ["Play count", number(stats.play_count)],
            ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <p className="mb-8 text-sm text-white/55">Profile content is refreshed daily. <a href={profile.url} target="_blank" rel="noopener noreferrer" className="underline">View live stats on osu!</a></p>
        </header>
        {/* HTML is reduced to a formatting allowlist by scripts/sync-external.py.
            Images are verified and stored locally; source scripts/styles are discarded. */}
        <section className="osu-panel osu-synced-profile" aria-label="osu! profile content" dangerouslySetInnerHTML={{ __html: profile.html }} />
        <p className="osu-art-credit">In-game seasonal artwork by <a href="https://osu.ppy.sh/community/forums/topics/641984" target="_blank" rel="noopener noreferrer">Ariisha ↗</a></p>
      </main>
      <Footer />
    </div>
  );
}
