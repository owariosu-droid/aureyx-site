import Image from "next/image";
import scores from "@/data/external/osu-scores.json";
import OsuMods from "@/components/OsuMods";

export default function OsuScoreShowcase() {
  return <>{(["best", "pinned"] as const).map(kind => <section key={kind} id={`${kind}-scores`} className="osu-panel osu-score-showcase" aria-labelledby={`${kind}-scores-heading`}>
    <div className="osu-organized-heading"><div><p className="osu-project-status">{kind === "best" ? "Ranked by performance points" : "Selected on my osu! profile"}</p><h2 id={`${kind}-scores-heading`}>{kind === "best" ? "Top scores" : "Pinned scores"}</h2></div><span>{scores[kind].length} plays</span></div>
    <div className="osu-score-table-scroll" role="region" aria-label={kind === "best" ? "Top score list" : "Pinned score list"} tabIndex={0}>
      <ol className="osu-score-table">{scores[kind].map((score, index) => <li key={score.id} className="osu-live-score">
        <span className="osu-score-position">{String(index + 1).padStart(2, "0")}</span>
        <div className="osu-score-map-art">{score.cover && <Image src={score.cover} alt="" fill sizes="100px" className="object-cover" />}</div>
        <div className="osu-score-map-copy"><a href={`https://osu.ppy.sh/beatmaps/${score.beatmapId}`} target="_blank" rel="noopener noreferrer">{score.title} ↗</a><p>{score.artist} · [{score.difficulty}]</p><OsuMods mods={score.mods} /><time dateTime={score.playedAt}>{new Date(score.playedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}</time></div>
        <div className="osu-score-performance"><a href={`https://osu.ppy.sh/scores/${score.id}`} target="_blank" rel="noopener noreferrer" aria-label={`View ${score.title} score on osu!`}><strong>{score.pp === null ? "—" : Math.round(score.pp * 10) / 10}<small> pp</small></strong><span className="osu-score-grade">{score.rank}</span></a><dl><div><dt>Accuracy</dt><dd>{(score.accuracy * 100).toFixed(2)}%</dd></div><div><dt>Combo</dt><dd>{score.combo.toLocaleString("en-US")}x</dd></div><div><dt>Misses</dt><dd>{score.misses}</dd></div></dl></div>
      </li>)}</ol>
      {!scores[kind].length && <p>No pinned scores on the public profile yet.</p>}
    </div>
    <a className="osu-scores-source" href={`https://osu.ppy.sh/users/${scores.userId}/osu#${kind === "best" ? "scoresBest" : "scoresPinned"}`} target="_blank" rel="noopener noreferrer">View live {kind === "best" ? "top" : "pinned"} scores on osu! ↗</a>
  </section>)}</>;
}
