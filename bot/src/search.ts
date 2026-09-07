import { db, type IndexedMessage } from "./db.ts";

const searchStmt = db.prepare(`
  SELECT m.*, bm25(messages_fts) AS rank
  FROM messages_fts
  JOIN messages m ON m.rowid = messages_fts.rowid
  WHERE messages_fts MATCH ?
    AND m.guild_id = ?
  ORDER BY m.pinned DESC, rank, m.created_at DESC
  LIMIT ?
`);

const likeStmt = db.prepare(`
  SELECT *
  FROM messages
  WHERE guild_id = ?
    AND (content LIKE ? OR author_tag LIKE ?)
  ORDER BY pinned DESC, created_at DESC
  LIMIT ?
`);

const faqStmt = db.prepare(`
  SELECT * FROM faqs
  WHERE guild_id = ?
    AND (question LIKE ? OR answer LIKE ?)
  LIMIT 5
`);

export function toFtsQuery(raw: string): string {
  const tokens = raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));

  if (tokens.length === 0) return raw.trim().replace(/"/g, "");
  return tokens.map((t) => `"${t}"*`).join(" OR ");
}

const STOP = new Set([
  "the",
  "where",
  "is",
  "this",
  "that",
  "info",
  "information",
  "whats",
  "what",
  "was",
  "are",
  "for",
  "and",
  "you",
  "can",
  "how",
  "does",
  "about",
  "please",
  "find",
  "me",
  "a",
  "an",
  "to",
  "of",
  "in",
  "on",
]);

export function searchMessages(guildId: string, query: string, limit = 5): IndexedMessage[] {
  const fts = toFtsQuery(query);
  try {
    const rows = searchStmt.all(fts, guildId, limit) as IndexedMessage[];
    if (rows.length > 0) return rows;
  } catch {
    // malformed FTS query — fall through
  }

  const like = `%${query.replace(/\s+/g, "%")}%`;
  return likeStmt.all(guildId, like, like, limit) as IndexedMessage[];
}

export function searchFaqs(guildId: string, query: string) {
  const like = `%${query}%`;
  return faqStmt.all(guildId, like, like) as {
    id: number;
    question: string;
    answer: string;
    jump_url: string | null;
  }[];
}
