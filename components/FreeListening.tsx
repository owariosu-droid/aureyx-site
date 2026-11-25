import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import YouTubePlayer from "@/components/YouTubePlayer";
import YouTubeChannelPlayer from "@/components/YouTubeChannelPlayer";
import SocialIcon from "@/components/SocialIcon";
import { getYouTubeVideos } from "@/lib/youtube-feed";
import { getSoundCloudTracks, soundCloudEmbedUrl, soundCloudSources } from "@/lib/soundcloud";
import { artists } from "@/data/artists";
import "./free-listening.css";

const channels = [
  { name: "Aureyx", id: "UC2qP_-I9kcrSazQNUWNd6ag" },
  { name: "Lyrlvst", id: "UC7xSxOfYmUlZ8jIp_567M6w" },
  { name: "iyune", id: "UCrNekfYIdOYln8PP1AcGWvA" },
  { name: "Dysto", id: "UCcKq5OXoC-guJU9hBcZjC3w" },
  { name: "Yoru Zenaku", id: "UCe5zNYSQ3xVyss4hET5j7Cw" },
];
const date = (value: string) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function FreeListening({ artistName }: { artistName?: string }) {
  const [feeds, tracks] = await Promise.all([
    Promise.all(channels.filter((channel) => !artistName || channel.name === artistName).map(async (channel) => {
      const live = await getYouTubeVideos(channel.id);
      const saved = artists.find((artist) => artist.name === channel.name)?.featuredVideos || [];
      return { ...channel, videos: (live.length ? live : saved).slice(0, 2) };
    })),
    getSoundCloudTracks(artistName),
  ]);
  const seenVideos = new Set<string>();
  const sources = soundCloudSources.filter((source) => !artistName || source.name === artistName);

  return <div className="free-listening">
    <section id="youtube-music" className="free-platform-section" aria-labelledby="youtube-music-heading">
      <div className="free-platform-heading"><h3 id="youtube-music-heading"><SocialIcon platform="YouTube" size={25} />YouTube</h3><Link href="/videos">All artist channels <ArrowUpRight size={15} /></Link></div>
      <div className="free-youtube-grid">
        {feeds.flatMap((channel) => {
          const videos = channel.videos.filter((video) => {
            if (seenVideos.has(video.id)) return false;
            seenVideos.add(video.id);
            return true;
          });
          return videos.length ? videos.map((video) => <article className="free-media-card" key={video.id}>
            <YouTubePlayer id={video.id} title={`${channel.name}: ${video.title}`} />
            <div className="free-card-copy"><p className="free-card-artist">{channel.name}</p><h4><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">{video.title}</a></h4><time dateTime={video.published}>{date(video.published)}</time></div>
          </article>) : channel.videos.length ? [] : [<article className="free-media-card free-channel-card" key={channel.id}>
            <div className="free-card-copy"><p className="free-card-artist">{channel.name}</p><h4>Latest uploads</h4></div>
            <YouTubeChannelPlayer channelId={channel.id} name={channel.name} />
          </article>];
        })}
      </div>
    </section>

    {sources.length > 0 && <section id="soundcloud-music" className="free-platform-section" aria-labelledby="soundcloud-music-heading">
      <div className="free-platform-heading"><h3 id="soundcloud-music-heading"><SocialIcon platform="SoundCloud" size={27} />SoundCloud</h3><span>Full tracks</span></div>
      {tracks.length ? <div className="free-soundcloud-grid">{tracks.map((track) => {
        const embed = soundCloudEmbedUrl(track.link);
        return <article className="free-media-card free-soundcloud-card" key={track.id}>
          <div className="free-soundcloud-art"><Image src={track.image} alt={`${track.title} cover`} fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 28vw" /></div>
          <div className="free-card-copy"><p className="free-card-artist">{track.artist}</p><h4><a href={track.link} target="_blank" rel="noopener noreferrer">{track.title}</a></h4><time dateTime={track.published}>{date(track.published)}</time></div>
          {embed && <details className="free-soundcloud-player"><summary><Play size={14} aria-hidden="true" />Open player</summary><iframe src={embed} title={`${track.title} on SoundCloud`} loading="lazy" height="166" allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" /></details>}
        </article>;
      })}</div> : <p className="free-listening-note">The tracks couldn’t be loaded right now. You can still listen on the artists’ SoundCloud pages.</p>}
      <div className="free-soundcloud-links">{sources.map((source) => <a key={source.slug} href={`https://soundcloud.com/${source.slug}`} target="_blank" rel="noopener noreferrer"><SocialIcon platform="SoundCloud" />{source.name} on SoundCloud <ArrowUpRight size={14} /></a>)}</div>
    </section>}
  </div>;
}
