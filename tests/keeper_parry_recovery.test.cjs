'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadEngine(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {ENGINE}=await import('../src/modules/engine.js');
 return ENGINE;
}
function fixture(ENGINE,team,speed,power,profile=null){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,humans:0,mode:'quick'});
 const keeper=game.player(team,0),direction=team===0?-1:1;
 Object.assign(keeper,{stun:0,diveCooldown:0,diveIntentCooldown:0,
  diveIntentPending:false,fatigue:.15,z:0});
 if(profile){
  const src={...keeper.src,gkSkill:50,gkDiving:50};
  if(Object.hasOwn(profile,'agility'))src.agility=profile.agility;
  else delete src.agility;
  keeper.src=src;
 }
 Object.assign(game.ball,{owner:null,attacker:1-team,
  x:keeper.x-direction*24,y:keeper.y,z:0,vx:direction*speed,vy:0,vz:0,
  power,ordinaryShot:true,shot:null,strike:null,age:.2,canCollect:0,trail:[]});
 return {game,keeper,direction};
}

test('a parried save shortens the next-dive recovery on both sides without skipping the get-up pose',async()=>{
 const ENGINE=await loadEngine();
 for(const team of [0,1]){
  const caught=fixture(ENGINE,team,700,0);
  assert.equal(caught.game.tryKeeperDive(caught.keeper,false),true,'clean catch');
  assert.equal(caught.game.ball.owner,caught.keeper);
  const catchCooldown=caught.keeper.diveCooldown;

  const parried=fixture(ENGINE,team,2500,60);
  assert.equal(parried.game.tryKeeperDive(parried.keeper,false),true,'strong shot is parried');
  assert.equal(parried.game.ball.owner,null);
  assert.equal(parried.game.ball.attacker,team,'parry changes the ball to the keeper team');
  assert.equal(Math.sign(parried.game.ball.vx),-parried.direction,'rebound travels back into the field');
  const parryCooldown=parried.keeper.diveCooldown;
  const reduction=catchCooldown-parryCooldown;
  assert.ok(reduction>=.12-1e-6&&reduction<=.30+1e-6,
   'parry recovery discount stays bounded');
  assert.ok(parryCooldown>=parried.keeper.actionTimer+.34+.06-1e-6,
   'the keeper must finish the dive and get-up pose before another save is available');
 }
});


test('keeper Agility changes only post-parry scramble recovery and preserves the get-up floor',async()=>{
 const ENGINE=await loadEngine();
 for(const team of [0,1]){
  const parry=profile=>{
   const f=fixture(ENGINE,team,2500,60,profile);
   assert.equal(f.game.tryKeeperDive(f.keeper,false),true,'strong shot must be parried');
   assert.equal(f.game.ball.owner,null);
   assert.equal(f.game.ball.attacker,team);
   return {cooldown:f.keeper.diveCooldown,actionTimer:f.keeper.actionTimer};
  };
  const low=parry({agility:1}),average=parry({agility:50}),high=parry({agility:100});
  const missing=parry({}),invalid=parry({agility:NaN});
  assert.ok(high.cooldown<average.cooldown&&average.cooldown<low.cooldown,
   JSON.stringify({team,low,average,high}));
  assert.equal(missing.cooldown,invalid.cooldown,'missing and invalid Agility retain the same STATS-inferred fallback');
  assert.ok(missing.cooldown>=high.cooldown&&missing.cooldown<=low.cooldown,
   'inferred Agility remains within the low/high recovery bounds');
  for(const sample of [low,average,high,missing,invalid])
   assert.ok(sample.cooldown>=sample.actionTimer+.34+.06-1e-6,
    JSON.stringify({team,sample}));
  const catchLow=fixture(ENGINE,team,700,0,{agility:1});
  const catchHigh=fixture(ENGINE,team,700,0,{agility:100});
  assert.equal(catchLow.game.tryKeeperDive(catchLow.keeper,false),true);
  assert.equal(catchHigh.game.tryKeeperDive(catchHigh.keeper,false),true);
  assert.equal(catchLow.game.ball.owner,catchLow.keeper);
  assert.equal(catchHigh.game.ball.owner,catchHigh.keeper);
  assert.equal(catchLow.keeper.diveCooldown,catchHigh.keeper.diveCooldown,
   'Agility must not alter clean-catch recovery');
 }
});
