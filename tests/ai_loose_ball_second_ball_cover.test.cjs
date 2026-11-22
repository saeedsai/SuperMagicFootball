'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const looseBall=()=>({owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
 x:420,y:300,z:54,vx:260,vy:-80,vz:-40,canCollect:0,attacker:1,lastTouchTeam:1});

test('second defender covers the descending loose-ball landing point in both directions',async()=>{
 const {AI}=await loadModules(),ball=looseBall();
 const teamZero=AI.defensiveLooseBallCoverTarget(0,ball,bounds);
 const teamOne=AI.defensiveLooseBallCoverTarget(1,ball,bounds);
 assert.ok(teamZero&&teamOne);
 const flight=(-40+Math.sqrt(40*40+1000*54))/500;
 const landingX=420+260*flight,landingY=300-80*flight;
 assert.ok(Math.abs(teamZero.x-(landingX-26))<1e-9);
 assert.ok(Math.abs(teamOne.x-(landingX+26))<1e-9);
 assert.ok(Math.abs(teamZero.y-landingY)<1e-9);
 assert.ok(Math.abs(teamOne.y-landingY)<1e-9);
 assert.ok(teamZero.x<teamOne.x,'each defending side holds its own goal-side margin');
});

test('second-ball cover rejects possession, active passes/shots, rising or grounded balls and delayed collection',async()=>{
 const {AI}=await loadModules(),base=looseBall();
 const invalid=[
  {owner:{t:0}},{pass:true},{shot:{behavior:'normal'}},{strike:{power:1}},
  {ordinaryShot:true},{z:20},{z:180},{vz:80},{canCollect:1},{x:NaN},{vy:Infinity}
 ];
 for(const patch of invalid){
  assert.equal(AI.defensiveLooseBallCoverTarget(0,{...base,...patch},bounds),null,
   'must reject '+Object.keys(patch).join(','));
 }
 assert.equal(AI.defensiveLooseBallCoverTarget(2,base,bounds),null);
 assert.equal(AI.defensiveLooseBallCoverTarget(0,base,{xMin:20,xMax:20,yMin:0,yMax:100}),null);
});

test('second-ball cover caps flight projection and clamps to the playable field',async()=>{
 const {AI}=await loadModules();
 const ball={...looseBall(),x:970,y:570,z:100,vx:5000,vy:5000,vz:-20};
 const target=AI.defensiveLooseBallCoverTarget(0,ball,bounds);
 assert.ok(target);
 assert.ok(target.x>=bounds.xMin+22&&target.x<=bounds.xMax-22);
 assert.ok(target.y>=bounds.yMin+23&&target.y<=bounds.yMax-23);
 const vertical=AI.defensiveLooseBallCoverTarget(0,
  {...looseBall(),vx:0,vy:0,vz:0},bounds);
 assert.ok(vertical,'a vertical high ball still needs a goal-side second-ball cover');
 assert.equal(vertical.x,looseBall().x-26);
 assert.equal(vertical.y,looseBall().y);
});

test('driveAI sends the second CPU presser to the landing cover while the primary still attacks the ball',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  game.weather='Clear';
  const dir=team===0?1:-1,primary=game.player(team,3),support=game.player(team,4);
  const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
  for(const p of game.players){
   p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
   p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
  }
  for(const p of [primary,support]){
   p.down=false;p.stun=0;p.invuln=0;p.action='idle';p.actionTimer=0;p.z=0;
   p.slideTimer=0;p.shotImpactKnockdownPending=0;p.shotImpactKnockdownTimer=0;p.shotImpactRiseTimer=0;
  }
  Object.assign(primary,{x:x-dir*18,y,aiTimer:1});
  Object.assign(support,{x:x+dir*50,y:y+65,aiTimer:1});
  Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
   x,y,z:54,vx:dir*260,vy:-80,vz:-40,canCollect:0,attacker:1-team,lastTouchTeam:1-team});
  game.clock=5;
  const expected=AI.defensiveLooseBallCoverTarget(team,game.ball,
   {xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24});
  assert.ok(expected);
  game.driveAI(primary,.016);
  game.driveAI(support,.016);
  assert.deepEqual(support.aiTarget,expected,'the support defender protects the predicted landing pocket');
  assert.ok(Math.hypot(primary.aiTarget.x-expected.x,primary.aiTarget.y-expected.y)>40,
   'the primary presser continues toward the live ball instead of duplicating cover');
 }
});
