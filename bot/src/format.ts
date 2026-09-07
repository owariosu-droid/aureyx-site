import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Message,
} from "discord.js";
import type { IndexedMessage } from "./db.ts";

export function indexableText(message: Message): string {
  const bits = [message.content];
  for (const embed of message.embeds) {
    if (embed.title) bits.push(embed.title);
    if (embed.description) bits.push(embed.description);
    if (embed.url) bits.push(embed.url);
  }
  for (const file of message.attachments.values()) {
    bits.push(file.name, file.url);
  }
  return bits.filter(Boolean).join("\n").slice(0, 1800);
}

export function resultEmbed(hit: IndexedMessage, askedBy: string) {
  const snippet =
    hit.content.length > 400 ? `${hit.content.slice(0, 397)}…` : hit.content || "*no text*";

  return new EmbedBuilder()
    .setColor(0x7c5cff)
    .setAuthor({ name: hit.author_tag })
    .setDescription(snippet)
    .addFields(
      { name: "When", value: `<t:${Math.floor(hit.created_at / 1000)}:R>`, inline: true },
      { name: "Asked by", value: `<@${askedBy}>`, inline: true },
    )
    .setFooter({ text: hit.pinned ? "Pinned · original message" : "Original message" });
}

export function jumpRow(url: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel("Jump to message").setStyle(ButtonStyle.Link).setURL(url),
  );
}

export function quickReply(hits: IndexedMessage[]) {
  const lines = hits.map((hit, i) => {
    const preview = hit.content.replace(/\n/g, " ").slice(0, 80) || "attachment / embed";
    return `**${i + 1}.** ${preview}${preview.length >= 80 ? "…" : ""}\n${hit.url} — ${hit.author_tag} · <t:${Math.floor(hit.created_at / 1000)}:R>`;
  });
  return lines.join("\n\n");
}
