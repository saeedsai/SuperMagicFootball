/** Current modular goalkeeper dive-event attribution (read-only calibration). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const source=pathToFileURL(path.join(__dirname,'..','src','match_telemetry.js')).href;
const make=async()=>new (await import(source)).MatchOpportunityTracker();
const kick=(team,kind='shot')=>({type:'kick',player:{t:team},kind,
 origin:{x:team?1800:1900,y:765,z:20},targetY:800});
const attempt=(team)=>({type:'keeperDiveAttempt',team,keeperId:'gk-'+team,
 predictedSeconds:.2345,lateral:88.245,shotKind:'normal'});
const contact=(team)=>({type:'keeperContact',team,keeperId:'gk-'+team,
 depth:24.666,lateral:38.1,contactDepth:54,shotKind:'normal'});
test('mirrored shot dive/contact events correlate without inventing saves or goals',async()=>{
 const t=await make();
 for(const defendingTeam of [0,1]){
  t.onEvent(kick(1-defendingTeam));
  t.onEvent(attempt(defendingTeam));
  t.onEvent(contact(defendingTeam));
  const current=t.active;
  assert.equal(current.keeperDive.attempted,true);
  assert.equal(current.keeperDive.contacted,true);
  assert.equal(current.keeperDive.predictedSeconds,.23);
  assert.equal(current.keeperDive.lateralAtAttempt,88.25);
  assert.equal(current.keeperDive.contactDepth,24.67);
  assert.equal(current.keeperDive.keeperId,'gk-'+defendingTeam);
  assert.equal(current.outcome,null,'physical contact event does not claim save');
  t.onEvent({type:'save',player:{t:defendingTeam},saveType:'dive',deflected:true});
 }
 const c=t.report().keeperCalibration;
 assert.deepEqual([c.shots,c.attempted,c.contacted,c.attemptAndContact,c.attemptsWithoutContact],
                  [2,2,2,2,0]);
 assert.equal(c.byDefendingTeam.home.attemptAndContact,1);
 assert.equal(c.byDefendingTeam.away.attemptAndContact,1);
 assert.equal(t.report().counts.keeper_deflection,2);
});
test('early visual intent and actual plane contact have independent denominators',async()=>{
 const t=await make();
 t.onEvent(kick(0,'shot'));t.onEvent(attempt(1));
 t.onEvent(attempt(1)); // duplicate per-frame event cannot double-count a shot.
 t.onEvent({type:'goal',team:0});
 t.onEvent(kick(1,'superShot'));t.onEvent(contact(0));t.onEvent({type:'save',player:{t:0}});
 t.onEvent(kick(0,'superShot'));t.onEvent({type:'halftime'});
 t.onEvent(kick(0,'pass'));t.onEvent(attempt(1));t.onEvent(contact(1));t.onEvent({type:'finished'});
 const c=t.finalize().keeperCalibration;
 assert.equal(c.shots,3);
 assert.equal(c.attempted,1);
 assert.equal(c.contacted,1);
 assert.equal(c.attemptAndContact,0);
 assert.equal(c.attemptsWithoutContact,1);
 assert.equal(c.contactsWithoutAttempt,1);
 assert.equal(c.byShotKind.superShot.shots,2);
 assert.equal(c.byShotKind.superShot.contactsWithoutAttempt,1);
 assert.equal(c.unlinkedAttempts,1);
 assert.equal(c.unlinkedContacts,1);
 assert.equal(t.report().counts.goal,1,'a visual dive must never imply a save');
});
test('events from a wrong defending side and after an ended attempt remain unlinked',async()=>{
 const t=await make();
 t.onEvent(kick(0,'shot'));
 t.onEvent(attempt(0));t.onEvent(contact(0)); // own shooter is NOT opposing goalkeeper.
 assert.equal(t.active.keeperDive.contacted,false);
 t.onEvent({type:'goal',team:0});
 t.onEvent(attempt(1));t.onEvent(contact(1));
 const c=t.report().keeperCalibration;
 assert.equal(c.unlinkedAttempts,2);
 assert.equal(c.unlinkedContacts,2);
 assert.equal(c.attempted,0);
});
test('keeper telemetry is pure and excludes passes from shot classifications',async()=>{
 const t=await make();
 const game={players:[{t:0,x:1000,y:750},{t:1,x:2260,y:800,keeper:true}],
  ball:{vx:1000,vy:40,owner:null},world:{field:{x:150,w:2260.8}}};
 const before=JSON.stringify(game);
 t.onEvent(kick(0,'shot'),game);t.onEvent(attempt(1),game);
 t.onEvent(contact(1),game);t.observe(game,1/30);
 t.onEvent({type:'save',player:{t:1},saveType:'dive'},game);
 t.onEvent(kick(0,'pass'),game);
 assert.equal(JSON.stringify(game),before);
 const c=t.report();
 assert.equal(c.keeperCalibration.shots,1);
 assert.equal(c.attempts,2);
 assert.equal(c.keeperCalibration.attemptAndContact,1);
 assert.equal(c.records[1].keeperDive,undefined);
 assert.equal(c.keeperCalibration.unlinkedAttempts,0);
 assert.equal(c.keeperCalibration.unlinkedContacts,0);
});
