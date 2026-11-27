'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadRuntime(){
 const assets=await import('../src/assets.js');
 await assets.loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE,world:assets.GAME_ASSETS.mechanics.world};
}
function cpuShotAim(ENGINE,world,team,keeperVelocity,controlled,keeperInput={dx:0,dy:0}){
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
  action:'run',actionTimer:0,moveVY:keeperVelocity,moveVX:0,
  dx:keeperInput.dx??0,dy:keeperInput.dy??0,
  src:{...keeper.src,agility:80,gkSkill:80},diveIntentPending:false});
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
  const straight=cpuShotAim(ENGINE,world,team,800,false,{dx:0,dy:0});
  const turning=cpuShotAim(ENGINE,world,team,800,false,{dx:1,dy:-1});
  const aligned=cpuShotAim(ENGINE,world,team,800,false,{dx:0,dy:1});
  assert.notEqual(turning,straight,'CPU shot lane must account for the keeper turning against lateral momentum');
  assert.equal(aligned,straight,'aligned keeper steering preserves the previous linear read');
  assert.equal(cpuShotAim(ENGINE,world,team,800,true,{dx:1,dy:-1}),
   cpuShotAim(ENGINE,world,team,800,true,{dx:0,dy:0}),
   'human shot aiming must not read/project keeper steering or movement');
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


test('CPU shot read brakes keeper cross-lane momentum according to Agility, GK Skill and fatigue',async()=>{
 const {AI,world}=await loadRuntime(),middle=(world.goalTop+world.goalBottom)/2;
 const read=(agility,gkSkill,fatigue,velocity=220)=>
  AI.keeperShotReadY({y:middle,moveVY:velocity,fatigue,src:{agility,gkSkill}},.22);
 const low=read(0,0,0),average=read(50,50,0),elite=read(100,100,0),tiredElite=read(100,100,1);
 assert.ok(elite>middle&&middle<average&&average<low,
  JSON.stringify({middle,low,average,elite}));
 assert.ok(tiredElite>elite&&tiredElite<low,
  JSON.stringify({elite,tiredElite,low}));
 assert.equal(read(100,100,0,-220),2*middle-elite,
  'negative lateral movement must mirror the same braking read');
 assert.equal(AI.keeperShotReadY({y:middle,moveVY:NaN,vy:220,fatigue:0,
  src:{agility:'',gkSkill:null}},.22),average,
  'missing ratings use neutral 50 and legacy velocity remains supported');
 assert.equal(read(100,100,2),tiredElite,'fatigue remains clamped to its normalized range');
});

test('keeper shot read projects active 2D steering with Agility while preserving neutral and aligned baselines',async()=>{
 const {AI,world}=await loadRuntime(),middle=(world.goalTop+world.goalBottom)/2;
 const read=(agility,gkSkill,velocity,steering={dx:0,dy:0},fatigue=0)=>
  AI.keeperShotReadY({y:middle,moveVX:0,moveVY:velocity,dx:steering.dx,dy:steering.dy,
   fatigue,src:{agility,gkSkill}},.22);
 const lowNeutral=read(1,1,220),lowTurn=read(1,1,220,{dx:1,dy:-1});
 const highNeutral=read(100,100,220),highTurn=read(100,100,220,{dx:1,dy:-1});
 assert.ok(highTurn<lowTurn&&lowTurn<lowNeutral,
  JSON.stringify({lowNeutral,lowTurn,highNeutral,highTurn}));
 assert.ok(highTurn<highNeutral,'elite Agility must turn the predicted lane more decisively');
 assert.equal(read(50,50,220,{dx:0,dy:1}),read(50,50,220),
  'aligned steering preserves the previous linear projection exactly');
 assert.equal(read(100,100,220,{dx:.1,dy:-.1}),read(100,100,220),
  'sub-threshold steering preserves the previous linear projection exactly');
 assert.equal(read(100,100,70,{dx:1,dy:-1}),read(100,100,70),
  'low-speed movement preserves the previous linear projection exactly');
 assert.equal(read(100,100,-220,{dx:1,dy:1}),2*middle-highTurn,
  'mirrored negative lateral movement and steering must mirror the same prediction');
});
