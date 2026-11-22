'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ai=fs.readFileSync('src/modules/ai.js','utf8');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const helperStart=ai.indexOf('function keeperOutletLane(');
const helperEnd=ai.indexOf('function keeperShotReadY(',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'keeperOutletLane helper exists');
const keeperOutletLane=vm.runInNewContext('(function(){'+ai.slice(helperStart,helperEnd)+';return keeperOutletLane;})()', {});
const start=source.indexOf(' keeperPassingLane(p,q,flightSpeed=480,receiverLeadSeconds=null){');
const end=source.indexOf('\n keeperClearanceTarget(',start);
assert.ok(start>=0&&end>start,'keeperPassingLane production method exists');
const method=source.slice(start,end);
const run=vm.runInNewContext('(function(players,p,q,flightSpeed=480,receiverLeadSeconds=null){const obj={'+method.trim()+'};return obj.keeperPassingLane(p,q,flightSpeed,receiverLeadSeconds);})',{keeperOutletLane});
const p={t:0,x:0,y:0},target={x:300,y:0};
const defender=(overrides={})=>({t:1,keeper:false,stun:0,x:150,y:0,z:0,...overrides});
test('grounded active defender blocks keeper roll lane',()=>assert.equal(run([defender()],p,target).clear,false));
test('high jumping defender does not block ground rollout',()=>assert.equal(run([defender({z:75})],p,target).clear,true));
test('downed and recovering defenders do not block rollout',()=>{
 assert.equal(run([defender({down:true})],p,target).clear,true);
 assert.equal(run([defender({shotImpactKnockdownTimer:.3})],p,target).clear,true);
});
test('stunned defender does not block rollout',()=>assert.equal(run([defender({stun:.4})],p,target).clear,true));
test('low jump and missing height retain interception behavior',()=>{
 assert.equal(run([defender({z:12})],p,target).clear,false);
 assert.equal(run([defender({z:undefined})],p,target).clear,false);
});
