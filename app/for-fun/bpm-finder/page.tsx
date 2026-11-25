import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioBpmFinder from "@/components/AudioBpmFinder";
import "@/app/home.css";
import "../tools.css";
import "./bpm.css";

export const metadata: Metadata = { title: "Audio BPM Finder | Aureyx", description: "Find the estimated tempo of a song or loop privately in your browser." };
export default function BpmPage() {
  return <div className="tool-world tempo-lab"><Navbar /><main className="bpm-page"><header><a href="/for-fun">← For Fun / Music tools</a><p className="transmission-eyebrow">Audio tools</p><h1>Find the beat.</h1><p>Choose an audio file or use your microphone to find its BPM, then try that tempo in your music software.</p></header><AudioBpmFinder /><section className="bpm-help"><h2>Getting a useful BPM estimate</h2><p>Microphone mode updates as you play or tap a steady rhythm for at least 8 seconds. WAV files can be up to 200 MB; other formats can be up to 100 MB. Use a clip with at least 8 seconds of a steady beat. The finder checks up to 90 seconds and estimates tempos between 50 and 220 BPM. For longer files, it starts 10 seconds in to skip the opening.</p><p>Half-time and double-time interpretations are common. Ambient tracks, changing tempos, and complex rhythms may not produce a reliable estimate. Check the result by ear against your project’s metronome.</p><a href="/for-fun/pitch-detector">Looking for a note? Try the Voice Pitch Detector ↗</a></section></main><Footer /></div>;
}
