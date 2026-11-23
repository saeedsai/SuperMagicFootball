'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

let AI;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 ({AI}=await import('../src/modules/ai.js'));
});
const bounds={xMin:100,xMax:2000,yMin:100,yMax:1300};
const player=(t,x,y,extra={})=>({t,x,y,keeper:false,down:false,stun:0,z:0,...extra});
const cover=(support,carrier,area=bounds,horizon=.12)=>
 AI.defensiveCarrierSupportCoverTarget(support,carrier,area,horizon);

test('stationary-carrier support cover preserves the exact existing goal-side offset in both directions',()=>{
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const support=player(team,1000-dir*150,800);
  const carrier=player(1-team,1000,700,{moveVY:0});
  assert.deepEqual(cover(support,carrier),{x:1000-dir*110,y:795});
 }
});

test('support cover projects lateral carrier movement while retaining its original side in both directions',()=>{
 const down=cover(player(0,850,800),player(1,1000,700,{moveVY:180}));
 const up=cover(player(1,1150,800),player(0,1000,700,{moveVY:-180}));
 assert.ok(Math.abs(down.y-816.6)<1e-9,JSON.stringify(down));
 assert.ok(Math.abs(up.y-773.4)<1e-9,JSON.stringify(up));
 assert.equal(down.x,890);
 assert.equal(up.x,1110);
});

test('support cover caps lateral prediction at 36 units and clamps to playable bounds',()=>{
 const fast=cover(player(0,850,800),player(1,1000,700,{moveVY:2000}),bounds,.18);
 assert.equal(fast.y,831);
 const edge=cover(player(0,850,1300),player(1,1000,1250,{moveVY:5000}));
 assert.equal(edge.y,1277);
});

test('missing movement velocity preserves the baseline and invalid or unavailable players fail closed',()=>{
 const support=player(0,850,800),carrier=player(1,1000,700,{moveVY:NaN,vy:NaN});
 assert.deepEqual(cover(support,carrier),{x:890,y:795});
 assert.equal(cover(support,{...carrier,t:0}),null,'same-team carrier is invalid');
 assert.equal(cover({...support,keeper:true},carrier),null,'keeper cannot be the outfield screen');
 assert.equal(cover(support,{...carrier,z:19}),null,'airborne carrier cannot drive grounded cover');
 assert.equal(cover(support,carrier,{xMin:100,xMax:100,yMin:100,yMax:1300}),null,'invalid bounds fail closed');
});
