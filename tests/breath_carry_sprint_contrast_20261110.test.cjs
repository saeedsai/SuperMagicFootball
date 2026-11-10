const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const fitnessPromise=import(pathToFileURL(path.join(__dirname,'../src/modules/fitness.js')).href).then(m=>m.FITNESS);

test('ordinary ball carrying plus held Dribble costs far less Breath than sprint',async()=>{
 const f=await fitnessPromise;
 for(const stamina of [1,35,60,100]){
  const cap=f.breathCapacity(stamina);
  const ordinary=f.breathMovementIntensity(1,false,false);
  const sprint=f.breathMovementIntensity(1,true,false);
  const ordinaryLoss=cap-f.breathTick(cap,stamina,1,ordinary)+f.dribbleHoldBreathRate(stamina);
  const sprintLoss=cap-f.breathTick(cap,stamina,1,sprint);
  assert.ok(ordinaryLoss>0&&ordinaryLoss<.25,`cheap carry at stamina ${stamina}: ${ordinaryLoss}`);
  assert.ok(sprintLoss>ordinaryLoss*6,`sprint should cost >6x ordinary carry at stamina ${stamina}: ${sprintLoss} vs ${ordinaryLoss}`);
  assert.ok(sprintLoss<cap,'one second of sprint should not exhaust full Breath capacity');
 }
});
test('walking and idle recover Breath while Energy is independent',async()=>{
 const f=await fitnessPromise;
 for(const stamina of [1,60,100]){
  const cap=f.breathCapacity(stamina),start=cap*.3;
  const idle=f.breathTick(start,stamina,1,f.breathMovementIntensity(0));
  const walk=f.breathTick(start,stamina,1,f.breathMovementIntensity(.3));
  assert.ok(idle>start&&idle<=cap);
  assert.ok(walk>start&&walk<=cap);
  assert.ok(f.breathTick(start,stamina,1,f.breathMovementIntensity(1,true))<start);
  assert.equal(f.recoverEnergy(30,0,stamina),30,'Breath tick does not alter Energy recovery');
 }
});
