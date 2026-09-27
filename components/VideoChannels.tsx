"use client";
import { useState } from "react";
import Image from "next/image";
import YouTubePlayer from "@/components/YouTubePlayer";
import SocialIcon from "@/components/SocialIcon";
import type { YouTubeVideo } from "@/lib/youtube-feed";
type Channel = { name:string; handle:string; id:string; avatar:string; videos:YouTubeVideo[] };
export default function VideoChannels({ feeds, compact }: { feeds:Channel[]; compact:boolean }) {
  const [selected,setSelected]=useState("All");
  const visible=selected==="All"?feeds:feeds.filter((channel)=>channel.name===selected);
  return <>{!compact&&<div className="video-filters" aria-label="Filter videos by artist">{["All",...feeds.map((channel)=>channel.name)].map((name)=><button type="button" aria-pressed={selected===name} onClick={()=>setSelected(name)} key={name}>{name}</button>)}</div>}<div className={`home-video-channels${compact ? " home-video-channels-compact" : ""}`}>{visible.map((channel)=><section className="home-video-channel" key={channel.id} aria-labelledby={`channel-${channel.id}`}><header><div><div className="home-video-identity"><Image src={channel.avatar} alt={`${channel.name} YouTube profile picture`} width={58} height={58}/><h3 id={`channel-${channel.id}`}>{channel.name}</h3></div><span>{channel.handle}</span></div><a className="social-icon-link" href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer"><SocialIcon platform="YouTube"/> Channel ↗</a></header>{channel.videos.length?<div className="home-video-grid">{channel.videos.map((video)=><article className="home-video-card" key={video.id}><YouTubePlayer id={video.id} title={`${channel.name}: ${video.title}`}/><div><h4><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">{video.title}</a></h4><time dateTime={video.published}>{new Date(video.published).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"UTC"})}</time></div></article>)}</div>:<p className="home-video-empty">No recent uploads found. <a className="social-icon-link" href={`https://www.youtube.com/${channel.handle}`} target="_blank" rel="noopener noreferrer"><SocialIcon platform="YouTube"/> Open the channel ↗</a></p>}</section>)}</div></>;
}
