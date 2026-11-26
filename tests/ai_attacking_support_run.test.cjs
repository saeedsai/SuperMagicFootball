'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadAI(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();return (await import('../src/modules/ai.js')).AI;}
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,homeY:y,stun:0,z:0,...extra});

test('attacking support runner advances toward goal in a safer mirrored lane',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
  const runner=player('runner',team,carrier.x+dir*50,300);
  const blocker=player('blocker',1-team,carrier.x+dir*160,188);
  const result=AI.attackingSupportRun([carrier,runner,blocker],team,carrier,null,bounds);
  assert.equal(result?.runner,runner);
  assert.equal(result.target.x,carrier.x+dir*160);
  assert.equal(result.target.y,412,'runner should use the lateral lane away from the defender');
 }
});

test('human, keeper, recovering, sliding, downed and airborne teammates cannot consume the support run',async()=>{
 const AI=await loadAI(),carrier=player('carrier',0,400,300),human=player('human',0,430,300);
 const unavailable=[
  player('keeper',0,420,300,{keeper:true}),player('stunned',0,425,300,{stun:.2}),
  player('down',0,426,300,{down:true}),player('sliding',0,427,300,{slideTimer:.2}),
  player('pending',0,428,300,{shotImpactKnockdownPending:.2}),
  player('knocked-down',0,429,300,{shotImpactKnockdownTimer:.2}),
  player('getting-up',0,431,300,{shotImpactRiseTimer:.2}),
  player('airborne',0,432,300,{z:30}),player('assisting',0,433,300,{aiAssistTarget:{expires:5}})
 ];
 const available=player('available',0,460,300);
 const result=AI.attackingSupportRun([carrier,human,...unavailable,available],0,carrier,human,bounds);
 assert.equal(result?.runner,available);
});

test('support run avoids a teammate already occupying its arrival lane',async()=>{
 const AI=await loadAI(),carrier=player('carrier',0,400,300),runner=player('runner',0,450,300);
 const laneMate=player('lane-mate',0,550,188,{aiAssistTarget:{expires:5}});
 const result=AI.attackingSupportRun([carrier,runner,laneMate],0,carrier,null,bounds);
 assert.equal(result?.runner,runner);
 assert.equal(result.target.y,412);
});

test('support target stays inside pitch bounds and malformed/no-space inputs fall back',async()=>{
 const AI=await loadAI(),carrier=player('carrier',0,900,30),runner=player('runner',0,850,30);
 const result=AI.attackingSupportRun([carrier,runner],0,carrier,null,bounds);
 assert.equal(result?.target.x,976);
 assert.ok(result.target.y>=bounds.yMin&&result.target.y<=bounds.yMax);
 assert.equal(AI.attackingSupportRun([carrier,runner],0,carrier,null,null),null);
 assert.equal(AI.attackingSupportRun([carrier],0,carrier,null,bounds),null);
 assert.equal(AI.attackingSupportRun([carrier,runner],1,carrier,null,bounds),null);
});


test('support lane selection anticipates defenders closing into or leaving a diagonal route',async()=>{
 const AI=await loadAI();
 const carrier=player('carrier',0,400,300),runner=player('runner',0,450,300);
 const closing=player('closing',1,500,340,{moveVX:0,moveVY:-300});
 const saferLower=AI.attackingSupportRun([carrier,runner,closing],0,carrier,null,bounds);
 assert.equal(saferLower?.target.y,412,'runner avoids the upper lane a defender is sprinting into');
 const leaving=player('leaving',1,500,340,{moveVX:0,moveVY:300});
 const saferUpper=AI.attackingSupportRun([carrier,runner,leaving],0,carrier,null,bounds);
 assert.equal(saferUpper?.target.y,188,'runner can use the upper lane the defender is moving away from');
});


test('support-run selection prefers a goal-facing receiver in both attack directions',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
  const turned=player('turned',team,carrier.x+dir*50,300,{face:-dir});
  const facing=player('facing',team,carrier.x+dir*50,300,{face:dir});
  const result=AI.attackingSupportRun([carrier,turned,facing],team,carrier,null,bounds);
  assert.equal(result?.runner,facing,'team '+team+' should prefer the receiver already facing its attacking goal');
 }
});

test('forward momentum overrides stale facing at 110 units per second',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
  const moving=player('moving',team,carrier.x+dir*50,300,{face:-dir,moveVX:dir*110});
  const facing=player('facing',team,carrier.x+dir*50,300,{face:dir});
  const result=AI.attackingSupportRun([carrier,moving,facing],team,carrier,null,bounds);
  assert.equal(result?.runner,moving,'a real forward run must override stale sprite facing for team '+team);
 }
});

test('sub-threshold forward movement does not override a goal-facing receiver',async()=>{
 const AI=await loadAI();
 const carrier=player('carrier',0,400,300);
 const moving=player('moving',0,450,300,{face:-1,moveVX:109});
 const facing=player('facing',0,450,300,{face:1});
 assert.equal(AI.attackingSupportRun([carrier,moving,facing],0,carrier,null,bounds)?.runner,facing);
});

test('orientation is only a tie-breaker and never rejects a sole safe runner',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
  const sole=player('sole',team,carrier.x+dir*50,300,{face:-dir});
  assert.equal(AI.attackingSupportRun([carrier,sole],team,carrier,null,bounds)?.runner,sole);
 }
});


test('support-run lane selection projects defender turns using Agility in both attack directions',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
  const runner=player('runner',team,carrier.x+dir*50,300);
  const marker=agility=>player('marker-'+agility,1-team,carrier.x+dir*80,320,{
   moveVX:dir*300,moveVY:300,dx:dir,dy:-1,src:{agility}
  });
  const elite=AI.attackingSupportRun([carrier,runner,marker(100)],team,carrier,null,bounds);
  const limited=AI.attackingSupportRun([carrier,runner,marker(1)],team,carrier,null,bounds);
  assert.equal(elite?.runner,runner);
  assert.equal(limited?.runner,runner);
  assert.equal(elite.target.y,412,'an elite marker turning into the upper route makes the runner use the lower lane for team '+team);
  assert.equal(limited.target.y,188,'a low-Agility marker retains lower-lane momentum, leaving the upper route safer for team '+team);
 }
});

test('neutral and invalid defender input preserve linear support-run threat projection',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
  const runner=player('runner',team,carrier.x+dir*50,300);
  const resultFor=(dx,dy)=>AI.attackingSupportRun([carrier,runner,player('marker',1-team,
   carrier.x+dir*80,320,{moveVX:dir*300,moveVY:300,dx,dy,src:{agility:100}})],
   team,carrier,null,bounds);
  const neutral=resultFor(0,0),invalid=resultFor(NaN,NaN);
  assert.deepEqual(invalid,neutral,'invalid directional input must retain the neutral linear fallback for team '+team);
  assert.equal(neutral?.target.y,188,'linear momentum still identifies the lower-lane threat for team '+team);
 }
});
