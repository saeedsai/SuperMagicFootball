'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadRuntime(){
 const assets=await import('../src/assets.js');
 await assets.loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE,world:assets.GAME_ASSETS.mechanics.world};
}
function cpuShotAim(ENGINE,world,team,keeperVelocity,controlled){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,humans:0,mode:'quick'});
 const direction=team===0?1:-1;
 const goalX=direction===1?world.field.x+world.field.w:world.field.x;
 const middle=(world.goalTop+world.goalBottom)/2;
 const shooter=game.player(team,3),keeper=game.player(1-team,0);
 for(const player of game.players)if(player!==shooter&&player!==keeper)
  Object.assign(player,{x:goalX-direction*260,y:middle+220,z:0,stun:0});
 Object.assign(shooter,{x:goalX-direction*500,y:middle,z:0,stun:0,cd:0,fatigue:0,dx:0,dy:0});
 Object.assign(keeper,{x:goalX-direction*24,y:middle,z:0,stun:0,down:false,
  action:'run',actionTimer:0,moveVY:keeperVelocity,moveVX:0,diveIntentPending:false});
 game.ball.owner=shooter;game.inControl=()=>controlled;
 let launched=null;
 game.freeBall=(player,dx,dy,speed,options)=>{launched={aimY:player.y+dy,options,speed};return true;};
 const random=Math.random;Math.random=()=>.5;
 try{assert.equal(game.shoot(shooter,false,false,0),true,'shot should launch');}
 finally{Math.random=random;}
 assert.ok(launched,'shoot must reach the existing ball-launch path');
 return launched.aimY;
}
test('CPU shot lane leads an active moving keeper in both attack directions while human aim stays unchanged',async()=>{
 const {ENGINE,world}=await loadRuntime();
 for(const team of [0,1]){
  const up=cpuShotAim(ENGINE,world,team,220,false),down=cpuShotAim(ENGINE,world,team,-220,false);
  assert.ok(up<down,'CPU should aim opposite the keeper lateral movement');
  assert.equal(cpuShotAim(ENGINE,world,team,220,true),cpuShotAim(ENGINE,world,team,-220,true),
   'human shot aiming must not read/project keeper movement');
 }
});
test('keeper shot projection is bounded, goalmouth-clamped and disabled during recovery or invalid states',async()=>{
 const {AI,world}=await loadRuntime(),middle=(world.goalTop+world.goalBottom)/2;
 assert.equal(AI.keeperShotReadY({y:middle,moveVY:500},.5),middle+65);
 assert.equal(AI.keeperShotReadY({y:middle,moveVY:-500},.5),middle-65);
 assert.equal(AI.keeperShotReadY({y:middle,moveVY:NaN},.3),middle);
 for(const state of [{action:'keeperDive'},{action:'keeperRecover'},{stun:.2},{down:true},{diveIntentPending:true}]){
  assert.equal(AI.keeperShotReadY({y:middle,moveVY:500,...state},.3),middle);
 }
 assert.equal(AI.keeperShotReadY({y:world.goalTop+2,moveVY:-500},.34),world.goalTop+8);
 assert.equal(AI.keeperShotReadY({y:world.goalBottom-2,moveVY:500},.34),world.goalBottom-8);
 assert.equal(AI.keeperShotReadY({y:NaN,moveVY:100},.2),null);
});
