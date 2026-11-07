// Focused property regressions for the existing Breath movement and local-owner rules.
// This file intentionally does not change production gameplay or release metadata.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const context = {};
vm.runInNewContext(read('src/modules/fitness.js').replace(/export \{FITNESS\};?/g, '') + '\nthis.F=FITNESS', context);
const F = context.F;

test('analog Breath input stays finite, bounded and monotonic across walk, jog and sprint', () => {
 for (const stat of [1, 35, 60, 100]) {
  const cap = F.breathCapacity(stat), start = cap * .6;
  for (const magnitude of [0, .14, .15, .25, .55, .56, .75, 1]) {
   const jog = F.breathMovementIntensity(magnitude);
   const sprint = F.breathMovementIntensity(magnitude, true);
   const hyper = F.breathMovementIntensity(magnitude, true, true);
   for (const intensity of [jog, sprint, hyper]) {
    assert.ok(Number.isFinite(intensity) && intensity >= 0 && intensity <= 1.8);
    const next = F.breathTick(start, stat, .2, intensity);
    assert.ok(Number.isFinite(next) && next >= 0 && next <= cap);
   }
   if (magnitude > .14) {
    assert.ok(sprint >= jog, 'sprint must never be cheaper than ordinary movement');
    assert.ok(F.breathTick(start, stat, .2, sprint) <= F.breathTick(start, stat, .2, jog));
   }
  }
 }
});

test('local Breath ring follows host/guest role changes without leaking to a remote or CPU player', () => {
 const render = read('src/modules/render.js');
 const match = render.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
 assert.ok(match, 'use the production renderer predicate');
 const show = vm.runInNewContext('(' + match[0] + ')');
 const players = [{t:0,i:1},{t:0,i:2},{t:1,i:1},{t:1,i:2}];
 let selected = [players[0], players[2]];
 const game = {humans:2, localBreathSide:0,
  inControl(t){return this.humans===2 || t===0;},
  controlledPlayer(t){return selected[t];}};
 for (const role of [0,1,0,1]) {
  game.localBreathSide = role;
  for (let switchIndex=0; switchIndex<2; switchIndex++) {
   selected = [players[switchIndex],players[2+switchIndex]];
   const visible = players.filter(p=>show(p,game,true));
   assert.equal(visible.length,1,'only one local human ring');
   assert.equal(visible[0],selected[role],'ring follows local selection immediately');
   assert.equal(show(selected[1-role],game,true),false,'remote ring hidden');
  }
 }
 game.localBreathSide=null; game.humans=1;
 assert.equal(show(selected[0],game,true),true,'solo human visible');
 assert.equal(show(selected[1],game,true),false,'CPU hidden');
 assert.equal(show(selected[0],game,false),false,'not visible outside live match');
});
