import { estimateTempo } from "../lib/bpm";
self.onmessage = (event: MessageEvent<Float32Array>) => {
  try { self.postMessage({ result: estimateTempo(event.data) }); }
  catch { self.postMessage({ error: "Tempo analysis failed. Try a different audio file." }); }
};
