import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VoicePitchDetector from "@/components/VoicePitchDetector";
import "@/app/home.css";
import "../tools.css";
import "./pitch.css";

export const metadata: Metadata = { title: "Voice Pitch Detector | Aureyx", description: "Sing or hum to find your musical note, octave, frequency, and MIDI note with Aureyx’s live voice pitch detector." };
export default function PitchPage() {
  return <div className="tool-world pitch-lab"><Navbar /><main className="pitch-page"><header><a href="/for-fun">← For Fun</a><p className="transmission-eyebrow">Aureyx music tools</p><h1>Find your voice’s note.</h1><p>Sing or hum a single pitch. See its note and octave, then match it in your piano roll.</p></header><VoicePitchDetector /><section className="pitch-help" aria-label="Tips"><h2>Getting a clear reading</h2><p>Use a quiet room and hold one note close to your microphone. The large letter is the nearest note; the meter shows how far your voice is above or below it. MIDI numbers help you match notes across music apps with different octave labels.</p><p>Works with one voice at a time, roughly C2–F6. Chords, background music, breathy sounds, and vocal fry can give unstable readings or octave jumps. Use headphones if music is playing.</p></section></main><Footer /></div>;
}
