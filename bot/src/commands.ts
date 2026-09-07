import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Client,
  type TextBasedChannel,
} from "discord.js";
import { db } from "./db.ts";
import { jumpRow, quickReply, resultEmbed } from "./format.ts";
import { searchFaqs, searchMessages } from "./search.ts";
import {
  guildMode,
  indexMessage,
  isTextSendable,
  resultsChannelId,
  setGuildDefaults,
} from "./store.ts";

export const slashCommands = [
  new SlashCommandBuilder()
    .setName("find")
    .setDescription("Search the server for where something was said")
    .addStringOption((o) =>
      o.setName("query").setDescription("What are you looking for?").setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName("mode")
        .setDescription("quick = jump links here, forward = copy into the bot channel")
        .addChoices(
          { name: "quick access", value: "quick" },
          { name: "forward to bot channel", value: "forward" },
        ),
    ),
  new SlashCommandBuilder()
    .setName("remember")
    .setDescription("Save a short FAQ the finder should hit first")
    .addStringOption((o) =>
      o.setName("question").setDescription("How people ask for it").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("answer").setDescription("The answer or notes").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("jump_url").setDescription("Optional Discord message link"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  new SlashCommandBuilder()
    .setName("watch")
    .setDescription("Ping the bot channel when this topic shows up again")
    .addStringOption((o) =>
      o.setName("query").setDescription("Topic to watch").setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Point the finder at a results channel and default mode")
    .addChannelOption((o) =>
      o
        .setName("results_channel")
        .setDescription("Where forwards and watches land")
        .addChannelTypes(ChannelType.GuildText),
    )
    .addStringOption((o) =>
      o
        .setName("default_mode")
        .setDescription("Used when /find has no mode")
        .addChoices(
          { name: "quick access", value: "quick" },
          { name: "forward", value: "forward" },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  new SlashCommandBuilder()
    .setName("backfill")
    .setDescription("Index recent channel history so older messages are searchable")
    .addIntegerOption((o) =>
      o
        .setName("limit")
        .setDescription("Messages per channel (default 200, max 1000)")
        .setMinValue(50)
        .setMaxValue(1000),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
].map((c) => c.toJSON());

export async function handleFind(
  interaction: ChatInputCommandInteraction,
  query: string,
  modeOverride?: "quick" | "forward",
) {
  if (!interaction.guildId) {
    await interaction.reply({ content: "This only works in a server.", ephemeral: true });
    return;
  }

  const mode = modeOverride ?? guildMode(interaction.guildId);
  const faqs = searchFaqs(interaction.guildId, query);
  const hits = searchMessages(interaction.guildId, query, 5);

  if (faqs.length === 0 && hits.length === 0) {
    await interaction.reply({
      content: `Nothing indexed for **${query}**. Try \`/backfill\` once, or ask with different words.`,
      ephemeral: true,
    });
    return;
  }

  const faqBlock =
    faqs.length > 0
      ? faqs
          .map(
            (f) =>
              `**FAQ · ${f.question}**\n${f.answer}${f.jump_url ? `\n${f.jump_url}` : ""}`,
          )
          .join("\n\n")
      : "";

  if (mode === "quick") {
    const body = [faqBlock, hits.length ? quickReply(hits) : ""]
      .filter(Boolean)
      .join("\n\n");
    await interaction.reply({ content: body.slice(0, 1900) });
    return;
  }

  const destId = resultsChannelId(interaction.guildId);
  if (!destId) {
    await interaction.reply({
      content: "Forward mode needs a results channel. Run `/setup` first.",
      ephemeral: true,
    });
    return;
  }

  const dest = await interaction.client.channels.fetch(destId);
  if (!dest || !isTextSendable(dest)) {
    await interaction.reply({
      content: "I can't send to the results channel.",
      ephemeral: true,
    });
    return;
  }

  if (faqBlock) {
    await dest.send({ content: faqBlock.slice(0, 1900) });
  }
  for (const hit of hits.slice(0, 3)) {
    await dest.send({
      embeds: [resultEmbed(hit, interaction.user.id)],
      components: [jumpRow(hit.url)],
    });
  }

  await interaction.reply({
    content: `Sent ${Math.min(hits.length, 3)} hit${hits.length === 1 ? "" : "s"} to <#${destId}>.`,
    ephemeral: true,
  });
}

export async function handleSlash(interaction: ChatInputCommandInteraction) {
  if (!interaction.guildId) return;

  switch (interaction.commandName) {
    case "find": {
      const query = interaction.options.getString("query", true);
      const mode = interaction.options.getString("mode") as "quick" | "forward" | null;
      await handleFind(interaction, query, mode ?? undefined);
      return;
    }
    case "remember": {
      db.prepare(
        `INSERT INTO faqs (guild_id, question, answer, jump_url) VALUES (?, ?, ?, ?)`,
      ).run(
        interaction.guildId,
        interaction.options.getString("question", true),
        interaction.options.getString("answer", true),
        interaction.options.getString("jump_url"),
      );
      await interaction.reply({ content: "Saved. `/find` will surface this first.", ephemeral: true });
      return;
    }
    case "watch": {
      const query = interaction.options.getString("query", true);
      db.prepare(`INSERT INTO watches (guild_id, query, owner_id) VALUES (?, ?, ?)`).run(
        interaction.guildId,
        query,
        interaction.user.id,
      );
      await interaction.reply({
        content: `Watching **${query}**. New matches go to the bot channel.`,
        ephemeral: true,
      });
      return;
    }
    case "setup": {
      const channel = interaction.options.getChannel("results_channel");
      const mode = interaction.options.getString("default_mode") as
        | "quick"
        | "forward"
        | null;
      setGuildDefaults(interaction.guildId, {
        resultsChannelId: channel?.id,
        mode: mode ?? undefined,
      });
      await interaction.reply({
        content: `Updated.${channel ? ` Results → <#${channel.id}>.` : ""}${mode ? ` Default mode → **${mode}**.` : ""}`,
        ephemeral: true,
      });
      return;
    }
    case "backfill": {
      await interaction.deferReply({ ephemeral: true });
      const limit = interaction.options.getInteger("limit") ?? 200;
      const n = await backfillGuild(interaction.client, interaction.guildId, limit);
      await interaction.editReply(`Indexed **${n}** messages across text channels.`);
      return;
    }
  }
}

async function backfillGuild(client: Client, guildId: string, perChannel: number) {
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();
  let count = 0;

  for (const channel of channels.values()) {
    if (!channel || !channel.isTextBased() || channel.isDMBased()) continue;
    count += await backfillChannel(channel, perChannel);
  }
  return count;
}

async function backfillChannel(channel: TextBasedChannel, limit: number) {
  let indexed = 0;
  let lastId: string | undefined;
  let remaining = limit;

  while (remaining > 0) {
    const batch = await channel.messages.fetch({
      limit: Math.min(100, remaining),
      before: lastId,
    });
    if (batch.size === 0) break;
    for (const message of batch.values()) {
      indexMessage(message);
      indexed += 1;
    }
    lastId = batch.last()?.id;
    remaining -= batch.size;
    if (batch.size < 100) break;
  }
  return indexed;
}
