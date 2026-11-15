import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../lib/pitch.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { detectPitch, pitchToNote } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
test('finds voice-like fundamentals across the supported range and common sample rates', () => {
  for (const sr of [44100, 48000]) for (const hz of [65.41,82.41,110,220,261.626,440,880,1046.5,1396.9]) {
    const samples = Float32Array.from({length:2048}, (_,i) => .3*Math.sin(2*Math.PI*hz*i/sr) + .12*Math.sin(4*Math.PI*hz*i/sr) + .07*Math.sin(6*Math.PI*hz*i/sr));
    const found = detectPitch(samples, sr);
    assert.ok(found !== null);
    assert.ok(Math.abs(1200*Math.log2(found/hz)) < 8, 'Frequency: ' + hz + ', sample rate: ' + sr);
  }
});
test('rejects silence, very quiet input, and unpitched noise', () => {
  assert.equal(detectPitch(new Float32Array(2048),48000), null);
  assert.equal(detectPitch(Float32Array.from({length:2048},(_,i)=>.001*Math.sin(2*Math.PI*440*i/48000)),48000),null);
  let seed=13;
  const noise=Float32Array.from({length:2048},()=>{seed=(seed*16807)%2147483647;return (seed/2147483647-.5)*.5;});
  assert.equal(detectPitch(noise,48000),null);
});
test('maps notes and cents to a standard MIDI piano roll', () => {
  assert.deepEqual(pitchToNote(440), {name:'A',octave:4,midi:69,cents:0,frequency:440});
  assert.equal(pitchToNote(261.626).name,'C');
  assert.equal(pitchToNote(261.626).octave,4);
  assert.equal(pitchToNote(440*2**(25/1200)).cents,25);
  assert.equal(pitchToNote(440*2**(-25/1200)).cents,-25);
});
