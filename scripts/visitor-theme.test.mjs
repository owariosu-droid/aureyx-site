import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
const source=await readFile(new URL('../lib/visitor-theme.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
const theme=await import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
test('theme choices are constrained, default to light, and resolve System correctly',()=>{
 for(const value of [null,undefined,'other','<script>'])assert.equal(theme.themePreference(value),'light');
 assert.equal(theme.resolvedTheme('system',true),'dark');assert.equal(theme.resolvedTheme('system',false),'light');
 assert.equal(theme.resolvedTheme('light',true),'light');assert.equal(theme.resolvedTheme('dark',false),'dark');
});
test('pre-paint bootstrap applies saved choices and tolerates unavailable storage',()=>{
 for(const [value,systemDark,expected] of [['dark',false,'dark'],['light',true,'light'],['system',true,'dark'],['system',false,'light'],[null,true,'light'],['invalid',true,'light'],['throws',true,'light']]){
  const element={dataset:{},style:{}};
  vm.runInNewContext(theme.themeBootstrap,{document:{documentElement:element},localStorage:{getItem(){if(value==='throws')throw new Error('blocked');return value;}},matchMedia:()=>({matches:systemDark})});
  assert.equal(element.dataset.theme,expected);assert.equal(element.style.colorScheme,expected);
 }
});
