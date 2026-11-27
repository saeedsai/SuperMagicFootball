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

test('primary landing target meets the same descending ball without the support defender goal-side offset',async()=>{
 const {AI}=await loadModules(),ball=looseBall();
 const flight=(-40+Math.sqrt(40*40+1000*54))/500;
 const landingX=420+260*flight,landingY=300-80*flight;
 for(const team of [0,1]){
  const primary=AI.defensiveLooseBallPrimaryTarget(team,ball,bounds);
  const support=AI.defensiveLooseBallCoverTarget(team,ball,bounds);
  assert.ok(primary&&support);
  assert.ok(Math.abs(primary.x-landingX)<1e-9);
  assert.ok(Math.abs(primary.y-landingY)<1e-9);
  assert.ok(Math.abs(Math.hypot(primary.x-support.x,primary.y-support.y)-26)<1e-9);
 }
 const invalid=[
  {owner:{t:0}},{pass:true},{shot:{behavior:'normal'}},{strike:{power:1}},
  {ordinaryShot:true},{z:31.99},{z:175.01},{vz:35.01},{vz:-320.01},
  {x:NaN},{vy:Infinity}
 ];
 for(const patch of invalid)
  assert.equal(AI.defensiveLooseBallPrimaryTarget(0,{...ball,...patch},bounds),null,
   'primary must fail closed for '+Object.keys(patch).join(','));
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
  Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
   x,y,z:54,vx:dir*260,vy:-80,vz:-40,canCollect:0,attacker:1-team,lastTouchTeam:1-team});
  game.clock=5;
  const pressBounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const expected=AI.defensiveLooseBallCoverTarget(team,game.ball,pressBounds);
  const primaryExpected=AI.defensiveLooseBallPrimaryTarget(team,game.ball,pressBounds);
  assert.ok(expected&&primaryExpected);
  Object.assign(primary,{x:primaryExpected.x,y:primaryExpected.y,aiTimer:1});
  Object.assign(support,{x:x,y:primaryExpected.y,aiTimer:1});
  assert.ok(Math.hypot(primary.x-game.ball.x,primary.y-game.ball.y)>
   Math.hypot(support.x-game.ball.x,support.y-game.ball.y),
   'landing defender starts farther from the live ball');
  game.driveAI(primary,.016);
  game.driveAI(support,.016);
  assert.deepEqual(primary.aiTarget,primaryExpected,'the primary meets the actual predicted landing point');
  assert.deepEqual(support.aiTarget,expected,'the support defender protects the goal-side landing pocket');
  assert.ok(Math.abs(Math.hypot(primary.aiTarget.x-expected.x,primary.aiTarget.y-expected.y)-26)<1e-6,
   'the two defenders split the landing point and its 26-unit goal-side cover');
 }
});

 
test('primary and support split fresh low tackle spills and short rolling rebounds in both directions',async()=>{
 const {AI}=await loadModules();
 const spill={owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
  x:420,y:300,z:23,vx:150,vy:50,vz:115,canCollect:.15,age:0,lastTouchTeam:1};
 for(const team of [0,1]){
  const ball={...spill,lastTouchTeam:1-team,vx:team===0?150:-150};
  const primary=AI.defensiveGroundSpillPrimaryTarget(team,ball,bounds);
  const support=AI.defensiveGroundSpillCoverTarget(team,ball,bounds);
  assert.ok(primary&&support);
  const flight=(115+Math.sqrt(115*115+1000*23))/500,dir=team===0?1:-1;
  const landingX=420+Math.max(-150,Math.min(150,ball.vx*flight));
  const landingY=300+Math.max(-150,Math.min(150,50*flight));
  assert.ok(Math.abs(primary.x-landingX)<1e-9);
  assert.ok(Math.abs(primary.y-landingY)<1e-9);
  assert.ok(Math.abs(support.x-(landingX-dir*26))<1e-9);
  assert.ok(Math.abs(support.y-landingY)<1e-9);
  assert.ok(Math.abs(Math.hypot(primary.x-support.x,primary.y-support.y)-26)<1e-9);
 }
 const rolling={...spill,z:0,vx:180,vy:-60,vz:0,canCollect:0,age:.35};
 for(const team of [0,1]){
  const ball={...rolling,vx:team===0?180:-180};
  const primary=AI.defensiveGroundSpillPrimaryTarget(team,ball,bounds);
  const support=AI.defensiveGroundSpillCoverTarget(team,ball,bounds);
  const dir=team===0?1:-1,rollSeconds=(1-Math.pow(.986,.18*60))/(60*(1-.986)),
   landingX=420+Math.max(-150,Math.min(150,ball.vx*rollSeconds)),
   landingY=300+Math.max(-150,Math.min(150,-60*rollSeconds));
  assert.ok(primary&&support);
  assert.ok(Math.abs(primary.x-landingX)<1e-9);
  assert.ok(Math.abs(primary.y-landingY)<1e-9);
  assert.ok(Math.abs(support.x-(landingX-dir*26))<1e-9);
  assert.ok(Math.abs(support.y-landingY)<1e-9);
  assert.ok(Math.abs(Math.hypot(primary.x-support.x,primary.y-support.y)-26)<1e-9);
 }
 const invalid=[{age:1.16},{lastTouchTeam:-1},{vx:40,vy:20},{z:33},{vz:141},
  {pass:true},{ordinaryShot:true},{canCollect:1},{owner:{t:1}}];
 for(const patch of invalid){
  const ball={...spill,...patch};
  assert.equal(AI.defensiveGroundSpillPrimaryTarget(0,ball,bounds),null,
   'primary must reject '+Object.keys(patch).join(','));
  assert.equal(AI.defensiveGroundSpillCoverTarget(0,ball,bounds),null,
   'support must reject '+Object.keys(patch).join(','));
 }
});

test('driveAI assigns the support defender with the best momentum-aware arrival to the goal-side spill pocket',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const dir=team===0?1:-1,primary=game.player(team,3),atPocket=game.player(team,4),closing=game.player(team,5);
  const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
  for(const p of game.players){
   p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
   p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
  }
  for(const p of [primary,atPocket,closing]){
   p.down=false;p.stun=0;p.invuln=0;p.action='idle';p.actionTimer=0;p.z=0;
   p.slideTimer=0;p.shotImpactKnockdownPending=0;p.shotImpactKnockdownTimer=0;
   p.shotImpactRiseTimer=0;p.aiTarget=null;p.aiTimer=1;
  }
  Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
   x,y,z:0,vx:dir*180,vy:-60,vz:0,canCollect:0,age:.35,attacker:1-team,lastTouchTeam:1-team});
  game.clock=5;
  const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const primaryTarget=AI.defensiveGroundSpillPrimaryTarget(team,game.ball,bounds);
  const supportTarget=AI.defensiveGroundSpillCoverTarget(team,game.ball,bounds);
  assert.ok(primaryTarget&&supportTarget);
  Object.assign(primary,{x:primaryTarget.x,y:primaryTarget.y,moveVX:0,moveVY:0});
  Object.assign(atPocket,{x:supportTarget.x,y:supportTarget.y,moveVX:dir*220,moveVY:0});
  Object.assign(closing,{x:supportTarget.x-dir*4,y:supportTarget.y,moveVX:dir*33,moveVY:0});
  const distanceFirst=AI.defensivePressers([primary,atPocket,closing],team,{...primaryTarget,landingRead:true});
  assert.equal(distanceFirst.primary,primary);
  assert.equal(distanceFirst.support,atPocket,'distance-only support prefers the closer landing-center defender');
  const arrivalAware=AI.defensivePressers([primary,atPocket,closing],team,
   {...primaryTarget,landingRead:true},null,supportTarget);
  assert.equal(arrivalAware.primary,primary);
  assert.equal(arrivalAware.support,closing,'the slightly farther defender is already arriving into the cover pocket');
  game.moveAgile=()=>{};
  game.driveAI(primary,.016);game.driveAI(atPocket,.016);game.driveAI(closing,.016);
  assert.deepEqual(primary.aiTarget,primaryTarget,'primary still meets the spill landing');
  assert.deepEqual(closing.aiTarget,supportTarget,'closing support defender owns the goal-side cover pocket');
  assert.notDeepEqual(atPocket.aiTarget,supportTarget,'retreating pocket defender is not assigned the cover target');
 }
});
test('driveAI assigns primary and support to coordinated fresh ground-spill landing targets',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const dir=team===0?1:-1,primary=game.player(team,3),support=game.player(team,4);
  const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
  for(const scenario of [
   {name:'fresh tackle spill',z:23,vx:dir*150,vy:50,vz:115,canCollect:.15,age:0},
   {name:'short rolling rebound',z:0,vx:dir*180,vy:-60,vz:0,canCollect:0,age:.35}
  ]){
   for(const p of game.players){
    p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
    p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
   }
   for(const p of [primary,support]){
    p.down=false;p.stun=0;p.invuln=0;p.action='idle';p.actionTimer=0;p.z=0;
    p.slideTimer=0;p.shotImpactKnockdownPending=0;p.shotImpactKnockdownTimer=0;p.shotImpactRiseTimer=0;
   }
   Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
    x,y,z:scenario.z,vx:scenario.vx,vy:scenario.vy,vz:scenario.vz,
    canCollect:scenario.canCollect,age:scenario.age,attacker:1-team,lastTouchTeam:1-team});
   game.clock=5;
   const bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
   const primaryExpected=AI.defensiveGroundSpillPrimaryTarget(team,game.ball,bounds);
   const supportExpected=AI.defensiveGroundSpillCoverTarget(team,game.ball,bounds);
   assert.ok(primaryExpected&&supportExpected,scenario.name);
   Object.assign(primary,{x:primaryExpected.x,y:primaryExpected.y,aiTarget:null,aiTimer:1});
   Object.assign(support,{x:x,y:primaryExpected.y,aiTarget:null,aiTimer:1});
   assert.ok(Math.hypot(primary.x-game.ball.x,primary.y-game.ball.y)>
    Math.hypot(support.x-game.ball.x,support.y-game.ball.y),
    scenario.name+' landing defender starts farther from the live ball');
   game.driveAI(primary,.016);game.driveAI(support,.016);
   assert.deepEqual(primary.aiTarget,primaryExpected,scenario.name+' primary meets predicted landing');
   assert.deepEqual(support.aiTarget,supportExpected,scenario.name+' support protects goal-side pocket');
   assert.ok(Math.abs(Math.hypot(primary.aiTarget.x-support.aiTarget.x,
    primary.aiTarget.y-support.aiTarget.y)-26)<1e-6,scenario.name+' keeps 26-unit separation');
  }
 }
 const staleBall={...looseBall(),z:23,vx:150,vy:50,vz:115,canCollect:.15,age:1.16,lastTouchTeam:1};
 const nearBall={t:0,x:420,y:300,stun:0,down:false,z:0,action:'idle'};
 const farther={t:0,x:512,y:330,stun:0,down:false,z:0,action:'idle'};
 assert.equal(AI.defensiveGroundSpillPrimaryTarget(0,staleBall,bounds),null,
  'stale spills must not supply a landing assignment');
 assert.equal(AI.defensivePressers([nearBall,farther],0,staleBall,null).primary,nearBall,
  'without a trusted landing estimate the existing live-ball nearest-defender fallback remains');

});

test('rolling spill interception follows live Grass, Wet and Sand drag while airborne spill landing stays unchanged',async()=>{
 const {AI,ENGINE}=await loadModules();
 const rolling={owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
  x:420,y:300,z:0,vx:360,vy:-120,vz:0,canCollect:0,age:.35,lastTouchTeam:1};
 const surfaces=[
  {name:'Grass',terrain:'Grass',condition:'Clear',friction:.986},
  {name:'Wet',terrain:'Grass',condition:'Wet',friction:.96},
  {name:'Sand',terrain:'Sand',condition:'Clear',friction:.94}
 ];
 const projected=[];
 for(const surface of surfaces){
  const seconds=(1-Math.pow(surface.friction,.18*60))/(60*(1-surface.friction));
  for(const team of [0,1]){
   const ball={...rolling,lastTouchTeam:1-team,vx:team===0?360:-360};
   const primary=AI.defensiveGroundSpillPrimaryTarget(team,ball,bounds,surface.friction);
   const support=AI.defensiveGroundSpillCoverTarget(team,ball,bounds,surface.friction);
   const dir=team===0?1:-1;
   const expectedX=ball.x+Math.max(-150,Math.min(150,ball.vx*seconds));
   const expectedY=ball.y+Math.max(-150,Math.min(150,ball.vy*seconds));
   assert.ok(primary&&support,surface.name);
   assert.ok(Math.abs(primary.x-expectedX)<1e-9,surface.name+' primary X');
   assert.ok(Math.abs(primary.y-expectedY)<1e-9,surface.name+' primary Y');
   assert.ok(Math.abs(support.x-(expectedX-dir*26))<1e-9,surface.name+' support margin');
   assert.ok(Math.abs(support.y-expectedY)<1e-9,surface.name+' support Y');
   projected.push({surface:surface.name,team,primary});
   const game=new ENGINE.GameEngine({halfSeconds:120});
   game.init({home:0,away:1,mode:'quick',humans:0});
   game.terrain=surface.terrain;game.condition=surface.condition;game.weather='Clear';
   const field=ENGINE.WORLD.field,defender=game.player(team,3),cover=game.player(team,4);
   for(const p of game.players){
    p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
    p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
   }
   for(const p of [defender,cover]){
    p.down=false;p.stun=0;p.invuln=0;p.action='idle';p.actionTimer=0;p.z=0;
    p.slideTimer=0;p.shotImpactKnockdownPending=0;p.shotImpactKnockdownTimer=0;
    p.shotImpactRiseTimer=0;p.aiTimer=1;
   }
   const engineBall={...ball,x:field.x+field.w*.5,y:field.y+field.h*.5};
   Object.assign(game.ball,{...engineBall});
   game.clock=5;
   const liveBounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
   const primaryExpected=AI.defensiveGroundSpillPrimaryTarget(team,game.ball,liveBounds,surface.friction);
   const supportExpected=AI.defensiveGroundSpillCoverTarget(team,game.ball,liveBounds,surface.friction);
   Object.assign(defender,{x:primaryExpected.x,y:primaryExpected.y,aiTarget:null,aiTimer:1});
   Object.assign(cover,{x:field.x+field.w*.5,y:primaryExpected.y,aiTarget:null,aiTimer:1});
   game.moveAgile=()=>{};
   game.driveAI(defender,.016);game.driveAI(cover,.016);
   assert.deepEqual(defender.aiTarget,primaryExpected,surface.name+' actual primary dispatch');
   assert.deepEqual(cover.aiTarget,supportExpected,surface.name+' actual support dispatch');
  }
 }
 const grass=projected.find(x=>x.surface==='Grass'&&x.team===0).primary;
 const wet=projected.find(x=>x.surface==='Wet'&&x.team===0).primary;
 const sand=projected.find(x=>x.surface==='Sand'&&x.team===0).primary;
 assert.ok(grass.x>wet.x&&wet.x>sand.x,'more drag must shorten the roll projection');
 const airborne={...rolling,z:23,vx:150,vy:50,vz:115,canCollect:.15,age:0};
 const flight=(115+Math.sqrt(115*115+1000*23))/500;
 const airborneX=420+Math.max(-150,Math.min(150,150*flight));
 const airborneY=300+Math.max(-150,Math.min(150,50*flight));
 for(const friction of [.986,.96,.94]){
  const target=AI.defensiveGroundSpillPrimaryTarget(0,airborne,bounds,friction);
  assert.ok(Math.abs(target.x-airborneX)<1e-9,'airborne spill keeps its existing X landing estimate');
  assert.ok(Math.abs(target.y-airborneY)<1e-9,'airborne spill keeps its existing Y landing estimate');
 }
});
