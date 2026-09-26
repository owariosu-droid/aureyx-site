import Image from "next/image";
import YouTubePlayer from "@/components/YouTubePlayer";
import SocialIcon from "@/components/SocialIcon";
import { getYouTubeVideos } from "@/lib/youtube-feed";

const channels = [
  { name: "Aureyx", handle: "@Aureyx-u6c", id: "UC2qP_-I9kcrSazQNUWNd6ag", avatar: "/members/youtube-aureyx.jpg" },
  { name: "Lyrlvst", handle: "@lyrlvst", id: "UC7xSxOfYmUlZ8jIp_567M6w", avatar: "/members/youtube-lyrlvst.jpg" },
  { name: "iyune", handle: "@iyuneofficial", id: "UCrNekfYIdOYln8PP1AcGWvA", avatar: "/members/youtube-iyune.jpg" },
  { name: "Dysto", handle: "@dystoftmusic23", id: "UCcKq5OXoC-guJU9hBcZjC3w", avatar: "/members/youtube-dysto.jpg" },
];

export default async function HomeVideoFeeds({ compact = false }: { compact?: boolean }) {
  const feeds = await Promise.all(
    channels.map(async (channel) => ({
      ...channel,
      videos: (await getYouTubeVideos(channel.id)).slice(0, compact ? 1 : 2),
    })),
  );

  return (
    <div className={`home-video-channels${compact ? " home-video-channels-compact" : ""}`}>
      {feeds.map((channel) => (
        <section className="home-video-channel" key={channel.id} aria-labelledby={`channel-${channel.id}`}>
          <header>
            <div>
              <div className="home-video-identity"><Image src={channel.avatar} alt={`${channel.name} YouTube profile picture`} width={58} height={58} /><h3 id={`channel-${channel.id}`}>{channel.name}</h3></div>
              <span>{channel.handle}</span>
            </div>
            <a className="social-icon-link" href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer"><SocialIcon platform="YouTube" /> Channel ↗</a>
          </header>
          {channel.videos.length ? (
            <div className="home-video-grid">
              {channel.videos.map((video) => (
                <article className="home-video-card" key={video.id}>
                  <YouTubePlayer id={video.id} title={`${channel.name}: ${video.title}`} thumbnail={video.thumbnail} />
                  <div>
                    <h4><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">{video.title}</a></h4>
                    <time dateTime={video.published}>{new Date(video.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="home-video-empty">No recent uploads found. <a className="social-icon-link" href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer"><SocialIcon platform="YouTube" /> Open the channel ↗</a></p>
          )}
        </section>
      ))}
    </div>
  );
}
