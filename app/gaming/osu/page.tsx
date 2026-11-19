import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import profile from "@/data/external/osu.json";
import sideChannel from "@/data/external/osu-side-channel.json";
import LinkedYouTubeChannel from "@/components/LinkedYouTubeChannel";
import { favoriteScores } from "@/data/osu-scores";
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
  const sections = organizeOsuProfile(profile.html).filter(section => !section.title.startsWith("Unranked Scores"));
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
          <nav className="osu-jump-nav" aria-label="osu! page sections"><a href="#favorite-scores">Favorite scores</a><a href="#side-channel">Side channel</a>{sections.map(section => <a href={"#" + section.id} key={section.id}>{section.title === "Thinking of Mapping" ? "Mapping ideas" : section.title.startsWith("Unranked Scores") ? "Scores" : section.title}</a>)}</nav>
          <div className="osu-organized-sections">{sections.map(section => <section className="osu-panel osu-organized-section" id={section.id} key={section.id} aria-labelledby={section.id + "-heading"}>
            <div className="osu-organized-heading"><h2 id={section.id + "-heading"}>{section.title.startsWith("Unranked Scores") ? "Unranked scores" : section.title}</h2>{section.cards.length > 0 && <span>{section.cards.length} {section.cards.length === 1 ? "project" : "projects"}</span>}</div>
            {section.intro && <div className="osu-section-intro osu-synced-profile" dangerouslySetInnerHTML={{ __html: section.intro }} />}
            {section.cards.length > 0 ? <div className="osu-project-grid">{section.cards.map((card, index) => <article className="osu-project-card" key={index}>
              {card.image && <div className="osu-project-art"><Image src={card.image} alt={card.title + " mapping artwork"} width={800} height={800} sizes="(max-width:700px) 90vw, 500px" /></div>}
              <div className="osu-project-copy"><p className="osu-project-status">{projectStatuses[card.title] ?? (section.title === "Thinking of Mapping" ? "Mapping idea" : card.href ? "On osu!" : "In development")}</p><h3>{card.title}</h3><div className="osu-synced-profile" dangerouslySetInnerHTML={{ __html: card.html }} />{card.href && <a className="osu-project-link" href={card.href} target="_blank" rel="noopener noreferrer">View beatmap <ExternalLink size={15} /></a>}</div>
            </article>)}</div> : <div className="osu-synced-profile" dangerouslySetInnerHTML={{ __html: section.html }} />}
          </section>)}</div>
        </> : <section className="osu-panel osu-synced-profile" aria-label="osu! profile content" dangerouslySetInnerHTML={{ __html: profile.html }} />}
        <section id="favorite-scores" className="osu-panel osu-local-scores" aria-labelledby="favorite-scores-heading">
          <div className="osu-organized-heading"><div><p className="osu-project-status">Personal best moments</p><h2 id="favorite-scores-heading">Favorite scores</h2></div><span>{favoriteScores.length} plays · {favoriteScores.filter(score => score.video).length} playable</span></div>
          <p className="osu-scores-intro">Favorite plays and personal milestones. Scroll through the recordings below.</p>
          <div className="osu-scores-scroll" role="region" aria-label="Favorite play recordings" tabIndex={0}>
            <ol className="osu-scores-list">
              {favoriteScores.map((score, index) => <li key={score.id}><article className="osu-score-recording">
                {score.video ? <video controls playsInline preload="none" poster={score.poster} aria-label={score.title} width={1280} height={720}><source src={score.video} type="video/mp4" /><p>Your browser cannot play this recording. <a href={score.video}>Download the video</a>.</p></video> : <div className="osu-score-pending" aria-label="Recording not available"><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>Recording not available yet</span></div>}
                <div className="osu-score-copy"><h3>{score.title}</h3><p>{score.details}</p>{score.video ? <a href={score.video} download>Download recording ↗</a> : <p className="osu-score-availability">This play is listed; its video has not been added yet.</p>}</div>
              </article></li>)}
            </ol>
          </div>
        </section>
        <section id="side-channel" className="osu-panel osu-side-channel" aria-label="osu side channel"><LinkedYouTubeChannel channel={sideChannel} /></section>
        <p className="osu-art-credit">In-game seasonal artwork by <a href="https://osu.ppy.sh/community/forums/topics/641984" target="_blank" rel="noopener noreferrer">Ariisha ↗</a></p>
      </main>
      <Footer />
    </div>
  );
}
