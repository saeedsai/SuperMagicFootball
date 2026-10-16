/** Release-time keeper target/fatigue fairness cohorts are observations, not saves. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),path=require('node:path');
const url=pathToFileURL(path.join(__dirname,'..','src','match_telemetry.js')).href;
const tracker=async()=>new (await import(url)).MatchOpportunityTracker();
function game(defendingTeam,offset,fatigue,pressure=100){
 const attacking=1-defendingTeam;
 const keeper={t:defendingTeam,keeper:true,x:defendingTeam?2370:280,y:760,fatigue};
 return {players:[keeper,{t:attacking,x:1200,y:760,keeper:false},
  {t:defendingTeam,x:1200+pressure,y:760,keeper:false}],
  ball:{vx:attacking? -850:850,vy:0,owner:null},
  world:{field:{x:150,w:2260.8}},target:760+offset};
}
function shoot(t,aim,kind='shot'){
 return {type:'kick',player:{t},kind,origin:{x:1200,y:760,z:15},targetY:aim};
}
test('mirrored goalkeeper sides yield equal release cohorts and honest outcomes',async()=>{
 const t=await tracker();
 for(const side of [0,1]){
  const g=game(side,40,.1);
  const snapshot=JSON.stringify(g);
  t.onEvent(shoot(1-side,g.target),g);
  assert.equal(t.active.releaseContext.keeperTargetOffset,40);
  t.onEvent({type:side===0?'save':'goal',...(side===0?{player:{t:side},saveType:'catch'}:{team:1-side})});
  assert.equal(JSON.stringify(g),snapshot,'observations must never mutate match state');
 }
 const r=t.report().keeperCalibration;
 assert.equal(r.shots,2);
 assert.deepEqual([r.byTargetOffsetBand.near.shots,r.byTargetOffsetBand.near.saves,
  r.byTargetOffsetBand.near.goals],[2,1,1]);
 assert.equal(r.byKeeperFatigueBand.rested.shots,2);
 assert.equal(r.byDefendingTeam.home.shots,1);
 assert.equal(r.byDefendingTeam.away.shots,1);
 assert.equal(r.byTargetOffsetBand.near.attempted,0,'events cannot invent physical dives');
});
test('edge targets and tired keepers separate contacts, real deflections and goals',async()=>{
 const t=await tracker();
 const g=game(0,90,.5,25);
 t.onEvent(shoot(1,g.target),g);
 t.onEvent({type:'keeperDiveAttempt',team:0});
 t.onEvent({type:'keeperContact',team:0});
 t.onEvent({type:'save',player:{t:0},deflected:true});
 const h=game(1,185,.88,260);
 t.onEvent(shoot(0,h.target,'superShot'),h);
 t.onEvent({type:'goal',team:0});
 const r=t.report().keeperCalibration;
 assert.equal(r.byTargetOffsetBand.stretch.deflections,1);
 assert.equal(r.byTargetOffsetBand.stretch.attemptAndContact,1);
 assert.equal(r.byTargetOffsetBand.wide.goals,1);
 assert.equal(r.byKeeperFatigueBand.moderate.deflections,1);
 assert.equal(r.byKeeperFatigueBand.tired.goals,1);
 assert.equal(r.byReleasePressureBand.close.deflections,1);
 assert.equal(r.byReleasePressureBand.open.goals,1);
 assert.equal(Object.values(r.byReleasePressureBand).reduce((sum,v)=>sum+v.shots,0),r.shots);
 assert.equal(r.byTargetOffsetBand.stretch.saves,0,'deflection is not a caught save');
 assert.equal(r.byTargetOffsetBand.wide.contacted,0);
});
test('missing and invalid aim or fatigue remain unobserved, never invented',async()=>{
 const t=await tracker();
 const g=game(1,0,.5);
 const e=shoot(0,undefined);
 t.onEvent(e,g);t.onEvent({type:'halftime'});
 const bad=game(0,0,Infinity);t.onEvent(shoot(1,760),bad);t.onEvent({type:'finished'});
 t.onEvent(shoot(1,760),null);t.onEvent({type:'halftime'});
 t.onEvent(shoot(1,760,'pass'),g);t.onEvent({type:'finished'});
 const r=t.report().keeperCalibration;
 assert.equal(r.shots,3);
 assert.equal(r.byTargetOffsetBand.unobserved.shots,2);
 assert.equal(r.byTargetOffsetBand.near.shots,1);
 assert.equal(r.byKeeperFatigueBand.unobserved.shots,2);
 assert.equal(r.byKeeperFatigueBand.moderate.shots,1);
 assert.equal(r.byTargetOffsetBand.unobserved.otherOrUnresolved,2);
 assert.equal(r.byTargetOffsetBand.unobserved.goals,0);
});
test('exact threshold boundaries, snapshot stability and shot-only partition accounting',async()=>{
 const t=await tracker();
 const inputs=[[65,.35,'stretch','moderate'],[145,.7,'wide','tired'],[64.99,.34,'near','rested']];
 for(const [offset,fatigue] of inputs){
  const g=game(1,offset,fatigue);
  t.onEvent(shoot(0,g.target),g);
  g.players[0].y=200;g.players[0].fatigue=.99; // must not re-bin stored shot
  t.onEvent({type:'goal',team:0});
 }
 t.onEvent(shoot(0,760,'pass'),game(1,0,.2));t.onEvent({type:'finished'});
 const r=t.report().keeperCalibration;
 const offsetBands=r.byTargetOffsetBand,fatigueBands=r.byKeeperFatigueBand;
 assert.equal(offsetBands.near.shots,1);
 assert.equal(offsetBands.stretch.shots,1);
 assert.equal(offsetBands.wide.shots,1);
 assert.equal(fatigueBands.rested.shots,1);
 assert.equal(fatigueBands.moderate.shots,1);
 assert.equal(fatigueBands.tired.shots,1);
 assert.equal(Object.values(offsetBands).reduce((sum,b)=>sum+b.shots,0),r.shots);
 assert.equal(Object.values(fatigueBands).reduce((sum,b)=>sum+b.shots,0),r.shots);
 assert.equal(r.shots,3,'passes excluded from keeper calibration');
});
