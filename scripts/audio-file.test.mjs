import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source=await readFile(new URL('../lib/audio-file.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}});
const {audioLimitMB,planAudioRead,assembleAudio}=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
function wavHeader(length){
 const b=new Uint8Array(44),v=new DataView(b.buffer),put=(at,s)=>[...s].forEach((c,i)=>b[at+i]=c.charCodeAt(0));
 put(0,'RIFF');v.setUint32(4,length+36,true);put(8,'WAVE');put(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,48000,true);v.setUint32(28,192000,true);v.setUint16(32,4,true);v.setUint16(34,16,true);put(36,'data');v.setUint32(40,length,true);return b;
}
test('WAVs get 200 MB and other audio gets 100 MB',()=>{
 assert.equal(audioLimitMB({name:'TRACK.WAV',type:''}),200);
 assert.equal(audioLimitMB({name:'track',type:'audio/x-wav'}),200);
 assert.equal(audioLimitMB({name:'song.mp3',type:'audio/mpeg'}),100);
});
test('large PCM WAV uses an aligned 90-second excerpt with corrected WAV sizes',async()=>{
 const length=150*1024*1024,header=wavHeader(length);
 const file={name:'large.wav',type:'audio/wav',size:length+44,slice:()=>new Blob([header])};
 const plan=await planAudioRead(file);
 assert.equal(plan.start,44+48000*4*10);
 assert.equal(plan.end-plan.start,48000*4*90);
 const output=assembleAudio(plan,new ArrayBuffer(plan.end-plan.start));
 const view=new DataView(output);
 assert.equal(view.getUint32(4,true),output.byteLength-8);
 assert.equal(view.getUint32(40,true),48000*4*90);
});
test('unknown large WAVs fail clearly rather than decoding the entire file',async()=>{
 const file={name:'invalid.wav',type:'audio/wav',size:150*1024*1024,slice:()=>new Blob(['not WAV'])};
 await assert.rejects(planAudioRead(file),/uncompressed PCM or float WAV/);
});
test('small non-WAVs retain the full decoding path',async()=>{
 const plan=await planAudioRead({name:'song.mp3',type:'audio/mpeg',size:1024});
 assert.deepEqual(plan,{start:0,end:1024});
});
