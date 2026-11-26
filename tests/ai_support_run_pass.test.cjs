'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {AI}=await import('../src/modules/ai.js');
 const {ENGINE}=await import('../src/modules/engine.js');
 return {AI,ENGINE};
}

function fixture(ENGINE){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.players.find(p=>p.t===0&&p.i===3);
 const runner=game.players.find(p=>p.t===0&&p.i===4);
 const decoy=game.players.find(p=>p.t===0&&p.i===1);
 carrier.x=250;carrier.y=300;carrier.dx=1;carrier.dy=0;
 runner.x=420;runner.y=188;runner.dx=1;runner.dy=-.5;
 decoy.x=330;decoy.y=300;decoy.dx=1;decoy.dy=0;
 for(const p of game.players){
  if(p.t===0&&p!==carrier&&p!==runner&&p!==decoy){p.x=340;p.y=300;}
  if(p.t===1){p.x=850;p.y=550;p.stun=0;p.down=false;p.z=0;p.action='idle';}
 }
 game.ball.owner=carrier;
 return {game,carrier,runner,decoy,defender:game.players.find(p=>p.t===1&&!p.keeper)};
}

test('AI support pass selects the runner only after reaching a clear forward lane',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x+8,y:runner.y-6}};
 const target=AI.attackingSupportPass(game.players,0,carrier,supportRun);
 assert.equal(target,runner);
 assert.equal(game.pass(carrier,false,false,{preferredTarget:target,supportRun:true}),true);
 assert.equal(game.ball.passTarget,runner.src.id);
});

test('support-run PASS leads a moving receiver using bounded world velocity',async()=>{
 const {ENGINE}=await loadModules();
 const stationary=fixture(ENGINE),moving=fixture(ENGINE),fast=fixture(ENGINE);
 for(const f of [stationary,moving,fast]){f.runner.dx=0;f.runner.dy=0;f.runner.moveVX=0;f.runner.moveVY=0;}
 moving.runner.moveVX=1000;fast.runner.moveVX=5000;
 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  assert.equal(stationary.game.pass(stationary.carrier,false,false,{preferredTarget:stationary.runner,supportRun:true}),true);
  assert.equal(moving.game.pass(moving.carrier,false,false,{preferredTarget:moving.runner,supportRun:true}),true);
  assert.equal(fast.game.pass(fast.carrier,false,false,{preferredTarget:fast.runner,supportRun:true}),true);
 }finally{Math.random=originalRandom;}
 const slope=game=>game.ball.vy/game.ball.vx;
 assert.ok(slope(moving.game)>slope(stationary.game),'forward receiver motion moves the pass aim ahead');
 assert.ok(Math.abs(slope(fast.game)-slope(moving.game))<1e-9,'extreme receiver speed cannot exceed the lead cap');
});

function supportArrivalFixture(ENGINE,team,moveY){
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});
 const dir=team===0?1:-1,carrier=game.players.find(p=>p.t===team&&p.i===3),
  runner=game.players.find(p=>p.t===team&&p.i===4),defender=game.players.find(p=>p.t===1-team&&!p.keeper);
 const carrierX=team===0?600:1960;
 Object.assign(carrier,{x:carrierX,y:300,down:false,stun:0,z:0,action:'idle',actionTimer:0,cd:0});
 Object.assign(runner,{x:carrierX+dir*170,y:188,homeX:carrierX+dir*160,homeY:188,
  down:false,stun:0,z:0,action:'idle',actionTimer:0,slideTimer:0,moveVX:300,moveVY:moveY,
  aiAssistTarget:null,aiGiveAndGoRun:null});
 for(const p of game.players)if(p!==carrier&&p!==runner&&p!==defender)
  Object.assign(p,{down:true,stun:1,z:0,action:'idle',actionTimer:0});
 Object.assign(defender,{x:runner.x+44,y:138,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 game.ball.owner=carrier;
 return {game,carrier,runner,defender,dir,supportRun:{runner,target:{x:carrierX+dir*160,y:188}}};
}

test('support-run PASS checks the receiver projected at collection in both attack directions',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const movingAway=supportArrivalFixture(ENGINE,team,300);
  assert.equal(AI.attackingSupportPass(movingAway.game.players,team,movingAway.carrier,movingAway.supportRun),
   movingAway.runner,'a marker left behind by the receiver must not block the pass for team '+team);
  const movingInto=supportArrivalFixture(ENGINE,team,-300);
  assert.equal(AI.attackingSupportPass(movingInto.game.players,team,movingInto.carrier,movingInto.supportRun),null,
   'a defender at the projected collection point blocks the support pass for team '+team);
  assert.equal(movingInto.game.pass(movingInto.carrier,false,false,{excludeTargets:[movingInto.runner]}),false,
   'an unsafe support runner is not reused by ordinary AI fallback when no alternative is available');
  const alternative=movingInto.game.players.find(p=>p.t===team&&p!==movingInto.carrier&&p!==movingInto.runner&&!p.keeper);
  Object.assign(alternative,{down:false,stun:0,z:0,action:'idle',x:movingInto.carrier.x+movingInto.dir*100,y:400});
  assert.equal(movingInto.game.pass(movingInto.carrier,false,false,{excludeTargets:[movingInto.runner]}),true);
  assert.notEqual(movingInto.game.ball.passTarget,movingInto.runner.src.id,
   'an available teammate remains eligible after excluding the unsafe runner');
 }
});

test('active grounded defenders block a support-run pass corridor or arrival point',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=(carrier.x+runner.x)/2;defender.y=(carrier.y+runner.y)/2;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),null);
 defender.x=runner.x+28;defender.y=runner.y+12;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),null);
});

test('downed, high-airborne and too-late recovering defenders do not block the ground lane',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=(carrier.x+runner.x)/2;defender.y=(carrier.y+runner.y)/2;
 defender.down=true;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
 defender.down=false;defender.z=40;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
 defender.z=0;defender.stun=2;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
});

test('a runner who has not entered the support lane is not force-selected',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,{runner,target:{x:runner.x+220,y:runner.y+20}}),null);
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,null),null);
});

test('support-run preference is opt-in and ordinary AI receiver ranking remains the fallback',async()=>{
 const {ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 assert.equal(game.pass(carrier,false,false,{preferredTarget:runner}),true);
 assert.equal(game.events.at(-1)?.mode,'ai');
 const next=fixture(ENGINE);
 assert.equal(next.game.pass(next.carrier,false,false,{preferredTarget:next.runner,supportRun:true}),true);
 assert.equal(next.game.ball.passTarget,next.runner.src.id);
 assert.equal(next.game.events.at(-1)?.mode,'supportRun');
});

test('a grounded defender projected into the support-run lane cancels the preferred receiver',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=335;defender.y=320;defender.moveVX=0;defender.moveVY=-450;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),null);
});

test('a defender moving away from the support-run lane does not block the clear pass',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=335;defender.y=320;defender.moveVX=0;defender.moveVY=300;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
});

test('invalid defender velocity remains neutral for support-run lane prediction',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=335;defender.y=320;defender.moveVX=NaN;defender.moveVY=NaN;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
});

const fs=require('node:fs');
const path=require('node:path');
test('driveAI wires the pressure-checked support runner into the existing PASS action',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 assert.match(source,/attackingSupportPass\(this\.players,t,owner,supportRun\)/);
 assert.match(source,/preferredTarget:supportPassTarget,supportRun:true/);
});


test('AI through ball leads a committed support runner into open space before arrival',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 runner.x=340;runner.y=350;runner.moveVX=180;runner.moveVY=-260;
 const supportRun={runner,target:{x:410,y:188}};
 const option=AI.attackingThroughBall(game.players,0,carrier,supportRun);
 assert.equal(option?.runner,runner);
 assert.ok(option.target.x>runner.x,'lead point must be ahead of the runner');
 assert.ok(option.target.y<runner.y,'lead point must follow the runner diagonal');
 assert.ok(option.target.x<supportRun.target.x&&option.target.y>supportRun.target.y,
  'lead point must remain between the runner and the bounded support lane');
 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  assert.equal(game.pass(carrier,false,false,{preferredTarget:option.runner,supportRun:true,
   throughBall:true,preferredPoint:option.target}),true);
 }finally{Math.random=originalRandom;}
 assert.equal(game.ball.passTarget,runner.src.id);
 assert.equal(game.events.at(-1)?.mode,'throughBall');
 assert.equal(game.events.at(-1)?.loft,'through');
 const slope=game.ball.vy/game.ball.vx;
 assert.ok(Math.abs(slope-(option.target.y-carrier.y)/(option.target.x-carrier.x))<1e-9,
  'ball trajectory should aim into the space ahead, not at current feet');
});

function throughBallFixture(ENGINE,team){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const dir=team===0?1:-1;
 const carrier=game.players.find(p=>p.t===team&&p.i===3);
 const runner=game.players.find(p=>p.t===team&&p.i===4);
 const defender=game.players.find(p=>p.t!==team&&!p.keeper);
 Object.assign(carrier,{x:1200,y:600,down:false,stun:0,z:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,dx:dir,dy:0});
 Object.assign(runner,{x:1200+dir*120,y:600,down:false,stun:0,z:0,action:'run',actionTimer:0,
  slideTimer:0,moveVX:dir*340,moveVY:0,dx:0,dy:-1,aiAssistTarget:null,aiGiveAndGoRun:null});
 for(const p of game.players)if(p.t!==team)Object.assign(p,{down:true,stun:1,z:0,
  action:'idle',actionTimer:0,slideTimer:0,moveVX:0,moveVY:0});
 game.ball.owner=carrier;
 return {game,carrier,runner,defender,dir,
  supportRun:{runner,target:{x:carrier.x+dir*160,y:carrier.y-112}}};
}

test('through-ball lead follows the receiver directional cut at the Agility turn rate',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,carrier,runner,supportRun}=throughBallFixture(ENGINE,team);
  const targetFor=()=>{
   const option=AI.attackingThroughBall(game.players,team,carrier,supportRun);
   assert.ok(option,'the committed forward runner should retain a through-ball option');
   return option.target;
  };
  runner.src.agility=100;const high=targetFor();
  runner.src.agility=50;const average=targetFor();
  runner.src.agility=1;const low=targetFor();
  assert.ok(high.y<average.y&&average.y<low.y,JSON.stringify({team,high,average,low}));
  delete runner.src.agility;
  assert.deepEqual(targetFor(),average,'missing Agility uses the neutral turn profile');
  runner.src.agility=NaN;
  assert.deepEqual(targetFor(),average,'invalid Agility uses the neutral turn profile');
  runner.dx=0;runner.dy=0;
  runner.src.agility=100;const neutralHigh=targetFor();
  runner.src.agility=1;const neutralLow=targetFor();
  assert.deepEqual(neutralHigh,neutralLow,'neutral input retains the exact residual-velocity lead');
  runner.dx=NaN;runner.dy=Infinity;
  runner.src.agility=100;const invalidHigh=targetFor();
  runner.src.agility=1;const invalidLow=targetFor();
  assert.deepEqual(invalidHigh,invalidLow,'invalid input retains the exact residual-velocity lead');
 }
});

test('through-ball collection safety projects active defenders through their Agility turn',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,carrier,runner,defender,dir,supportRun}=throughBallFixture(ENGINE,team);
  const open=AI.attackingThroughBall(game.players,team,carrier,supportRun);
  assert.equal(open?.runner,runner,'the pocket is initially open for team '+team);
  Object.assign(defender,{x:open.target.x-dir*20,y:open.target.y+101,down:false,stun:0,z:0,
   action:'run',actionTimer:0,slideTimer:0,moveVX:dir*300,moveVY:0,dx:0,dy:-1});
  defender.src.agility=100;
  assert.equal(AI.attackingThroughBall(game.players,team,carrier,supportRun),null,
   'an elite defender turning into the collection pocket blocks team '+team);
  defender.src.agility=1;
  const low=AI.attackingThroughBall(game.players,team,carrier,supportRun);
  assert.equal(low?.runner,runner,
   'a low-Agility defender retaining residual momentum does not falsely block team '+team);
  defender.dx=0;defender.dy=0;
  defender.src.agility=100;const neutralHigh=AI.attackingThroughBall(game.players,team,carrier,supportRun);
  defender.src.agility=1;const neutralLow=AI.attackingThroughBall(game.players,team,carrier,supportRun);
  assert.deepEqual(neutralHigh,neutralLow,'neutral input retains the prior linear projection');
  defender.dx=NaN;defender.dy=Infinity;
  defender.src.agility=100;const invalidHigh=AI.attackingThroughBall(game.players,team,carrier,supportRun);
  defender.src.agility=1;const invalidLow=AI.attackingThroughBall(game.players,team,carrier,supportRun);
  assert.deepEqual(invalidHigh,invalidLow,'invalid input retains the prior linear projection');
 }
});

test('through ball requires genuine forward run momentum and preserves arrived-runner fallback',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 const supportRun={runner,target:{x:410,y:188}};
 runner.x=340;runner.y=350;
 for(const motion of [
  {moveVX:0,moveVY:0},
  {moveVX:-220,moveVY:-260},
  {moveVX:180,moveVY:260},
  {moveVX:Infinity,moveVY:NaN}
 ]){
  Object.assign(runner,motion);
  assert.equal(AI.attackingThroughBall(game.players,0,carrier,supportRun),null,
   'stationary, retreating, away-running or invalid motion must not trigger a through ball');
 }
 runner.x=410;runner.y=188;runner.moveVX=180;runner.moveVY=0;
 assert.equal(AI.attackingThroughBall(game.players,0,carrier,{runner,target:{x:410,y:188}}),null,
  'an arrived runner remains on the existing support-pass path');
});

test('through ball yields to a closing lane defender and a crowded receiving pocket',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 runner.x=340;runner.y=350;runner.moveVX=180;runner.moveVY=-260;
 const supportRun={runner,target:{x:410,y:188}};
 const option=AI.attackingThroughBall(game.players,0,carrier,supportRun);
 assert.ok(option);
 defender.x=(carrier.x+option.target.x)/2;
 defender.y=(carrier.y+option.target.y)/2;
 defender.moveVX=0;defender.moveVY=0;defender.action='idle';defender.z=0;defender.stun=0;
 assert.equal(AI.attackingThroughBall(game.players,0,carrier,supportRun),null,
  'a defender in the projected flight corridor blocks the early pass');
 defender.x=option.target.x+18;defender.y=option.target.y+12;
 assert.equal(AI.attackingThroughBall(game.players,0,carrier,supportRun),null,
  'a defender occupying the predicted collection pocket blocks the through ball');
 defender.down=true;
 assert.ok(AI.attackingThroughBall(game.players,0,carrier,supportRun),
  'a knocked-down defender cannot occupy the lane or collection pocket');
});

test('through-ball target and momentum are mirrored for the opposite attacking direction',async()=>{
 const {AI,ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.players.find(p=>p.t===1&&p.i===3);
 const runner=game.players.find(p=>p.t===1&&p.i===4);
 carrier.x=750;carrier.y=300;runner.x=660;runner.y=350;runner.moveVX=-180;runner.moveVY=-260;
 for(const p of game.players)if(p.t===0){p.x=150;p.y=550;p.stun=0;p.down=false;p.z=0;p.action='idle';}
 game.ball.owner=carrier;
 const option=AI.attackingThroughBall(game.players,1,carrier,{runner,target:{x:590,y:188}});
 assert.equal(option?.runner,runner);
 assert.ok(option.target.x<runner.x,'away-side lead point must advance toward the left goal');
 assert.ok(option.target.y<runner.y,'away-side lead point follows the mirrored diagonal');
});

function throughBallKeeperFixture(team){
 const dir=team===0?1:-1;
 const carrier={t:team,x:1350,y:600,down:false,stun:0,z:0,action:'idle'};
 const runner={t:team,x:carrier.x+dir*120,y:600,moveVX:dir*200,moveVY:-200,
  down:false,stun:0,z:0,action:'idle'};
 const supportRun={runner,target:{x:carrier.x+dir*160,y:488}};
 return {team,dir,carrier,runner,supportRun};
}

test('through-ball target tracks bounded lateral receiver momentum in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=throughBallKeeperFixture(team),point={x:f.carrier.x+f.dir*160,y:488};
  const dx=point.x-f.runner.x,dy=point.y-f.runner.y,gap=Math.hypot(dx,dy);
  const laneX=dx/gap,laneY=dy/gap,alongSpeed=f.runner.moveVX*laneX+f.runner.moveVY*laneY;
  const alignedRunner={...f.runner,moveVX:alongSpeed*laneX,moveVY:alongSpeed*laneY};
  const aligned=AI.attackingThroughBall([f.carrier,alignedRunner],team,f.carrier,{runner:alignedRunner,target:point});
  const moving=AI.attackingThroughBall([f.carrier,f.runner],team,f.carrier,{runner:f.runner,target:point});
  assert.ok(aligned&&moving,'both aligned and laterally moving receivers remain eligible for team '+team);
  const perpX=-laneY,perpY=laneX;
  const lateralSpeed=f.runner.moveVX*perpX+f.runner.moveVY*perpY;
  const flight=Math.max(.12,Math.min(.35,Math.hypot(point.x-f.carrier.x,point.y-f.carrier.y)/1400));
  const expected=Math.max(-32,Math.min(32,lateralSpeed*flight));
  const shiftX=moving.target.x-aligned.target.x,shiftY=moving.target.y-aligned.target.y;
  assert.ok(Math.abs(shiftX*laneX+shiftY*laneY)<1e-9,'lateral motion must not alter the longitudinal lead');
  assert.ok(Math.abs(shiftX*perpX+shiftY*perpY-expected)<1e-9,'receiver drift is projected over flight time and capped');
  assert.ok(team===0?shiftX>0:shiftX<0,'the lateral lead mirrors with the attacking direction');
  assert.ok(shiftY>0,'both mirrored fixtures meet the same upward receiver drift');
 }
});

test('through-ball lateral projection is capped and clamped to playable pitch margins',async()=>{
 const {AI,ENGINE}=await loadModules(),field=ENGINE.WORLD.field;
 const carrier={t:0,x:field.x+950,y:field.y+50,down:false,stun:0,z:0,action:'idle'};
 const runner={t:0,x:carrier.x+150,y:carrier.y,down:false,stun:0,z:0,action:'idle'};
 const point={x:runner.x+130,y:field.y+24};
 const dx=point.x-runner.x,dy=point.y-runner.y,gap=Math.hypot(dx,dy);
 const laneX=dx/gap,laneY=dy/gap,perpX=-laneY,perpY=laneX;
 const alongSpeed=240,lateralSpeed=-500;
 runner.moveVX=alongSpeed*laneX+lateralSpeed*perpX;
 runner.moveVY=alongSpeed*laneY+lateralSpeed*perpY;
 const option=AI.attackingThroughBall([carrier,runner],0,carrier,{runner,target:point});
 assert.ok(option,'a forward runner remains eligible while correcting sharply toward the upper touchline');
 const flight=Math.max(.12,Math.min(.35,Math.hypot(point.x-carrier.x,point.y-carrier.y)/1400));
 const projection=(runner.x-carrier.x)*laneX+(runner.y-carrier.y)*laneY;
 const perpendicularSquared=Math.max(0,Math.hypot(runner.x-carrier.x,runner.y-carrier.y)**2-projection*projection);
 const minimumLead=perpendicularSquared>=110*110?48:Math.max(48,-projection+Math.sqrt(110*110-perpendicularSquared));
 const lead=Math.max(minimumLead,Math.min(100,Math.min(gap-16,alongSpeed*flight)));
 const unclampedY=runner.y+laneY*lead+perpY*(-32);
 assert.ok(unclampedY<field.y+24,'the capped lateral lead reaches beyond the playable margin in this edge fixture');
 assert.equal(option.target.y,field.y+24,'the pass target is clamped back inside the playable pitch');
 assert.ok(option.target.x>=field.x+24&&option.target.x<=field.x+field.w-24);
});

test('through-ball lead scales with estimated pass flight time on both attacking sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=throughBallKeeperFixture(team);
  const optionFor=laneX=>{
   const supportRun={runner:f.runner,target:{x:f.carrier.x+f.dir*laneX,y:488}};
   return {supportRun,option:AI.attackingThroughBall([f.carrier,f.runner],team,f.carrier,supportRun)};
  };
  const short=optionFor(160),long=optionFor(280);
  assert.ok(short.option,'short through-ball fixture must remain eligible');
  assert.ok(long.option,'long through-ball fixture must remain eligible');
  const expectedLead=({supportRun})=>{
   const point=supportRun.target,dx=point.x-f.runner.x,dy=point.y-f.runner.y;
   const gap=Math.hypot(dx,dy);
   const runSpeed=(f.runner.moveVX*dx+f.runner.moveVY*dy)/gap;
   const flightSeconds=Math.max(.12,Math.min(.35,
    Math.hypot(point.x-f.carrier.x,point.y-f.carrier.y)/1400));
   const directionX=dx/gap,directionY=dy/gap;
   const projection=(f.runner.x-f.carrier.x)*directionX+(f.runner.y-f.carrier.y)*directionY;
   const perpendicularSquared=Math.max(0,Math.hypot(f.runner.x-f.carrier.x,f.runner.y-f.carrier.y)**2-projection*projection);
   const minimumLead=perpendicularSquared>=110*110?48:Math.max(48,-projection+Math.sqrt(110*110-perpendicularSquared));
   return Math.max(minimumLead,Math.min(100,Math.min(gap-16,runSpeed*flightSeconds)));
  };
  const actualLead=({option,supportRun})=>{
   const dx=supportRun.target.x-f.runner.x,dy=supportRun.target.y-f.runner.y,gap=Math.hypot(dx,dy);
   return ((option.target.x-f.runner.x)*dx+(option.target.y-f.runner.y)*dy)/gap;
  };
  assert.ok(Math.abs(actualLead(short)-expectedLead(short))<1e-9,
   'short-pass longitudinal lead must match its estimated arrival window');
  assert.ok(Math.abs(actualLead(long)-expectedLead(long))<1e-9,
   'long-pass longitudinal lead must match its estimated arrival window');
  for(const {option} of [short,long])
   assert.ok(Math.hypot(option.target.x-f.carrier.x,option.target.y-f.carrier.y)>=110-1e-9,
    'arrival-aware lead must preserve the existing minimum pass distance');
  assert.ok(actualLead(long)>actualLead(short)+5,
   'a longer flight gives the committed runner more time to advance');
 }
});

test('through-ball selection respects goalkeeper collection reach, skill, fatigue and recovery on both sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=throughBallKeeperFixture(team);
  const open=AI.attackingThroughBall([f.carrier,f.runner],team,f.carrier,f.supportRun);
  assert.ok(open,'fixture must begin with an uncontested through-ball');
  const keeper={t:1-team,keeper:true,x:open.target.x+f.dir*94,y:open.target.y+34,
   z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:0,moveVY:0,fatigue:0,
   src:{gkSkill:1,gkDiving:1}};
  const players=[f.carrier,f.runner,keeper];
  assert.ok(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),
   'a low-reach goalkeeper must not erase a clear through-ball');
  keeper.src.gkSkill=100;keeper.src.gkDiving=100;
  assert.equal(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),null,
   'a rested elite keeper within its projected collection pocket must block the through-ball');
  keeper.fatigue=1;
  assert.ok(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),
   'fatigue must reduce the keeper collection envelope');
  keeper.fatigue=0;keeper.keeper=false;
  assert.ok(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),
   'outfield defenders retain the existing 84-unit pocket');
  keeper.keeper=true;keeper.action='keeperRecover';
  assert.ok(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),
   'a recovering keeper cannot falsely block a ground through-ball');
  keeper.action='keeperDiveCatch';
  assert.ok(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),
   'a committed catch pose cannot falsely block a separate through-ball');
 }
});

test('through-ball keeper prediction rewards closing movement and respects a keeper moving away on both sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=throughBallKeeperFixture(team);
  const open=AI.attackingThroughBall([f.carrier,f.runner],team,f.carrier,f.supportRun);
  assert.ok(open);
  const keeper={t:1-team,keeper:true,x:open.target.x+f.dir*130,y:open.target.y,
   z:0,stun:0,down:false,action:'idle',actionTimer:0,moveVX:-f.dir*250,moveVY:0,
   fatigue:0,src:{gkSkill:100,gkDiving:100}};
  const players=[f.carrier,f.runner,keeper];
  assert.equal(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),null,
   'a keeper projected into reach before arrival must stop the speculative lead');
  keeper.moveVX=f.dir*250;
  assert.ok(AI.attackingThroughBall(players,team,f.carrier,f.supportRun),
   'a keeper moving away from the landing pocket must not over-defend it');
 }
});
