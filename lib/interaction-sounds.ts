export const BUTTON_SOUNDS_KEY = "aureyx-button-sounds";
export const BUTTON_SOUNDS_EVENT = "aureyx-button-sounds-change";
export const TAP_SECONDS = 0.035;
export const TAP_VOLUME = 0.14;

export function buttonSoundsPreference(value: unknown) {
  return value !== "off";
}

export function storedButtonSounds(storage: Pick<Storage, "getItem">) {
  try { return buttonSoundsPreference(storage.getItem(BUTTON_SOUNDS_KEY)); }
  catch { return true; }
}

export function buttonSoundsSnapshot() {
  const current = document.documentElement.dataset.buttonSounds;
  if (current === "on" || current === "off") return current === "on";
  try { return storedButtonSounds(localStorage); }
  catch { return true; }
}

export function subscribeButtonSounds(notify: () => void) {
  const update = () => notify();
  const storage = (event: StorageEvent) => {
    if (event.key !== BUTTON_SOUNDS_KEY && event.key !== null) return;
    document.documentElement.dataset.buttonSounds = buttonSoundsPreference(event.key === null ? null : event.newValue) ? "on" : "off";
    notify();
  };
  window.addEventListener(BUTTON_SOUNDS_EVENT, update);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(BUTTON_SOUNDS_EVENT, update);
    window.removeEventListener("storage", storage);
  };
}

export function setButtonSounds(enabled: boolean) {
  const value = enabled ? "on" : "off";
  document.documentElement.dataset.buttonSounds = value;
  try { localStorage.setItem(BUTTON_SOUNDS_KEY, value); }
  catch { /* This tab can still be muted when storage is blocked. */ }
  window.dispatchEvent(new Event(BUTTON_SOUNDS_EVENT));
}

export function clickSoundTarget(event: Pick<MouseEvent, "target" | "button" | "isTrusted">) {
  if (!event.isTrusted || event.button !== 0 || !(event.target instanceof Element)) return null;
  const button = event.target.closest<HTMLElement>('button,input[type="button"],input[type="submit"],input[type="reset"],[role="button"],summary,a.transmission-button,a.release-preview-button');
  if (!button || button.matches(":disabled") || button.closest('[inert],[aria-disabled="true"],[data-no-click-sound]')) return null;
  return button;
}

/** A short, quiet tap with a gentle attack and no audio files to download. */
export function makeTapWave(sampleRate: number) {
  if (!Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 192000) throw new RangeError("Unsupported sample rate");
  const samples = new Float32Array(Math.ceil(sampleRate * TAP_SECONDS));
  for (let index = 0; index < samples.length; index++) {
    const seconds = index / sampleRate;
    const attack = Math.min(seconds / 0.0015, 1);
    const release = Math.min((samples.length - 1 - index) / (sampleRate * 0.004), 1);
    const envelope = attack * release * Math.exp(-seconds * 135);
    samples[index] = envelope * (Math.sin(2 * Math.PI * 1400 * seconds) + 0.3 * Math.sin(2 * Math.PI * 2200 * seconds)) * 0.42;
  }
  return samples;
}
