import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64');
const service = await import(moduleUrl(await readFile(new URL('../lib/owner-service.ts', import.meta.url),'utf8')));
const config = {url:'https://test.supabase.co',key:'test-public-key',ownerId:'11111111-1111-4111-8111-111111111111',origin:'https://aureyx.example'};
const tokens = {access_token:'owner-access',refresh_token:'owner-refresh',expires_in:900};
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
test('sign-in validates the returned account with the auth service before granting owner access', async()=>{
 const calls=[];
 const api=service.createOwnerService(config,async(url,options)=>{calls.push({url,options});return url.includes('/token?')?json(tokens):json({id:config.ownerId,email:'owner@example.com'});});
 assert.deepEqual(await api.signIn('owner@example.com','not-a-real-password'),tokens);
 assert.equal(calls.length,2);assert.equal(calls[1].options.headers.Authorization,'Bearer owner-access');
 assert.equal(calls[0].options.cache,'no-store');
});
test('a valid non-owner login and a refreshed non-owner token are both denied',async()=>{
 const api=service.createOwnerService(config,async(url)=>url.includes('/token?')?json(tokens):json({id:'22222222-2222-4222-8222-222222222222'}));
 await assert.rejects(api.signIn('other@example.com','other-password'),{status:401});
 await assert.rejects(api.refresh('stolen-refresh'),{status:401});
});
test('forged access tokens fail server validation',async()=>{
 const api=service.createOwnerService(config,async()=>json({error:'invalid'},401));
 await assert.rejects(api.verify('forged-jwt'),{status:401});
});
test('provider throttling and failures produce safe errors without upstream credentials',async()=>{
 for(const [status,expected] of [[429,429],[500,503]]){
  const api=service.createOwnerService(config,async()=>json({secret:'must not appear'},status));
  await assert.rejects(api.signIn('owner@example.com','private'),e=>e.status===expected&&!e.message.includes('secret'));
 }
});
test('cross-origin and missing-origin writes are rejected',()=>{
 assert.doesNotThrow(()=>service.requireSameOrigin(config.origin,config.origin));
 for(const origin of [null,'https://attacker.example','null','https://aureyx.example.evil']) assert.throws(()=>service.requireSameOrigin(origin,config.origin),{status:403});
});
test('missing or unsafe configuration keeps owner administration disabled',()=>{
 const names=['SUPABASE_URL','SUPABASE_ANON_KEY','AUREYX_OWNER_ID','AUREYX_SITE_ORIGIN'];const original=Object.fromEntries(names.map(n=>[n,process.env[n]]));
 try{
  names.forEach(n=>delete process.env[n]);assert.equal(service.ownerConfig(),null);
  Object.assign(process.env,{SUPABASE_URL:config.url,SUPABASE_ANON_KEY:config.key,AUREYX_OWNER_ID:config.ownerId,AUREYX_SITE_ORIGIN:config.origin});
  assert.ok(service.ownerConfig());
  process.env.SUPABASE_URL='https://attacker.example';assert.equal(service.ownerConfig(),null);
 }finally{for(const n of names){if(original[n]===undefined)delete process.env[n];else process.env[n]=original[n];}}
});
const artistsUrl=moduleUrl(await readFile(new URL('../data/artists.ts',import.meta.url),'utf8'));
let schemaSource=await readFile(new URL('../lib/owner-content.ts',import.meta.url),'utf8');
schemaSource=schemaSource.replace('"@/data/artists"',JSON.stringify(artistsUrl)).replace('import { albums } from "@/data/albums";', 'const albums = Array(38);');
const schema=await import(moduleUrl(schemaSource));
test('text edits preserve known artists and reject extra fields or oversized content',()=>{
 const content=schema.defaultOwnerContent();content.artists.iyune.bio='New public biography';
 assert.equal(schema.validateOwnerContent(content).artists.iyune.bio,'New public biography');
 for(const mutate of [c=>c.artists.iyune.bio='x'.repeat(1501),c=>c.artists.iyune.role='',c=>c.artists.attacker={bio:'x',role:'x'},c=>c.pages.home.html='<script>']){
  const c=schema.defaultOwnerContent();mutate(c);assert.throws(()=>schema.validateOwnerContent(c));
 }
});
