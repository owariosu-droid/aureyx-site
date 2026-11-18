export class MicrophoneError extends Error {}

export type MicrophoneSession = {
  context: AudioContext;
  stream: MediaStream;
  source: MediaStreamAudioSourceNode;
  close: () => void;
};

/** Called directly from a user gesture: request permission before awaiting resume. */
export async function openMicrophone(signal: AbortSignal, deviceId = ""): Promise<MicrophoneSession> {
  if (signal.aborted) throw new DOMException("Canceled", "AbortError");
  if (typeof window === "undefined" || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    throw new MicrophoneError("Open this tool over HTTPS in Safari, Chrome, Firefox, or Edge to use your microphone.");
  }
  const policyDocument = document as Document & { permissionsPolicy?: { allowsFeature: (name: string) => boolean }; featurePolicy?: { allowsFeature: (name: string) => boolean } };
  const policy = policyDocument.permissionsPolicy ?? policyDocument.featurePolicy;
  if (policy && !policy.allowsFeature("microphone")) {
    throw new MicrophoneError("Microphone access is blocked in this window. Open this tool directly in a browser tab and try again.");
  }
  const Constructor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Constructor) throw new MicrophoneError("This browser cannot process live audio. Try a current version of Safari or Chrome.");
  const context = new Constructor({ latencyHint: "interactive" });
  let stream: MediaStream | undefined;
  let source: MediaStreamAudioSourceNode | undefined;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    signal.removeEventListener("abort", close);
    context.onstatechange = null;
    source?.disconnect();
    stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    if (context.state !== "closed") void context.close().catch(() => {});
  };
  signal.addEventListener("abort", close, { once: true });
  try {
    // Start the browser permission request synchronously, even if audio resume stalls.
    const permission = navigator.mediaDevices.getUserMedia({
      audio: { deviceId: deviceId ? { exact: deviceId } : undefined, channelCount: { ideal: 1 }, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false,
    });
    void context.resume().catch(() => {});
    stream = await permission;
    if (signal.aborted) {
      stream.getTracks().forEach(track => track.stop());
      throw new DOMException("Canceled", "AbortError");
    }
    if (context.state !== "running") {
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          context.resume(),
          new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new MicrophoneError("Audio processing is paused. Press Start again, or open this tool directly in your browser.")), 5000); }),
        ]);
      } finally { clearTimeout(timer); }
    }
    if (signal.aborted || context.state === "closed") throw new DOMException("Canceled", "AbortError");
    source = context.createMediaStreamSource(stream);
    return { context, stream, source, close };
  } catch (error) { close(); throw error; }
}

export function microphoneError(error: unknown) {
  if (error instanceof MicrophoneError) return error.message;
  const name = error && typeof error === "object" && "name" in error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "Microphone permission was blocked. Allow microphone access in your browser’s site settings, then press Start again. If this is an in-app browser, open the tool in Safari or Chrome.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "That microphone is unavailable. Choose System default or connect another microphone and try again.";
  if (name === "NotReadableError") return "The microphone could not be opened. Check your device’s privacy settings and close other apps using it, then try again.";
  return "Could not start live audio. Check your microphone connection and try again.";
}
