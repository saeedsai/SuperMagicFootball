'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8'),render=fs.readFileSync('src/modules/render.js','utf8');
const F=mechanics.world.field,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};};
function method(name,next,globals={}){const a=engine.indexOf(`\n ${name}(`),b=engine.indexOf(`\n ${next}(`,a);assert.ok(a>=0&&b>a,`extract ${name}`);return vm.runInNewContext('({'+engine.slice(a,b)+'})',globals)[name];}
const globals={F,clamp,norm,STATS:{verifiedRatingTierForPlayer:p=>p?.statsVerified===true?p.verifiedTier:null},distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0,placeBananaPeel:()=>[],placeIcePatch:()=>[]};
const faceStart=engine.indexOf('function defenderFacesCarrier2D('),faceEnd=engine.indexOf('\n}',faceStart)+2;
assert.ok(faceStart>=0&&faceEnd>faceStart,'extract only the shared 2D facing helper');
const defenderFacesCarrier2D=vm.runInNewContext('('+engine.slice(faceStart,faceEnd)+')');
const readyStart=engine.indexOf('function lightningTargetReady('),readyEnd=engine.indexOf('\n}',readyStart)+2;
assert.ok(readyStart>=0&&readyEnd>readyStart,'Lightning shared target-readiness helper exists');
const lightningTargetReady=vm.runInNewContext('('+engine.slice(readyStart,readyEnd)+')');
globals.lightningTargetReady=lightningTargetReady;
const helperStart=engine.indexOf('function lightningDefenderCounters('),helperEnd=engine.indexOf('\n}',helperStart)+2;
const lightningDefenderCounters=vm.runInNewContext('('+engine.slice(helperStart,helperEnd)+')',{defenderFacesCarrier2D,stat:(p,k)=>p.src?.[k]??0});
globals.lightningDefenderCounters=lightningDefenderCounters;
const trick=method('tryMagicTrick','updateSpinBumpFx',globals);
const update=method('updateLightningTrick','resolveLightningTrick',{});
const resolve=method('resolveLightningTrick','beginRideBall',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??0,lightningDefenderCounters});
function setup(side=0,tier='Gold',verified=true){
 const p={t:side,x:F.x+F.w/2,y:F.y+F.h/2,face:side===0?1:-1,dx:side===0?1:-1,dy:0,z:0,keeper:false,stun:0,fatigue:.2,magicReadyAt:0,action:'idle',src:{id:'lightning-caster',name:'Caster',role:'FW',magicTrick:'lightning',dribbling:60,statsVerified:verified,verifiedTier:tier}};
 const q={t:1-side,x:p.x+(side===0?50:-50),y:p.y,face:side===0?-1:1,dx:0,dy:0,z:0,keeper:false,stun:0,action:'idle',actionTimer:0,src:{id:'target',name:'Defender',defence:20}};
 const ball={owner:p,x:p.x,y:p.y,z:0},events=[];const g={clock:4,players:[p,q],ball,rideBall:null,fatigueLedger:[{},{}],controlled:[0,3],inControl:()=>false,emit:(type,data)=>events.push({type,...data}),burst(){}};g.resolveLightningTrick=resolve.bind(g);return{g,p,q,ball,events};
}

test('Lightning fails closed without verified Gold+, carrier, live target or available cooldown',()=>{
 for(const [tier,verified,expected] of [['Common',true,false],['Silver',true,false],['Gold',false,false],['Gold',true,true],['Star',true,true],['Superstar',true,true]]){
  const {g,p}=setup(0,tier,verified);assert.equal(trick.call(g,p),expected);if(!expected){assert.equal(p.magicReadyAt,0);assert.equal(p.fatigue,.2);assert.equal(p.lightningPending,undefined);}
 }
 const noTarget=setup();noTarget.g.players=[noTarget.p];assert.equal(trick.call(noTarget.g,noTarget.p),false);
 const tooFar=setup();tooFar.q.x=tooFar.p.x+95;assert.equal(trick.call(tooFar.g,tooFar.p),false);
 const cooldown=setup();cooldown.p.magicReadyAt=5;assert.equal(trick.call(cooldown.g,cooldown.p),false);
});


test('Lightning selects the nearest available target instead of an incapacitated decoy',()=>{
 const unavailable=[
  {down:true},{invuln:.2},{shotImpactKnockdownPending:.2},
  {shotImpactKnockdownTimer:.2},{shotImpactRiseTimer:.2},
  {action:'shotDown'},{action:'shotGetUp'},{action:'hurt',actionTimer:.2},
  {action:'jump',actionTimer:.3,z:8},{x:NaN},{y:NaN},{z:NaN},{z:-1}
 ];
 for(const patch of unavailable){
  const {g,p,q}=setup();
  Object.assign(q,{x:p.x+24,...patch});
  const ready={...q,x:p.x+72,down:false,invuln:0,stun:0,action:'idle',actionTimer:0,
   shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
   src:{id:'ready-lightning-target',name:'Ready Defender',defence:20}};
  g.players=[p,q,ready];
  assert.equal(trick.call(g,p),true,JSON.stringify(patch));
  assert.equal(p.lightningPending.target,ready,JSON.stringify(patch));
  assert.equal(q.lightningMark||0,0,'unavailable decoy must not receive the warning mark');
  assert.equal(ready.lightningMark,.32,'nearest ready target receives the warning mark');
 }
 for(const patch of [{down:true},{action:'jump',actionTimer:.3,z:8},{x:NaN},{y:NaN}]){
  const none=setup();Object.assign(none.q,patch);
  assert.equal(trick.call(none.g,none.p),false,'Lightning cannot acquire only unavailable defenders: '+JSON.stringify(patch));
  assert.equal(none.p.magicReadyAt,0,'rejected acquisition spends no cooldown');
  assert.equal(none.p.fatigue,.2,'rejected acquisition spends no fatigue');
 }
});

test('Lightning fizzles without stun if its marked defender becomes unavailable during the warning',()=>{
 const unavailable=[
  {down:true},{invuln:.2},{shotImpactKnockdownPending:.2},
  {shotImpactKnockdownTimer:.2},{shotImpactRiseTimer:.2},
  {action:'shotDown'},{action:'shotGetUp'},{action:'hurt',actionTimer:.2},
  {action:'jump',actionTimer:.3,z:8},{x:NaN},{y:NaN},{z:NaN},{z:-1}
 ];
 for(const patch of unavailable){
  const {g,p,q,events}=setup();
  assert.equal(trick.call(g,p),true);
  Object.assign(q,patch);
  update.call(g,p,.32,false);
  assert.equal(q.stun,0,JSON.stringify(patch));
  assert.equal(events.at(-1).type,'lightningTrickResolved');
  assert.equal(events.at(-1).hit,false,JSON.stringify(patch));
  assert.equal(events.at(-1).countered,false,JSON.stringify(patch));
  assert.equal(q.lightningMark,0,'the stale warning mark is cleared');
 }
});

test('Lightning starts a .32s target windup, preserves possession and resolves a bounded stun after the tell',()=>{
 for(const side of [0,1]){
  const {g,p,q,ball,events}=setup(side);assert.equal(trick.call(g,p),true);
  assert.equal(ball.owner,p);assert.equal(p.magicReadyAt,g.clock+6);assert.ok(Math.abs(p.fatigue-.245)<1e-9);
  assert.equal(q.stun,0);assert.equal(q.lightningMark,.32);assert.equal(p.lightningPending.remaining,.32);assert.equal(p.lightningPending.target,q);
  assert.equal(events[0].type,'lightningTrickWindup');assert.equal(events[0].seconds,.32);assert.equal(events[0].radius,95);
  assert.equal(update.call(g,p,.32,false),true);assert.equal(p.lightningPending,null);assert.equal(q.lightningMark,0);assert.equal(q.stun,.32);assert.equal(q.lightningFx,.32);
  assert.equal(events.at(-1).type,'lightningTrickResolved');assert.equal(events.at(-1).hit,true);assert.equal(ball.owner,p);
 }
});

test('near defender gets slide, jump and facing+closing reads during the windup; already-stunned targets never stack',()=>{
 const cases=[{action:'slide',actionTimer:.18,z:0},{action:'jump',z:20},{action:'idle',z:0,face:-1,dx:-1,src:{name:'read',defence:80}}];
 for(const c of cases){const {g,p,q,events}=setup();trick.call(g,p);Object.assign(q,c);update.call(g,p,.32,false);assert.equal(q.stun,0);assert.equal(q.lightningFx,undefined);assert.equal(events.at(-1).countered,true);}
 const {g,p,q,events}=setup();trick.call(g,p);q.stun=.12;update.call(g,p,.32,false);assert.equal(q.stun,.12);assert.equal(events.at(-1).hit,false);assert.equal(events.at(-1).countered,false);
 const noChain=setup();noChain.q.stun=.3;noChain.g.players=[noChain.p,noChain.q];assert.equal(trick.call(noChain.g,noChain.p),false);assert.equal(noChain.p.fatigue,.2);
});

test('Lightning selected-human marker receives a CPU backup whose existing JUMP counters the single-target strike',()=>{
 for(const side of [0,1]){
  const {g,p,q,events}=setup(side),sign=side===0?1:-1;
  q.i=3;const backup={t:1-side,x:p.x+sign*70,y:p.y,z:0,stun:0,down:false,invuln:0,
   action:'idle',actionTimer:0,face:-sign,dx:0,dy:0,moveVX:0,moveVY:0,i:4,
   shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,src:{id:'backup',name:'Backup',defence:20}};
  g.players=[p,q,backup];g.controlled[1-side]=q.i;g.inControl=t=>t===1-side;
  assert.equal(trick.call(g,p),true);
  assert.equal(p.lightningPending.target,q,'the nearest selected human remains the marked target');
  assert.equal(p.lightningPending.backup,backup,'the nearest ready CPU teammate receives backup duty');
  backup.action='jump';backup.actionTimer=.5;backup.z=20;
  assert.equal(resolve.call(g,p),false);
  assert.equal(q.stun,0);assert.equal(events.at(-1).hit,false);
  assert.equal(events.at(-1).countered,true,'the backup JUMP protects the marked human');
 }
});
test('Lightning does not duplicate an already-effective selected-human JUMP, slide or direct read',()=>{
 for(const side of [0,1])for(const patch of [
  {action:'jump',actionTimer:.3,z:20},
  {action:'slide',actionTimer:.2,z:0},
  {action:'idle',face:side===0?-1:1,dx:side===0?-1:1,dy:0,src:{defence:80}}
 ]){
  const {g,p,q,events}=setup(side),sign=side===0?1:-1;
  q.i=3;Object.assign(q,{...patch,x:p.x+sign*50,y:p.y});
  const backup={t:1-side,i:4,x:p.x+sign*70,y:p.y,z:0,stun:0,down:false,invuln:0,
   action:'idle',actionTimer:0,face:-sign,dx:0,dy:0,moveVX:0,moveVY:0,src:{defence:20}};
  g.players=[p,q,backup];g.controlled[1-side]=q.i;g.inControl=t=>t===1-side;
  assert.equal(trick.call(g,p),true);
  assert.equal(p.lightningPending.backup,null);
  assert.equal(resolve.call(g,p),false);
  assert.equal(events.at(-1).countered,true);
 }
});
test('Lightning backup must still be ready and within 95 units when the warning resolves',()=>{
 for(const side of [0,1])for(const patch of [
  {down:true},{invuln:.2},{stun:.1},{xOffset:100},
  {action:'jump',actionTimer:.3,z:8},{x:NaN},{y:NaN}
 ]){
  const {g,p,q,events}=setup(side),sign=side===0?1:-1;q.i=3;
  const backup={t:1-side,i:4,x:p.x+sign*70,y:p.y,z:0,stun:0,down:false,invuln:0,
   action:'idle',actionTimer:0,face:-sign,dx:0,dy:0,moveVX:0,moveVY:0,
   shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,src:{id:'backup',name:'Backup',defence:20}};
  g.players=[p,q,backup];g.controlled[1-side]=q.i;g.inControl=t=>t===1-side;
  assert.equal(trick.call(g,p),true);assert.equal(p.lightningPending.backup,backup);
  backup.action='jump';backup.actionTimer=.5;backup.z=20;
  if(patch.xOffset)backup.x=p.x+patch.xOffset;else Object.assign(backup,patch);
  assert.equal(resolve.call(g,p),true,JSON.stringify(patch));
  assert.equal(q.stun,.32);assert.equal(events.at(-1).hit,true);
  assert.equal(events.at(-1).countered,false);
 }
});
test('Lightning windup interrupts cleanly; cue timers expire and the renderer offers steady reduced-flash marks',()=>{
 const {g,p,q,events}=setup();trick.call(g,p);p.stun=.1;assert.equal(update.call(g,p,1/60,false),false);assert.equal(p.lightningPending,null);assert.equal(q.lightningMark,0);assert.equal(events.at(-1).type,'lightningTrickInterrupted');
 const fresh=setup();trick.call(fresh.g,fresh.p);fresh.q.lightningMark=.32;fresh.q.lightningFx=.32;for(let i=0;i<20;i++)update.call(fresh.g,fresh.q,1/30,false);assert.equal(fresh.q.lightningMark,0);assert.equal(fresh.q.lightningFx,0);
 assert.match(engine,/this\.updateLightningTrick\(p,dt,true\)/);assert.match(engine,/resolveLightningTrick\(p\)/);
 assert.match(render,/drawLightningTrick\(ctx,remaining,phase='warning',reducedFlash=false\)/);assert.match(render,/LIGHTNING · EVADE/);assert.match(render,/p\.lightningMark/);
});
