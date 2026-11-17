import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import saved from "@/data/external/geometry-dash.json";
import { getYouTubeVideos, type YouTubeVideo } from "@/lib/youtube-feed";
import YouTubePlayer from "@/components/YouTubePlayer";
import YouTubeChannelPlayer from "@/components/YouTubeChannelPlayer";
import "@/app/home.css";
import "./geometry.css";

export const metadata: Metadata = { title: "Geometry Dash | Aureyx", description: "A personal Geometry Dash showcase for progress and videos." };
export const revalidate = 86400;
export default async function GeometryDashPage() {
  const channelId = saved.channelId as string | null;
  const fresh = channelId ? await getYouTubeVideos(channelId) : [];
  const videos: YouTubeVideo[] = fresh.length ? fresh : saved.videos;

  return <div className="geometry-theme"><Navbar /><main><header><Link href="/for-fun">← For Fun</Link><p className="geometry-kicker">Personal showcase</p><h1>Geometry Dash</h1><p>Progress, runs, and videos from naga. More profile details coming soon.</p><Image src="/tools/geometry-dash.svg" alt="Geometry Dash showcase illustration" width={900} height={400} priority /></header><section aria-labelledby="geometry-videos"><h2 id="geometry-videos">Videos from naga</h2><p>Connected to <a href={saved.url} target="_blank" rel="noopener noreferrer">@naga-gd ↗</a>. Checked daily; saved videos remain available during temporary feed outages.</p>{videos.length ? <div className="geometry-video-grid">{videos.map(video => <article key={video.id}><YouTubePlayer id={video.id} title={video.title} /><h3>{video.title}</h3><time dateTime={video.published}>{new Date(video.published).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"})}</time></article>)}</div> : channelId ? <YouTubeChannelPlayer channelId={channelId} name="naga" /> : <p>The video feed is temporarily unavailable. <a href={saved.url + "/videos"} target="_blank" rel="noopener noreferrer">Watch naga’s videos on YouTube ↗</a></p>}</section></main><Footer /></div>;
}
