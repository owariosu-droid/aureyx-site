import { getYouTubeVideos } from "@/lib/youtube-feed";
import VideoChannels from "@/components/VideoChannels";

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

  return <VideoChannels feeds={feeds} compact={compact} />;
}
