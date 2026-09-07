import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  type Message,
} from "discord.js";
import { handleSlash, slashCommands } from "./commands.ts";
import { config } from "./config.ts";
import { db } from "./db.ts";
import { jumpRow, quickReply, resultEmbed } from "./format.ts";
import { searchFaqs, searchMessages } from "./search.ts";
import {
  indexMessage,
  isTextSendable,
  resultsChannelId,
  skipIndexing,
  unindexMessage,
} from "./store.ts";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.once(Events.ClientReady, (ready) => {
  console.log(`Finder online as ${ready.user.tag}`);
  console.log(`Commands: ${slashCommands.map((c) => "/" + (c as { name: string }).name).join(", ")}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  try {
    await handleSlash(interaction);
  } catch (err) {
    console.error(err);
    const payload = { content: "Something broke while searching.", ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  indexMessage(message);
  await maybeWatch(message);
  await maybeMentionFind(message);
});

client.on(Events.MessageUpdate, (_old, message) => {
  if (message.partial) return;
  indexMessage(message);
});

client.on(Events.MessageDelete, (message) => {
  unindexMessage(message.id);
});

function askedToForward(text: string) {
  return /\b(forward|drop it|bot channel|send it there)\b/i.test(text);
}

async function maybeMentionFind(message: Message) {
  if (!client.user || !message.guildId) return;
  if (!message.mentions.has(client.user)) return;
  if (message.author.bot) return;

  const query = message.content.replace(new RegExp(`<@!?${client.user.id}>`, "g"), "").trim();
  if (query.length < 2) {
    await message.reply("Ask me like: `where is the merch link`");
    return;
  }

  const faqs = searchFaqs(message.guildId, query);
  const hits = searchMessages(message.guildId, query, 5);

  if (faqs.length === 0 && hits.length === 0) {
    await message.reply("I don't have that indexed yet. Someone with perms can `/backfill`.");
    return;
  }

  if (!askedToForward(query)) {
    const faqBlock = faqs
      .map((f) => `**FAQ · ${f.question}**\n${f.answer}${f.jump_url ? `\n${f.jump_url}` : ""}`)
      .join("\n\n");
    await message.reply(
      [faqBlock, hits.length ? quickReply(hits) : ""].filter(Boolean).join("\n\n").slice(0, 1900),
    );
    return;
  }

  const destId = resultsChannelId(message.guildId);
  const dest = destId ? await client.channels.fetch(destId) : null;
  if (!dest || !isTextSendable(dest)) {
    await message.reply("Forward mode needs `/setup` with a results channel.");
    return;
  }
  for (const hit of hits.slice(0, 3)) {
    await dest.send({
      embeds: [resultEmbed(hit, message.author.id)],
      components: [jumpRow(hit.url)],
    });
  }
  await message.reply(`Parked that in <#${destId}>.`);
}

async function maybeWatch(message: Message) {
  if (skipIndexing(message) || !message.guildId) return;
  const watches = db
    .prepare(`SELECT query, owner_id FROM watches WHERE guild_id = ?`)
    .all(message.guildId) as { query: string; owner_id: string }[];
  if (watches.length === 0) return;

  const hay = message.content.toLowerCase();
  const hits = watches.filter((w) => hay.includes(w.query.toLowerCase()));
  if (hits.length === 0) return;

  const destId = resultsChannelId(message.guildId);
  if (!destId || destId === message.channelId) return;
  const dest = await client.channels.fetch(destId);
  if (!dest || !isTextSendable(dest)) return;

  await dest.send({
    content: hits.map((w) => `Watch **${w.query}** (<@${w.owner_id}>)`).join("\n"),
    embeds: [
      resultEmbed(
        {
          id: message.id,
          guild_id: message.guildId,
          channel_id: message.channelId,
          author_id: message.author.id,
          author_tag: message.author.tag,
          content: message.content,
          url: message.url,
          created_at: message.createdTimestamp,
          pinned: message.pinned ? 1 : 0,
        },
        hits[0].owner_id,
      ),
    ],
    components: [jumpRow(message.url)],
  });
}

await client.login(config.token);
