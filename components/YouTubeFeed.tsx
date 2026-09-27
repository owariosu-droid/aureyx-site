import YouTubePlayer from "@/components/YouTubePlayer";
import { getYouTubeVideos } from "@/lib/youtube-feed";
import SocialIcon from "@/components/SocialIcon";
import type { YouTubeVideo } from "@/lib/youtube-feed";

export default async function YouTubeFeed({ channelId, fallbackChannelIds = [], featuredVideos = [], name }: { channelId?: string; fallbackChannelIds?: string[]; featuredVideos?: YouTubeVideo[]; name: string }) {
  let videos = channelId ? await getYouTubeVideos(channelId) : [];
  if (!videos.length && fallbackChannelIds.length) {
    const related = (await Promise.all(fallbackChannelIds.map(getYouTubeVideos))).flat();
    const artistName = name.toLowerCase();
    videos = related.filter((video, index, all) => video.title.toLowerCase().includes(artistName) && all.findIndex((candidate) => candidate.id === video.id) === index).slice(0, 6);
  }
  if (!videos.length) videos = featuredVideos;
  const channelHref = channelId ? `https://www.youtube.com/channel/${channelId}/videos` : "https://www.youtube.com/@Aureyx-u6c";
  return (
    <section id="videos" className="artist-video-feed mt-16 scroll-mt-32" aria-labelledby="videos-heading">
      <div className="artist-video-heading flex flex-wrap items-center justify-between gap-4">
        <h2 id="videos-heading" className="text-3xl font-semibold">Videos</h2>
        <a className="social-icon-link text-sm text-white/65 hover:text-white" href={channelHref} target="_blank" rel="noopener noreferrer"><SocialIcon platform="YouTube" />{channelId ? "View YouTube channel" : "View on Aureyx YouTube"} ↗</a>
      </div>
      {videos.length ? <div className="artist-video-grid mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => <article key={video.id} className="artist-video-card overflow-hidden rounded-2xl border border-white/10 bg-[#181618]">
          <YouTubePlayer id={video.id} title={`${name}: ${video.title}`} thumbnail={video.thumbnail} />
          <div className="p-5"><h3 className="text-sm font-medium leading-6"><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">{video.title}</a></h3><time dateTime={video.published} className="mt-3 block text-xs text-white/50">{new Date(video.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></div>
        </article>)}
      </div> : <p className="mt-6 text-white/60">Videos couldn’t be loaded right now. You can still watch them on the YouTube channel.</p>}
    </section>
  );
}
