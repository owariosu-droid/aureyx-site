import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var ${name}`);
  return value;
}

export const config = {
  token: required("DISCORD_TOKEN"),
  clientId: required("CLIENT_ID"),
  guildId: required("GUILD_ID"),
  resultsChannelId: process.env.RESULTS_CHANNEL_ID ?? "",
  defaultMode: (process.env.DEFAULT_MODE === "forward" ? "forward" : "quick") as
    | "quick"
    | "forward",
};
