"use client";

import { useEffect } from "react";
import { buttonSoundsSnapshot, clickSoundTarget, makeTapWave, subscribeButtonSounds, TAP_VOLUME } from "@/lib/interaction-sounds";

export default function InteractionSounds() {
  useEffect(() => {
    let enabled = buttonSoundsSnapshot();
    let context: AudioContext | null = null;
    let buffer: AudioBuffer | null = null;
    const sources = new Set<AudioBufferSourceNode>();

    function stopTaps() {
      for (const source of sources) {
        try { source.stop(); } catch { /* A tap may already have ended. */ }
      }
      sources.clear();
    }

    const unsubscribe = subscribeButtonSounds(() => {
      enabled = buttonSoundsSnapshot();
      if (!enabled) stopTaps();
    });

    function startTap(audio: AudioContext) {
      if (!enabled || audio.state !== "running") return;
      if (!buffer) {
        const samples = makeTapWave(audio.sampleRate);
        buffer = audio.createBuffer(1, samples.length, audio.sampleRate);
        buffer.copyToChannel(samples, 0);
      }
      const source = audio.createBufferSource();
      const gain = audio.createGain();
      source.buffer = buffer;
      gain.gain.value = TAP_VOLUME;
      source.connect(gain);
      gain.connect(audio.destination);
      sources.add(source);
      source.onended = () => { source.disconnect(); gain.disconnect(); sources.delete(source); };
      source.start();
    }

    function click(event: MouseEvent) {
      if (!enabled || !clickSoundTarget(event)) return;
      try {
        if (!context || context.state === "closed") {
          const Audio = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!Audio) return;
          context = new Audio();
          buffer = null;
        }
        const audio = context;
        if (audio.state !== "running") {
          void audio.resume().then(() => { try { startTap(audio); } catch { /* Audio may be unavailable on this device. */ } }).catch(() => {});
        } else startTap(audio);
      } catch { /* Browsers can decline audio without interrupting the button action. */ }
    }

    // Click also covers keyboard activation, with no second pointer/key listener.
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("click", click, true);
      unsubscribe();
      stopTaps();
      if (context && context.state !== "closed") void context.close().catch(() => {});
    };
  }, []);
  return null;
}
