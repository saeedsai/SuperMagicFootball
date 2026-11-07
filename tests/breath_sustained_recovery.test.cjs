// BREATH-SUSTAINED-RECOVERY-01: real FITNESS module, no gameplay modifications.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/fitness.js'),'utf8');
const ctx={};
vm.runInNewContext(source.replace(/export \{FITNESS\};?/, '')+'\nthis.F=FITNESS',ctx);
const F=ctx.F;
function advance(start,stat,seconds,magnitude,sprint=false,hold=false,fps=60){
 let breath=start;
 const dt=1/fps;
 for(let i=0;i<seconds*fps;i++){
  const intensity=F.breathMovementIntensity(magnitude,sprint);
  breath=F.breathTick(breath,stat,dt,intensity);
  if(hold)breath=Math.max(0,breath-dt*F.dribbleHoldBreathRate(stat)*magnitude);
 }
 return breath;
}
test('sustained ordinary ball dribble stays inexpensive while sprint is costly',()=>{
 for(const stat of [1,35,60,100]){
  const cap=F.breathCapacity(stat);
  const dribble=advance(cap,stat,2,1,false,true);
  const sprint=advance(cap,stat,2,1,true,false);
  assert.ok(cap-dribble<.85,`ordinary held dribble drained too much at stamina ${stat}`);
  assert.ok(sprint<dribble-2,`sprint must drain far more than ordinary dribble at stamina ${stat}`);
  assert.ok(dribble>0&&sprint>=0&&sprint<=cap);
 }
});
test('release of sprint restores Breath while walking, across frame rates',()=>{
 for(const stat of [1,35,60,100]){
  const cap=F.breathCapacity(stat);
  for(const fps of [30,60,120]){
   const exhausted=advance(cap,stat,2,1,true,false,fps);
   const recovered=advance(exhausted,stat,1,.25,false,false,fps);
   assert.ok(recovered>exhausted,`walking recovery failed at ${fps} Hz, stamina ${stat}`);
   assert.ok(recovered<=cap);
   const idle=advance(exhausted,stat,1,0,false,false,fps);
   assert.ok(idle>=recovered,`idle should recover at least as fast as walking`);
  }
 }
});
