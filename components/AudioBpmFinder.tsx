"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { onsetEnvelope, type TempoEstimate } from "@/lib/bpm";

const MAX_FILE_MB = 100;

export default function AudioBpmFinder() {
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<TempoEstimate | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const generation = useRef(0);
  const resource = useRef<{ context?: AudioContext; worker?: Worker }>({});
  const release = useCallback(() => {
    generation.current++;
    resource.current.worker?.terminate();
    const context = resource.current.context;
    if (context && context.state !== "closed") void context.close().catch(() => {});
    resource.current = {};
  }, []);
  useEffect(() => release, [release]);

  async function analyze(file: File) {
    release(); setError(""); setResult(null); setSelected(null); setName(file.name);
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError("Choose an audio file up to " + MAX_FILE_MB + " MB."); setStatus(""); return; }
    const version = generation.current;
    setStatus("Decoding audio…");
    try {
      const context = new AudioContext();
      resource.current.context = context;
      const buffer = await context.decodeAudioData(await file.arrayBuffer());
      if (generation.current !== version) return;
      if (buffer.duration < 8) throw new Error("Choose at least 8 seconds of audio with a steady beat.");
      const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
      const envelope = onsetEnvelope(channels, buffer.sampleRate);
      await context.close();
      if (generation.current !== version) return;
      resource.current.context = undefined;
      setStatus("Finding the beat…");
      const worker = new Worker(new URL("../workers/bpm.worker.ts", import.meta.url));
      resource.current.worker = worker;
      worker.onmessage = (event: MessageEvent<{ result?: TempoEstimate | null; error?: string }>) => {
        if (generation.current !== version) return;
        setStatus("");
        if (event.data.error) setError(event.data.error);
        else if (!event.data.result) setError("No consistent beat found. Try a longer section with clear drums or percussion.");
        else { setResult(event.data.result); setSelected(event.data.result.bpm); }
        release();
      };
      worker.onerror = () => {
        if (generation.current !== version) return;
        setStatus(""); setError("Could not analyze this file. Try again with another audio file."); release();
      };
      worker.postMessage(envelope, [envelope.buffer]);
    } catch (cause) {
      if (generation.current !== version) return;
      setStatus("");
      setError(cause instanceof Error && cause.message.startsWith("Choose at least") ? cause.message : "This audio could not be decoded. Try a WAV, MP3, or another format your browser supports.");
      release();
    }
  }

  return <section className="bpm-tool" aria-label="Audio BPM finder">
    <label className="bpm-upload"><span>Choose an audio file</span><input type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac" onChange={event => { const file = event.target.files?.[0]; if (file) void analyze(file); event.target.value = ""; }} /><small>WAV, MP3, or a browser-supported audio format · up to {MAX_FILE_MB} MB</small></label>
    {name && <p className="bpm-filename">{name}</p>}
    <p className="bpm-status" role="status">{status || (result ? "Tempo estimate ready" : "Choose a song or loop to begin")}</p>
    {status && <button type="button" className="bpm-cancel" onClick={() => { release(); setStatus(""); }}>Cancel analysis</button>}
    {error && <p className="bpm-error" role="alert">{error}</p>}
    <div className="bpm-result"><strong>{selected ?? "—"}</strong><span>BPM</span></div>
    {result && <><p>{result.strength >= .65 ? "Clear rhythmic match" : "Tentative rhythmic match — check by ear"}</p><div className="bpm-options" aria-label="Tempo interpretations">{[result.bpm,...result.alternatives].map(value => <button type="button" key={value} aria-pressed={value === selected} onClick={() => setSelected(value)}>{value} BPM{value === result.bpm ? " · estimate" : ""}</button>)}</div><p className="bpm-hint">Try half or double time if the beat grid feels too slow or fast.</p></>}
    <p className="bpm-privacy">Your audio stays on this device. Nothing is uploaded or recorded.</p>
  </section>;
}
