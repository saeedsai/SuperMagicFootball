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


test('moving-carrier press arrival projects each defender through its live Agility-limited steering',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const attackTeam=1-team,dir=attackTeam===0?1:-1;
  const carrier={t:attackTeam,keeper:false,x:1000,y:600,moveVX:dir*120,moveVY:0,
   dx:dir,dy:0,src:{agility:50}};
  const make=(name,agility,heading)=>player(name,team,1000-dir*100,600,{
   moveVX:0,moveVY:120,dx:heading*dir,dy:0,src:{agility}
  });
  const away=make('turned-away-'+team,100,-1);
  const turning=make('turning-in-'+team,100,1);
  const result=AI.defensivePressers([away,turning],team,carrier);
  assert.equal(result.primary,turning,'live steering toward a moving carrier must beat identical momentum turning away');
  assert.equal(result.support,away,'the remaining defender stays the cover player');

  const low=make('low-agility-in-'+team,1,1);
  const high=make('high-agility-in-'+team,100,1);
  assert.equal(AI.defensivePressers([low,high],team,carrier).primary,high,
   'higher Agility earns only its bounded earlier turn arrival');

  const slowAway=player('slow-away-'+team,team,1000-dir*100,600,{
   moveVX:0,moveVY:60,dx:-dir,dy:0,src:{agility:100}
  });
  const slowTurning=player('slow-turning-'+team,team,1000-dir*100,600,{
   moveVX:0,moveVY:60,dx:dir,dy:0,src:{agility:100}
  });
  assert.equal(AI.defensivePressers([slowAway,slowTurning],team,carrier).primary,slowAway,
   'sub-75-unit/s defenders retain the previous cross-track reserve');

  const neutralAway=make('neutral-away-'+team,100,-1);
  const neutralTurning=make('neutral-turning-'+team,100,1);
  delete neutralAway.dx;delete neutralAway.dy;delete neutralTurning.dx;delete neutralTurning.dy;
  assert.equal(AI.defensivePressers([neutralAway,neutralTurning],team,carrier).primary,neutralAway,
   'neutral steering preserves distance-first tie order and the existing cross-track penalty');
  const malformedAway=make('malformed-away-'+team,100,-1);
  const malformedTurning=make('malformed-turning-'+team,100,1);
  malformedAway.dx=NaN;malformedAway.dy=Infinity;
  malformedTurning.dx=NaN;malformedTurning.dy=Infinity;
  assert.equal(AI.defensivePressers([malformedAway,malformedTurning],team,carrier).primary,malformedAway,
   'malformed steering falls back without inventing a turn');

  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const field=ENGINE.WORLD.field,x=field.x+field.w*.55,y=field.y+field.h*.5;
  const liveCarrier=game.player(attackTeam,3),liveAway=game.player(team,3),liveTurning=game.player(team,4);
  for(const q of game.players){
   if(q===liveCarrier||q===liveAway||q===liveTurning||q.keeper)continue;
   q.down=true;q.stun=1;
  }
  Object.assign(liveCarrier,{x,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
   moveVX:dir*120,moveVY:0,vx:dir*120,vy:0,dx:dir,dy:0,
   firstTouchControlTimer:0,firstTouchPressure:0,dribbleHold:0});
  liveCarrier.src.agility=50;
  for(const [q,heading] of [[liveAway,-1],[liveTurning,1]]){
   Object.assign(q,{x:x-dir*100,y,z:0,down:false,stun:0,action:'run',actionTimer:0,
    moveVX:0,moveVY:120,vx:0,vy:120,dx:heading*dir,dy:0,slideTimer:0,
    shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
    aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,aiFirstTouchTarget:null,aiDetour:null});
   q.src.agility=100;
  }
  Object.assign(game.ball,{owner:liveCarrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
   attacker:attackTeam,lastTouchTeam:attackTeam,age:0,shot:null,strike:null,ordinaryShot:false});
  game.clock=2;game.moveAgile=()=>{};game.driveAI(liveTurning,.016);
  assert.ok(liveTurning.aiTarget&&Math.hypot(liveTurning.aiTarget.x-x,liveTurning.aiTarget.y-y)<=34.1,
   JSON.stringify({team,liveTarget:liveTurning.aiTarget,carrier:{x,y}}));
  assert.equal(game.ball.owner,liveCarrier,'turn-aware press selection must not change possession');
 }
});

test('moving-carrier press and lead projection anticipate current turn input at the carrier Agility limit',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const attackTeam=1-team,dir=attackTeam===0?1:-1,cutSign=team===0?-1:1;
  const carrier={t:attackTeam,keeper:false,x:1000,y:600,moveVX:dir*220,moveVY:0,
   dx:0,dy:cutSign,src:{agility:100}};
  const makeDefenders=()=>[
   player('momentum-lane-'+team,team,1000-dir*80,600,{moveVX:dir*220,moveVY:0}),
   player('cut-lane-'+team,team,1000-dir*80,600+cutSign*16,{moveVX:dir*220,moveVY:0})
  ];
  const bounds={xMin:100,xMax:2100,yMin:100,yMax:1300};
  let defenders=makeDefenders();
  assert.equal(AI.defensivePressers(defenders,team,carrier).primary,defenders[1],
   'high-Agility carrier input should move the press read into the cut lane');
  let lead=AI.defensiveCarrierLeadTarget(defenders[1],carrier,bounds,.5);
  assert.ok(lead&&cutSign*(lead.y-carrier.y)>20,JSON.stringify({team,agility:100,lead}));

  carrier.src.agility=50;defenders=makeDefenders();
  assert.equal(AI.defensivePressers(defenders,team,carrier).primary,defenders[1],
   'average Agility preserves a responsive but bounded input read');
  lead=AI.defensiveCarrierLeadTarget(defenders[1],carrier,bounds,.5);
  assert.ok(lead&&cutSign*(lead.y-carrier.y)>20,JSON.stringify({team,agility:50,lead}));

  carrier.src.agility=1;defenders=makeDefenders();
  assert.equal(AI.defensivePressers(defenders,team,carrier).primary,defenders[0],
   'low Agility retains more of the existing momentum lane');
  lead=AI.defensiveCarrierLeadTarget(defenders[0],carrier,bounds,.5);
  assert.ok(lead&&cutSign*(lead.y-carrier.y)<14,JSON.stringify({team,agility:1,lead}));

  delete carrier.dx;delete carrier.dy;defenders=makeDefenders();
  assert.equal(AI.defensivePressers(defenders,team,carrier).primary,defenders[0],
   'neutral input preserves the residual-momentum baseline');
  lead=AI.defensiveCarrierLeadTarget(defenders[0],carrier,bounds,.5);
  assert.ok(lead&&Math.abs(lead.y-carrier.y)<1e-9);

  carrier.dx=NaN;carrier.dy=Infinity;defenders=makeDefenders();
  assert.equal(AI.defensivePressers(defenders,team,carrier).primary,defenders[0],
   'malformed input fails back to residual momentum');
  carrier.moveVX=dir*60;carrier.moveVY=0;defenders=makeDefenders();
  assert.equal(AI.defensivePressers(defenders,team,carrier).primary,defenders[0],
   'slow carriers retain the stationary/slow arrival read');
  assert.equal(AI.defensiveCarrierLeadTarget(defenders[0],carrier,bounds,.5),null);

  const looseBall={x:1000,y:600,vx:dir*220,vy:0,dx:0,dy:cutSign};
  defenders=makeDefenders();
  assert.equal(AI.defensivePressers(defenders,team,looseBall).primary,defenders[0],
   'loose-ball and non-carrier targets remain distance-first');
 }
});

test('real GameEngine driveAI selects and leads into the moving carrier input lane on both sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const defendingTeam of [0,1]){
  for(const agility of [100,1]){
   const game=new ENGINE.GameEngine({halfSeconds:120});
   game.init({home:0,away:1,mode:'quick',humans:0});
   const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,cutSign=defendingTeam===0?-1:1;
   const field=ENGINE.WORLD.field,x=field.x+field.w*.55,y=field.y+field.h*.5;
   const carrier=game.player(attackingTeam,3),momentum=game.player(defendingTeam,3),cut=game.player(defendingTeam,4);
   for(const q of game.players){if(q===carrier||q===momentum||q===cut||q.keeper)continue;q.down=true;q.stun=1;}
   Object.assign(carrier,{x,y,z:0,down:false,stun:0,invuln:0,action:'run',actionTimer:0,
    moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,dx:0,dy:cutSign,
    firstTouchControlTimer:0,firstTouchPressure:0,dribbleHold:0});
   carrier.src.agility=agility;
   for(const [q,laneY] of [[momentum,y],[cut,y+cutSign*16]]){
    Object.assign(q,{x:x-dir*80,y:laneY,z:0,down:false,stun:0,invuln:0,action:'run',actionTimer:0,
     moveVX:dir*220,moveVY:0,vx:dir*220,vy:0,slideTimer:0,
     shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
     aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,aiFirstTouchTarget:null,aiDetour:null});
   }
   Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,
    attacker:attackingTeam,lastTouchTeam:attackingTeam,age:0,shot:null,strike:null,ordinaryShot:false});
   game.clock=2;game.moveAgile=()=>{};
   const primary=agility>=50?cut:momentum;
   game.driveAI(primary,.016);
   assert.ok(primary.aiTarget,JSON.stringify({defendingTeam,agility,target:primary.aiTarget}));
   const laneShift=cutSign*(primary.aiTarget.y-y);
   assert.ok(agility>=50?laneShift>20:laneShift<14,
    JSON.stringify({defendingTeam,agility,laneShift,target:primary.aiTarget}));
   assert.equal(game.ball.owner,carrier,'turn-aware press assignment must not change possession');
  }
 }
});
