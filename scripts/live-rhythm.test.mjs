import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
const processorSource = await readFile(new URL("../public/worklets/rhythm-input.js", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(await readFile(new URL("../lib/bpm.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { estimateTempo, onsetEnvelope } = await import("data:text/javascript;base64," + Buffer.from(outputText).toString("base64"));
test("live processor follows the sample clock and detects a 120 BPM rhythm at common input rates", () => {
  for (const rate of [44100,48000]) {
    let Processor;
    const packets = [];
    vm.runInNewContext(processorSource, {
      sampleRate: rate, Float32Array, Math,
      AudioWorkletProcessor: class { constructor() { this.port = { postMessage: packet => packets.push(packet) }; } },
      registerProcessor: (_, constructor) => { Processor = constructor; },
    });
    const processor = new Processor();
    const samples = Float32Array.from({length:rate*12},(_,i)=>{
      const phase=(i/rate)%.5;
      return .65*Math.exp(-phase*65)*Math.sin(2*Math.PI*90*phase);
    });
    for (let index=0;index<samples.length;index+=128) {
      const output = new Float32Array(128).fill(1);
      processor.process([[samples.subarray(index,index+128)]],[[output]]);
      assert.ok(output.every(value=>value===0),"Microphone audio must not feed the speakers");
    }
    const envelope = Float32Array.from(packets.flatMap(packet=>[...packet.envelope]));
    assert.equal(envelope.length,1200);
    const expected = onsetEnvelope([samples],rate);
    assert.ok(envelope.every((value,index)=>Math.abs(value-expected[index])<1e-6));
    assert.ok(Math.abs(estimateTempo(envelope).bpm-120)<1);
    assert.ok(packets.some(packet=>packet.level>.05));
  }
});
test("live silence never produces a tempo", () => {
  let Processor;const packets=[];
  vm.runInNewContext(processorSource,{
    sampleRate:48000,Float32Array,Math,
    AudioWorkletProcessor:class{constructor(){this.port={postMessage:p=>packets.push(p)};}},
    registerProcessor:(_,constructor)=>{Processor=constructor;},
  });
  const processor=new Processor();
  for(let i=0;i<375*10;i++)processor.process([[new Float32Array(128)]],[[new Float32Array(128)]]);
  const envelope=Float32Array.from(packets.flatMap(packet=>[...packet.envelope]));
  assert.equal(estimateTempo(envelope),null);
});
