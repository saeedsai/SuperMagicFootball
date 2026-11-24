'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
async function loadModules(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);return {AI,ENGINE};}
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,z:0,stun:0,down:false,moveVX:0,moveVY:0,action:'idle',actionTimer:0,src:{id:name},...extra});
function fixture(team){const attacking=1-team,dir=attacking===0?1:-1,receiver=player('receiver-'+team,attacking,500,300),ball={owner:null,pass:true,passTeam:attacking,passTarget:receiver.src.id,attacker:attacking,x:receiver.x-dir*180,y:receiver.y,z:8,vx:dir*600,vy:0,vz:40,age:.15,shot:null,strike:null,ordinaryShot:false};return {attacking,dir,receiver,ball,players:[receiver]};}
test('targeted low passes reserve a mirrored final-lane screen for the second defender',async()=>{const {AI}=await loadModules();for(const team of [0,1]){const f=fixture(team),point=AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds);assert.ok(point,JSON.stringify({team,point}));assert.ok(team===0?point.x>f.receiver.x:point.x<f.receiver.x);assert.ok(Math.abs(point.y-f.receiver.y)<2);assert.ok(point.x>=bounds.xMin&&point.x<=bounds.xMax);assert.ok(point.y>=bounds.yMin&&point.y<=bounds.yMax);assert.ok(Math.hypot(point.x-f.ball.x,point.y-f.ball.y)>38);assert.ok(Math.hypot(point.x-f.receiver.x,point.y-f.receiver.y)>34);}});
test('cover predicts receiver movement with a bounded lead and respects pitch edges',async()=>{const {AI}=await loadModules(),f=fixture(1);f.receiver.moveVX=1800;f.receiver.moveVY=900;const point=AI.defensivePassReceiverCoverTarget(1,f.ball,f.players,bounds);assert.ok(point);assert.ok(point.x>=bounds.xMin+22&&point.x<=bounds.xMax-22);assert.ok(point.y>=bounds.yMin+23&&point.y<=bounds.yMax-23);assert.ok(Math.abs(point.x-f.receiver.x)<120);assert.ok(Math.abs(point.y-f.receiver.y)<120);});
test('cover rejects high, long, stale, owned, untargeted and wrong-team balls',async()=>{const {AI}=await loadModules(),f=fixture(0);assert.ok(AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds));assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,vz:180},f.players,bounds),null);assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,z:90},f.players,bounds),null);assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,age:2.5},f.players,bounds),null);assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,owner:{}},f.players,bounds),null);assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,passTarget:null},f.players,bounds),null);assert.equal(AI.defensivePassReceiverCoverTarget(1,f.ball,f.players,bounds),null);assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,passTeam:0},f.players,bounds),null);});
test('cover ignores unavailable receivers and passes travelling away from their target',async()=>{const {AI}=await loadModules(),f=fixture(0);f.receiver.down=true;assert.equal(AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds),null);f.receiver.down=false;f.receiver.stun=.2;assert.equal(AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds),null);f.receiver.stun=0;f.receiver.z=28;assert.equal(AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds),null);f.receiver.z=0;f.receiver.action='slide';f.receiver.actionTimer=.2;assert.equal(AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds),null);f.receiver.action='idle';f.receiver.actionTimer=0;assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,vx:600},f.players,bounds),null);assert.equal(AI.defensivePassReceiverCoverTarget(0,{...f.ball,vy:600},f.players,bounds),null);});
test('engine sends the second defender to the pass lane while the primary keeps chasing the ball',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const receiver=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
  const field=ENGINE.WORLD.field,boundsNow={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const receiverX=field.x+field.w*.55+(attackingTeam===0?110:-110),y=field.y+field.h*.5,ballX=receiverX-dir*180;
  Object.assign(receiver,{x:receiverX,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
  for(const q of game.players){if(q===receiver||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=0;q.z=0;}
  Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
  Object.assign(game.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,
   lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,shot:null,strike:null,ordinaryShot:false});
  game.clock=.2;
  const legacy=AI.defensivePassReceiverCoverTarget(defendingTeam,game.ball,game.players,boundsNow);
  assert.ok(legacy,JSON.stringify({defendingTeam,legacy,ball:game.ball}));
  Object.assign(support,{x:legacy.x,y:legacy.y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
   aiAssistTarget:null,aiTimer:0,aiTarget:null});
  const ai=AI.aiTuning(game.cpuLevel(support)),style=game.options.aiStyle||'Balanced';
  const styleSpeed=defendingTeam===1?(style==='Aggressive'?1.09:style==='Defensive'?.96:1):1;
  const speed=game.playerSpeed(support)*ai.speed*styleSpeed*(game.terrain==='Sand'?.75:1);
  const expected=AI.defensivePassReceiverCoverTarget(defendingTeam,game.ball,game.players,boundsNow,support,speed,ai.reaction);
  assert.ok(expected,JSON.stringify({defendingTeam,expected,ball:game.ball,support}));
  game.driveAI(support,.016);
  assert.ok(Math.abs(support.aiTarget.x-expected.x)<1,JSON.stringify({defendingTeam,expected,actual:support.aiTarget}));
  assert.ok(Math.abs(support.aiTarget.y-expected.y)<1);
  game.driveAI(primary,.016);
  assert.ok(Math.hypot(primary.aiTarget.x-game.ball.x,primary.aiTarget.y-game.ball.y)<80,
   'primary defender must continue to pursue the moving ball');
 }
});

test('reachable moving-receiver cover chooses an earlier grounded interception point in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(team);
  f.receiver.moveVX=f.dir*180;f.receiver.moveVY=120;
  const support=player('reachable-support-'+team,team,f.ball.x+f.dir*126,f.ball.y+12.6);
  const legacy=AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds);
  const point=AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds,support,320,.2);
  assert.ok(legacy&&point,JSON.stringify({team,legacy,point}));
  const progress=(point.x-f.ball.x)*f.dir;
  const legacyProgress=(legacy.x-f.ball.x)*f.dir;
  assert.ok(progress<legacyProgress-35,JSON.stringify({team,progress,legacyProgress,point,legacy}));
  assert.ok(Math.hypot(point.x-support.x,point.y-support.y)<30,
   'the selected point must be reachable using the supplied movement speed');
  assert.ok(point.x>=bounds.xMin&&point.x<=bounds.xMax);
  assert.ok(point.y>=bounds.yMin&&point.y<=bounds.yMax);
 }
});
test('distant, slow or unavailable support defenders retain the conservative legacy screen',async()=>{
 const {AI}=await loadModules(),f=fixture(0);
 f.receiver.moveVX=f.dir*180;f.receiver.moveVY=120;
 const legacy=AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds);
 const distant=player('distant-support',0,f.ball.x-f.dir*260,f.ball.y+210);
 assert.deepEqual(AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds,distant,120,.2),legacy);
 for(const patch of [{down:true},{stun:.2},{z:28},{action:'slide',actionTimer:.2}]){
  assert.deepEqual(AI.defensivePassReceiverCoverTarget(0,f.ball,f.players,bounds,{...distant,...patch},320,.2),legacy,
   'unavailable support state '+JSON.stringify(patch));
 }
});
test('engine assigns a reachable early pass interception to the second defender while the primary keeps pressing',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const receiver=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
  const field=ENGINE.WORLD.field,boundsNow={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const receiverX=field.x+field.w*.55+(attackingTeam===0?110:-110),y=field.y+field.h*.5,ballX=receiverX-dir*180;
  Object.assign(receiver,{x:receiverX,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,slideTimer:0,
   moveVX:dir*180,moveVY:120,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0});
  for(const q of game.players)if(q!==receiver&&q!==primary&&q!==support&&!q.keeper){q.down=true;q.stun=1;}
  Object.assign(primary,{x:ballX-dir*5,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
   shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
  Object.assign(game.ball,{owner:null,pass:true,passTeam:attackingTeam,passTarget:receiver.src.id,attacker:attackingTeam,
   lastTouchTeam:attackingTeam,x:ballX,y,z:8,vx:dir*600,vy:0,vz:40,age:.15,shot:null,strike:null,ordinaryShot:false});
  Object.assign(support,{x:ballX+dir*126,y:y+12.6,down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,
   moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
   aiAssistTarget:null,aiTimer:0,aiTarget:null});
  game.clock=.2;
  const ai=AI.aiTuning(game.cpuLevel(support)),style=game.options.aiStyle||'Balanced';
  const styleSpeed=defendingTeam===1?(style==='Aggressive'?1.09:style==='Defensive'?.96:1):1;
  const speed=game.playerSpeed(support)*ai.speed*styleSpeed*(game.terrain==='Sand'?.75:1);
  const expected=AI.defensivePassReceiverCoverTarget(defendingTeam,game.ball,game.players,boundsNow,support,speed,ai.reaction);
  assert.ok(expected,JSON.stringify({defendingTeam,ball:game.ball,support}));
  game.driveAI(support,.016);
  assert.ok(Math.abs(support.aiTarget.x-expected.x)<1,JSON.stringify({defendingTeam,expected,actual:support.aiTarget}));
  assert.ok(Math.abs(support.aiTarget.y-expected.y)<1);
  game.driveAI(primary,.016);
  assert.ok(Math.hypot(primary.aiTarget.x-game.ball.x,primary.aiTarget.y-game.ball.y)<80,
   'primary defender must continue pursuing the live ball');
 }
});


test('ground-pass interception reaction scales with defender Defence while average and invalid stats preserve the baseline',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(team);f.receiver.moveVX=f.dir*180;f.receiver.moveVY=120;
  const support=player('defence-read-'+team,team,f.ball.x+f.dir*90,f.ball.y+12.6);
  const targetFor=defence=>{if(defence===null)delete support.src.defence;else support.src.defence=defence;return AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds,support,320,.2);};
  const legacy=targetFor(null),average=targetFor(50),elite=targetFor(100),low=targetFor(1);
  assert.ok(legacy&&average&&elite&&low,JSON.stringify({team,legacy,average,elite,low}));
  assert.deepEqual(average,legacy,'average Defence must preserve the previous target exactly');
  const progress=point=>(point.x-f.ball.x)*f.dir;
  assert.ok(progress(elite)<progress(average)-2,JSON.stringify({team,elite,average}));
  assert.ok(progress(low)>progress(average)+2,JSON.stringify({team,low,average}));
  assert.deepEqual(targetFor(NaN),average,'missing/non-finite Defence must use the neutral baseline');
  assert.deepEqual(targetFor(200),elite,'high Defence is clamped to 100');
  assert.deepEqual(targetFor(-20),low,'low Defence is clamped to 1');
 }
});

test('ground-pass interception reach respects agility acceleration and current momentum',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(team);
  f.receiver.moveVX=f.dir*180;f.receiver.moveVY=120;
  const support=player('agility-momentum-'+team,team,f.ball.x+f.dir*86,f.ball.y+12.6);
  const fallback=AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds);
  const read=(agility,along)=>{
   support.src.agility=agility;
   support.moveVX=f.dir*along;support.moveVY=0;
   return AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds,support,320,.2);
  };
  const elite=read(100,0),low=read(1,0);
  const averageApproach=read(50,200),averageRetreat=read(50,-200);
  assert.ok(fallback&&elite&&averageApproach,JSON.stringify({team,fallback,elite,averageApproach}));
  const progress=point=>(point.x-f.ball.x)*f.dir;
  assert.ok(progress(elite)<progress(fallback)-50,JSON.stringify({team,elite,fallback}));
  assert.ok(progress(averageApproach)<progress(fallback)-50,JSON.stringify({team,averageApproach,fallback}));
  assert.deepEqual(low,fallback,'low Agility cannot reach the early pocket from a standstill');
  assert.deepEqual(averageRetreat,fallback,'retreating momentum cannot be treated as instant forward acceleration');
  delete support.src.agility;support.moveVX=0;
  const missing=AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds,support,320,.2);
  support.src.agility=50;
  const average=AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds,support,320,.2);
  assert.deepEqual(missing,average,'missing Agility uses the neutral 50-point acceleration profile');
 }
});


test('ground-pass interception discounts cross-track momentum while preserving aligned arrival',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(team);f.receiver.moveVX=f.dir*180;f.receiver.moveVY=120;
  const support=player('cross-track-support-'+team,team,f.ball.x+f.dir*136,f.ball.y+12.6);
  support.src.agility=100;
  const read=(vx,vy)=>{
   support.moveVX=vx;support.moveVY=vy;
   return AI.defensivePassReceiverCoverTarget(team,f.ball,f.players,bounds,support,320,.2);
  };
  const aligned=read(-f.dir*200,0),crossTrack=read(0,200),stationary=read(0,0);
  assert.ok(aligned&&crossTrack&&stationary,JSON.stringify({team,aligned,crossTrack,stationary}));
  const progress=point=>(point.x-f.ball.x)*f.dir;
  assert.ok(progress(aligned)<progress(crossTrack)-5,
   JSON.stringify({team,aligned,crossTrack,stationary}));
  assert.ok(progress(stationary)<=progress(crossTrack)+1,
   'cross-track momentum must not create an earlier interception than a stationary start');
  const extreme=read(0,2400);
  assert.ok(extreme&&extreme.x>=bounds.xMin&&extreme.x<=bounds.xMax&&
   extreme.y>=bounds.yMin&&extreme.y<=bounds.yMax,
   'the capped turn reserve must retain a bounded fallback lane');
 }
});
