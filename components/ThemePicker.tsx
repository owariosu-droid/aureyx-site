"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { THEME_KEY, themePreference, resolvedTheme, type VisitorTheme } from "@/lib/visitor-theme";

function apply(preference: VisitorTheme) {
  const theme = resolvedTheme(preference, window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f7f7f5" : "#0d0d0f");
}
function snapshot() { return themePreference(document.documentElement.dataset.themePreference); }
function subscribe(notify: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => { apply(snapshot()); notify(); };
  const storage = (event: StorageEvent) => { if (event.key === THEME_KEY || event.key === null) { apply(themePreference(event.newValue)); notify(); } };
  update();
  window.addEventListener("aureyx-theme-change", update); window.addEventListener("storage", storage); media.addEventListener("change", update);
  return () => { window.removeEventListener("aureyx-theme-change", update); window.removeEventListener("storage", storage); media.removeEventListener("change", update); };
}
export default function ThemePicker() {
  const preference = useSyncExternalStore(subscribe, snapshot, () => "light" as VisitorTheme);
  function change(value: string) {
    const next = themePreference(value); apply(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* The selected theme still works when storage is unavailable. */ }
    window.dispatchEvent(new Event("aureyx-theme-change"));
  }
  const Icon = preference === "dark" ? Moon : preference === "system" ? Monitor : Sun;
  return <label className="theme-picker"><Icon size={16} aria-hidden="true" /><span className="sr-only">Color theme</span><select aria-label="Color theme" value={preference} onChange={event => change(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label>;
}
