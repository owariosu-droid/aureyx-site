"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { detectPitch, pitchToNote } from "@/lib/pitch";
import { openMicrophone, microphoneError, type MicrophoneSession } from "@/lib/microphone";
import MicrophoneInput from "@/components/MicrophoneInput";
type Reading = ReturnType<typeof pitchToNote>;

export default function VoicePitchDetector() {
  const [status, setStatus] = useState<"idle" | "requesting" | "listening">("idle");
  const [reading, setReading] = useState<Reading | null>(null);
  const [last, setLast] = useState<Reading | null>(null);
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [level, setLevel] = useState(0);
  const resources = useRef<{ controller?: AbortController; session?: MicrophoneSession; frame?: number }>({});
  const generation = useRef(0);
  const release = useCallback(() => {
    generation.current++;
    const current = resources.current;
    resources.current = {};
    if (current.frame) cancelAnimationFrame(current.frame);
    current.controller?.abort();
    current.session?.close();
  }, []);
  const stop = useCallback(() => {
    release(); setStatus("idle"); setReading(null); setLevel(0);
  }, [release]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", stop);
    return () => { document.removeEventListener("visibilitychange", hide); window.removeEventListener("pagehide", stop); release(); };
  }, [release, stop]);

  async function start() {
    release(); setError(""); setReading(null); setStatus("requesting");
    const version = generation.current;
    const controller = new AbortController();
    resources.current.controller = controller;
    try {
      const session = await openMicrophone(controller.signal, deviceId);
      if (generation.current !== version) { session.close(); return; }
      resources.current.session = session;
      const { context, stream } = session;
      stream.getAudioTracks().forEach(track => { track.onended = () => { stop(); setError("The microphone disconnected. Choose an input and press Start again."); }; });
      context.onstatechange = () => {
        if (context.state === "suspended" || (context.state as string) === "interrupted") { stop(); setError("Live audio was interrupted. Press Start microphone to resume."); }
      };
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      session.source.connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let previousTime = 0, candidate = -1, count = 0;
      const recent: number[] = [];
      setStatus("listening");
      const tick = (time: number) => {
        if (generation.current !== version) return;
        if (time - previousTime >= 75) {
          previousTime = time;
          analyser.getFloatTimeDomainData(samples);
          const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
          setLevel(Math.min(100, Math.round(rms * 500)));
          const frequency = detectPitch(samples, context.sampleRate);
          if (frequency) {
            const next = pitchToNote(frequency);
            if (candidate !== next.midi) { recent.length = 0; count = 0; }
            count++; candidate = next.midi;
            recent.push(frequency); if (recent.length > 3) recent.shift();
            if (count >= 2) {
              const sorted = [...recent].sort((a,b) => a-b);
              const stable = pitchToNote(sorted[Math.floor(sorted.length / 2)]);
              setReading(stable); setLast(stable);
            }
          } else { count = 0; candidate = -1; recent.length = 0; setReading(null); }
        }
        resources.current.frame = requestAnimationFrame(tick);
      };
      resources.current.frame = requestAnimationFrame(tick);
    } catch (cause) {
      if (generation.current !== version) return;
      release(); setStatus("idle");
      setLevel(0); setError(microphoneError(cause));
    }
  }
  const cents = reading?.cents ?? 0;
  return <section className="pitch-tool" aria-label="Live voice pitch detector">
    <MicrophoneInput value={deviceId} onChange={setDeviceId} active={status !== "idle"} />
    <div className="audio-input-level"><label htmlFor="pitch-input-level">Input level</label><meter id="pitch-input-level" min={0} max={100} value={level} /></div>
    <div className="pitch-status" role="status">{status === "requesting" ? "Waiting for microphone permission…" : status === "listening" ? "Microphone on · sing or hum one steady note" : "Microphone off"}</div>
    <div className="pitch-note" aria-label={reading ? reading.name + reading.octave : "No note detected"}>{reading ? <>{reading.name}<sub>{reading.octave}</sub></> : "—"}</div>
    <p className="pitch-frequency">{reading ? reading.frequency.toFixed(1) + " Hz · MIDI " + reading.midi : "Your note will appear here"}</p>
    <div className="pitch-meter" role="meter" aria-label="Tuning in cents" aria-valuemin={-50} aria-valuemax={50} aria-valuenow={cents} aria-valuetext={reading ? Math.abs(cents) + " cents " + (Math.abs(cents) <= 5 ? "in tune" : cents < 0 ? "flat" : "sharp") : "No pitch detected"}><span className="pitch-center" /><span className={"pitch-needle" + (reading ? " is-active" : "")} style={{ left: (50 + cents) + "%" }} /></div>
    <div className="pitch-scale"><span>♭ Flat</span><span>In tune</span><span>Sharp ♯</span></div>
    <p className="pitch-feedback">{reading ? Math.abs(cents) <= 5 ? "In tune" : Math.abs(cents) + " cents " + (cents < 0 ? "flat — raise your pitch" : "sharp — lower your pitch") : status === "listening" ? "Try a clear, sustained vowel or hum." : "Start the microphone to find your voice’s note."}</p>
    <button className="pitch-start" type="button" onClick={status === "idle" ? start : stop}>{status === "idle" ? <Mic aria-hidden="true" /> : <Square aria-hidden="true" />}{status === "idle" ? "Start microphone" : status === "requesting" ? "Cancel" : "Stop microphone"}</button>
    {error && <p className="pitch-error" role="alert">{error}</p>}
    <p className="pitch-last">{last ? "Last detected: " + last.name + last.octave + " · MIDI " + last.midi : "Standard tuning: A4 = 440 Hz"}</p>
    <p className="pitch-privacy">Audio stays on your device. Nothing is recorded or uploaded.</p>
  </section>;
}
