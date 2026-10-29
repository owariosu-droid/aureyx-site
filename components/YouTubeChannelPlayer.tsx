import { channelEmbed } from "@/lib/youtube-embed";

// YouTube supplies the native thumbnail and keeps its uploads playlist current.
export default function YouTubeChannelPlayer({ channelId, name }: { channelId: string; name: string }) {
  const embed = channelEmbed(channelId);
  if (!embed) return null;

  return <div className="youtube-embed">
    <div className="youtube-player-shell">
      <iframe src={embed.src} title={`${name} uploads`} loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>
    <p className="youtube-watch-link">Latest uploads · <a href={embed.watchUrl} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></p>
  </div>;
}
