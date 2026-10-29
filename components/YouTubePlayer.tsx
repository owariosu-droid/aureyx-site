import { videoEmbed } from "@/lib/youtube-embed";

export default function YouTubePlayer({ id, title }: { id: string; title: string }) {
  const embed = videoEmbed(id);
  if (!embed) return null;

  return <div className="youtube-embed">
    <div className="youtube-player-shell">
      <iframe src={embed.src} title={title} loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>
    <a className="youtube-watch-link" href={embed.watchUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
  </div>;
}
