export type TempoEstimate = { bpm: number; strength: number; alternatives: number[] };

/** A positive energy-change envelope, sampled at 100 Hz; no audio is retained. */
export function onsetEnvelope(channels: Float32Array[], sampleRate: number) {
  const start = channels[0].length / sampleRate > 110 ? Math.round(10 * sampleRate) : 0;
  const end = Math.min(channels[0].length, start + Math.round(90 * sampleRate));
  const frames = Math.floor((end - start) / sampleRate * 100);
  const envelope = new Float32Array(frames);
  let previous = 0;
  for (let frame = 0; frame < frames; frame++) {
    const a = start + Math.round(frame * sampleRate / 100);
    const b = start + Math.round((frame + 1) * sampleRate / 100);
    let energy = 0;
    for (const channel of channels) for (let i = a; i < b; i++) energy += channel[i] * channel[i];
    const rms = Math.sqrt(energy / ((b - a) * channels.length));
    envelope[frame] = Math.max(0, rms - previous);
    previous = rms;
  }
  return envelope;
}

/** Normalized onset autocorrelation. Half/double-time readings remain possible. */
export function estimateTempo(envelope: Float32Array): TempoEstimate | null {
  if (envelope.length < 800) return null;
  let mean = 0, maximum = 0;
  for (const value of envelope) { mean += value; maximum = Math.max(maximum, value); }
  mean /= envelope.length;
  if (maximum < .002) return null;
  // Smooth over 50 ms so sub-frame onset timing does not favor three-beat aliases.
  const weights = [1, 2, 3, 2, 1];
  const centered = Float32Array.from(envelope, (_, index) => {
    let sum = 0, weight = 0;
    for (let offset = -2; offset <= 2; offset++) {
      if (index + offset < 0 || index + offset >= envelope.length) continue;
      sum += envelope[index + offset] * weights[offset + 2];
      weight += weights[offset + 2];
    }
    return sum / weight - mean;
  });
  const scoreAt = (bpm: number) => {
    const lag = 6000 / bpm, floor = Math.floor(lag), fraction = lag - floor;
    let dot = 0, a2 = 0, b2 = 0;
    for (let i = floor + 1; i < centered.length; i++) {
      const a = centered[i], b = centered[i - floor] * (1 - fraction) + centered[i - floor - 1] * fraction;
      dot += a * b; a2 += a * a; b2 += b * b;
    }
    return a2 && b2 ? dot / Math.sqrt(a2 * b2) : 0;
  };
  const scores: { bpm: number; score: number }[] = [];
  for (let bpm = 50; bpm <= 220; bpm += .25) scores.push({ bpm, score: scoreAt(bpm) });
  const peaks = scores.filter((entry, index) => entry.score > .2 && entry.score >= (scores[index - 1]?.score ?? -1) && entry.score >= (scores[index + 1]?.score ?? -1)).sort((a,b) => b.score - a.score);
  if (!peaks.length) return null;
  // Near-equal periodic matches favor a useful midrange; alternatives expose ambiguity.
  const strongest = peaks[0].score;
  const best = peaks.filter(p => p.score >= strongest * .97).sort((a,b) => Math.abs(Math.log2(a.bpm / 120)) - Math.abs(Math.log2(b.bpm / 120)))[0];
  const alternatives = [best.bpm / 2, best.bpm * 2, ...peaks.filter(p => p.score >= strongest * .75).map(p => p.bpm)]
    .map(value => Math.round(value * 10) / 10)
    .filter((value,index,all) => value >= 40 && value <= 300 && Math.abs(value - best.bpm) > 2 && all.indexOf(value) === index).slice(0,3);
  return { bpm: Math.round(best.bpm * 10) / 10, strength: best.score, alternatives };
}
