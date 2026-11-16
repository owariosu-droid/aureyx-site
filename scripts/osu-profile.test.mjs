import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const source = await readFile(new URL('../lib/osu-profile.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { organizeOsuProfile } = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
test('organizes the saved profile without discarding maps or their selected artwork', async () => {
 const { html } = JSON.parse(await readFile(new URL('../data/external/osu.json', import.meta.url), 'utf8'));
 const sections = organizeOsuProfile(html);
 assert.equal(sections.length,4);
 const maps = sections.find(s=>s.title==='Mapping Projects');
 assert.equal(maps.cards.length,5);
 assert.ok(maps.intro.includes('keep making maps'));
 assert.equal(maps.cards[0].title,'Cynthoni of Flames');
 assert.equal(maps.cards[0].image,'/osu/cynthoni-art.jpg');
 assert.ok(maps.cards[0].href.includes('2575406'));
 assert.ok(maps.cards.find(c=>c.title==='Death of the Endless').html.includes('Sink into the Deep Sea Ocean'));
 assert.equal(maps.cards.find(c=>c.title==='Dork After Dark').image,'/osu/dork-after-dark.png');
 assert.equal(sections.find(s=>s.title==='Thinking of Mapping').cards[0].title,'Mousou Happy End');
 assert.ok(sections[0].html.includes('Gaomon S620'));
 assert.ok(sections.at(-1).html.includes('screenshot is no longer available'));
});
test('preserves new headings and falls back for unfamiliar source layouts', () => {
 assert.deepEqual(organizeOsuProfile('<p>Content before headings</p><h2>About</h2>Text'),[]);
 assert.deepEqual(organizeOsuProfile('No headings'),[]);
 const sections=organizeOsuProfile('<div><h2>New section</h2><p>New content</p></div>');
 assert.equal(sections[0].html,'<p>New content</p>');
});
test('keeps all notes in card bodies and does not invent map links', () => {
 const sections=organizeOsuProfile('<h2>Thinking of Mapping</h2><strong>New &amp; old</strong><br>Some notes<br><br>More notes');
 assert.equal(sections[0].cards[0].title,'New & old');
 assert.equal(sections[0].cards[0].href,undefined);
 assert.ok(sections[0].cards[0].html.includes('More notes'));
});
