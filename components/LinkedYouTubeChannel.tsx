import { getYouTubeVideos, type YouTubeVideo } from "@/lib/youtube-feed";
import YouTubePlayer from "@/components/YouTubePlayer";
import YouTubeChannelPlayer from "@/components/YouTubeChannelPlayer";
import SocialIcon from "@/components/SocialIcon";

type Channel = { name: string; handle: string; url: string; channelId: string | null; videos: YouTubeVideo[] };
export default async function LinkedYouTubeChannel({ channel, compact = false }: { channel: Channel; compact?: boolean }) {
  const fresh = channel.channelId ? await getYouTubeVideos(channel.channelId) : [];
  const videos = (fresh.length ? fresh : channel.videos).slice(0, compact ? 1 : 3);
  return <div className={"linked-channel" + (compact ? " linked-channel--compact" : "")}>
    <header><div><p>{compact ? "Founder’s channel" : "Side channel"}</p><h3><SocialIcon platform="YouTube" />{channel.handle}</h3></div><a href={channel.url} target="_blank" rel="noopener noreferrer">View channel ↗</a></header>
    {videos.length ? <div className="linked-channel-videos">{videos.map(video => <article key={video.id}><YouTubePlayer id={video.id} title={video.title} /><h4>{video.title}</h4></article>)}</div> : channel.channelId ? <YouTubeChannelPlayer channelId={channel.channelId} name={channel.name} /> : <a className="linked-channel-open" href={channel.url + "/videos"} target="_blank" rel="noopener noreferrer">Explore {channel.name} on YouTube ↗</a>}
    <p className="linked-channel-note">Daily channel updates · opens YouTube only when you play or follow a link.</p>
  </div>;
}
