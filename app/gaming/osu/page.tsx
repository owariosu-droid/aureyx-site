import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import profile from "@/data/external/osu.json";
import { organizeOsuProfile } from "@/lib/osu-profile";
import "@/app/home.css";
import "./osu.css";

const number = (value: number) => value.toLocaleString("en-US");
const projectStatuses: Record<string, string> = {
  "Death of the Endless": "Started",
  "Dork After Dark": "Started",
};

export default function OsuPage() {
  const stats = profile.statistics;
  const sections = organizeOsuProfile(profile.html);
  return (
    <div className="osu-theme">
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
        {sections.length > 0 ? <>
          <nav className="osu-jump-nav" aria-label="osu! page sections">{sections.map(section => <a href={"#" + section.id} key={section.id}>{section.title === "Thinking of Mapping" ? "Mapping ideas" : section.title.startsWith("Unranked Scores") ? "Scores" : section.title}</a>)}</nav>
          <div className="osu-organized-sections">{sections.map(section => <section className="osu-panel osu-organized-section" id={section.id} key={section.id} aria-labelledby={section.id + "-heading"}>
            <div className="osu-organized-heading"><h2 id={section.id + "-heading"}>{section.title.startsWith("Unranked Scores") ? "Unranked scores" : section.title}</h2>{section.cards.length > 0 && <span>{section.cards.length} {section.cards.length === 1 ? "project" : "projects"}</span>}</div>
            {section.intro && <div className="osu-section-intro osu-synced-profile" dangerouslySetInnerHTML={{ __html: section.intro }} />}
            {section.cards.length > 0 ? <div className="osu-project-grid">{section.cards.map((card, index) => <article className="osu-project-card" key={index}>
              {card.image && <div className="osu-project-art"><Image src={card.image} alt={card.title + " mapping artwork"} width={800} height={800} sizes="(max-width:700px) 90vw, 500px" /></div>}
              <div className="osu-project-copy"><p className="osu-project-status">{projectStatuses[card.title] ?? (section.title === "Thinking of Mapping" ? "Mapping idea" : card.href ? "On osu!" : "In development")}</p><h3>{card.title}</h3><div className="osu-synced-profile" dangerouslySetInnerHTML={{ __html: card.html }} />{card.href && <a className="osu-project-link" href={card.href} target="_blank" rel="noopener noreferrer">View beatmap <ExternalLink size={15} /></a>}</div>
            </article>)}</div> : <div className="osu-synced-profile" dangerouslySetInnerHTML={{ __html: section.html }} />}
          </section>)}</div>
        </> : <section className="osu-panel osu-synced-profile" aria-label="osu! profile content" dangerouslySetInnerHTML={{ __html: profile.html }} />}
        <p className="osu-art-credit">In-game seasonal artwork by <a href="https://osu.ppy.sh/community/forums/topics/641984" target="_blank" rel="noopener noreferrer">Ariisha ↗</a></p>
      </main>
      <Footer />
    </div>
  );
}
