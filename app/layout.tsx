import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, Pirata_One } from "next/font/google";
import "./globals.css";
import ImageProtection from "@/components/ImageProtection";
import SiteAtmosphere from "@/components/SiteAtmosphere";
import AudioPlayerProvider from "@/components/AudioPlayerProvider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: "variable",
});

const pirataOne = Pirata_One({
  variable: "--font-pirata-one",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aureyx.xyz"),
  title: "AUREYX",
  description: "Music label that features a bunch of small aspiring artists and producers",
  openGraph: { title:"AUREYX", description:"Independent electronic music and artist projects.", images:["/aureyx-youtube-banner.jpg"], type:"website" },
  twitter: { card:"summary_large_image", title:"AUREYX", description:"Independent electronic music and artist projects.", images:["/aureyx-youtube-banner.jpg"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#101011",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${pirataOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><AudioPlayerProvider><a className="skip-link" href="#main-content">Skip to content</a><ImageProtection /><SiteAtmosphere /><div id="main-content">{children}</div></AudioPlayerProvider><Analytics /></body>
    </html>
  );
}
