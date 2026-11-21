'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

let AI;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 ({AI}=await import('../src/modules/ai.js'));
});

const player=(t,x,y,extra={})=>({t,x,y,keeper:false,stun:0,invuln:0,down:false,z:0,...extra});

test('run-up slide reads an escaping carrier in either attacking direction',()=>{
 for(const dir of [1,-1]){
  const defender=player(0,1000,700,{moveVX:dir*220,moveVY:0});
  const carrier=player(1,1000+dir*60,700,{moveVX:dir*300,moveVY:0});
  assert.equal(AI.defensiveTackleSlide(defender,carrier,250),true);
 }
});

test('a carrier not escaping while the defender closes is met with a short poke',()=>{
 const defender=player(0,1000,700,{moveVX:220,moveVY:0});
 const carrier=player(1,1060,700,{moveVX:0,moveVY:0});
 assert.equal(AI.defensiveTackleSlide(defender,carrier,250),false);
});

test('a running defender can slide across a lateral cut when relative closure is bounded',()=>{
 const defender=player(0,1000,700,{moveVX:110,moveVY:0});
 const carrier=player(1,1060,700,{moveVX:40,moveVY:190});
 assert.equal(AI.defensiveTackleSlide(defender,carrier,160),true);
});

test('standing defenders, very close contact and invalid or unavailable carriers keep the poke',()=>{
 const running=player(0,1000,700,{moveVX:240,moveVY:0});
 const escaping=player(1,1060,700,{moveVX:320,moveVY:0});
 assert.equal(AI.defensiveTackleSlide({...running,moveVX:0,moveVY:0},escaping,250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,x:1040},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,z:25},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,invuln:.3},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,down:true},250),false);
 assert.equal(AI.defensiveTackleSlide(running,{...escaping,x:Infinity},250),false);
});

const engineSource=fs.readFileSync('src/modules/engine.js','utf8');

test('driveAI routes both ordinary and primary press tackles through movement-aware slide selection',()=>{
 const marker='defensiveTackleSlide(p,owner,this.playerSpeed(p))';
 assert.equal(engineSource.split(marker).length-1,2,
  'both CPU tackle paths must use the shared run-up/relative-motion decision');
 assert.ok(engineSource.includes('distance(p,owner)<68'));
 assert.ok(engineSource.includes('carrierDistance<74'));
 assert.ok(engineSource.includes('carrierDistance<=98&&defensiveFirstTouchSlide(p,owner,this.playerSpeed(p))'));
 assert.ok(engineSource.includes('const slideRoll=Math.random();'));
});
