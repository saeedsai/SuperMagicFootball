'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf('function keeperDiveAnimationSeconds(keeper){');
const end=source.indexOf('function keeperDiveRecoverySeconds(keeper){',start);
assert.ok(start>=0&&end>start,'keeper dive visual duration helper exists');
const duration=vm.runInNewContext('(function(stat,clamp){'+source.slice(start,end)+'return keeperDiveAnimationSeconds;})',{})((p,k)=>p[k],(v,a,b)=>Math.max(a,Math.min(b,v)));
test('skilled fresh keeper settles earlier than tired inexperienced keeper',()=>{
 const elite={gkSkill:95,gkDiving:95,fatigue:0};
 const novice={gkSkill:20,gkDiving:20,fatigue:1};
 assert.ok(duration(elite)<duration(novice));
 assert.ok(duration(elite)>=.54&&duration(novice)<=.78);
});
test('visual settle duration is bounded and does not replace dive cooldown',()=>{
 assert.ok(Math.abs(duration({gkSkill:100,gkDiving:100,fatigue:-10})-.56)<1e-9);
 assert.ok(duration({gkSkill:0,gkDiving:0,fatigue:99})<=.78);
 assert.match(source,/p\.diveCooldown=keeperDiveRecoverySeconds\(p\)/);
 assert.match(source,/p\.actionTimer=keeperDiveAnimationSeconds\(p\)/);
});
