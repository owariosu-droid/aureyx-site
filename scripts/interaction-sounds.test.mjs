import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../lib/interaction-sounds.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });

function harness({ stored = null, blocked = false } = {}) {
  const listeners = new Map();
  const saved = new Map(stored === null ? [] : [["aureyx-button-sounds", stored]]);
  const document = { documentElement: { dataset: {} } };
  const window = {
    addEventListener(name, listener) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(listener); },
    removeEventListener(name, listener) { listeners.get(name)?.delete(listener); },
    dispatchEvent(event) { for (const listener of listeners.get(event.type) || []) listener(event); },
  };
  const localStorage = {
    getItem(key) { if (blocked) throw new Error("Storage unavailable"); return saved.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw new Error("Storage unavailable"); saved.set(key, value); },
  };
  class Element {
    constructor({ control = null, disabled = false, blocked = false } = {}) { this.control = control; this.disabled = disabled; this.blocked = blocked; }
    closest(selector) { return selector.startsWith("button,") ? this.control : this.blocked ? this : null; }
    matches() { return this.disabled; }
  }
  const exports = {};
  vm.runInNewContext(outputText, { exports, document, window, localStorage, Element, Event, Float32Array });
  return { sounds: exports, document, window, saved, Element };
}

test("sounds default on and muting persists without requiring storage to work", () => {
  for (const stored of [null, "on", "invalid"]) assert.equal(harness({ stored }).sounds.buttonSoundsSnapshot(), true);
  const saved = harness({ stored: "off" });
  assert.equal(saved.sounds.buttonSoundsSnapshot(), false);
  for (const blocked of [false, true]) {
    const h = harness({ blocked });
    let notifications = 0;
    const unsubscribe = h.sounds.subscribeButtonSounds(() => notifications++);
    h.sounds.setButtonSounds(false);
    assert.equal(h.sounds.buttonSoundsSnapshot(), false);
    if (!blocked) assert.equal(h.saved.get(h.sounds.BUTTON_SOUNDS_KEY), "off");
    h.sounds.setButtonSounds(true);
    assert.equal(h.sounds.buttonSoundsSnapshot(), true);
    assert.equal(notifications, 2);
    unsubscribe();
    h.sounds.setButtonSounds(false);
    assert.equal(notifications, 2);
  }
});

test("the mute control follows changes from another tab and storage clearing", () => {
  const h = harness();
  let notifications = 0;
  h.sounds.subscribeButtonSounds(() => notifications++);
  h.window.dispatchEvent({ type: "storage", key: "other-setting", newValue: "off" });
  assert.equal(notifications, 0);
  h.window.dispatchEvent({ type: "storage", key: h.sounds.BUTTON_SOUNDS_KEY, newValue: "off" });
  assert.equal(h.sounds.buttonSoundsSnapshot(), false);
  h.window.dispatchEvent({ type: "storage", key: null, newValue: null });
  assert.equal(h.sounds.buttonSoundsSnapshot(), true);
  assert.equal(notifications, 2);
});

test("only genuine enabled button activations play, including nested icons and keyboard clicks", () => {
  const { sounds, Element } = harness();
  const button = new Element();
  button.control = button;
  const svg = new Element({ control: button });
  for (const target of [button, svg]) {
    assert.equal(sounds.clickSoundTarget({ target, button: 0, isTrusted: true, detail: 0 }), button);
    assert.equal(sounds.clickSoundTarget({ target, button: 0, isTrusted: false }), null);
    assert.equal(sounds.clickSoundTarget({ target, button: 1, isTrusted: true }), null);
  }
  for (const target of [new Element(), null, {}, { textContent: "label" }]) assert.equal(sounds.clickSoundTarget({ target, button: 0, isTrusted: true }), null);
  button.disabled = true;
  assert.equal(sounds.clickSoundTarget({ target: svg, button: 0, isTrusted: true }), null);
  button.disabled = false;
  button.blocked = true;
  assert.equal(sounds.clickSoundTarget({ target: svg, button: 0, isTrusted: true }), null);
});

test("tap audio stays short, quiet, and fades cleanly at common device sample rates", () => {
  const { sounds } = harness();
  for (const rate of [8000, 44100, 48000, 96000, 192000]) {
    const wave = sounds.makeTapWave(rate);
    assert.ok(wave.length / rate <= 0.036);
    assert.equal(Math.abs(wave[0]), 0);
    assert.equal(Math.abs(wave.at(-1)), 0);
    let peak = 0;
    let startEnergy = 0;
    let endEnergy = 0;
    for (const [index, value] of wave.entries()) {
      assert.ok(Number.isFinite(value));
      peak = Math.max(peak, Math.abs(value));
      if (index < wave.length / 4) startEnergy += value * value;
      if (index >= wave.length * 3 / 4) endEnergy += value * value;
    }
    assert.ok(peak > 0);
    assert.ok(peak * sounds.TAP_VOLUME < 0.1);
    assert.ok(endEnergy < startEnergy / 100);
  }
  for (const rate of [NaN, Infinity, 0, -1, 7999, 192001]) assert.throws(() => sounds.makeTapWave(rate), /Unsupported sample rate/);
});
