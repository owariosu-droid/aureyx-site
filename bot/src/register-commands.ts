import { REST, Routes } from "discord.js";
import { slashCommands } from "./commands.ts";
import { config } from "./config.ts";

const rest = new REST({ version: "10" }).setToken(config.token);

await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
  body: slashCommands,
});

console.log("Slash commands registered for this server.");
