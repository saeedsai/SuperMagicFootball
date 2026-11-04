'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function fullscreenHelpFocusUsable(');
const end=ui.indexOf('\nfunction fullscreenHelp(',start);
assert.ok(start>=0&&end>start,'fullscreen help focus-restoration helpers exist');

test('UX26 fullscreen help restoration returns focus to a connected opener once',()=>{
 let focusCalls=0;
 const opener={isConnected:true,focus(options){focusCalls++;assert.deepEqual({...options},{preventScroll:true});}};
 const context={fullscreenHelpReturnFocus:opener};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.restore=restoreFullscreenHelpFocus;',context);
 context.restore();
 assert.equal(focusCalls,1);
 assert.equal(context.fullscreenHelpReturnFocus,null);
 context.restore();
 assert.equal(focusCalls,1,'a second close must not refocus a stale opener');
});

test('UX26 fullscreen help falls back when a connected opener is hidden or disabled',()=>{
 for(const invalid of ['hidden','disabled']){
  let openerFocus=0,fallbackFocus=0;
  const fallback={isConnected:true,focus(options){fallbackFocus++;assert.deepEqual({...options},{preventScroll:true});}};
  const opener={isConnected:true,matches(selector){return invalid==='disabled'&&selector===':disabled';},
   closest(selector){return invalid==='hidden'&&selector.includes('.hidden')?{}:null;},focus(){openerFocus++;}};
  const context={fullscreenHelpReturnFocus:opener,menuVisible:()=>true,
   menu:{querySelector:selector=>selector==='.heading'?fallback:null,querySelectorAll:()=>[]},
   $:()=>null};
  vm.runInNewContext(ui.slice(start,end)+'\nthis.restore=restoreFullscreenHelpFocus;',context);
  context.restore();
  assert.equal(openerFocus,0,`${invalid} connected opener must not receive focus`);
  assert.equal(fallbackFocus,1,`${invalid} opener falls back to visible menu heading`);
  assert.equal(context.fullscreenHelpReturnFocus,null,'invalid opener is consumed exactly once');
 }
});

test('UX26 fullscreen help declares modal focus entry, Tab containment, and Escape/click restoration',()=>{
 assert.match(ui,/function fullscreenHelp\(message\)\{[\s\S]*?dialog\.classList\.remove\('hidden'\);\$\('fullscreenHelpClose'\)\.focus\(/);
 const keydown=ui.slice(ui.indexOf("$('fullscreenHelp').addEventListener('keydown',event=>{"),ui.indexOf("$('fullscreenHelpClose').addEventListener('click'",ui.indexOf("$('fullscreenHelp').addEventListener('keydown',event=>{")));
 assert.match(keydown,/event\.key==='Escape'[\s\S]*?restoreFullscreenHelpFocus\(\)/);
 assert.match(keydown,/event\.key==='Tab'[\s\S]*?fullscreenHelpClose'[\s\S]*?\.focus\(/);
 assert.match(ui,/fullscreenHelpClose'\)\.addEventListener\('click',\(\)=>\{\$\('fullscreenHelp'\)\.classList\.add\('hidden'\);restoreFullscreenHelpFocus\(\);\}\)/);
});
