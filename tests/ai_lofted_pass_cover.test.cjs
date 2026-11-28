'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,z:0,stun:0,down:false,
 moveVX:0,moveVY:0,action:'idle',actionTimer:0,slideTimer:0,
 shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
 src:{id:name,jumping:100},...extra});
function fixture(team){
 const attacking=1-team,dir=attacking===0?1:-1;
 const receiver=player('lofted-receiver-'+team,attacking,500,300);
 const ball={owner:null,pass:true,passTeam:attacking,passTarget:receiver.src.id,attacker:attacking,
  lastTouchTeam:attacking,x:receiver.x-dir*360,y:receiver.y,z:35,vx:dir*600,vy:0,vz:245,
  age:.15,canCollect:.17,shot:null,strike:null,ordinaryShot:false};
 return {attacking,dir,receiver,ball,players:[receiver]};
}
test('targeted lofted passes reserve a mirrored second-defender flight-lane screen',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(team),point=AI.defensiveLoftedPassCoverTarget(team,f.ball,f.players,bounds);
  assert.ok(point,JSON.stringify({team,point,ball:f.ball}));
  assert.ok(team===0?point.x>f.receiver.x:point.x<f.receiver.x);
  assert.ok(point.x>=bounds.xMin+22&&point.x<=bounds.xMax-22);
  assert.ok(point.y>=bounds.yMin+23&&point.y<=bounds.yMax-23);
  assert.ok(Math.hypot(point.x-f.ball.x,point.y-f.ball.y)>42);
  assert.ok(Math.hypot(point.x-f.receiver.x,point.y-f.receiver.y)>32);
 }
});
test('lofted cover predicts bounded receiver motion and rejects unreachable flight',async()=>{
 const {AI}=await loadModules(),f=fixture(1);
 f.receiver.moveVX=240;f.receiver.moveVY=180;
 const point=AI.defensiveLoftedPassCoverTarget(1,f.ball,f.players,bounds);
 assert.ok(point);
 assert.ok(point.x>=bounds.xMin+22&&point.x<=bounds.xMax-22);
 assert.ok(point.y>=bounds.yMin+23&&point.y<=bounds.yMax-23);
 assert.ok(Math.abs(point.y-f.receiver.y)>1,'the predicted lateral run must affect the screen');
 assert.equal(AI.defensiveLoftedPassCoverTarget(1,{...f.ball,age:2.5},f.players,bounds),null);
 assert.equal(AI.defensiveLoftedPassCoverTarget(1,{...f.ball,vx:90,vy:0},f.players,bounds),null);
});
test('lofted cover rejects low passes, stale/owned/untargeted shots and wrong teams',async()=>{
 const {AI}=await loadModules(),f=fixture(0);
 assert.equal(AI.defensiveLoftedPassCoverTarget(0,{...f.ball,z:8,vz:40},f.players,bounds),null);
 for(const patch of [{age:2.5},{owner:{t:0}},{pass:false},{passTarget:null},{shot:{behavior:'normal'}},
  {strike:{power:1}},{ordinaryShot:true},{z:191},{vz:331},{canCollect:NaN}])
  assert.equal(AI.defensiveLoftedPassCoverTarget(0,{...f.ball,...patch},f.players,bounds),null,
   'must reject '+Object.keys(patch).join(','));
 assert.equal(AI.defensiveLoftedPassCoverTarget(1,f.ball,f.players,bounds),null);
 assert.equal(AI.defensiveLoftedPassCoverTarget(0,{...f.ball,passTeam:0},f.players,bounds),null);
});
test('lofted cover ignores receivers who cannot contest the arrival',async()=>{
 const {AI}=await loadModules(),f=fixture(0);
 for(const patch of [{down:true},{stun:.2},{z:28},{action:'slide',actionTimer:.2},
  {action:'hurt',actionTimer:.2},{shotImpactKnockdownTimer:.2},{shotImpactRiseTimer:.2}]){
  const receiver={...f.receiver,...patch};
  assert.equal(AI.defensiveLoftedPassCoverTarget(0,f.ball,[receiver],bounds),null,
   'must reject unavailable receiver '+Object.keys(patch).join(','));
 }
});
test('second-defender JUMP read respects the defender\'s actual Jumping rating and ballistic reach',async()=>{
 const {AI}=await loadModules();
 const f=fixture(0),defender=player('jump-rating-cover',0,0,0);
 f.players.push(defender);
 const point=AI.defensiveLoftedPassCoverTarget(0,f.ball,f.players,bounds);
 assert.ok(point);
 Object.assign(defender,{x:point.x,y:point.y});
 assert.equal(AI.defensiveLoftedPassJumpWindow(0,f.ball,defender,f.players,bounds,.32),true,
  'a high-Jumping defender can reach the projected ball height');
 defender.src.jumping=1;
 assert.equal(AI.defensiveLoftedPassJumpWindow(0,f.ball,defender,f.players,bounds,.32),false,
  'a low-Jumping defender must not waste JUMP on an unreachable pass');
 defender.src.jumping=100;
 assert.equal(AI.defensiveLoftedPassJumpWindow(0,f.ball,defender,f.players,bounds,.32),true);
});
test('a live airborne JUMP can collect a high pass while a grounded player keeps the original reach',async()=>{
 const {ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const jumper=game.player(0,3);
 for(const p of game.players)if(p!==jumper){p.stun=1;p.down=true;}
 const setBall=()=>Object.assign(game.ball,{owner:null,x:500,y:300,z:100,vx:0,vy:0,vz:0,
  canCollect:0,pass:true,passTeam:1,attacker:1,passTarget:jumper.src.id,age:.5,
  shot:null,strike:null,ordinaryShot:false});
 Object.assign(jumper,{x:500,y:300,z:70,vz:0,jumpCount:1,action:'jump',actionTimer:.3,
  stun:0,down:false,slideTimer:0,shotImpactKnockdownPending:0,
  shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
 setBall();game.updateBall(.001);
 assert.equal(game.ball.owner,jumper,'the jumping body envelope must collect the high pass');
 game.ball.owner=null;
 Object.assign(jumper,{z:0,vz:0,jumpCount:0,action:'idle',actionTimer:0});
 setBall();game.updateBall(.001);
 assert.equal(game.ball.owner,null,'a grounded player must not gain extra aerial reach');
});
test('second defender jumps only when a targeted lofted pass crosses a reachable window after reaction',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(team),defender=player('cover-'+team,team,0,0);
  f.players.push(defender);
  const point=AI.defensiveLoftedPassCoverTarget(team,f.ball,f.players,bounds);
  assert.ok(point);
  Object.assign(defender,{x:point.x,y:point.y});
  assert.equal(AI.defensiveLoftedPassJumpWindow(team,f.ball,defender,f.players,bounds,.32),true);
  assert.equal(AI.defensiveLoftedPassJumpWindow(team,f.ball,defender,f.players,bounds,.5),false,
   'the defender must still have time to react and rise');
  defender.down=true;
  assert.equal(AI.defensiveLoftedPassJumpWindow(team,f.ball,defender,f.players,bounds,.32),false);
  defender.down=false;defender.z=28;
  assert.equal(AI.defensiveLoftedPassJumpWindow(team,f.ball,defender,f.players,bounds,.32),false);
  defender.z=0;defender.y+=100;
  assert.equal(AI.defensiveLoftedPassJumpWindow(team,f.ball,defender,f.players,bounds,.32),false);
  const low={...f.ball,z:8,vz:40};
  defender.y=point.y;
  assert.equal(AI.defensiveLoftedPassJumpWindow(team,low,defender,f.players,bounds,.32),false);
 }
});
test('engine executes untargeted low-pass corridor cover with the second defender while the primary presses the live ball',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const field=ENGINE.WORLD.field,x=field.x+field.w*.52,y=field.y+field.h*.5;
  const primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
  for(const q of game.players)if(q!==primary&&q!==support&&!q.keeper){q.down=true;q.stun=1;}
  Object.assign(primary,{x:x-dir*12,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
  Object.assign(game.ball,{owner:null,x,y,z:2,vx:dir*620,vy:0,vz:0,pass:true,
   passTeam:attackingTeam,passTarget:null,attacker:attackingTeam,lastTouchTeam:attackingTeam,
   age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});
  const area={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const expected=AI.defensiveUntargetedPassCoverTarget(defendingTeam,game.ball,area);
  assert.ok(expected,JSON.stringify({defendingTeam,ball:game.ball,area}));
  Object.assign(support,{x:expected.x,y:expected.y+40,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
  game.clock=.18;
  game.driveAI(support,.016);
  assert.ok(support.aiTarget,JSON.stringify({defendingTeam,support}));
  assert.ok(Math.hypot(support.aiTarget.x-expected.x,support.aiTarget.y-expected.y)<1,
   JSON.stringify({defendingTeam,expected,actual:support.aiTarget}));
  assert.ok((support.aiTarget.x-x)*dir>=48&&(support.aiTarget.x-x)*dir<=190,
   'the second defender must move ahead in the live pass direction');
  assert.ok(Math.abs(support.aiTarget.y-y)<1,'the cover must remain in the low-pass corridor');
  game.driveAI(primary,.016);
  assert.ok(primary.aiTarget);
  assert.ok(Math.hypot(primary.aiTarget.x-x,primary.aiTarget.y-y)<180,
   'the primary defender must continue pressing the live ball');
 }
});

test('engine assigns lofted-pass cover to the second defender while the primary keeps pressing',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const receiver=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
  const field=ENGINE.WORLD.field,x=field.x+field.w*.55+(attackingTeam===0?120:-120),y=field.y+field.h*.5;
  const ballX=x-dir*360;
  for(const q of game.players){
   if(q===receiver||q===primary||q===support||q.keeper)continue;
   q.down=true;q.stun=1;
  }
  Object.assign(receiver,{x,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
   moveVX:0,moveVY:0,aiAssistTarget:null});
  Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
   slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
   aiAssistTarget:null,aiTimer:0,aiTarget:null});
  Object.assign(game.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,
   attacker:attackingTeam,lastTouchTeam:attackingTeam,x:ballX,y,z:35,vx:dir*600,vy:0,vz:245,
   age:.15,canCollect:.17,shot:null,strike:null,ordinaryShot:false});
  game.clock=.2;
  const boundsNow={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const expected=AI.defensiveLoftedPassCoverTarget(defendingTeam,game.ball,game.players,boundsNow);
  assert.ok(expected);
  Object.assign(support,{x:expected.x,y:expected.y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
   slideTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
  game.driveAI(support,.016);
  assert.ok(Math.abs(support.aiTarget.x-expected.x)<1);
  assert.ok(Math.abs(support.aiTarget.y-expected.y)<1);
  assert.equal(support.action,'jump','the second defender uses the existing JUMP action at a reachable lofted-pass crossing');
  assert.equal(support.jumpCount,1,'the existing jump action must be committed');
  game.driveAI(primary,.016);
  assert.ok(Math.hypot(primary.aiTarget.x-game.ball.x,primary.aiTarget.y-game.ball.y)<80,
   'primary must continue pressing the live ball');
 }
});
