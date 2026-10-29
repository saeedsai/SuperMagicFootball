const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function text(file){return fs.readFileSync(path.join(root,file),'utf8')}
const source=text('src/modules/fitness.js');
const ctx={};vm.runInNewContext(source.replace(/export \{FITNESS\};?/g,'')+'\nthis.F=FITNESS',ctx);
const F=ctx.F;
test('Breath capacity remains in 3 to 10 second range',()=>{
 assert.equal(F.breathCapacity(1),3);assert.equal(F.breathCapacity(100),10);
});
test('idle and walking refill Breath quickly without exceeding capacity',()=>{
 for(const stat of [1,50,100]){
  const cap=F.breathCapacity(stat);
  assert.ok(F.breathTick(0,stat,8,.45)>cap*.90);
  assert.equal(F.breathTick(cap,stat,10,0),cap);
  assert.ok(F.breathTick(0,stat,3,0)>F.breathTick(0,stat,3,.45));
 }
});
test('running and sprinting do not regenerate Breath',()=>{
 for(const stat of [1,50,100]){
  assert.ok(F.breathTick(2,stat,1,1)<2);
  assert.ok(F.breathTick(2,stat,1,1.7)<F.breathTick(2,stat,1,1));
 }
});
test('higher Stamina improves capacity and refill without making spam free',()=>{
 assert.ok(F.breathCapacity(100)>F.breathCapacity(1));
 assert.ok(F.breathTick(0,100,1,.45)>F.breathTick(0,1,1,.45));
 assert.ok(F.spendBreath(F.breathCapacity(100),100,'dribble')<F.breathCapacity(100));
});
test('live renderer draws foot-level proportional Breath ring with stat normalization',()=>{
 const render=text('src/modules/render.js');
 assert.match(render,/STATS\.stat\(p,'stamina'\)/);
 assert.match(render,/Math\.PI\*2\*ratio/);
 assert.match(render,/if\(this\.inMatchDraw&&!p\.preview\)/);
});
test('HUD identifies existing top stamina meter as Energy',()=>{
 assert.match(text('src/modules/ui.js'),/staminaText\.textContent=`ENERGY /);
});
test('dribble no longer applies fixed lockout and continuous hold spends Breath',()=>{
 const engine=text('src/modules/engine.js');
 assert.match(engine,/p\.dribbleCooldown=0;p\.cd=\.43/);
 assert.match(engine,/if\(s\.dribble&&this\.ball\.owner===p\)p\.breath=Math\.max\(0,/);
 assert.match(engine,/p\.breath<\.55/);
 assert.doesNotMatch(engine,/p\.dribbleCooldown=2;p\.cd=\.43/);
});
