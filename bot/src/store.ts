import { Message, type Channel, type SendableChannels } from "discord.js";
import { config } from "./config.ts";
import { deleteMessage, getSetting, upsertMessage, upsertSetting } from "./db.ts";
import { indexableText } from "./format.ts";

export function skipIndexing(message: Message): boolean {
  if (message.author.bot) return true;
  if (!message.guildId) return true;
  const settings = getSetting.get(message.guildId) as
    | { results_channel_id: string | null }
    | undefined;
  const resultsId = settings?.results_channel_id || config.resultsChannelId;
  if (resultsId && message.channelId === resultsId) return true;
  return false;
}

export function indexMessage(message: Message) {
  if (skipIndexing(message)) return;
  const text = indexableText(message);
  if (!text.trim()) return;

  upsertMessage.run({
    id: message.id,
    guild_id: message.guildId!,
    channel_id: message.channelId,
    author_id: message.author.id,
    author_tag: message.author.tag,
    content: text,
    url: message.url,
    created_at: message.createdTimestamp,
    pinned: message.pinned ? 1 : 0,
  });
}

export function unindexMessage(id: string) {
  deleteMessage.run(id);
}

export function guildMode(guildId: string): "quick" | "forward" {
  const row = getSetting.get(guildId) as { default_mode: string } | undefined;
  if (row?.default_mode === "forward") return "forward";
  if (row?.default_mode === "quick") return "quick";
  return config.defaultMode;
}

export function resultsChannelId(guildId: string): string {
  const row = getSetting.get(guildId) as { results_channel_id: string | null } | undefined;
  return row?.results_channel_id || config.resultsChannelId;
}

export function setGuildDefaults(
  guildId: string,
  opts: { resultsChannelId?: string; mode?: "quick" | "forward" },
) {
  upsertSetting.run({
    guild_id: guildId,
    results_channel_id: opts.resultsChannelId ?? null,
    default_mode: opts.mode ?? guildMode(guildId),
  });
}

export function isTextSendable(channel: Channel | null): channel is SendableChannels {
  return Boolean(channel && channel.isSendable());
}
