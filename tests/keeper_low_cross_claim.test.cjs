'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
function player(name,t,x,y,extra={}){
 return {t,keeper:false,x,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,
  slideTimer:0,moveVX:0,moveVY:0,src:{id:name},...extra};
}
function fixture(ENGINE,team){
 const field=ENGINE.WORLD.field,bounds={xMin:field.x+24,xMax:field.x+field.w-24,
  yMin:field.y+24,yMax:field.y+field.h-24};
 const dir=team===0?1:-1,ownGoalX=dir===1?bounds.xMin:bounds.xMax;
 const goalY=(ENGINE.WORLD.goalTop+ENGINE.WORLD.goalBottom)/2;
 const target={x:ownGoalX+dir*56,y:goalY+42};
 const keeper=player('low-cross-keeper-'+team,team,ownGoalX+dir*30,goalY,{keeper:true});
 const receiver=player('low-cross-receiver-'+team,1-team,target.x+dir*150,target.y+8);
 const ball={owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
  passTarget:receiver.src.id,x:ownGoalX+dir*200,y:target.y-45*.45,z:0,
  vx:-dir*320,vy:45,vz:0,age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false};
 return {field,bounds,dir,ownGoalX,goalY,target,keeper,receiver,ball,players:[keeper,receiver]};
}
test('CPU keeper claims a reachable targeted low ground cross on either goal side',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team),point=AI.keeperLowCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds);
  assert.ok(point,JSON.stringify({team,point,ball:f.ball}));
  assert.ok(f.dir*(point.x-f.keeper.x)>0,'keeper must step off its goal line');
  assert.ok(Math.abs(point.x-f.target.x)<1&&Math.abs(point.y-f.target.y)<1,
   'claim point must match the ball at the bounded 56-unit goal-side plane');
  assert.ok(point.x>=f.bounds.xMin+22&&point.x<=f.bounds.xMax-22);
  assert.ok(point.y>=f.bounds.yMin+23&&point.y<=f.bounds.yMax-23);
 }
});
test('low-cross claim rejects stale, owned, high, wrong-team and non-approaching passes',async()=>{
 const {AI,ENGINE}=await loadModules(),f=fixture(ENGINE,0);
 const invalid=[
  {age:1.9},{owner:{t:0}},{pass:false},{passTeam:0},{attacker:0},{lastTouchTeam:0},
  {passTarget:null},{z:28},{z:35},{z:-1},{vz:110},{vx:f.dir*320},{vx:-f.dir*90},
  {x:f.ownGoalX+f.dir*60},{y:f.bounds.yMin-180},{shot:{behavior:'normal'}},
  {strike:{kind:'normal'}},{ordinaryShot:true}
 ];
 for(const patch of invalid)
  assert.equal(AI.keeperLowCrossClaimTarget(f.keeper,{...f.ball,...patch},f.players,f.bounds),null,
   'must reject '+Object.keys(patch).join(','));
 const late={...f.ball,x:f.ownGoalX+f.dir*90,y:f.target.y-45*((90-56)/320)};
 assert.equal(AI.keeperLowCrossClaimTarget(f.keeper,late,f.players,f.bounds),null,
  'keeper must not claim when the remaining arrival time is too short for its approach');
});
test('low-cross claim yields to an earlier active outfielder but ignores unavailable runners',async()=>{
 const {AI,ENGINE}=await loadModules(),f=fixture(ENGINE,0);
 const closerOpponent=player('closer-opponent',1,f.target.x,f.target.y);
 assert.equal(AI.keeperLowCrossClaimTarget(f.keeper,f.ball,[...f.players,closerOpponent],f.bounds),null);
 const closerTeammate=player('closer-teammate',0,f.target.x,f.target.y);
 assert.equal(AI.keeperLowCrossClaimTarget(f.keeper,f.ball,[...f.players,closerTeammate],f.bounds),null);
 const unavailable=player('unavailable-opponent',1,f.target.x,f.target.y,
  {down:true,stun:1,action:'shotDown'});
 const point=AI.keeperLowCrossClaimTarget(f.keeper,f.ball,[...f.players,unavailable],f.bounds);
 assert.ok(point,'a down/recovering opponent must not falsely win the arrival race');
 f.receiver.down=true;f.receiver.stun=1;
 assert.equal(AI.keeperLowCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds),null,
  'an unavailable named receiver cannot be treated as an active cross runner');
});
test('driveAI sends the keeper to a safe low cross and returns to its line after collection',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const f=fixture(ENGINE,team),keeper=game.player(team,0),receiver=game.player(1-team,3);
  for(const q of game.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
  Object.assign(keeper,{x:f.keeper.x,y:f.keeper.y,z:0,stun:0,down:false,action:'idle',
   actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,
   aiKeeperClaimTargetActive:false,aiParryReboundTarget:false,keeperHold:0});
  Object.assign(receiver,{x:f.receiver.x,y:f.receiver.y,z:0,stun:0,down:false,
   action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
  Object.assign(game.ball,{...f.ball,passTarget:receiver.src.id});
  game.clock=.2;
  const expected=AI.keeperLowCrossClaimTarget(keeper,game.ball,game.players,f.bounds);
  assert.ok(expected);
  game.driveAI(keeper,.016);
  assert.equal(keeper.aiKeeperClaimTargetActive,true,'the keeper must enter a temporary cross claim');
  assert.ok(keeper.aiTarget&&Math.abs(keeper.aiTarget.x-expected.x)<1&&
   Math.abs(keeper.aiTarget.y-expected.y)<1,JSON.stringify({team,expected,actual:keeper.aiTarget}));
  assert.ok(f.dir*(keeper.moveVX||0)>0,'keeper must step toward the cross on both goals');
  const claim={...keeper.aiTarget};
  Object.assign(keeper,{x:claim.x,y:claim.y,moveVX:0,moveVY:0,aiTimer:.5,cd:10,keeperHold:0});
  Object.assign(game.ball,{owner:keeper,pass:false,passTarget:null,attacker:team,lastTouchTeam:team,
   z:0,vx:0,vy:0,vz:0,shot:null,strike:null,ordinaryShot:false});
  game.driveAI(keeper,.016);
  const homeX=team===0?f.field.x+34:f.field.x+f.field.w-34;
  assert.equal(keeper.aiKeeperClaimTargetActive,false,'a caught ball must end the claim');
  assert.ok(keeper.aiTarget&&Math.abs(keeper.aiTarget.x-homeX)<1,
   JSON.stringify({team,claim,returnTarget:keeper.aiTarget}));
  assert.ok(team===0?keeper.moveVX<0:keeper.moveVX>0,
   'keeper must begin returning to its goal line');
 }
});
