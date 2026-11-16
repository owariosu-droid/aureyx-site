export const AUDIO_LIMIT_MB = 100;
export const WAV_LIMIT_MB = 200;
export const isWavFile = (file: { name: string; type: string }) => /\.wav$/i.test(file.name) || /^(audio\/(?:x-)?wav|audio\/wave)$/i.test(file.type);
export const audioLimitMB = (file: { name: string; type: string }) => isWavFile(file) ? WAV_LIMIT_MB : AUDIO_LIMIT_MB;

export type AudioReadPlan = { start: number; end: number; header?: Uint8Array };
/** Read only an analysis excerpt from uncompressed WAVs, not the whole large file. */
export async function planAudioRead(file: File): Promise<AudioReadPlan> {
  if (!isWavFile(file)) return { start: 0, end: file.size };
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer());
  const view = new DataView(bytes.buffer);
  const label = (offset: number) => String.fromCharCode(...bytes.slice(offset, offset + 4));
  let rate = 0, alignment = 0, format = 0;
  if (bytes.length >= 12 && label(0) === "RIFF" && label(8) === "WAVE") {
    for (let at = 12; at + 8 <= bytes.length;) {
      const size = view.getUint32(at + 4, true);
      if (label(at) === "fmt " && size >= 16 && at + 8 + size <= bytes.length) {
        format = view.getUint16(at + 8, true);
        if (format === 65534 && size >= 40) format = view.getUint16(at + 32, true);
        rate = view.getUint32(at + 12, true);
        alignment = view.getUint16(at + 20, true);
      }
      if (label(at) === "data" && [1,3].includes(format) && rate > 0 && alignment > 0) {
        const length = Math.min(size, file.size - at - 8);
        const duration = length / (rate * alignment);
        const offset = duration > 110 ? Math.floor(rate * 10) * alignment : 0;
        const frames = Math.min(Math.floor(rate * 90), Math.floor(64 * 1024 * 1024 / alignment), Math.floor((length - offset) / alignment));
        const dataLength = Math.max(0, frames * alignment);
        const header = bytes.slice(0, at + 8);
        const output = new DataView(header.buffer);
        output.setUint32(4, header.length + dataLength + dataLength % 2 - 8, true);
        output.setUint32(at + 4, dataLength, true);
        return { start: at + 8 + offset, end: at + 8 + offset + dataLength, header };
      }
      at += 8 + size + size % 2;
    }
  }
  if (file.size > AUDIO_LIMIT_MB * 1024 * 1024) throw new Error("For WAV files over 100 MB, use an uncompressed PCM or float WAV. This file’s WAV format could not be read.");
  return { start: 0, end: file.size };
}
export function assembleAudio(plan: AudioReadPlan, data: ArrayBuffer): ArrayBuffer {
  if (!plan.header) return data;
  const merged = new Uint8Array(plan.header.length + data.byteLength + data.byteLength % 2);
  merged.set(plan.header);
  merged.set(new Uint8Array(data), plan.header.length);
  return merged.buffer;
}
