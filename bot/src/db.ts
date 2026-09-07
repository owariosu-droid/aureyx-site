import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "data"), { recursive: true });

export const db = new Database(join(root, "data", "finder.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_tag TEXT NOT NULL,
    content TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    pinned INTEGER NOT NULL DEFAULT 0
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
    content,
    author_tag,
    content='messages',
    content_rowid='rowid'
  );

  CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    jump_url TEXT
  );

  CREATE TABLE IF NOT EXISTS watches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    query TEXT NOT NULL,
    owner_id TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    guild_id TEXT PRIMARY KEY,
    results_channel_id TEXT,
    default_mode TEXT NOT NULL DEFAULT 'quick'
  );

  CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, content, author_tag)
    VALUES (new.rowid, new.content, new.author_tag);
  END;

  CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, content, author_tag)
    VALUES ('delete', old.rowid, old.content, old.author_tag);
  END;

  CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON messages BEGIN
    INSERT INTO messages_fts(messages_fts, rowid, content, author_tag)
    VALUES ('delete', old.rowid, old.content, old.author_tag);
    INSERT INTO messages_fts(rowid, content, author_tag)
    VALUES (new.rowid, new.content, new.author_tag);
  END;
`);

export type IndexedMessage = {
  id: string;
  guild_id: string;
  channel_id: string;
  author_id: string;
  author_tag: string;
  content: string;
  url: string;
  created_at: number;
  pinned: number;
};

export const upsertMessage = db.prepare(`
  INSERT INTO messages (id, guild_id, channel_id, author_id, author_tag, content, url, created_at, pinned)
  VALUES (@id, @guild_id, @channel_id, @author_id, @author_tag, @content, @url, @created_at, @pinned)
  ON CONFLICT(id) DO UPDATE SET
    content = excluded.content,
    author_tag = excluded.author_tag,
    pinned = excluded.pinned
`);

export const deleteMessage = db.prepare(`DELETE FROM messages WHERE id = ?`);

export const getSetting = db.prepare(
  `SELECT results_channel_id, default_mode FROM settings WHERE guild_id = ?`,
);

export const upsertSetting = db.prepare(`
  INSERT INTO settings (guild_id, results_channel_id, default_mode)
  VALUES (@guild_id, @results_channel_id, @default_mode)
  ON CONFLICT(guild_id) DO UPDATE SET
    results_channel_id = COALESCE(excluded.results_channel_id, settings.results_channel_id),
    default_mode = excluded.default_mode
`);
