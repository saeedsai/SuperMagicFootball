'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function createTrainingCrossCoachState()');
const end=ui.indexOf('\nconst trainingCrossCoachState=',start);
assert.ok(start>=0&&end>start,'isolated Training Cross coach state exists');
const sandbox={};
vm.runInNewContext(ui.slice(start,end)+'\nthis.create=createTrainingCrossCoachState;',sandbox);

test('UX26 Training Arena coach waits for an airborne ball carrier and a real Cross event',()=>{
 const state=sandbox.create(),player={z:0};
 assert.equal(state.reset(true),'jump');
 assert.equal(state.update(player,true),'jump');
 player.z=24;
 assert.equal(state.update(player,false),'jump','airborne without possession is not the lesson step');
 assert.equal(state.update(player,true),'pass');
 assert.equal(state.observePass({team:1,loft:'cross'}),false,'the opposing player cannot complete this drill');
 assert.equal(state.observePass({team:0,loft:'long'}),false,'a normal long pass is not a Cross');
 player.z=0;
 assert.equal(state.update(player,true),'jump','landing returns the player to the first step');
 player.z=24;
 assert.equal(state.update(player,true),'pass');
 assert.equal(state.observePass({team:0,loft:'cross'}),true);
 assert.equal(state.stage(),'done');
 assert.equal(state.observePass({team:0,loft:'cross'}),false,'completion is only announced once');
 assert.equal(state.reset(false),'inactive');
});

test('UX26 Training Cross coach is a real-match, accessible Training Arena HUD guide',()=>{
 const hud=fs.readFileSync('index.html','utf8');
 assert.ok(/<p id="trainingCrossCoach" class="trainingCrossCoach hidden" role="status" aria-live="polite" aria-atomic="true"><\/p>/.test(hud),'HUD exposes a polite live status');
 assert.ok(/trainingCrossCoachState\.reset\(mode==='training'\)/.test(ui),'each kickoff initializes the coach only for Training Arena');
 assert.ok(/e\.type==='passIntent'&&game\.mode==='training'&&trainingCrossCoachState\.observePass\(e\)/.test(ui),'completion listens for the live cross-pass event');
 assert.ok(/game\.update\(dt\);updateTrainingCrossCoach\(\)/.test(ui),'coach reads live state after each fixed update');
 assert.ok(/game\.ball\.owner===player/.test(ui),'the coach requires possession');
 assert.ok(/press \$\{p1\.JUMP\} or JUMP to get airborne/.test(ui),'step one reflects the mapped JUMP key');
 assert.ok(/Press \$\{p1\.PASS\} or PASS now to send the Cross/.test(ui),'step two reflects the mapped PASS key');
 assert.ok(/if\(node\.textContent!==message\)node\.textContent=message/.test(ui),'live status is only announced when its text changes');
});
