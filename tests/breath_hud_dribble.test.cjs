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
test('Breath and Energy exhaustion penalties are gentler while sprint still costs more than jogging',()=>{
 for(const stat of [1,50,100]){
  const cap=F.breathCapacity(stat);
  assert.equal(F.breathPenalty(0,stat),1.6,'empty Breath adds a bounded 60% action Energy penalty');
  assert.equal(F.breathPenalty(cap,stat),1,'full Breath adds no penalty');
  assert.ok(F.spendBreath(cap,stat,'super')<F.spendBreath(cap,stat,'pass'),'special actions still cost more Breath');
  assert.ok(F.breathTick(cap,stat,1,1.5)<F.breathTick(cap,stat,1,.6),'sprinting remains more expensive than jogging');
 }
 const source=text('src/modules/fitness.js');
 assert.match(source,/\)\*\.70\*/,'ongoing Energy action drain should use the eased multiplier');
 assert.match(source,/breathActionSeconds\[kind\]\|\|\.45\)\*\.90/,'discrete Breath actions should cost about 10% less');
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
  assert.ok(rate>=.04&&rate<.08,'holding dribble must be very cheap but nonzero');
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

test('LAN/P2P Breath ring is scoped to local human, with immediate switching and couch Versus preserved',()=>{
 const render=text('src/modules/render.js');
 const match=render.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
 assert.ok(match,'real renderer predicate must be present');
 const visible=vm.runInNewContext('('+match[0]+')');
 const home={t:0,i:2},nextHome={t:0,i:3},away={t:1,i:2},nextAway={t:1,i:3};
 const chosen=[home,away];
 const game={humans:2,localBreathSide:null,inControl(t){return t===0||this.humans===2;},controlledPlayer(t){return chosen[t];}};
 assert.equal(visible(home,game,true),true,'local Versus home');
 assert.equal(visible(away,game,true),true,'local Versus away');
 game.localBreathSide=0;
 assert.equal(visible(home,game,true),true,'host local home');
 assert.equal(visible(away,game,true),false,'host must not see remote away ring');
 game.localBreathSide=1;
 assert.equal(visible(home,game,true),false,'guest must not see remote home ring');
 assert.equal(visible(away,game,true),true,'guest local away');
 chosen[1]=nextAway;
 assert.equal(visible(away,game,true),false,'stale remote selection hidden immediately');
 assert.equal(visible(nextAway,game,true),true,'guest switched player shown immediately');
 chosen[0]=nextHome;
 assert.equal(visible(nextHome,game,true),false,'guest must not see home switch');
 game.humans=1;
 assert.equal(visible(nextAway,game,true),false,'CPU never shows ring');
 game.humans=2;game.localBreathSide=null;
 assert.equal(visible(nextHome,game,true),true,'couch Versus home restored');
 assert.equal(visible(nextAway,game,true),true,'couch Versus away restored');
 assert.equal(visible(nextAway,game,false),false,'menu/preview never draws live ring');
 assert.match(text('src/modules/ui.js'),/game\.localBreathSide=lanRole==='host'\?0:lanRole==='guest'\?1:null/,'UI must supply actual local network role');
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
test('low-Breath warning is steady in reduced-flash mode',()=>{
 const render=text('src/modules/render.js');
 assert.match(render,/game\.options\?\.reducedFlash\?\.42:\.35\+\.45\*\(\.5\+\.5\*Math\.sin\(this\.time\*10\)\)/,
  'reduced-flash uses a steady readable warning while standard mode retains its pulse');
});
test('controlled-player outline and Breath ring share current human selection',()=>{
 const render=text('src/modules/render.js');
 assert.match(render,/if\(shouldShowBreathRing\(p,game,this\.inMatchDraw\)\)\{ctx\.strokeStyle=p\.t===0/);
 const outline=render.indexOf('if(shouldShowBreathRing(p,game,this.inMatchDraw)){ctx.strokeStyle=');
 const gauge=render.indexOf('if(shouldShowBreathRing(p,game,this.inMatchDraw)){',outline+1);
 assert.ok(outline>=0&&gauge>outline,'selected outline must precede selected gauge');
 assert.doesNotMatch(render.slice(outline,gauge),/if\(p\.controlled\)/,'no stale selection in foot-gauge region');
});


test('Breath movement remains frame-rate independent and never leaks a ring across rapid local switches',()=>{
 for(const stamina of [1,50,100]){
  const cap=F.breathCapacity(stamina);
  for(const [magnitude,sprint] of [[0,false],[.25,false],[1,false],[1,true]]){
   const intensity=F.breathMovementIntensity(magnitude,sprint);
   const advance=frames=>{
    let breath=cap*.5;
    for(let i=0;i<frames;i++)breath=F.breathTick(breath,stamina,1/frames,intensity);
    return breath;
   };
   assert.ok(Math.abs(advance(30)-advance(120))<1e-9,
    'movement drain/recovery must not depend on frame count');
  }
 }
 const render=text('src/modules/render.js');
 const match=render.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
 assert.ok(match,'real ring predicate must exist');
 const visible=vm.runInNewContext('('+match[0]+')');
 const team=[{t:0,i:2},{t:0,i:3},{t:0,i:4}];
 const remote={t:1,i:2};
 let selected=team[0];
 const game={humans:2,localBreathSide:0,inControl:t=>t===0||t===1,
  controlledPlayer:t=>t===0?selected:remote};
 for(let cycle=0;cycle<12;cycle++){
  selected=team[cycle%team.length];
  assert.equal(team.filter(p=>visible(p,game,true)).length,1,
   'exactly one locally selected player must display the ring');
  assert.equal(visible(remote,game,true),false,'remote human must never display a local ring');
 }
});


test('minimum-Stamina two-second carry budget stays cheap after a spent action',()=>{
 const stamina=1,cap=F.breathCapacity(stamina),hold=F.dribbleHoldBreathRate(stamina);
 const step=(breath,seconds,intensity,holding)=>Math.max(0,F.breathTick(breath,stamina,seconds,intensity)-(holding?hold*seconds:0));
 let ordinary=F.spendBreath(cap,stamina,'dribble');
 let sprint=ordinary;
 for(let i=0;i<120;i++){
  ordinary=step(ordinary,1/60,F.breathMovementIntensity(1,false),true);
  sprint=step(sprint,1/60,F.breathMovementIntensity(1,true),false);
 }
 assert.ok(cap-F.spendBreath(cap,stamina,'dribble')<.4,'initiating dribble is a bounded one-off cost');
 assert.ok(F.spendBreath(cap,stamina,'dribble')-ordinary<.45,'two seconds of ordinary ball carrying remain inexpensive');
 assert.ok(ordinary-sprint>1.4,'two-second sprint costs substantially more than carrying');
 const recovered=step(ordinary,1,F.breathMovementIntensity(.25),false);
 assert.ok(recovered>ordinary,'walking recovers Breath after held dribble');
 assert.ok(recovered<=cap,'recovery stays capped');
});

test('walking-to-running threshold preserves recovery and sprint never masquerades as a walk',()=>{
 for(const stamina of [1,25,60,100]){
  const cap=F.breathCapacity(stamina),start=cap*.4;
  for(const magnitude of [.14,.25,.4,.55]){
   const intensity=F.breathMovementIntensity(magnitude,false);
   assert.ok(intensity<=.55,'analog walking stays in the recovery range');
   assert.ok(F.breathTick(start,stamina,1,intensity)>start,'walking restores Breath');
  }
  for(const magnitude of [.56,.75,1]){
   const ordinary=F.breathMovementIntensity(magnitude,false);
   const sprint=F.breathMovementIntensity(magnitude,true);
   assert.ok(sprint>ordinary,'sprint intensity exceeds normal movement');
   assert.ok(F.breathTick(start,stamina,1,sprint)<F.breathTick(start,stamina,1,ordinary),
    'sprint must always cost more Breath');
  }
 }
});

test('Breath ring fails closed for missing selection and follows local seat changes',()=>{
 const render=text('src/modules/render.js');
 const match=render.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
 assert.ok(match,'production visibility predicate exists');
 const visible=vm.runInNewContext('('+match[0]+')');
 const home={t:0,i:1},away={t:1,i:1},bench={t:1,i:2};
 const selected=[home,away];
 const game={humans:2,localBreathSide:0,inControl:()=>true,
  controlledPlayer:t=>selected[t]};
 assert.equal(visible(home,game,true),true);
 assert.equal(visible(away,game,true),false);
 selected[0]=null;
 assert.equal(visible(home,game,true),false,'missing selection must not leave a stale ring');
 game.localBreathSide=1;
 assert.equal(visible(away,game,true),true,'new local seat owns the ring');
 assert.equal(visible(home,game,true),false,'previous local seat loses its ring');
 selected[1]=bench;
 assert.equal(visible(away,game,true),false,'old selected player loses ring');
 assert.equal(visible(bench,game,true),true,'new selected player gains ring');
 game.humans=1;
 assert.equal(visible(bench,game,true),false,'CPU-controlled away team never shows ring');
});
