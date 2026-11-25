'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([
  import('../src/modules/ai.js'),import('../src/modules/engine.js')
 ]);
 return {AI,ENGINE};
}
const player=(name,t,x,y,extra={})=>({
 name,t,keeper:false,x,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,
 moveVX:0,moveVY:0,...extra
});

test('moving carrier press assignment favors the defender already closing in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const attackTeam=1-team,dir=attackTeam===0?1:-1;
  const carrier={t:attackTeam,keeper:false,x:1000,y:600,moveVX:dir*120,moveVY:0};
  const nearer=player('nearer-but-retreating',team,1000-dir*100,600,{moveVX:-dir*220});
  const closing=player('slightly-farther-but-closing',team,1000-dir*105,600,{moveVX:dir*220});
  const support=player('distance-first-support',team,1000-dir*150,720);
  const result=AI.defensivePressers([nearer,closing,support],team,carrier);
  assert.equal(result.primary,closing,'arrival read should prefer the defender closing the moving carrier');
  assert.equal(result.support,nearer,'support remains selected by current distance and cover geometry');
 }
});

test('stationary and slow carriers favor the arriving primary while support stays distance-first',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const attackTeam=1-team,dir=attackTeam===0?1:-1;
  for(const carrierSpeed of [0,60]){
   const carrier={t:attackTeam,keeper:false,x:1000,y:600,moveVX:dir*carrierSpeed,moveVY:0};
   const nearer=player('nearer-but-retreating',team,1000-dir*100,600,{moveVX:-dir*220});
   const closing=player('slightly-farther-but-closing',team,1000-dir*105,600,{moveVX:dir*220});
   const support=player('distance-first-support',team,1000-dir*150,720);
   const result=AI.defensivePressers([nearer,closing,support],team,carrier);
   assert.equal(result.primary,closing,'a closing defender should win a close stationary/slow-carrier press');
   assert.equal(result.support,nearer,'support remains selected by current distance and cover geometry');
  }
 }
});

test('zero-velocity carriers and loose balls retain distance-first pressing',async()=>{
 const {AI}=await loadModules();
 const nearer=player('nearer',0,900,600);
 const farther=player('farther',0,895,600);
 for(const target of [
  {t:1,keeper:false,x:1000,y:600,moveVX:0,moveVY:0},
  {x:1000,y:600,vx:120,vy:0}
 ]){
  assert.equal(AI.defensivePressers([farther,nearer],0,target).primary,nearer);
 }
});

test('arrival scoring is bounded so extreme velocity cannot promote a much farther defender',async()=>{
 const {AI}=await loadModules();
 const carrier={t:1,keeper:false,x:1000,y:600,moveVX:120,moveVY:0};
 const nearer=player('nearer',0,900,600,{moveVX:-220});
 const far=player('far',0,870,600,{moveVX:220});
 assert.equal(AI.defensivePressers([far,nearer],0,carrier).primary,nearer);
 const malformed=player('malformed',0,890,600,{moveVX:NaN,moveVY:Infinity,vx:0,vy:0});
 assert.equal(AI.defensivePressers([malformed,nearer],0,carrier).primary,nearer);
 const stationary={t:1,keeper:false,x:1000,y:600,moveVX:0,moveVY:0};
 const nearRetreating=player('near-stationary',0,900,600,{moveVX:-220});
 const materiallyFarther=player('far-stationary',0,865,600,{moveVX:220});
 assert.equal(AI.defensivePressers([materiallyFarther,nearRetreating],0,stationary).primary,nearRetreating,
  'the capped arrival read must not promote a materially farther defender');
});

test('real driveAI assigns the moving-carrier press to the better-arriving defender on both sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const field=ENGINE.WORLD.field,x=field.x+field.w*.55,y=field.y+field.h*.5;
  const carrier=game.player(attackingTeam,3),nearer=game.player(defendingTeam,3),closing=game.player(defendingTeam,4);
  for(const q of game.players){
   if(q===carrier||q===nearer||q===closing||q.keeper)continue;
   q.down=true;q.stun=1;
  }
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:dir*120,moveVY:0,vx:dir*120,vy:0,dribbleHold:0,firstTouchControlTimer:0,firstTouchPressure:0});
  Object.assign(nearer,{x:x-dir*100,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:-dir*220,moveVY:0,vx:-dir*220,vy:0,slideTimer:0,shotImpactKnockdownPending:0,
   shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
  Object.assign(closing,{x:x-dir*105,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,slideTimer:0,shotImpactKnockdownPending:0,
   shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null,
   aiGiveAndGoRun:null,aiFirstTouchTarget:null,aiDetour:null});
  Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
   attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
  game.clock=2;
  const expected=AI.defensiveCarrierLeadTarget(closing,carrier,
   {xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24},.5);
  assert.ok(expected);
  game.driveAI(closing,.016);
  assert.ok(Math.hypot(closing.aiTarget.x-carrier.x,closing.aiTarget.y-carrier.y)<=34.1,
   JSON.stringify({defendingTeam,closingTarget:closing.aiTarget,expected}));
  assert.ok((closing.aiTarget.x-carrier.x)*dir>0);
  assert.ok(Math.abs(closing.aiTarget.y-expected.y)<1e-6);
  assert.equal(game.ball.owner,carrier);
 }
});


test('real driveAI assigns a stationary or slow-carrier press to the arriving defender on both sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const field=ENGINE.WORLD.field,x=field.x+field.w*.55,y=field.y+field.h*.5;
  const carrier=game.player(attackingTeam,3),nearer=game.player(defendingTeam,3),closing=game.player(defendingTeam,4);
  for(const q of game.players){
   if(q===carrier||q===nearer||q===closing||q.keeper)continue;
   q.down=true;q.stun=1;
  }
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   moveVX:0,moveVY:0,vx:0,vy:0,firstTouchControlTimer:0,firstTouchPressure:0});
  Object.assign(nearer,{x:x-dir*100,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:-dir*220,moveVY:0,vx:-dir*220,vy:0,slideTimer:0,shotImpactKnockdownPending:0,
   shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
  Object.assign(closing,{x:x-dir*105,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,slideTimer:0,shotImpactKnockdownPending:0,
   shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null,
   aiGiveAndGoRun:null,aiFirstTouchTarget:null,aiDetour:null});
  Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
   attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
  game.clock=2;game.moveAgile=()=>{};game.driveAI(closing,.016);
  assert.ok(closing.aiTarget&&Math.abs(closing.aiTarget.x-x)<1e-6&&Math.abs(closing.aiTarget.y-y)<1e-6,
   JSON.stringify({defendingTeam,target:closing.aiTarget,carrier:{x,y}}));
  assert.equal(game.ball.owner,carrier,'press assignment must not change possession');
 }
});

test('cross-track press selection uses the defender Agility turn reserve in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const carrier=player('stationary-carrier-'+team,1-team,1000,600,{moveVX:0,moveVY:0});
  const steady=player('steady-arrival-'+team,team,908,600,{moveVX:1,moveVY:0,src:{agility:50}});
  const lowAgility=player('low-agility-cross-track-'+team,team,910,600,{moveVX:0,moveVY:60,src:{agility:1}});
  const highAgility=player('high-agility-cross-track-'+team,team,910,600,{moveVX:0,moveVY:60,src:{agility:100}});
  const low=AI.defensivePressers([lowAgility,steady],team,carrier);
  const high=AI.defensivePressers([highAgility,steady],team,carrier);
  assert.equal(low.primary,steady,'low-Agility cross-track momentum must pay the larger reorientation reserve');
  assert.equal(low.support,lowAgility);
  assert.equal(high.primary,highAgility,'high Agility must retain the smaller cross-track turn cost in a close arrival tie');
  assert.equal(high.support,steady);
  const invalid=player('invalid-agility-cross-track-'+team,team,910,600,{moveVX:0,moveVY:60,src:{agility:NaN}});
  const fallback=AI.defensivePressers([invalid,steady],team,carrier);
  assert.equal(fallback.primary,steady,'missing/invalid Agility uses the neutral 50-point turn response');
  const extreme=AI.defensivePressers([player('extreme-cross-track-'+team,team,910,600,{moveVX:0,moveVY:2400,src:{agility:1}}),steady],team,carrier);
  assert.equal(extreme.primary,steady,'the turn reserve is capped and cannot over-promote a cross-track defender');
 }
});

test('real driveAI uses the Agility-aware cross-track press read without changing possession',async()=>{
 const {ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const field=ENGINE.WORLD.field,x=field.x+field.w*.55,y=field.y+field.h*.5;
  const carrier=game.player(attackingTeam,3),lowAgility=game.player(defendingTeam,3),steady=game.player(defendingTeam,4);
  for(const q of game.players){if(q===carrier||q===lowAgility||q===steady||q.keeper)continue;q.down=true;q.stun=1;}
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0,firstTouchControlTimer:0,firstTouchPressure:0});
  Object.assign(lowAgility,{x:x-dir*90,y,z:0,down:false,stun:0,action:'run',actionTimer:0,moveVX:0,moveVY:60,vx:0,vy:60,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
  lowAgility.src.agility=1;
  Object.assign(steady,{x:x-dir*92,y,z:0,down:false,stun:0,action:'run',actionTimer:0,moveVX:dir*1,moveVY:0,vx:dir*1,vy:0,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
  steady.src.agility=50;
  Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
  game.clock=2;game.driveAI(steady,.016);
  assert.ok(steady.aiTarget&&Math.hypot(steady.aiTarget.x-carrier.x,steady.aiTarget.y-carrier.y)<=34.1,JSON.stringify({defendingTeam,target:steady.aiTarget,carrier:{x,y}}));
  assert.equal(game.ball.owner,carrier,'the turn-aware press assignment must not change possession');
 }
});
