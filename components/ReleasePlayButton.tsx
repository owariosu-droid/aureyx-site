"use client";
import { Pause, Play } from "lucide-react";
import { useAudioPlayer } from "@/components/AudioPlayerProvider";
import type { Release } from "@/lib/releases";

export default function ReleasePlayButton({ release }: { release: Release }) {
  const player = useAudioPlayer();
  if (!release.preview) return null;
  const active = player.current?.link === release.link && player.playing;
  return <button className="release-detail-play" type="button" onClick={() => player.play({ title:release.title,image:release.image,src:release.preview!,link:release.link,slug:release.slug })}>{active ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}{active ? "Pause preview" : "Play preview"}</button>;
}
