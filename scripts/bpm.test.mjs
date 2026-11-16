import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../lib/bpm.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}});
const {onsetEnvelope,estimateTempo}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
function percussion(bpm,sr=22050,duration=18){
 return Float32Array.from({length:sr*duration},(_,i)=>{
  const phase=(i/sr)%(60/bpm);
  return .8*Math.exp(-phase*70)*Math.sin(2*Math.PI*90*phase);
 });
}
test('estimates steady percussion at varied tempos, allowing explicit half/double time',()=>{
 for(const bpm of [60,80,100,120,140,160,180,200]){
  const result=estimateTempo(onsetEnvelope([percussion(bpm)],22050));
  assert.ok(result, 'No result for '+bpm);
  assert.ok([result.bpm,...result.alternatives].some(value=>Math.abs(value-bpm)<1),JSON.stringify({bpm,result}));
 }
});
test('energy analysis preserves anti-phase stereo transients',()=>{
 const signal=percussion(120);
 const negative=Float32Array.from(signal,x=>-x);
 const mono=onsetEnvelope([signal],22050), stereo=onsetEnvelope([signal,negative],22050);
 assert.deepEqual(stereo,mono);
});
test('rejects silence, short clips, and unpitched noise',()=>{
 assert.equal(estimateTempo(new Float32Array(1800)),null);
 assert.equal(estimateTempo(new Float32Array(700).fill(.3)),null);
 let seed=5;
 const noise=Float32Array.from({length:22050*18},()=>{seed=seed*16807%2147483647;return (seed/2147483647-.5)*.4;});
 assert.equal(estimateTempo(onsetEnvelope([noise],22050)),null);
});
