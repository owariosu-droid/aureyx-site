import type { ReactNode } from "react";

type SocialIconProps = {
  platform: string;
  size?: number;
  className?: string;
};

const paths: Record<string, ReactNode> = {
  youtube: <><path d="M21.6 7.2a2.9 2.9 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.9 2.9 0 0 0-2 2A30 30 0 0 0 2 12a30 30 0 0 0 .4 4.8 2.9 2.9 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.9 2.9 0 0 0 2-2A30 30 0 0 0 22 12a30 30 0 0 0-.4-4.8Z"/><path d="m10 15.5 5-3.5-5-3.5v7Z" fill="currentColor" stroke="none"/></>,
  spotify: <><circle cx="12" cy="12" r="9.5"/><path d="M7.2 9.2c3.6-1 7.9-.7 10.6.8M7.9 12.3c3-.8 6.7-.5 9.2.8M8.5 15.2c2.4-.6 5.4-.4 7.5.7"/></>,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.8" r=".8" fill="currentColor" stroke="none"/></>,
  soundcloud: <><path d="M3 15.5h1m1.2-2.8v4m2-6.2v6m2-8.2v8.2m2-10v10m2-8.5v8.5h5.1a3.2 3.2 0 1 0-.6-6.3A5.4 5.4 0 0 0 13.2 8"/></>,
  bandcamp: <path d="m7 6.5 14 0-4 11H3l4-11Z"/>,
  tiktok: <path d="M14.2 4v10.2a4.2 4.2 0 1 1-3.1-4.1v3a1.4 1.4 0 1 0 .4 1V4h2.7Zm0 0c.3 2.4 1.7 3.8 4.2 4.1V5.3c-1.2-.2-1.9-.6-2.5-1.3"/>,
  linktree: <><path d="m12 3 2.2 4-4.2-2.1m2 6.1L7 7.5m5 3.5 5-3.5m-5 3.5-5 3.5m5-3.5 5 3.5M12 11v10"/></>,
};

export default function SocialIcon({ platform, size = 18, className }: SocialIconProps) {
  const key = platform.toLowerCase().replace(/[^a-z]/g, "");
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[key] ?? <><circle cx="12" cy="12" r="9"/><path d="M8 12h8m-4-4v8"/></>}
    </svg>
  );
}
