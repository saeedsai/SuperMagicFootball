'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
function helperFixture(ENGINE,team){
 const field=ENGINE.WORLD.field,bounds={xMin:field.x+24,xMax:field.x+field.w-24,
  yMin:field.y+24,yMax:field.y+field.h-24},dir=team===0?1:-1;
 const keeper={t:team,keeper:true,x:dir===1?bounds.xMin+31:bounds.xMax-31,
  y:(bounds.yMin+bounds.yMax)/2,down:false,stun:0,z:0,action:'idle',moveVX:0,moveVY:0};
 const ball={owner:null,attacker:team,lastTouchTeam:team,x:keeper.x+dir*75,
  y:keeper.y+38,z:60,vx:dir*260,vy:30,vz:-110,shot:null,strike:null,
  ordinaryShot:false,pass:false};
 return {bounds,dir,keeper,ball,players:[keeper],rebound:{team,expires:2}};
}
test('parry rebound target mirrors both goals and stays inside the keeper corridor',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=helperFixture(ENGINE,team),target=AI.keeperParryReboundTarget(
   f.keeper,f.ball,f.players,f.bounds,1,f.rebound);
  assert.ok(target,JSON.stringify({team,target}));
  assert.ok((f.dir===1?target.x-f.bounds.xMin:f.bounds.xMax-target.x)>=26);
  assert.ok((f.dir===1?target.x-f.bounds.xMin:f.bounds.xMax-target.x)<=210);
  assert.ok(Math.hypot(target.x-f.keeper.x,target.y-f.keeper.y)<=235);
  assert.ok(target.y>=f.bounds.yMin&&target.y<=f.bounds.yMax);
 }
});
test('keeper yields when an active opponent can reach the rebound pocket first',async()=>{
 const {AI,ENGINE}=await loadModules(),f=helperFixture(ENGINE,0);
 const open=AI.keeperParryReboundTarget(f.keeper,f.ball,f.players,f.bounds,1,f.rebound);
 assert.ok(open);
 const opponent={t:1,keeper:false,x:open.x,y:open.y,z:0,stun:0,down:false,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0};
 assert.equal(AI.keeperParryReboundTarget(f.keeper,f.ball,[...f.players,opponent],
  f.bounds,1,f.rebound),null);
});
test('keeper reads opponent arrival through the rebound descent on both sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=helperFixture(ENGINE,team),open=AI.keeperParryReboundTarget(
   f.keeper,f.ball,f.players,f.bounds,1,f.rebound);
  assert.ok(open,JSON.stringify({team,open}));
  const opponent={t:1-team,keeper:false,x:open.x-f.dir*145,y:open.y,z:0,
   stun:0,down:false,action:'idle',actionTimer:0,moveVX:f.dir*500,moveVY:0};
  assert.equal(AI.keeperParryReboundTarget(f.keeper,f.ball,[...f.players,opponent],
   f.bounds,1,f.rebound),null,'team '+team+': closing runner should win the landing race');
  opponent.moveVX=-f.dir*500;
  assert.ok(AI.keeperParryReboundTarget(f.keeper,f.ball,[...f.players,opponent],
   f.bounds,1,f.rebound),'team '+team+': retreating runner must not suppress a safe chase');
 }
});
test('keeper yields to a closer active teammate but ignores unavailable outfielders',async()=>{
 const {AI,ENGINE}=await loadModules(),f=helperFixture(ENGINE,0);
 const open=AI.keeperParryReboundTarget(f.keeper,f.ball,f.players,f.bounds,1,f.rebound);
 assert.ok(open);
 const ally={t:0,keeper:false,x:(open.x+f.keeper.x)/2,y:(open.y+f.keeper.y)/2,
  z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0};
 assert.equal(AI.keeperParryReboundTarget(f.keeper,f.ball,[...f.players,ally],
  f.bounds,1,f.rebound),null);
 const marker={t:1,keeper:false,x:open.x,y:open.y,z:0,stun:0,down:true,
  action:'shotDown',actionTimer:1,moveVX:0,moveVY:0};
 assert.ok(AI.keeperParryReboundTarget(f.keeper,f.ball,[...f.players,marker],
  f.bounds,1,f.rebound));
});
test('keeper rebound chase rejects owned, incoming, rising, expired and recovery states',async()=>{
 const {AI,ENGINE}=await loadModules(),f=helperFixture(ENGINE,0);
 const check=()=>AI.keeperParryReboundTarget(f.keeper,f.ball,f.players,f.bounds,1,f.rebound);
 assert.ok(check());
 f.ball.owner={t:0};assert.equal(check(),null);f.ball.owner=null;
 f.ball.attacker=1;assert.equal(check(),null);f.ball.attacker=0;
 f.ball.vx=-260;assert.equal(check(),null);f.ball.vx=260;
 f.ball.vz=200;assert.equal(check(),null);f.ball.vz=-110;
 f.rebound.expires=.5;assert.equal(check(),null);f.rebound.expires=2;
 f.keeper.action='keeperRecover';assert.equal(check(),null);
 f.keeper.action='keeperDive';f.keeper.diveElapsed=.10;assert.equal(check(),null);
 f.keeper.diveElapsed=.24;assert.ok(check(),'late dive follow-through may start the bounded chase');
});
function engineFixture(ENGINE,team){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,humans:0,mode:'quick'});
 const field=ENGINE.WORLD.field,dir=team===0?1:-1,keeper=game.player(team,0);
 Object.assign(keeper,{x:dir===1?field.x+55:field.x+field.w-55,y:field.y+field.h/2,
  action:'idle',actionTimer:0,stun:0,down:false,z:0,aiTimer:0,aiTarget:null,
  aiParryReboundTarget:false,diveCooldown:0,diveIntentCooldown:0,diveIntentPending:false,fatigue:.1});
 for(const p of game.players){
  if(p===keeper||p.keeper)continue;
  if(p.t===team)Object.assign(p,{x:dir===1?field.x+field.w*.74:field.x+field.w*.26,
   y:field.y+80+p.i*8,z:0,stun:0,down:false,action:'idle',actionTimer:0});
  else Object.assign(p,{x:dir===1?field.x+field.w*.82:field.x+field.w*.18,
   y:field.y+field.h-90-p.i*8,z:0,stun:0,down:false,action:'idle',actionTimer:0});
 }
 Object.assign(game.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,x:keeper.x+dir*24,
  y:keeper.y,z:0,vx:-dir*2500,vy:0,vz:0,power:60,ordinaryShot:true,shot:null,
  strike:null,age:.2,canCollect:0,trail:[],pass:false});
 assert.equal(game.tryKeeperDive(keeper,false),true,'strong shot should be parried');
 assert.equal(game.ball.attacker,team);
 keeper.action='keeperDive';keeper.actionTimer=.4;keeper.diveElapsed=.24;keeper.diveIntentPending=false;keeper.z=12;keeper.stun=0;keeper.down=false;
 Object.assign(game.ball,{x:keeper.x+dir*80,y:keeper.y+38,z:60,vx:dir*260,vy:30,
  vz:-110,shot:null,strike:null,ordinaryShot:false,pass:false,owner:null,age:.6});
 game.clock=.2;
 return {game,keeper,dir};
}
test('a real parry makes the CPU keeper move toward its safe rebound on both sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,keeper,dir}=engineFixture(ENGINE,team);
  game.driveAI(keeper,.016);
  assert.ok(keeper.aiParryReboundTarget,'the parrying keeper should own the temporary chase');
  assert.ok(keeper.aiTarget&&dir*(keeper.aiTarget.x-keeper.x)>0,'keeper target must move into the field');
  assert.ok(dir*(keeper.moveVX||0)>0,'keeper must actually move toward the rebound');
  const teammate=game.player(team,3);game.take(teammate);
  assert.equal(keeper.aiParryReboundTarget,false);
  assert.equal(keeper.aiTarget,null,'possession ends the keeper chase immediately');
 }
});
