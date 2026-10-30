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
  assert.ok(F.breathTick(0,stat,.5,0)>F.breathTick(0,stat,.5,.45));
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
 assert.match(render,/if\(shouldShowBreathRing\(p,game,this\.inMatchDraw\)\)/);
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

test('normal running with ball has very low Breath drain versus sprint',()=>{
 for(const stat of [1,50,100]){
  const cap=F.breathCapacity(stat);
  const jog=F.breathTick(cap,stat,1,.6);
  const sprint=F.breathTick(cap,stat,1,1.5);
  assert.ok(cap-jog<.2,`normal run depleted too much Breath at stamina ${stat}`);
  assert.ok(cap-sprint>1.4,`sprint depleted too little Breath at stamina ${stat}`);
  assert.ok(cap-sprint>8*(cap-jog));
 }
 const engine=text('src/modules/engine.js');
 assert.doesNotMatch(engine,/Math\.max\(1\.15,intensity\)/);
 assert.match(engine,/running\?1\.5:\.6/);
});
test('ordinary held dribble is low-drain and JUMP sprint remains substantially more costly',()=>{
 const engine=text('src/modules/engine.js');
 assert.match(engine,/dt\*dribbleHoldBreathRate\(stat\(p,'stamina'\)\)/,'live engine must use shared hold rate');
 for(const stamina of [1,50,100]){
  const cap=F.breathCapacity(stamina),rate=F.dribbleHoldBreathRate(stamina);
  assert.ok(rate>=.12&&rate<=.201,'holding dribble must be cheap but nonzero');
  const held=F.breathTick(cap,stamina,1,.6)-rate;
  const sprint=F.breathTick(cap,stamina,1,1.5);
  assert.ok(cap-held<.45,'normal moving dribble should spend less than half a second of Breath');
  assert.ok(cap-sprint>5*(cap-held),'sprinting must drain over five times as much');
 }
});
test('Breath ring is restricted to the currently selected human-controlled player',()=>{
 const render=text('src/modules/render.js');
 assert.match(render,/game\.inControl\(p\.t\)&&game\.controlledPlayer\(p\.t\)===p/);
 assert.doesNotMatch(render,/if\(this\.inMatchDraw&&!p\.preview\)\s*\{\s*const stamina=/);
});

test('critical Breath pulses only inside the selected-player ring branch',()=>{
 const render=text('src/modules/render.js');
 const guard=render.indexOf('if(shouldShowBreathRing(p,game,this.inMatchDraw))');
 const pulse=render.indexOf('if(ratio<.2){ctx.save();ctx.globalAlpha=',guard);
 const restore=render.indexOf('ctx.restore();',pulse);
 assert.ok(guard>=0&&pulse>guard&&restore>pulse);
 assert.match(render.slice(pulse,restore),/Math.sin\(this.time\*10\)/);
 assert.match(render.slice(pulse,restore),/ctx\.ellipse\(0,4,39,19/);
});

test('current selection wins immediately over stale controlled flags in both local teams',()=>{
 const render=text('src/modules/render.js');
 const match=render.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
 assert.ok(match,'test the actual renderer predicate');
 const predicate=vm.runInNewContext('('+match[0]+')');
 const home={t:0,i:2,controlled:true},next={t:0,i:3,controlled:false};
 const away={t:1,i:2,controlled:false},cpu={t:1,i:4,controlled:true};
 const selected=[home,away];
 const game={humans:1,inControl(t){return t===0||this.humans===2;},
  controlledPlayer(t){return selected[t];}};
 assert.equal(predicate(home,game,true),true);
 assert.equal(predicate(next,game,true),false);
 selected[0]=next; // old .controlled remains true; new remains false until next update
 assert.equal(predicate(home,game,true),false);
 assert.equal(predicate(next,game,true),true);
 assert.equal(predicate(away,game,true),false,'solo CPU');
 game.humans=2;
 assert.equal(predicate(away,game,true),true,'local second human');
 assert.equal(predicate(cpu,game,true),false,'unselected second-team player');
 assert.equal(predicate(next,game,false),false,'outside live match');
 next.preview=true;assert.equal(predicate(next,game,true),false,'editor preview');
});

test('stationary DRIBBLE hold preserves idle recovery and analog movement scales the extra cost',()=>{
 const engine=text('src/modules/engine.js');
 assert.match(engine,/dt\*dribbleHoldBreathRate\(stat\(p,'stamina'\)\)\*Math\.min\(1,Math\.hypot\(dx,dy\)\)/);
 for(const stamina of [1,50,100]){
  const cap=F.breathCapacity(stamina),start=cap*.4,rate=F.dribbleHoldBreathRate(stamina);
  const rest=F.breathTick(start,stamina,1,0);
  const still=rest-rate*0,half=F.breathTick(start,stamina,1,.6)-rate*.5;
  const full=F.breathTick(start,stamina,1,.6)-rate;
  const sprint=F.breathTick(cap,stamina,1,1.5);
  assert.equal(still,rest,'stationary held DRIBBLE must not cancel idle recovery');
  assert.ok(half>full,'half-speed dribble must consume less extra Breath');
  assert.ok(start-full<.5,'ordinary moving dribble remains inexpensive');
  assert.ok(cap-sprint>5*(start-full),'sprint must cost much more');
 }
});

test('analog walking restores Breath while full-speed running and sprint spend progressively more',()=>{
 const movement=F.breathMovementIntensity;
 assert.equal(movement(0),0);assert.equal(movement(.14),0);
 assert.ok(movement(.25)<.55,'slow analog input is walking');
 assert.ok(Math.abs(movement(1)-.6)<1e-10);
 assert.ok(Math.abs(movement(1,true)-1.5)<1e-10);
 assert.equal(movement(1,true,true),1.7);
 for(const stat of [1,50,100]){
  const cap=F.breathCapacity(stat),start=cap*.5;
  const walk=F.breathTick(start,stat,1,movement(.25));
  const jog=F.breathTick(start,stat,1,movement(1));
  const sprint=F.breathTick(start,stat,1,movement(1,true));
  assert.ok(walk>start,'walking restores Breath');
  assert.ok(jog<start&&start-jog<.2,'normal run is cheap');
  assert.ok(sprint<jog-1.3,'sprint costs far more');
 }
 const engine=text('src/modules/engine.js');
 assert.match(engine,/breathMovementIntensity\(Math\.hypot\(dx,dy\),running,p\.dashTimer>0\)/);
 assert.match(engine,/staminaTick\(p,dt,intensity=0,breathIntensity=intensity\)/);
 assert.match(engine,/fatigueTick\(p\.fatigue,stat\(p,'stamina'\),dt,intensity\)/,'Energy intensity unchanged');
});
test('controlled-player outline and Breath ring share current human selection',()=>{
 const render=text('src/modules/render.js');
 assert.match(render,/if\(shouldShowBreathRing\(p,game,this\.inMatchDraw\)\)\{ctx\.strokeStyle=p\.t===0/);
 assert.doesNotMatch(render,/if\(p\.controlled\)\{ctx\.strokeStyle=/);
});
