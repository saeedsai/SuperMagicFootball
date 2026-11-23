'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadEngine(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {ENGINE}=await import('../src/modules/engine.js');
 return ENGINE;
}

function diveTrial(ENGINE,{team=0,fatigue=0,speed=1900,gkSkill=50,gkDiving=50}={}){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0,options:{weather:'Clear',halfSeconds:120}});
 const field=ENGINE.WORLD.field,dir=team===0?1:-1,keeper=game.player(team,0);
 Object.assign(keeper,{x:dir===1?field.x+55:field.x+field.w-55,y:field.y+field.h/2,
  action:'idle',actionTimer:0,stun:0,down:false,z:0,diveCooldown:0,
  diveIntentCooldown:0,diveIntentPending:false,fatigue});
 keeper.src={...keeper.src,gkSkill,gkDiving};
 for(const q of game.players){
  if(q===keeper||q.keeper)continue;
  Object.assign(q,{x:keeper.x-dir*500,y:keeper.y+260,z:0,stun:0,down:false,
   action:'idle',actionTimer:0});
 }
 Object.assign(game.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,
  x:keeper.x+dir*30,y:keeper.y+12,z:20,vx:-dir*speed,vy:0,vz:0,power:0,
  ordinaryShot:true,shot:null,strike:null,pass:false,age:.15,canCollect:0,trail:[]});
 game.events.length=0;
 const committed=game.tryKeeperDive(keeper,false);
 const saves=game.events.filter(event=>event.type==='save');
 return {committed,ownerIsKeeper:game.ball.owner===keeper,
  deflected:saves[0]?.deflected===true,saveCount:saves.length,
  catchCount:game.events.filter(event=>event.type==='keeperCatch').length,
  ballAttacker:game.ball.attacker};
}

test('rested keeper preserves catch quality while fatigue turns borderline shots into parries on both goals',async()=>{
 const ENGINE=await loadEngine();
 for(const team of [0,1]){
  const rested=diveTrial(ENGINE,{team,fatigue:0,speed:1900});
  const half=diveTrial(ENGINE,{team,fatigue:.5,speed:1900});
  const tired=diveTrial(ENGINE,{team,fatigue:1,speed:1900});
  const harderRested=diveTrial(ENGINE,{team,fatigue:0,speed:1950});
  const harderHalf=diveTrial(ENGINE,{team,fatigue:.5,speed:1950});
  for(const [name,result] of [['rested',rested],['half',half],['tired',tired],
   ['harder-rested',harderRested],['harder-half',harderHalf]]){
   assert.equal(result.committed,true,team+': '+name+' shot should reach the keeper');
   assert.equal(result.saveCount,1,team+': '+name+' should resolve exactly one save');
  }
  for(const result of [rested,half,harderRested]){
   assert.equal(result.ownerIsKeeper,true,team+': rested/borderline shot should be caught');
   assert.equal(result.deflected,false);
   assert.equal(result.catchCount,1);
  }
  for(const result of [tired,harderHalf]){
   assert.equal(result.ownerIsKeeper,false,team+': fatigue should convert only the stronger borderline shot to a parry');
   assert.equal(result.deflected,true);
   assert.equal(result.catchCount,0);
   assert.equal(result.ballAttacker,team);
  }
 }
});

test('keeper fatigue is bounded and invalid fatigue retains the rested catch baseline',async()=>{
 const ENGINE=await loadEngine();
 for(const team of [0,1]){
  for(const fatigue of [NaN,-1]){
   const result=diveTrial(ENGINE,{team,fatigue,speed:1900});
   assert.equal(result.ownerIsKeeper,true,team+': invalid/negative fatigue must not penalize catching');
   assert.equal(result.deflected,false);
  }
  const over=diveTrial(ENGINE,{team,fatigue:2,speed:1900});
  assert.equal(over.ownerIsKeeper,false,team+': fatigue above one must clamp to the full-fatigue threshold');
  assert.equal(over.deflected,true);
 }
});

test('GK Skill and GK Diving still dominate the catch threshold under fatigue',async()=>{
 const ENGINE=await loadEngine();
 for(const team of [0,1]){
  const weak=diveTrial(ENGINE,{team,fatigue:0,speed:1900,gkSkill:10,gkDiving:10});
  const elite=diveTrial(ENGINE,{team,fatigue:1,speed:1900,gkSkill:90,gkDiving:90});
  assert.equal(weak.deflected,true,'low-quality keeper should parry the same forceful shot');
  assert.equal(elite.ownerIsKeeper,true,'elite keeper should retain the catch even when tired');
  assert.equal(elite.deflected,false);
 }
});
