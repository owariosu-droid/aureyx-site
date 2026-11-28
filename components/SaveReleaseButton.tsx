"use client";
import { useSyncExternalStore } from "react";
import { Bookmark } from "lucide-react";
import { listeningSnapshot, parseListeningList, subscribeListeningList, toggleSavedRelease } from "@/lib/listening-list";
export function useListeningList() {
  return parseListeningList(useSyncExternalStore(subscribeListeningList, listeningSnapshot, () => "[]"));
}
export default function SaveReleaseButton({ slug, title }: { slug: string; title: string }) {
  const saved = useListeningList().includes(slug);
  return <button className="release-save" type="button" aria-pressed={saved} aria-label={`${saved ? "Remove" : "Save"} ${title} ${saved ? "from" : "to"} listening list`} onClick={() => toggleSavedRelease(slug)}><Bookmark size={14} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button>;
}
