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
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(t,x,y,extra={})=>({
 t,x,y,keeper:false,z:0,stun:0,down:false,action:'idle',actionTimer:0,
 moveVX:0,moveVY:0,src:{id:`player-${t}-${x}-${y}`},...extra
});
const near=(a,b)=>Math.abs(a-b)<1e-6;

test('primary carrier lead follows moving dribblers in both attacking directions and stays bounded',async()=>{
 const {AI}=await loadModules();
 for(const defendingTeam of [0,1]){
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const defender=player(defendingTeam,500,300);
  const carrier=player(attackingTeam,620,300,{moveVX:dir*240,moveVY:90});
  const target=AI.defensiveCarrierLeadTarget(defender,carrier,bounds,.65);
  assert.ok(target,JSON.stringify({defendingTeam,target}));
  assert.ok((target.x-carrier.x)*dir>0,'lead must follow the carrier’s forward movement');
  assert.ok(target.y>carrier.y,'lateral movement must be included');
  assert.ok(Math.hypot(target.x-carrier.x,target.y-carrier.y)<=34.001);
  assert.ok(target.x>=bounds.xMin+22&&target.x<=bounds.xMax-22);
  assert.ok(target.y>=bounds.yMin+23&&target.y<=bounds.yMax-23);
 }
});

test('primary presser adds a bounded goalward cut-off for forward carriers in both directions',async()=>{
 const {AI}=await loadModules();
 const anticipation=.65,horizon=.08+anticipation*.10;
 const expectedCutoff=Math.min(8,(180-80)*.05)*anticipation;
 for(const defendingTeam of [0,1]){
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const carrier=player(attackingTeam,620,300,{moveVX:dir*180,moveVY:60});
  const defender=player(defendingTeam,620-dir*120,300);
  const target=AI.defensiveCarrierLeadTarget(defender,carrier,bounds,anticipation);
  assert.ok(target,JSON.stringify({defendingTeam,target}));
  assert.ok(near((target.x-carrier.x)*dir,180*horizon+expectedCutoff),
   JSON.stringify({defendingTeam,target,expectedCutoff}));
  assert.ok(near(target.y,carrier.y+60*horizon));
  assert.ok(Math.hypot(target.x-carrier.x,target.y-carrier.y)<=34.001);
 }
});

test('retreating, lateral-only and zero-anticipation carriers receive no extra goalward bias',async()=>{
 const {AI}=await loadModules();
 const defender=player(0,500,300);
 const retreat=AI.defensiveCarrierLeadTarget(defender,
  player(1,620,300,{moveVX:180,moveVY:0}),bounds,.75);
 assert.ok(retreat&&near(retreat.x,620+180*.155)&&near(retreat.y,300));
 const lateral=AI.defensiveCarrierLeadTarget(defender,
  player(1,620,300,{moveVX:0,moveVY:180}),bounds,.75);
 assert.ok(lateral&&near(lateral.x,620)&&near(lateral.y,300+180*.155));
 const noRead=AI.defensiveCarrierLeadTarget(defender,
  player(1,620,300,{moveVX:-180,moveVY:0}),bounds,0);
 assert.ok(noRead&&near(noRead.x,620-180*.08)&&near(noRead.y,300));
});

test('carrier anticipation scales the short lead and the 34-unit cap prevents overcommitment',async()=>{
 const {AI}=await loadModules();
 const defender=player(0,500,300);
 const carrier=player(1,620,300,{moveVX:120,moveVY:0});
 const low=AI.defensiveCarrierLeadTarget(defender,carrier,bounds,0);
 const high=AI.defensiveCarrierLeadTarget(defender,carrier,bounds,1);
 assert.ok(low&&high);
 assert.ok(high.x-carrier.x>low.x-carrier.x);
 const fast=AI.defensiveCarrierLeadTarget(defender,{...carrier,moveVX:900,moveVY:0},bounds,1);
 assert.ok(fast);
 assert.ok(Math.abs(fast.x-carrier.x-34)<1e-6);
});

test('stationary, slow, too-close, too-distant and malformed carriers retain direct pursuit',async()=>{
 const {AI}=await loadModules();
 const defender=player(0,500,300),carrier=player(1,620,300,{moveVX:0,moveVY:0});
 assert.equal(AI.defensiveCarrierLeadTarget(defender,carrier,bounds,.8),null);
 assert.equal(AI.defensiveCarrierLeadTarget(defender,{...carrier,moveVX:60},bounds,.8),null);
 assert.equal(AI.defensiveCarrierLeadTarget({...defender,x:570},carrier,bounds,.8),null);
 assert.equal(AI.defensiveCarrierLeadTarget({...defender,x:100},carrier,bounds,.8),null);
 assert.equal(AI.defensiveCarrierLeadTarget(defender,{...carrier,moveVX:NaN,moveVY:Infinity},bounds,.8),null);
 assert.equal(AI.defensiveCarrierLeadTarget(defender,carrier,{xMin:20,xMax:30,yMin:20,yMax:30},.8),null);
});

test('unavailable players and invalid team/keeper pairings never receive an intercept lead',async()=>{
 const {AI}=await loadModules();
 const defender=player(0,500,300),carrier=player(1,620,300,{moveVX:220,moveVY:0});
 for(const patch of [
  {down:true},{stun:.2},{z:22},{action:'shotDown'},{action:'slide',actionTimer:.2},
  {action:'hurt',actionTimer:.2}
 ])assert.equal(AI.defensiveCarrierLeadTarget(defender,{...carrier,...patch},bounds,.7),null,
  'carrier state '+JSON.stringify(patch));
 assert.equal(AI.defensiveCarrierLeadTarget({...defender,down:true},carrier,bounds,.7),null);
 assert.equal(AI.defensiveCarrierLeadTarget({...defender,z:24},carrier,bounds,.7),null);
 assert.equal(AI.defensiveCarrierLeadTarget(defender,{...carrier,t:0},bounds,.7),null);
 assert.equal(AI.defensiveCarrierLeadTarget({...defender,keeper:true},carrier,bounds,.7),null);
 assert.equal(AI.defensiveCarrierLeadTarget(defender,{...carrier,keeper:true},bounds,.7),null);
});

test('legacy vx/vy carrier records retain a bounded lead when movement fields are absent',async()=>{
 const {AI}=await loadModules();
 const defender=player(0,500,300);
 const carrier=player(1,620,300,{vx:180,vy:40});
 delete carrier.moveVX;delete carrier.moveVY;
 const target=AI.defensiveCarrierLeadTarget(defender,carrier,bounds,.5);
 assert.ok(target);
 assert.ok(target.x>carrier.x&&target.y>carrier.y);
});

test('primary presser shades toward an exposed live ground ball but respects far-side shielding',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const field=ENGINE.WORLD.field,x=field.x+field.w*.55,y=field.y+field.h*.5;
  const carrier=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
  for(const q of game.players){if(q===carrier||q===primary||q===support||q.keeper)continue;q.down=true;q.stun=1;}
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:0,moveVY:180,vx:0,vy:180,dribbleHold:0,firstTouchControlTimer:0});
  Object.assign(primary,{x:x-dir*110,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
   aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,aiFirstTouchTarget:null,aiDetour:null});
  Object.assign(support,{x:x-dir*220,y:y+100,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   slideTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
  Object.assign(game.ball,{owner:carrier,x:x-dir*24,y,z:0,vx:0,vy:0,vz:0,pass:false,
   passTarget:null,attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
  game.clock=2;
  const fieldBounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const anticipation=AI.aiTuning(game.cpuLevel(primary)).anticipation;
  const base=AI.defensiveCarrierLeadTarget(primary,carrier,fieldBounds,anticipation);
  const exposed=AI.defensiveCarrierLeadTarget(primary,carrier,fieldBounds,anticipation,game.ball);
  const expectedBias=Math.min(8,24*.25)*(.4+anticipation*.6);
  assert.ok(base&&exposed);
  assert.ok(near((exposed.x-base.x)*(-dir),expectedBias),JSON.stringify({defendingTeam,base,exposed,expectedBias}));
  assert.ok(near(exposed.y,base.y));
  assert.ok(Math.hypot(exposed.x-carrier.x,exposed.y-carrier.y)<=34.001);
  game.driveAI(primary,.016);
  assert.ok(near(primary.aiTarget.x,exposed.x),JSON.stringify({defendingTeam,expected:exposed,actual:primary.aiTarget}));
  assert.ok(near(primary.aiTarget.y,exposed.y));
  const shieldedBall={...game.ball,x:x+dir*24};
  const shielded=AI.defensiveCarrierLeadTarget(primary,carrier,fieldBounds,anticipation,shieldedBall);
  assert.ok(shielded&&near(shielded.x,base.x)&&near(shielded.y,base.y));
  Object.assign(game.ball,shieldedBall);game.driveAI(primary,.016);
  assert.ok(near(primary.aiTarget.x,base.x)&&near(primary.aiTarget.y,base.y));
  for(const patch of [{owner:null},{x:x-dir*40},{z:24},{x:NaN},{y:NaN},{x:x-dir*3}]){
   const ignored=AI.defensiveCarrierLeadTarget(primary,carrier,fieldBounds,anticipation,{...game.ball,...patch});
   assert.ok(ignored&&near(ignored.x,base.x)&&near(ignored.y,base.y),JSON.stringify({patch,base,ignored}));
  }
 }
});

test('real driveAI leads the primary presser to a moving carrier and falls back for a stationary one',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
  const field=ENGINE.WORLD.field,x=field.x+field.w*.55,y=field.y+field.h*.5;
  const carrier=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
  for(const q of game.players){
   if(q===carrier||q===primary||q===support||q.keeper)continue;
   q.down=true;q.stun=1;
  }
  Object.assign(carrier,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:dir*180,moveVY:60,vx:dir*180,vy:60,dribbleHold:0,firstTouchControlTimer:0});
  Object.assign(primary,{x:x-dir*110,y:y-20,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
   aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,aiFirstTouchTarget:null,aiDetour:null});
  Object.assign(support,{x:x-dir*220,y:y+100,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   slideTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null});
  Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
   attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
  game.clock=2;
  const fieldBounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
  const anticipation=AI.aiTuning(game.cpuLevel(primary)).anticipation;
  const horizon=.08+anticipation*.10;
  const expectedCutoff=Math.min(8,Math.max(0,(180-80)*.05))*anticipation;
  const expected=AI.defensiveCarrierLeadTarget(primary,carrier,fieldBounds,anticipation);
  assert.ok(expected);
  assert.ok(near((expected.x-x)*dir,180*horizon+expectedCutoff),
   JSON.stringify({defendingTeam,expected,horizon,expectedCutoff}));
  assert.ok(near(expected.y,y+60*horizon));
  game.driveAI(primary,.016);
  assert.ok(near(primary.aiTarget.x,expected.x),JSON.stringify({defendingTeam,expected,actual:primary.aiTarget}));
  assert.ok(near(primary.aiTarget.y,expected.y));
  assert.equal(game.ball.owner,carrier,'pressing must not alter possession');
  Object.assign(carrier,{moveVX:0,moveVY:0,vx:0,vy:0});
  game.driveAI(primary,.016);
  assert.ok(near(primary.aiTarget.x,carrier.x));
  assert.ok(near(primary.aiTarget.y,carrier.y));
 }
});
