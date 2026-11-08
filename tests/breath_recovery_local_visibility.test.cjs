const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const root=path.join(__dirname,'..');
const fitness=fs.readFileSync(path.join(root,'src/modules/fitness.js'),'utf8');
const context={};
vm.runInNewContext(fitness.replace(/export \{FITNESS\};?/g,'')+'\nthis.F=FITNESS;',context);
const F=context.F;
const renderer=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
const predicateSource=renderer.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
assert.ok(predicateSource,'production Breath-ring predicate must be available');
const visible=vm.runInNewContext('('+predicateSource[0]+')');

test('after sprint exhaustion, walking restores Breath while normal ball carrying stays cheap',()=>{
 for(const stamina of [1,25,50,75,100]){
  const cap=F.breathCapacity(stamina);
  let breath=cap;
  for(let frame=0;frame<120;frame++)
   breath=F.breathTick(breath,stamina,1/60,F.breathMovementIntensity(1,true));
  const exhausted=breath;
  assert.ok(cap-exhausted>2.5,'two seconds of sprint must meaningfully consume Breath');
  for(let frame=0;frame<120;frame++)
   breath=F.breathTick(breath,stamina,1/60,F.breathMovementIntensity(.4));
  assert.ok(breath>exhausted,'walking must recover Breath');
  const start=breath;
  for(let frame=0;frame<120;frame++)
   breath=Math.max(0,F.breathTick(breath,stamina,1/60,F.breathMovementIntensity(1))-
    F.dribbleHoldBreathRate(stamina)/60);
  assert.ok(start-breath<.5,'two seconds of ordinary ball carrying must remain inexpensive');
 }
});

test('one and only one ring follows the local human through guest/host selection handoffs',()=>{
 const home=[{t:0,i:1},{t:0,i:2}],away=[{t:1,i:1},{t:1,i:2}];
 const selected=[home[0],away[0]];
 const game={humans:2,localBreathSide:0,
  inControl(t){return this.humans===2||t===0;},
  controlledPlayer(t){return selected[t];}};
 const players=[...home,...away];
 const shown=()=>players.filter(p=>visible(p,game,true));
 for(const side of [0,1,0,1]){
  game.localBreathSide=side;
  assert.deepEqual(shown(),[selected[side]],'only locally selected player visible');
  selected[side]=side===0?home[1]:away[1];
  assert.deepEqual(shown(),[selected[side]],'switch updates immediately');
  selected[side]=null;
  assert.equal(shown().length,0,'missing selection hides all rings');
  selected[side]=side===0?home[0]:away[0];
 }
 game.localBreathSide=1;game.humans=1;
 assert.equal(shown().length,0,'CPU-controlled side cannot display ring');
 assert.equal(players.filter(p=>visible(p,game,false)).length,0,'outside match hides rings');
});
