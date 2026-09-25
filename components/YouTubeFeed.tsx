import YouTubePlayer from "@/components/YouTubePlayer";
import { getYouTubeVideos } from "@/lib/youtube-feed";

export default async function YouTubeFeed({ channelId, name }: { channelId: string; name: string }) {
  const videos = await getYouTubeVideos(channelId);
  return (
    <section id="videos" className="mt-16 scroll-mt-32" aria-labelledby="videos-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="videos-heading" className="text-3xl font-semibold">Videos</h2>
        <a className="text-sm text-white/65 hover:text-white" href={`https://www.youtube.com/channel/${channelId}/videos`} target="_blank" rel="noopener noreferrer">View YouTube channel ↗</a>
      </div>
      {videos.length ? <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => <article key={video.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#181618]">
          <YouTubePlayer id={video.id} title={`${name}: ${video.title}`} thumbnail={video.thumbnail} />
          <div className="p-5"><h3 className="text-sm font-medium leading-6"><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">{video.title}</a></h3><time dateTime={video.published} className="mt-3 block text-xs text-white/50">{new Date(video.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time></div>
        </article>)}
      </div> : <p className="mt-6 text-white/60">Videos couldn’t be loaded right now. You can still watch them on the YouTube channel.</p>}
    </section>
  );
}
