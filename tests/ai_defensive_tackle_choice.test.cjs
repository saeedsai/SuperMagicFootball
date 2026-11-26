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



test('CPU exposed-ball slide lead respects carrier Agility without changing human slides or PASS pokes',()=>{
 const slideAim=(team,agility,withLiveBall=true,carrierVY=200,turnInput=true)=>{
  const dir=team===0?1:-1;
  const defender=player(team,1000,700,{moveVX:dir*220,moveVY:0,dx:dir,dy:0,face:dir,
   src:{id:'slide-lead-defender',role:'DF',speedRating:50,defence:50}});
  const carrier=player(1-team,1000+dir*55,700,{moveVX:0,moveVY:carrierVY,dx:turnInput?dir:0,dy:0,src:{agility}});
  const liveBall={owner:carrier,x:carrier.x-dir*17,y:carrier.y+20,z:12};
  assert.equal(ENGINE.GameEngine.prototype.defensivePokeBallSideRead.call({},defender,carrier,liveBall),true,'fixture must expose the carried ball');
  const game={players:[defender,carrier],ball:{owner:carrier},spendStamina(){},
   playerSpeed(){return 320;},emit(){},slideContact(){}};
  assert.equal(ENGINE.GameEngine.prototype.tackle.call(game,defender,true,withLiveBall?liveBall:null),true);
  return {x:defender.slideDX,y:defender.slideDY};
 };
 const pokeAim=(team,agility)=>{
  const dir=team===0?1:-1;
  const defender=player(team,1000,700,{moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,
   src:{id:'poke-lead-defender',role:'DF',speedRating:50,defence:50}});
  const carrier=player(1-team,1000+dir*55,700,{moveVX:0,moveVY:200,src:{agility}});
  const liveBall={owner:carrier,x:carrier.x-dir*17,y:carrier.y+20,z:12};
  const game={players:[defender,carrier],ball:{owner:carrier},spendStamina(){},emit(){},slideContact(){}};
  const originalRandom=Math.random;Math.random=()=>1;
  try{assert.equal(ENGINE.GameEngine.prototype.tackle.call(game,defender,false,liveBall),true);}
  finally{Math.random=originalRandom;}
  return {x:defender.x-1000,y:defender.y-700};
 };
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const elite=slideAim(team,100),average=slideAim(team,50),low=slideAim(team,1);
  assert.ok(elite.y<average.y&&average.y<low.y,JSON.stringify({team,elite,average,low}));
  assert.ok(dir*elite.x>dir*average.x&&dir*average.x>dir*low.x,
   'the slide must lead farther into the live forward turn for higher-Agility carriers');
  const neutralElite=slideAim(team,100,true,200,false),neutralLow=slideAim(team,1,true,200,false);
  const expectedNeutral=agility=>{
   const horizon=Math.max(.07,Math.min(.10,.085+(50-agility)*.0003));
   const x=dir*38,y=20+200*horizon,length=Math.hypot(x,y);
   return {x:x/length,y:y/length};
  };
  for(const [agility,actual] of [[100,neutralElite],[1,neutralLow]]){
   const expected=expectedNeutral(agility);
   assert.ok(Math.abs(actual.x-expected.x)<1e-12&&Math.abs(actual.y-expected.y)<1e-12,
    'neutral input must retain the prior straight-line lead, including the existing Agility horizon');
  }
  assert.ok(Math.abs(slideAim(team,undefined).y-average.y)<1e-12,'missing Agility uses the 85 ms baseline');
  assert.ok(Math.abs(slideAim(team,NaN).y-average.y)<1e-12,'invalid Agility uses the 85 ms baseline');
  const bodyElite=slideAim(team,100,false),bodyLow=slideAim(team,1,false);
  assert.ok(Math.abs(bodyElite.y-bodyLow.y)<1e-12,'slides without a validated live ball retain the human/contextual baseline');
  const cappedElite=slideAim(team,100,true,10000),cappedLow=slideAim(team,1,true,10000);
  assert.ok(Math.abs(cappedElite.y-cappedLow.y)<1e-12,'the existing 22-unit lead cap remains authoritative');
  const elitePoke=pokeAim(team,100),lowPoke=pokeAim(team,1);
  assert.ok(Math.abs(elitePoke.y-lowPoke.y)<1e-12,'ordinary PASS pokes keep their 55 ms lead');
 }
});
