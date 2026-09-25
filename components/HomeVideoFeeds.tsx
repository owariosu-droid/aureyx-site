import YouTubePlayer from "@/components/YouTubePlayer";
import { getYouTubeVideos } from "@/lib/youtube-feed";

const channels = [
  { name: "Aureyx", handle: "@Aureyx-u6c", id: "UC2qP_-I9kcrSazQNUWNd6ag" },
  { name: "Lyrlvst", handle: "@lyrlvst", id: "UC7xSxOfYmUlZ8jIp_567M6w" },
  { name: "iyune", handle: "@iyuneofficial", id: "UCrNekfYIdOYln8PP1AcGWvA" },
  { name: "Dysto", handle: "@dystoftmusic23", id: "UCcKq5OXoC-guJU9hBcZjC3w" },
];

export default async function HomeVideoFeeds() {
  const feeds = await Promise.all(
    channels.map(async (channel) => ({
      ...channel,
      videos: (await getYouTubeVideos(channel.id)).slice(0, 2),
    })),
  );

  return (
    <div className="home-video-channels">
      {feeds.map((channel) => (
        <section className="home-video-channel" key={channel.id} aria-labelledby={`channel-${channel.id}`}>
          <header>
            <div>
              <h3 id={`channel-${channel.id}`}>{channel.name}</h3>
              <span>{channel.handle}</span>
            </div>
            <a href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer">Channel ↗</a>
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
            <p className="home-video-empty">No recent uploads found. <a href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer">Open the channel ↗</a></p>
          )}
        </section>
      ))}
    </div>
  );
}
