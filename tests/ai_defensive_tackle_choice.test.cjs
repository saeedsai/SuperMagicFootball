'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

let AI,ENGINE;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const [{AI:ai},{ENGINE:engine}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 AI=ai;ENGINE=engine;
});

const player=(t,x,y,extra={})=>({t,x,y,keeper:false,stun:0,invuln:0,down:false,z:0,...extra});

test('run-up slide reads an escaping carrier in either attacking direction',()=>{
 for(const dir of [1,-1]){
  const defender=player(0,1000,700,{moveVX:dir*220,moveVY:0,dx:dir,dy:0,face:dir});
  const carrier=player(1,1000+dir*60,700,{moveVX:dir*300,moveVY:0});
  assert.equal(AI.defensiveTackleSlide(defender,carrier,250),true);
 }
});

test('a carrier not escaping while the defender closes is met with a short poke',()=>{
 const defender=player(0,1000,700,{moveVX:220,moveVY:0,dx:1,dy:0,face:1});
 const carrier=player(1,1060,700,{moveVX:0,moveVY:0});
 assert.equal(AI.defensiveTackleSlide(defender,carrier,250),false);
});

test('a running defender can slide across a lateral cut when relative closure is bounded',()=>{
 const defender=player(0,1000,700,{moveVX:110,moveVY:0,dx:1,dy:0,face:1});
 const carrier=player(1,1060,700,{moveVX:40,moveVY:190});
 assert.equal(AI.defensiveTackleSlide(defender,carrier,160),true);
});

test('retreating and side-on run-ups keep the short poke; a diagonal forward run-up can still slide',()=>{
 const carrier=player(1,1060,700,{moveVX:300,moveVY:0});
 const retreating=player(0,1000,700,{moveVX:-220,moveVY:0,dx:-1,dy:0,face:-1});
 const sideOn=player(0,1000,700,{moveVX:0,moveVY:220,dx:0,dy:1,face:1});
 const diagonal=player(0,1000,700,{moveVX:160,moveVY:160,dx:1,dy:1,face:1});
 const diagonalCarrier=player(1,1042,742,{moveVX:300,moveVY:300});
 assert.equal(AI.defensiveTackleSlide(retreating,carrier,250),false);
 assert.equal(AI.defensiveTackleSlide(sideOn,{...carrier,moveVX:300,moveVY:190},250),false);
 assert.equal(AI.defensiveTackleSlide(diagonal,diagonalCarrier,250),true);
 const facingFallback=player(0,1000,700,{moveVX:220,moveVY:0,dx:0,dy:0,face:1});
 assert.equal(AI.defensiveTackleSlide(facingFallback,carrier,250),true);
});

test('slide alignment follows actual momentum when direction input or facing is stale',()=>{
 const retreatingMomentum=player(0,1000,700,{moveVX:-220,moveVY:0,dx:1,dy:0,face:1});
 const forwardCarrier=player(1,1060,700,{moveVX:300,moveVY:0});
 assert.equal(AI.defensiveTackleSlide(retreatingMomentum,forwardCarrier,250),false,
  'forward input and facing cannot override actual retreating momentum');

 const diagonalMomentum=player(0,1000,700,{moveVX:160,moveVY:120,dx:0,dy:0,face:1});
 const diagonalCarrier=player(1,1048,736,{moveVX:300,moveVY:225});
 assert.equal(AI.defensiveTackleSlide(diagonalMomentum,diagonalCarrier,250),true,
  'diagonal momentum remains eligible when the existing facing fallback enters the tackle arc');

 const sideInput=player(0,1000,700,{moveVX:220,moveVY:0,dx:0,dy:1,face:1});
 assert.equal(AI.defensiveTackleSlide(sideInput,forwardCarrier,250),false,
  'forward momentum cannot override a side-on input arc used by actual tackle contact');
});

test('standing defenders, very close contact and invalid or unavailable carriers keep the poke',()=>{
 const running=player(0,1000,700,{moveVX:240,moveVY:0,dx:1,dy:0,face:1});
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
 assert.ok(engineSource.includes('const mx=Number.isFinite(p.dx)?p.dx:0,my=Number.isFinite(p.dy)?p.dy:0;'),
  'the helper must preserve the engine contact arc and add momentum as a separate requirement');
 assert.equal((engineSource.match(/this\.cpuTackleSlideChance\(p,ai\.anticipation/g)||[]).length,2,
  'ordinary and primary press slide decisions must both use the player-aware threshold');
});

const slideGame=Object.create(ENGINE.GameEngine.prototype);
function slideChance(...args){return slideGame.cpuTackleSlideChance(...args);}
function slideProfile(defence,aggression){return {src:{id:'slide-'+defence+'-'+aggression,role:'DF',defence,aggression}};}

test('CPU slide choice scales with defender Defence and Aggression while preserving neutral AI baselines',()=>{
 const neutral=slideChance(slideProfile(50,50),.5,.24,.4);
 const low=slideChance(slideProfile(20,20),.5,.24,.4);
 const high=slideChance(slideProfile(90,90),.5,.24,.4);
 const primaryNeutral=slideChance(slideProfile(50,50),.5,.17,.35);
 assert.equal(neutral,.44,'average defenders retain the previous Normal baseline');
 assert.equal(primaryNeutral,.345,'primary pressers retain their previous baseline');
 assert.ok(low<neutral&&neutral<high,JSON.stringify({low,neutral,high}));
 assert.ok(slideChance(slideProfile(50,50),NaN,.24,.4)===neutral,
  'invalid anticipation uses the neutral fallback');
});

test('CPU slide preference remains bounded for extreme profiles and tuning inputs',()=>{
 const low=slideChance(slideProfile(1,1),0,-5,-2);
 const high=slideChance(slideProfile(100,100),1,2,2);
 assert.equal(low,.12);
 assert.equal(high,.76);
});

