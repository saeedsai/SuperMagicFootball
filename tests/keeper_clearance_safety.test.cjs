/** Keeper long-clearance safety regression: extracted production methods. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=source.indexOf('\n keeperPassingLane(p,q){');
const end=source.indexOf('\n distributeKeeper(p,mode=',start);
assert(start>0&&end>start,'production keeper clearance methods missing');
const F={x:0,y:0,w:1800,h:1200};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const extracted=source.slice(start,end).replace('\n keeperClearanceTarget(', '\n ,keeperClearanceTarget(');
assert(extracted.includes(',keeperClearanceTarget('),'both production methods must be extracted');
const methods=vm.runInNewContext('({'+extracted+'})',{
 F,distance,clamp:(v,min,max)=>Math.max(min,Math.min(max,v))
});
function fixture(t=0){
 const dir=t===0?1:-1;
 const p={t,keeper:true,x:t===0?140:1660,y:600,src:{id:'keeper'}};
 const safe={t,x:p.x+dir*530,y:180,stun:0,keeper:false,src:{id:'safe'}};
 const marked={t,x:p.x+dir*670,y:600,stun:0,keeper:false,src:{id:'marked'}};
 const blocker={t:1-t,x:p.x+dir*610,y:600,stun:0,keeper:false,src:{id:'opponent'}};
 const game={players:[p,safe,marked,blocker],keeperPassingLane:methods.keeperPassingLane,
  keeperClearanceTarget:methods.keeperClearanceTarget};
 return {game,p,safe,marked,blocker};
}
for(const team of [0,1]){
 test('keeper clearance avoids marked receiver for mirrored team '+team,()=>{
  const {game,p,safe,marked,blocker}=fixture(team);
  const scored=[safe,marked].map(q=>({q,safe:game.keeperPassingLane(p,q)}));
  assert.equal(scored[1].safe.clear,false,'marked receiver must be unsafe');
  const result=game.keeperClearanceTarget(p,scored,[blocker]);
  assert.notEqual(result.receiver,marked,'must never deliberately target marked teammate');
  assert(Number.isFinite(result.x)&&Number.isFinite(result.y));
 });
 test('keeper clearance chooses empty turf if all teammate lanes unsafe, team '+team,()=>{
  const {game,p,marked,blocker}=fixture(team);
  const scored=[{q:marked,safe:game.keeperPassingLane(p,marked)}];
  const result=game.keeperClearanceTarget(p,scored,[blocker]);
  assert.equal(result.receiver,null);
  assert((result.x-p.x)*(team===0?1:-1)>0,'clearance must advance');
 });
 test('keeper clearance still permits a safe receiver, team '+team,()=>{
  const {game,p,safe}=fixture(team);
  const scored=[{q:safe,safe:{clear:true,endpoint:9999,interception:9999}}];
  const result=game.keeperClearanceTarget(p,scored,[]);
  assert.equal(result.receiver,safe);
 });
}
