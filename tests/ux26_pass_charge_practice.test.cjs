'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function createPassChargePracticeState()');
const end=ui.indexOf('\nconst passChargePracticeState=',start);
assert.ok(start>=0&&end>start,'isolated PASS-practice clock exists');
const sandbox={};
vm.runInNewContext(ui.slice(start,end)+'\nthis.create=createPassChargePracticeState;',sandbox);

test('UX26 PASS practice reports measured elapsed time without a threshold',()=>{
 const state=sandbox.create();
 assert.equal(state.start('keyboard','KeyK',100),true);
 assert.equal(state.active(),true);
 assert.equal(state.elapsed(250),0.15);
 assert.equal(state.finish('keyboard','KeyK',625),0.525);
 assert.equal(state.active(),false);
 assert.equal(state.finish('keyboard','KeyK',700),null);
});

test('UX26 PASS practice matches its input source and token before completing',()=>{
 const state=sandbox.create();
 assert.equal(state.start('pointer',7,10),true);
 assert.equal(state.start('keyboard','KeyK',11),false,'one active gesture at a time');
 assert.equal(state.finish('pointer',8,20),null,'another pointer cannot finish this hold');
 assert.equal(state.finish('keyboard','KeyK',20),null,'another input source cannot finish this hold');
 assert.equal(state.finish('pointer',7,30),0.02);
});

test('UX26 PASS practice cancellation aborts without reporting a duration',()=>{
 const state=sandbox.create();
 assert.equal(state.start('pointer',9,0),true);
 assert.equal(state.cancel('pointer',8),false,'unrelated pointer does not cancel');
 assert.equal(state.cancel('pointer',9),true);
 assert.equal(state.finish('pointer',9,1000),null,'cancelled hold cannot complete');
 assert.equal(state.start('keyboard','KeyK',2000),true,'a fresh practice can start after cancellation');
 assert.equal(state.cancel(),true,'global cancellation clears any active source');
});

test('UX26 help exposes isolated accessible PASS hold/release practice and cancellation hooks',()=>{
 const helpStart=ui.indexOf('function showHelp('),helpEnd=ui.indexOf('\nfunction showEditor(',helpStart);
 const help=ui.slice(helpStart,helpEnd);
 assert.match(help,/GUIDED PRACTICE · PASS CHARGE/);
 assert.match(help,/mapped PASS key \(\$\{p1\.PASS\}\), then release/);
 assert.match(help,/role="status" aria-live="polite" aria-atomic="true"/);
 assert.match(help,/id="passChargePracticeElapsed" aria-live="off"/);
 assert.match(help,/data-pass-charge-practice/);
 assert.match(ui,/menu\.addEventListener\('pointerdown',[\s\S]*?\[data-pass-charge-practice/);
 assert.match(ui,/document\.addEventListener\('pointerup',[\s\S]*?finishPassChargePractice\('pointer'/);
 assert.match(ui,/document\.addEventListener\('pointercancel',[\s\S]*?cancelPassChargePractice\('pointer'/);
 assert.match(ui,/document\.addEventListener\('lostpointercapture',[\s\S]*?cancelPassChargePractice\('pointer'/);
 assert.match(ui,/window\.addEventListener\('blur',cancelControlsChargePractice\)/);
 assert.match(ui,/document\.addEventListener\('visibilitychange',[\s\S]*?cancelControlsChargePractice\(\)/);
 assert.match(ui,/profileIndex===0&&index===0\)\{startPassChargePractice\('keyboard',event\.code\);return;\}/);
 assert.match(ui,/if\(isPass&&finishPassChargePractice\('keyboard',event\.code\)\)updateGuidedHelpPractice\('pass'\)/,'the keyboard Cross step waits until PASS release');
 assert.match(ui,/screen==='CONTROLS'&&title!=='CONTROLS'\)cancelControlsChargePractice\(\)/,'leaving Controls cancels charge practices');
 assert.match(ui,/const show=\(html,id='home'\)=>\{if\(screen==='CONTROLS'&&id!=='CONTROLS'\)cancelControlsChargePractice\(\);[\s\S]*?screen=id;[\s\S]*?menu\.classList\.remove\('hidden','blank'\);[\s\S]*?menu\.innerHTML=/,'the shared show() path cancels before replacing the Controls DOM');
 const implementation=ui.slice(ui.indexOf('function createPassChargePracticeState()'),ui.indexOf('\nfunction showHelp(',ui.indexOf('function createPassChargePracticeState()')));
 assert.doesNotMatch(implementation,/\b(?:game|input)\b/i,'practice handlers do not touch game or gameplay input state');
 assert.match(help,/This lesson does not send a pass or start a match\./);
});
