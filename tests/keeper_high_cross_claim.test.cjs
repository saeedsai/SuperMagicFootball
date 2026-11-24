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
 const target={x:ownGoalX+dir*190,y:goalY+78};
 const keeper=player('cross-keeper-'+team,team,ownGoalX+dir*40,goalY,{keeper:true});
 const receiver=player('cross-receiver-'+team,1-team,target.x+dir*155,target.y+10);
 const ball={owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,pass:true,
  passTarget:receiver.src.id,x:target.x+dir*118,y:target.y-30,z:90,
  vx:-dir*190,vy:48,vz:10,age:.15,canCollect:0,shot:null,strike:null,ordinaryShot:false};
 return {field,bounds,dir,ownGoalX,goalY,target,keeper,receiver,ball,players:[keeper,receiver]};
}
test('CPU keeper claims a reachable targeted high cross on either goal side',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team),point=AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds);
  assert.ok(point,JSON.stringify({team,point,ball:f.ball}));
  assert.ok(f.dir*(point.x-f.keeper.x)>0,'keeper must step off its line into the field');
  assert.ok(Math.abs(point.x-f.target.x)<2&&Math.abs(point.y-f.target.y)<2,
   'claim point must predict the descending cross landing');
  assert.ok(point.x>=f.bounds.xMin+22&&point.x<=f.bounds.xMax-22);
  assert.ok(point.y>=f.bounds.yMin+23&&point.y<=f.bounds.yMax-23);
  assert.ok((point.x-f.ownGoalX)*f.dir>=24&&(point.x-f.ownGoalX)*f.dir<=360);
 }
});
test('high-cross claim rejects stale, owned, low, rising, shot and delayed-collection balls',async()=>{
 const {AI,ENGINE}=await loadModules(),f=fixture(ENGINE,0);
 const invalid=[
  {age:2.5},{owner:{t:0}},{pass:false},{passTeam:0},{attacker:0},{lastTouchTeam:0},
  {passTarget:null},{z:18},{z:180},{vz:180},{vz:-340},{shot:{behavior:'normal'}},
  {strike:{kind:'normal'}},{ordinaryShot:true},{canCollect:1},{canCollect:NaN}
 ];
 for(const patch of invalid)
  assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,{...f.ball,...patch},f.players,f.bounds),null,
   'must reject '+Object.keys(patch).join(','));
 assert.equal(AI.keeperHighCrossClaimTarget(0,f.ball,f.players,f.bounds),null);
 assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,{xMin:1,xMax:1,yMin:0,yMax:1}),null);
});
test('keeper yields to a clearly closer active receiver or teammate but ignores unavailable runners',async()=>{
 const {AI,ENGINE}=await loadModules(),f=fixture(ENGINE,0);
 const closerOpponent=player('closer-opponent',1,f.target.x,f.target.y);
 assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,closerOpponent],f.bounds),null);
 const closerTeammate=player('closer-teammate',0,f.target.x,f.target.y);
 assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,closerTeammate],f.bounds),null);
 const unavailable=player('unavailable-opponent',1,f.target.x,f.target.y,{down:true,stun:1,action:'shotDown'});
 assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,unavailable],f.bounds),
  'a downed opponent must not block the keeper claim');
 for(const patch of [{down:true},{stun:.2},{z:28},{action:'slide',actionTimer:.2},
  {action:'hurt',actionTimer:.2},{slideTimer:.2}]){
  const receiver={...f.receiver,...patch};
  assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[f.keeper,receiver],f.bounds),null,
   'must reject unavailable intended receiver '+Object.keys(patch).join(','));
 }
});
test('driveAI sends the CPU goalkeeper toward the safe cross claim on both sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const f=fixture(ENGINE,team),keeper=game.player(team,0),receiver=game.player(1-team,3);
  for(const q of game.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
  Object.assign(keeper,{x:f.keeper.x,y:f.keeper.y,z:0,stun:0,down:false,action:'idle',
   actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0});
  Object.assign(receiver,{x:f.receiver.x,y:f.receiver.y,z:0,stun:0,down:false,action:'idle',
   actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
  Object.assign(game.ball,{...f.ball,passTarget:receiver.src.id});
  game.clock=.2;
  const expected=AI.keeperHighCrossClaimTarget(keeper,game.ball,game.players,f.bounds);
  assert.ok(expected);
  game.driveAI(keeper,.016);
  assert.ok(keeper.aiTarget,'keeper must receive a live engine target');
  assert.ok(Math.abs(keeper.aiTarget.x-expected.x)<1&&Math.abs(keeper.aiTarget.y-expected.y)<1);
  assert.ok(f.dir*(keeper.moveVX||0)>0,'keeper must move toward the projected cross on both sides');
 }
});

test('keeper yields a high-cross claim only to an active opponent whose airborne body intersects the projected ball',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team);
  const flight=(f.ball.vz+Math.sqrt(f.ball.vz*f.ball.vz+1000*f.ball.z))/500;
  const horizon=Math.min(.22,flight);
  const ballX=f.ball.x+f.ball.vx*horizon,ballY=f.ball.y+f.ball.vy*horizon;
  const airborne=player('airborne-cross-contest-'+team,1-team,ballX+38,ballY,
   {z:55,vz:0,jumpCount:1,action:'jump'});
  assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,airborne],f.bounds),null,
   'an active airborne opponent in the cross path must keep the keeper on its goal-line read');
  const above={...airborne,z:250};
  assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,above],f.bounds),
   'a jumper above the cross must not block the claim');
  const belowBall={...f.ball,z:165,vz:-80};
  const below={...airborne,z:20};
  assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,belowBall,[f.keeper,f.receiver,below],f.bounds),
   'a jumper below the descending ball must not block the claim');
  const notJumping={...airborne,jumpCount:0};
  assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,notJumping],f.bounds),
   'a raised player without a live jump must not block the claim');
  const missingJump={...airborne,jumpCount:undefined};
  assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,missingJump],f.bounds),
   'a missing jump counter must not be treated as a live jump');
  const unavailable={...airborne,down:true};
  assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,[...f.players,unavailable],f.bounds),
   'an unavailable airborne player must not block the claim');
 }
});

test('a caught high-cross claim immediately releases the stale landing target and returns to the goal line on both sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const f=fixture(ENGINE,team),keeper=game.player(team,0),receiver=game.player(1-team,3);
  for(const q of game.players)if(q!==keeper&&q!==receiver&&!q.keeper){q.down=true;q.stun=1;}
  Object.assign(keeper,{x:f.keeper.x,y:f.keeper.y,z:0,stun:0,down:false,action:'idle',
   actionTimer:0,diveCooldown:0,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,cd:10,keeperHold:0});
  Object.assign(receiver,{x:f.receiver.x,y:f.receiver.y,z:0,stun:0,down:false,action:'idle',
   actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
  Object.assign(game.ball,{...f.ball,passTarget:receiver.src.id});
  game.clock=.2;
  const expected=AI.keeperHighCrossClaimTarget(keeper,game.ball,game.players,f.bounds);
  assert.ok(expected);
  game.driveAI(keeper,.016);
  assert.equal(keeper.aiKeeperClaimTargetActive,true,'a live high-cross claim must be marked as a temporary excursion');
  const claim={...keeper.aiTarget};
  assert.ok(claim&&Math.abs(claim.x-expected.x)<1&&Math.abs(claim.y-expected.y)<1);
  Object.assign(keeper,{x:claim.x,y:claim.y,moveVX:0,moveVY:0,aiTimer:.5,keeperHold:0,cd:10});
  Object.assign(game.ball,{owner:keeper,pass:false,passTarget:null,attacker:team,lastTouchTeam:team,
   z:82,vx:0,vy:0,vz:0,shot:null,strike:null,ordinaryShot:false});
  game.driveAI(keeper,.016);
  const homeX=team===0?f.field.x+34:f.field.x+f.field.w-34;
  assert.equal(keeper.aiKeeperClaimTargetActive,false,'a caught ball must end the high-cross excursion');
  assert.ok(Math.abs(keeper.aiTarget.x-homeX)<1,JSON.stringify({team,claim,returnTarget:keeper.aiTarget}));
  assert.ok(team===0?keeper.moveVX<0:keeper.moveVX>0,
   'the keeper must begin moving back toward its own goal line before the reaction timer expires');
  assert.ok(Math.abs(keeper.aiTarget.x-claim.x)>80,'the stale landing target must be replaced');
 }
});


test('high-cross claim reach scales with GK Skill, GK Diving and fatigue while preserving the neutral baseline',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team),dir=f.dir;
  f.target={x:f.ownGoalX+dir*265,y:f.goalY+35};
  Object.assign(f.keeper,{x:f.ownGoalX+dir*25,fatigue:0});
  Object.assign(f.receiver,{x:f.target.x+dir*215,y:f.target.y+10});
  Object.assign(f.ball,{x:f.target.x+dir*160,y:f.target.y-40,z:170,vx:-dir*190,vy:48,vz:10});
  const read=(skill,diving,fatigue=0)=>{
   if(skill===undefined)delete f.keeper.src.gkSkill;else f.keeper.src.gkSkill=skill;
   if(diving===undefined)delete f.keeper.src.gkDiving;else f.keeper.src.gkDiving=diving;
   f.keeper.fatigue=fatigue;
   return AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds);
  };
  assert.equal(read(50,50),null,'neutral keeper retains the old 235-unit cap');
  const skillRead=read(100,50);
  assert.ok(skillRead,'elite GK Skill extends the safe claim pocket');
  assert.ok(Math.abs(skillRead.x-f.target.x)<2&&Math.abs(skillRead.y-f.target.y)<2);
  assert.ok(read(50,100),'elite GK Diving independently extends the safe claim pocket');
  assert.equal(read(1,1),null,'low-rated keeper remains conservative');
  assert.equal(read(100,100,1),null,'full fatigue removes the elite extension');
  assert.equal(read(undefined,undefined),null,'missing ratings preserve the neutral baseline');
  assert.equal(read('',null),null,'invalid ratings fall back to the neutral baseline');
  assert.ok(read(1000,1000),'ratings above 100 clamp to the elite profile');
  assert.equal(read(-20,-20),null,'ratings below zero clamp to the low profile');
 }
});


test('high-cross claim reach follows keeper approach momentum but not retreat, with fatigue damping the bonus',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team),dir=f.dir;
  f.target={x:f.ownGoalX+dir*265,y:f.goalY+35};
  Object.assign(f.keeper,{x:f.ownGoalX+dir*25,y:f.goalY,fatigue:0,moveVX:0,moveVY:0});
  Object.assign(f.receiver,{x:f.target.x+dir*215,y:f.target.y+10});
  Object.assign(f.ball,{x:f.target.x+dir*160,y:f.target.y-40,z:170,vx:-dir*190,vy:48,vz:10});
  assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds),null,
   'a stationary neutral keeper retains the previous 235-unit baseline');
  f.keeper.moveVX=dir*200;
  const approaching=AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds);
  assert.ok(approaching,'momentum toward the landing can complete a marginally longer claim');
  assert.ok(Math.abs(approaching.x-f.target.x)<2&&Math.abs(approaching.y-f.target.y)<2);
  f.keeper.moveVX=-dir*200;
  assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds),null,
   'retreating momentum must not extend the claim');
  f.keeper.moveVX=dir*200;f.keeper.fatigue=1;
  assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds),null,
   'full fatigue halves the approach bonus and keeps this marginal claim out of reach');
 }
});

test('keeper yields a high-cross claim to a grounded runner who can arrive during the bounded flight window',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team);
  const flight=(f.ball.vz+Math.sqrt(f.ball.vz*f.ball.vz+1000*f.ball.z))/500;
  const target={x:f.ball.x+f.ball.vx*flight,y:f.ball.y+f.ball.vy*flight};
  const keeperGap=Math.hypot(target.x-f.keeper.x,target.y-f.keeper.y);
  const speed=85,shortHorizon=Math.min(.22,flight),arrivalHorizon=Math.min(.42,flight);
  const shortGap=Math.hypot(f.receiver.x-f.dir*speed*shortHorizon-target.x,f.receiver.y-target.y);
  const arrivalGap=Math.hypot(f.receiver.x-f.dir*speed*arrivalHorizon-target.x,f.receiver.y-target.y);
  assert.ok(shortGap+34>=keeperGap,'the old short snapshot must not yet yield the claim');
  assert.ok(arrivalGap+34<keeperGap,'the longer bounded arrival read must recognize the closing runner');
  f.receiver.moveVX=-f.dir*speed;
  assert.equal(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds),null,
   'a grounded receiver projected to arrive before the keeper must win the landing race');
  f.receiver.moveVX=f.dir*speed;
  assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds),
   'a retreating receiver must not suppress a safe keeper claim');
  f.receiver.moveVX=0;
  assert.ok(AI.keeperHighCrossClaimTarget(f.keeper,f.ball,f.players,f.bounds),
   'a stationary receiver must preserve the neutral claim baseline');
 }
});
