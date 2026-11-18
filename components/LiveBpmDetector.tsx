"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { openMicrophone, microphoneError, MicrophoneError, type MicrophoneSession } from "@/lib/microphone";
import type { TempoEstimate } from "@/lib/bpm";
import MicrophoneInput from "@/components/MicrophoneInput";

export default function LiveBpmDetector() {
  const [status, setStatus] = useState<"idle" | "requesting" | "listening">("idle");
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [result, setResult] = useState<TempoEstimate | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const generation = useRef(0);
  const resources = useRef<{ controller?: AbortController; session?: MicrophoneSession; node?: AudioWorkletNode; worker?: Worker }>({});
  const release = useCallback(() => {
    generation.current++;
    const current = resources.current; resources.current = {};
    current.node?.disconnect(); current.node?.port.close();
    current.worker?.terminate(); current.controller?.abort(); current.session?.close();
  }, []);
  const stop = useCallback(() => { release(); setStatus("idle"); setResult(null); setLevel(0); setSeconds(0); }, [release]);
  useEffect(() => {
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hide); window.addEventListener("pagehide", stop);
    return () => { document.removeEventListener("visibilitychange", hide); window.removeEventListener("pagehide", stop); release(); };
  }, [release, stop]);

  async function start() {
    release(); setError(""); setResult(null); setSeconds(0); setLevel(0); setMultiplier(1); setStatus("requesting");
    const version = generation.current;
    const controller = new AbortController(); resources.current.controller = controller;
    try {
      const session = await openMicrophone(controller.signal, deviceId);
      if (version !== generation.current) { session.close(); return; }
      resources.current.session = session;
      if (!session.context.audioWorklet || typeof AudioWorkletNode === "undefined") throw new MicrophoneError("Live BPM is not supported in this browser. Use audio-file analysis instead, or try a current version of Safari or Chrome.");
      await session.context.audioWorklet.addModule("/worklets/rhythm-input.js");
      if (version !== generation.current) return;
      const node = new AudioWorkletNode(session.context, "rhythm-input", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1] });
      resources.current.node = node;
      const worker = new Worker(new URL("../workers/bpm.worker.ts", import.meta.url)); resources.current.worker = worker;
      let elapsed = 0, lastRequest = 0, quiet = 0, busy = false;
      const history: number[] = [];
      worker.onmessage = (event: MessageEvent<{ result?: TempoEstimate | null; error?: string }>) => {
        busy = false;
        if (version !== generation.current) return;
        if (event.data.error) { stop(); setError(event.data.error); return; }
        setResult(quiet >= 2 ? null : event.data.result ?? null);
      };
      worker.onerror = () => { if (version === generation.current) { stop(); setError("Live tempo analysis stopped. Press Start microphone to try again."); } };
      node.onprocessorerror = () => { if (version === generation.current) { stop(); setError("The microphone processor stopped. Press Start microphone to try again."); } };
      node.port.onmessage = (event: MessageEvent<{ envelope: Float32Array; level: number }>) => {
        if (version !== generation.current) return;
        const packet = event.data, duration = packet.envelope.length / 100;
        elapsed += duration; quiet = packet.level < .006 ? quiet + duration : 0;
        setSeconds(Math.floor(elapsed + .01)); setLevel(Math.min(100, Math.round(packet.level * 500)));
        history.push(...packet.envelope); if (history.length > 2000) history.splice(0, history.length - 2000);
        if (quiet >= 2) setResult(null);
        if (history.length >= 800 && elapsed - lastRequest >= .99 && !busy) {
          busy = true; lastRequest = elapsed;
          const envelope = Float32Array.from(history); worker.postMessage(envelope, [envelope.buffer]);
        }
      };
      session.stream.getAudioTracks().forEach(track => { track.onended = () => { stop(); setError("The microphone disconnected. Choose an input and press Start again."); }; });
      session.context.onstatechange = () => {
        if (session.context.state === "suspended" || (session.context.state as string) === "interrupted") { stop(); setError("Live audio was interrupted. Press Start microphone to resume."); }
      };
      session.source.connect(node); node.connect(session.context.destination);
      setStatus("listening");
    } catch (cause) {
      if (version !== generation.current) return;
      release(); setStatus("idle"); setError(microphoneError(cause));
    }
  }
  return <div className="live-bpm-tool">
    <MicrophoneInput value={deviceId} onChange={setDeviceId} active={status !== "idle"} />
    <div className="audio-input-level"><label htmlFor="bpm-input-level">Input level</label><meter id="bpm-input-level" min={0} max={100} value={level} /></div>
    <p className="bpm-status" role="status">{status === "requesting" ? "Waiting for microphone permission…" : status === "listening" ? seconds < 8 ? "Listening · collecting at least 8 seconds of rhythm" : result ? "Live tempo estimate · updates every second" : "Listening · no steady rhythm detected yet" : "Microphone off"}</p>
    <div className="bpm-result"><strong>{result ? Math.round(result.bpm * multiplier * 10) / 10 : "—"}</strong><span>BPM</span></div>
    {status === "listening" && <p className="live-bpm-time">{seconds < 8 ? seconds + " / 8 seconds collected" : seconds + " seconds listening · recent 20 seconds analyzed"}</p>}
    {status === "listening" && seconds < 8 && <progress className="live-bpm-progress" aria-label="Collecting rhythm" max={8} value={seconds} />}
    <button type="button" className="live-bpm-start" onClick={status === "idle" ? start : stop}>{status === "idle" ? "Start microphone" : status === "requesting" ? "Cancel" : "Stop microphone"}</button>
    {result && <><p>{result.strength >= .65 ? "Clear rhythmic match" : "Tentative match — keep a steady beat"}</p><div className="bpm-options" aria-label="Live tempo interpretation">{[.5,1,2].map(value => <button type="button" key={value} aria-pressed={multiplier === value} onClick={() => setMultiplier(value)}>{value === 1 ? "Detected tempo" : value === .5 ? "Half time" : "Double time"}</button>)}</div></>}
    {error && <p className="bpm-error" role="alert">{error}</p>}
    <p className="bpm-hint">Play a steady rhythm near your microphone, or clap/tap evenly. A single held vocal note has pitch, but no repeating beat to measure.</p>
    <p className="bpm-privacy">Live audio stays on your device. Nothing is recorded or uploaded. Listening stops when you leave this page or hide the tab.</p>
  </div>;
}
