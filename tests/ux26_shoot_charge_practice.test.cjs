'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function createShootChargePracticeState()');
const end=ui.indexOf('\nconst passChargePracticeState=',start);
assert.ok(start>=0&&end>start,'isolated SHOOT-practice clock exists');
const sandbox={};
vm.runInNewContext(ui.slice(start,end)+'\nthis.create=createShootChargePracticeState;',sandbox);

test('UX26 SHOOT practice reports measured hold duration and clears on release',()=>{
 const state=sandbox.create();
 assert.equal(state.start('keyboard','KeyJ',100),true);
 assert.equal(state.elapsed(425),0.325);
 assert.equal(state.finish('keyboard','KeyJ',900),0.8);
 assert.equal(state.active(),false);
 assert.equal(state.finish('keyboard','KeyJ',1000),null);
});

test('UX26 SHOOT practice requires the matching source and pointer/key token',()=>{
 const state=sandbox.create();
 assert.equal(state.start('pointer',4,10),true);
 assert.equal(state.finish('pointer',5,20),null);
 assert.equal(state.finish('keyboard','KeyJ',20),null);
 assert.equal(state.finish('pointer',4,35),0.025);
});

test('UX26 SHOOT practice cancellation aborts without completing',()=>{
 const state=sandbox.create();
 assert.equal(state.start('pointer',11,0),true);
 assert.equal(state.cancel('pointer',12),false);
 assert.equal(state.cancel('pointer',11),true);
 assert.equal(state.finish('pointer',11,800),null);
 assert.equal(state.start('keyboard','KeyJ',1000),true);
 assert.equal(state.cancel(),true);
 assert.equal(state.active(),false);
});

test('UX26 SHOOT lesson is mapped, accessible and isolated from match actions',()=>{
 const helpStart=ui.indexOf('function showHelp('),helpEnd=ui.indexOf('\nfunction showEditor(',helpStart);
 const help=ui.slice(helpStart,helpEnd);
 assert.match(help,/GUIDED PRACTICE · SHOOT CHARGE/);
 assert.match(help,/mapped SHOOT key \(\$\{p1\.SHOOT\}\), then release/);
 assert.match(help,/id="shootChargePracticeStatus" class="muted" role="status" aria-live="polite" aria-atomic="true"/);
 assert.match(help,/id="shootChargePracticeElapsed" aria-live="off"/);
 assert.match(help,/data-shoot-charge-practice/);
 assert.match(ui,/profileIndex===0&&index===1\)\{startShootChargePractice\('keyboard',event\.code\);return;\}/);
 assert.match(ui,/document\.addEventListener\('pointerup',[\s\S]*?finishShootChargePractice\('pointer'/);
 assert.match(ui,/document\.addEventListener\('pointercancel',[\s\S]*?cancelShootChargePractice\('pointer'/);
 assert.match(ui,/document\.addEventListener\('lostpointercapture',[\s\S]*?cancelShootChargePractice\('pointer'/);
 assert.match(ui,/window\.addEventListener\('blur',cancelControlsChargePractice\)/);
 assert.match(ui,/document\.addEventListener\('visibilitychange',[\s\S]*?cancelControlsChargePractice\(\)/);
 const implementation=ui.slice(start,ui.indexOf('\nfunction showHelp(',start));
 assert.doesNotMatch(implementation,/\b(?:game|input)\b/i,'practice clock never accesses match state or gameplay input');
 assert.match(help,/This lesson does not send a shot or start a match\./);
});
