export type VisitorTheme = "light" | "dark" | "system";
export const THEME_KEY = "aureyx-color-theme";
export function themePreference(value: unknown): VisitorTheme { return value === "dark" || value === "system" ? value : "light"; }
export function resolvedTheme(preference: VisitorTheme, systemDark: boolean) { return preference === "system" ? systemDark ? "dark" : "light" : preference; }
// Run before paint. No user input is interpolated into this script.
export const themeBootstrap = `(()=>{let p="light";try{const v=localStorage.getItem("${THEME_KEY}");if(v==="dark"||v==="system")p=v}catch{}const t=p==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):p;document.documentElement.dataset.themePreference=p;document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;})()`;
