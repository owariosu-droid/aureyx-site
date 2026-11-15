/** YIN fundamental estimation for one voice. */
export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  let energy = 0;
  for (const value of samples) energy += value * value;
  if (Math.sqrt(energy / samples.length) < 0.008) return null;
  const maximum = Math.min(Math.floor(sampleRate / 65), Math.floor(samples.length / 2));
  const minimum = Math.max(2, Math.floor(sampleRate / 1400));
  const length = samples.length - maximum;
  const difference = new Float32Array(maximum + 1);
  let sum = 0;
  for (let lag = 1; lag <= maximum; lag++) {
    let value = 0;
    for (let i = 0; i < length; i++) {
      const delta = samples[i] - samples[i + lag];
      value += delta * delta;
    }
    sum += value;
    difference[lag] = sum ? value * lag / sum : 1;
  }
  for (let lag = minimum; lag < maximum; lag++) {
    if (difference[lag] >= 0.15) continue;
    while (lag + 1 < maximum && difference[lag + 1] < difference[lag]) lag++;
    const before = difference[lag - 1], center = difference[lag], after = difference[lag + 1];
    const denominator = 2 * (2 * center - after - before);
    const adjusted = lag + (denominator ? (after - before) / denominator : 0);
    const frequency = sampleRate / adjusted;
    return frequency >= 65 && frequency <= 1400 ? frequency : null;
  }
  return null;
}

export function pitchToNote(frequency: number) {
  const midi = 69 + 12 * Math.log2(frequency / 440);
  const rounded = Math.round(midi);
  const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  return { name: names[(rounded % 12 + 12) % 12], octave: Math.floor(rounded / 12) - 1, midi: rounded, cents: Math.round((midi - rounded) * 100), frequency };
}
