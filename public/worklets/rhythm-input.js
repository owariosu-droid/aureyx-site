/* Produce 100 Hz onset energy using the audio sample clock, not animation timing. */
class RhythmInput extends AudioWorkletProcessor {
  constructor() {
    super();
    this.samples = 0; this.frames = 0; this.energy = 0; this.count = 0;
    this.previous = 0; this.peak = 0; this.batch = [];
  }
  process(inputs, outputs) {
    // Never monitor microphone audio through the speakers.
    for (const output of outputs) for (const channel of output) channel.fill(0);
    const channels = inputs[0];
    if (!channels?.length) return true;
    for (let i = 0; i < channels[0].length; i++) {
      for (const channel of channels) { const value = channel[i] || 0; this.energy += value * value; this.count++; }
      this.samples++;
      if (this.samples >= Math.round((this.frames + 1) * sampleRate / 100)) {
        const rms = Math.sqrt(this.energy / Math.max(1, this.count));
        this.batch.push(Math.max(0, rms - this.previous));
        this.previous = rms; this.peak = Math.max(this.peak, rms);
        this.energy = 0; this.count = 0; this.frames++;
        if (this.batch.length === 10) {
          const envelope = new Float32Array(this.batch);
          this.port.postMessage({ envelope, level: this.peak }, [envelope.buffer]);
          this.batch = []; this.peak = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor("rhythm-input", RhythmInput);
