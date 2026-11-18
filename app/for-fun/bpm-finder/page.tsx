import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioBpmFinder from "@/components/AudioBpmFinder";
import "@/app/home.css";
import "../tools.css";
import "./bpm.css";

export const metadata: Metadata = { title: "Audio BPM Finder | Aureyx", description: "Find the estimated tempo of a song or loop privately in your browser." };
export default function BpmPage() {
  return <div className="tool-world tempo-lab"><Navbar /><main className="bpm-page"><header><a href="/for-fun">← For Fun / Music tools</a><p className="transmission-eyebrow">Audio tools</p><h1>Find the beat.</h1><p>Choose an audio file or listen through your microphone to estimate tempo and line it up in your music software.</p></header><AudioBpmFinder /><section className="bpm-help"><h2>From audio to your beat grid</h2><p>Live microphone mode needs at least eight seconds of a steady rhythm and updates continuously. For files, WAV files can be up to 200 MB; other formats can be up to 100 MB. Use at least 8 seconds with a steady beat. The finder analyzes up to 90 seconds and estimates tempos between 50 and 220 BPM. For longer files, analysis starts 10 seconds in to skip the opening.</p><p>Half-time and double-time interpretations are common. Ambient tracks, changing tempos, and complex rhythms may not produce a reliable estimate. Check the result by ear against your project’s metronome.</p><a href="/for-fun/pitch-detector">Need the note instead? Open the Voice Pitch Detector ↗</a></section></main><Footer /></div>;
}
