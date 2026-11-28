export const LIST_KEY = "aureyx-listening-list";
const EVENT = "aureyx-listening-list-change";
let memory = "[]";
export function parseListeningList(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === "string" && /^[a-zA-Z0-9-]{1,240}$/.test(item)))].slice(0, 200) : [];
  } catch { return []; }
}
export function listeningSnapshot() {
  try { return localStorage.getItem(LIST_KEY) || "[]"; } catch { return memory; }
}
export function subscribeListeningList(notify: () => void) {
  const changed = (event: StorageEvent) => { if (event.key === LIST_KEY || event.key === null) { memory = event.newValue || "[]"; notify(); } };
  window.addEventListener(EVENT, notify);
  window.addEventListener("storage", changed);
  return () => { window.removeEventListener(EVENT, notify); window.removeEventListener("storage", changed); };
}
export function toggleSavedRelease(slug: string) {
  const saved = parseListeningList(listeningSnapshot());
  const next = saved.includes(slug) ? saved.filter(value => value !== slug) : [slug, ...saved];
  memory = JSON.stringify(parseListeningList(JSON.stringify(next)));
  try { localStorage.setItem(LIST_KEY, memory); } catch { /* Still usable for this visit. */ }
  window.dispatchEvent(new Event(EVENT));
}
