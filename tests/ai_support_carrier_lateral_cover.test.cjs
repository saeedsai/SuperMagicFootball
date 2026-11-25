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

test('support cover projects forward and retreating carrier runs in both defending directions',()=>{
 const forward=cover(player(0,850,800),player(1,1000,700,{moveVX:180}));
 const retreat=cover(player(1,1150,800),player(0,1000,700,{moveVX:-180}));
 assert.ok(Math.abs(forward.x-911.6)<1e-9,JSON.stringify(forward));
 assert.ok(Math.abs(retreat.x-1088.4)<1e-9,JSON.stringify(retreat));
 assert.equal(forward.y,795);
 assert.equal(retreat.y,795);
});

test('support cover projects diagonal movement on both axes and caps each lead independently',()=>{
 const diagonal=cover(player(0,850,800),player(1,1000,700,{moveVX:180,moveVY:180}));
 assert.ok(Math.abs(diagonal.x-911.6)<1e-9,JSON.stringify(diagonal));
 assert.ok(Math.abs(diagonal.y-816.6)<1e-9,JSON.stringify(diagonal));
 const capped=cover(player(0,850,800),player(1,1000,700,{moveVX:2000,moveVY:2000}),bounds,.18);
 assert.equal(capped.x,926);
 assert.equal(capped.y,831);
});

test('support cover keeps the projected goal-side screen inside bounds at both field edges',()=>{
 const left=cover(player(0,110,800),player(1,110,700,{moveVX:-2000}),bounds,.18);
 const right=cover(player(1,1990,800),player(0,1990,700,{moveVX:2000}),bounds,.18);
 assert.equal(left.x,233);
 assert.equal(right.x,1867);
 assert.ok(left.x>=bounds.xMin+22&&left.x<=bounds.xMax-22);
 assert.ok(right.x>=bounds.xMin+22&&right.x<=bounds.xMax-22);
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


test('support cover stays on the defender side when a lateral cut crosses its current flank',()=>{
 for(const team of [0,1]){
  const goalDir=team===0?1:-1,lateralDir=team===0?1:-1;
  const support=player(team,1000-goalDir*150,700+lateralDir*10);
  const carrier=player(1-team,1000,700,{moveVY:lateralDir*180});
  const projectedY=700+lateralDir*21.6;
  const expectedSide=Math.sign(support.y-projectedY);
  const target=cover(support,carrier);
  assert.ok(target,JSON.stringify({team,target}));
  assert.equal(Math.sign(target.y-projectedY),expectedSide,
   'cover target must remain on the support defender side of the projected carrier');
  assert.ok(Math.abs(target.y-(projectedY+expectedSide*95))<1e-9,JSON.stringify({team,target,projectedY}));
  assert.equal(target.x,1000-goalDir*110);
 }
});

test('moving-carrier support selection protects the opposite projected flank and keeps stationary parity',()=>{
 for(const team of [0,1]){
  const goalSide=team===0?-1:1,lateralDir=team===0?1:-1;
  const carrier=player(1-team,1000,700,{moveVY:lateralDir*220});
  const primary=player(team,1000+goalSide*40,700-lateralDir*20);
  const nearSameProjectedFlank=player(team,1000+goalSide*60,700+lateralDir*1);
  const fartherOppositeProjectedFlank=player(team,1000+goalSide*100,700+lateralDir*50);
  const moving=AI.defensivePressers([primary,nearSameProjectedFlank,fartherOppositeProjectedFlank],team,carrier);
  assert.equal(moving.primary,primary,'nearest arrival remains the primary presser');
  assert.equal(moving.support,fartherOppositeProjectedFlank,
   'support should protect the opposite side after a 26.4-unit projected lateral cut');
  const stationary=AI.defensivePressers(
   [primary,nearSameProjectedFlank,fartherOppositeProjectedFlank],team,{...carrier,moveVY:0});
  assert.equal(stationary.primary,primary);
  assert.equal(stationary.support,nearSameProjectedFlank,
   'stationary-carrier support selection retains the existing nearest-flank baseline');
 }
});
