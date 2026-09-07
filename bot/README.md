# Finder bot

Indexes server messages, then either jumps you to the original or copies it into a bot channel.

## Discord setup

1. [Create an application](https://discord.com/developers/applications) → Bot.
2. Enable **Message Content Intent**.
3. Invite URL (replace `CLIENT_ID`):
   `https://discord.com/oauth2/authorize?client_id=CLIENT_ID&permissions=68608&scope=bot%20applications.commands`
   (View Channel, Send Messages, Embed Links, Read Message History.)
4. Copy `bot/.env.example` to `bot/.env` and fill token, client id, guild id.

```bash
cd bot
npm install
npm run register
npm start
```

In Discord: `/setup` a results channel, then `/backfill` once so older chat is searchable.

## Commands

- `/find query:` — **quick** replies with jump links; **forward** posts embeds in the bot channel
- `@bot where is the merch link` — same as quick; add “forward it” to use the bot channel
- `/remember` — curated FAQ that ranks above raw chat
- `/watch` — new matches get dropped in the results channel
- `/backfill` — crawl recent history
