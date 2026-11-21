'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadEngine(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {ENGINE}=await import('../src/modules/engine.js');
 return ENGINE;
}
function fixture(ENGINE,team,speed,power){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,humans:0,mode:'quick'});
 const keeper=game.player(team,0),direction=team===0?-1:1;
 Object.assign(keeper,{stun:0,diveCooldown:0,diveIntentCooldown:0,
  diveIntentPending:false,fatigue:.15,z:0});
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
