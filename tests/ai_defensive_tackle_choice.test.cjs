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

test('Agility tunes only the lateral-cut SHOOT-slide read in both directions',()=>{
 for(const dir of [1,-1]){
  const defendingTeam=dir===1?0:1;
  const decide=(agility,crossing=100,straight=false)=>{
   const defender=player(defendingTeam,1000,700,{moveVX:dir*110,moveVY:0,
    dx:dir,dy:0,face:dir,src:{agility}});
   const carrier=player(1-defendingTeam,1000+dir*60,700,{
    moveVX:straight?dir*300:dir*40,moveVY:straight?0:crossing
   });
   return AI.defensiveTackleSlide(defender,carrier,160);
  };
  assert.equal(decide(100),true,'elite Agility reads a 100-unit lateral cut');
  assert.equal(decide(50),false,'average Agility retains the exact 105-unit baseline');
  assert.equal(decide(20),false,'low Agility keeps the more conservative cut read');
  assert.equal(decide(1,120),true,'a sufficiently clear cut remains eligible at low Agility');
  assert.equal(decide(undefined),false,'missing Agility falls back to the average threshold');
  assert.equal(decide(NaN),false,'invalid Agility falls back to the average threshold');
  assert.equal(decide(1,0,true),true,'straight escaping carriers remain eligible independent of Agility');
  assert.equal(decide(100,0,true),true,'elite Agility does not change the straight escape branch');
 }
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
 const marker='defensiveTackleSlideBallSideRead(p,owner,liveBall,this.playerSpeed(p))';
 assert.equal(engineSource.split(marker).length-1,2,
  'both CPU tackle paths must use the shared run-up/relative-motion and live-ball decision');
 assert.ok(engineSource.includes('carrierDistance<=98&&defensivePokeBallSideRead(p,owner,liveBall)&&defensiveFirstTouchSlide(p,owner,this.playerSpeed(p))'),
  'the pressured first-touch slide must also require an exposed live ball');
 assert.ok(engineSource.includes('GameEngine.prototype.defensiveTackleSlideBallSideRead=defensiveTackleSlideBallSideRead;'));
 assert.ok(engineSource.includes('distance(p,owner)<68'));
 assert.ok(engineSource.includes('carrierDistance<74'));
 assert.ok(engineSource.includes('const slideRoll=Math.random();'));
 assert.ok(engineSource.includes('const mx=Number.isFinite(p.dx)?p.dx:0,my=Number.isFinite(p.dy)?p.dy:0;'),
  'the helper must preserve the engine contact arc and add momentum as a separate requirement');
 assert.equal((engineSource.match(/this\.cpuTackleSlideChance\(p,ai\.anticipation/g)||[]).length,2,
  'ordinary and primary press slide decisions must both use the player-aware threshold');
});

function slideChance(...args){return ENGINE.GameEngine.prototype.cpuTackleSlideChance.call({},...args);}
function slideProfile(defence,aggression,fatigue=0){return {fatigue,src:{id:'slide-'+defence+'-'+aggression,role:'DF',defence,aggression}};}

test('CPU slide choice scales with defender Defence, Aggression and fatigue while preserving rested baselines',()=>{
 const neutral=slideChance(slideProfile(50,50,0),.5,.24,.4);
 const low=slideChance(slideProfile(20,20,0),.5,.24,.4);
 const high=slideChance(slideProfile(90,90,0),.5,.24,.4);
 const primaryNeutral=slideChance(slideProfile(50,50,0),.5,.17,.35);
 const halfFatigue=slideChance(slideProfile(50,50,.5),.5,.24,.4);
 const fullFatigue=slideChance(slideProfile(50,50,1),.5,.24,.4);
 const primaryFullFatigue=slideChance(slideProfile(50,50,1),.5,.17,.35);
 assert.equal(neutral,.44,'rested average defenders retain the previous Normal baseline');
 assert.equal(primaryNeutral,.345,'rested primary pressers retain their previous baseline');
 assert.ok(low<neutral&&neutral<high,JSON.stringify({low,neutral,high}));
 assert.ok(halfFatigue<neutral&&fullFatigue<halfFatigue,JSON.stringify({neutral,halfFatigue,fullFatigue}));
 assert.ok(Math.abs(halfFatigue-.4025)<1e-9&&Math.abs(fullFatigue-.365)<1e-9,JSON.stringify({halfFatigue,fullFatigue}));
 assert.ok(Math.abs(primaryFullFatigue-.27)<1e-9,'fatigue also tempers the primary-presser slide baseline');
 assert.equal(slideChance(slideProfile(50,50,NaN),.5,.24,.4),neutral,'invalid fatigue falls back to rested behavior');
 assert.equal(slideChance(slideProfile(50,50,2),.5,.24,.4),fullFatigue,'fatigue above one is clamped');
 assert.ok(slideChance(slideProfile(50,50,-1),.5,.24,.4)===neutral,'negative fatigue is clamped');
});

test('CPU slide preference remains bounded for extreme profiles and tuning inputs',()=>{
 const low=slideChance(slideProfile(1,1),0,-5,-2);
 const high=slideChance(slideProfile(100,100),1,2,2);
 assert.equal(low,.12);
 assert.equal(high,.76);
});

