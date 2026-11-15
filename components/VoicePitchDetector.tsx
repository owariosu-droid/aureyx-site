"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { detectPitch, pitchToNote } from "@/lib/pitch";
type Reading = ReturnType<typeof pitchToNote>;

export default function VoicePitchDetector() {
  const [status, setStatus] = useState<"idle" | "requesting" | "listening">("idle");
  const [reading, setReading] = useState<Reading | null>(null);
  const [last, setLast] = useState<Reading | null>(null);
  const [error, setError] = useState("");
  const resources = useRef<{ stream?: MediaStream; context?: AudioContext; frame?: number }>({});
  const generation = useRef(0);
  const release = useCallback(() => {
    generation.current++;
    const current = resources.current;
    resources.current = {};
    if (current.frame) cancelAnimationFrame(current.frame);
    current.stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    if (current.context && current.context.state !== "closed") void current.context.close().catch(() => {});
  }, []);
  const stop = useCallback(() => {
    release(); setStatus("idle"); setReading(null);
  }, [release]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hide);
    return () => { document.removeEventListener("visibilitychange", hide); release(); };
  }, [release, stop]);

  async function start() {
    release(); setError(""); setReading(null); setStatus("requesting");
    const version = generation.current;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access needs HTTPS and a supported browser. Try opening this page directly in Safari or Chrome."); setStatus("idle"); return;
    }
    try {
      const context = new AudioContext();
      resources.current.context = context;
      await context.resume();
      if (generation.current !== version) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      if (generation.current !== version) { stream.getTracks().forEach(track => track.stop()); return; }
      resources.current.stream = stream;
      stream.getAudioTracks().forEach(track => { track.onended = stop; });
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      context.createMediaStreamSource(stream).connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let previousTime = 0, candidate = -1, count = 0;
      setStatus("listening");
      const tick = (time: number) => {
        if (generation.current !== version) return;
        if (time - previousTime >= 60) {
          previousTime = time;
          analyser.getFloatTimeDomainData(samples);
          const frequency = detectPitch(samples, context.sampleRate);
          if (frequency) {
            const next = pitchToNote(frequency);
            count = candidate === next.midi ? count + 1 : 1;
            candidate = next.midi;
            if (count >= 2) { setReading(next); setLast(next); }
          } else { count = 0; candidate = -1; setReading(null); }
        }
        resources.current.frame = requestAnimationFrame(tick);
      };
      resources.current.frame = requestAnimationFrame(tick);
    } catch (cause) {
      if (generation.current !== version) return;
      release(); setStatus("idle");
      const name = cause instanceof DOMException ? cause.name : "";
      setError(name === "NotAllowedError" ? "Microphone permission was denied. Allow microphone access in your browser’s site settings, then try again." : name === "NotFoundError" ? "No microphone found. Connect a microphone and try again." : "Could not start the microphone. Check that it is connected and available, then try again.");
    }
  }
  const cents = reading?.cents ?? 0;
  return <section className="pitch-tool" aria-label="Live voice pitch detector">
    <div className="pitch-status" role="status">{status === "requesting" ? "Waiting for microphone permission…" : status === "listening" ? "Microphone on · sing or hum one steady note" : "Microphone off"}</div>
    <div className="pitch-note" aria-label={reading ? reading.name + reading.octave : "No note detected"}>{reading ? <>{reading.name}<sub>{reading.octave}</sub></> : "—"}</div>
    <p className="pitch-frequency">{reading ? reading.frequency.toFixed(1) + " Hz · MIDI " + reading.midi : "Your note will appear here"}</p>
    <div className="pitch-meter" role="meter" aria-label="Tuning in cents" aria-valuemin={-50} aria-valuemax={50} aria-valuenow={cents} aria-valuetext={reading ? Math.abs(cents) + " cents " + (cents < 0 ? "flat" : "sharp") : "No pitch detected"}><span className="pitch-center" /><span className={"pitch-needle" + (reading ? " is-active" : "")} style={{ left: (50 + cents) + "%" }} /></div>
    <div className="pitch-scale"><span>♭ Flat</span><span>In tune</span><span>Sharp ♯</span></div>
    <p className="pitch-feedback">{reading ? Math.abs(cents) <= 5 ? "In tune" : Math.abs(cents) + " cents " + (cents < 0 ? "flat — raise your pitch" : "sharp — lower your pitch") : status === "listening" ? "Try a clear, sustained vowel or hum." : "Start the microphone to find your voice’s note."}</p>
    <button className="pitch-start" type="button" onClick={status === "idle" ? start : stop}>{status === "idle" ? <Mic aria-hidden="true" /> : <Square aria-hidden="true" />}{status === "idle" ? "Start microphone" : status === "requesting" ? "Cancel" : "Stop microphone"}</button>
    {error && <p className="pitch-error" role="alert">{error}</p>}
    <p className="pitch-last">{last ? "Last detected: " + last.name + last.octave + " · MIDI " + last.midi : "Standard tuning: A4 = 440 Hz"}</p>
    <p className="pitch-privacy">Audio stays on your device. Nothing is recorded or uploaded.</p>
  </section>;
}
