# Live audio tools

Both /for-fun/pitch-detector and /for-fun/bpm-finder allow same-origin microphone access. Tool entry links use document navigation; the global route boundary reloads the document when crossing between microphone-enabled and microphone-blocked pages, because SPA navigation cannot replace Permissions-Policy headers. Other routes continue to deny it. Visitors must press Start and approve the browser permission prompt; previously denied permission must be changed in browser site settings.

The shared microphone helper starts getUserMedia before awaiting audio-context resume so a suspended audio engine cannot prevent the permission request. It supports selecting an input, cancellation while permission is pending, device disconnection, and closing all tracks/contexts on stop, navigation, page hiding, or interruption. Microphone audio is never monitored through the speakers.

Pitch uses a 4096-sample analyser, repeat-note confirmation, and a short median filter. The signal meter distinguishes quiet input from a denied/unavailable microphone. It is intended for one sung or hummed note at a time, not chords.

Live BPM uses an AudioWorklet to produce an onset envelope at 100 Hz based on the audio sample clock. A worker estimates tempo once per second after at least eight seconds of input, retaining up to the most recent twenty seconds. Silence clears stale results. Half/double-time interpretation remains possible; a held pitch alone does not supply a beat. File BPM analysis is preserved as a separate mode.

Validation includes sample-clock tests at 44.1/48 kHz, silence rejection, fake-microphone Chromium tests for 440 Hz/A4 and 120 BPM, cleanup, late permission cancellation, denied permission, and file-mode regression. Physical iOS/Safari microphone behavior has not been tested.
