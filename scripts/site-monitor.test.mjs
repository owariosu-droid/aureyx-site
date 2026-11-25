import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSite } from './check-site-health.mjs';
const headers = { 'x-content-type-options':'nosniff','x-frame-options':'DENY' };
test('monitor checks only fixed public targets with timeouts and no redirects', async () => {
  const visited=[];
  await checkSite(async (url, options) => {
    visited.push(url);
    assert.equal(options.redirect,'error'); assert.ok(options.signal);
    return new Response(url.endsWith('/api/health') ? '{"status":"ok"}' : url.endsWith('/music') ? 'Supporter releases' : 'Aureyx',{headers});
  });
  assert.equal(visited.length,3);
  assert.ok(visited.every(url=>url.startsWith('https://aureyx-site.vercel.app/')));
});
test('monitor reports missing headers, degraded status and failed pages', async () => {
  await assert.rejects(checkSite(async()=>new Response('Aureyx')),/headers/);
  await assert.rejects(checkSite(async()=>new Response('',{status:503})),/503/);
  await assert.rejects(checkSite(async(url)=>new Response(url.endsWith('/api/health') ? '{"status":"degraded"}' : 'Aureyx Supporter releases',{headers})),/content missing/);
});
