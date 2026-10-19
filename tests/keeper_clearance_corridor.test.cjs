/** Long keeper punts: open turf must have a clear flight corridor. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=source.indexOf('\n keeperClearanceTarget(p,scored,opponents){');
const end=source.indexOf('\n distributeKeeper(p,mode=',start);
assert(start>0&&end>start,'keeper clearance source extraction');
const F={x:0,y:0,w:1800,h:1200};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const methods=vm.runInNewContext('({'+source.slice(start,end)+'})',{
 F,distance,clamp:(v,a,b)=>Math.max(a,Math.min(b,v))
});
function setup(team){
 const p={t:team,x:team===0?100:1700,y:600};
 const game={keeperClearanceTarget:methods.keeperClearanceTarget,
  keeperPassingLane(_p,q){
   const y=q.y;
   // Center and upper lanes are intercepted; lower lane is clear.
   return {clear:y>750,endpoint:y>750?500:30,interception:y>750?400:10};
  }};
 return {p,game};
}
for(const team of [0,1]){
 test('mirrored team '+team+' selects an open landing corridor',()=>{
  const {p,game}=setup(team);
  const result=game.keeperClearanceTarget(p,[],[]);
  assert.equal(result.receiver,null);
  assert(result.y>750,'punt must avoid intercepted center/upper corridors');
  assert((result.x-p.x)*(team===0?1:-1)>0,'punt advances toward opposing goal');
 });
 test('mirrored team '+team+' retains safe teammate as a valid candidate',()=>{
  const {p,game}=setup(team);
  const teammate={t:team,x:p.x+(team===0?1:-1)*1100,y:950};
  const result=game.keeperClearanceTarget(p,[{q:teammate,safe:{clear:true,endpoint:10000,interception:10000}}],[]);
  assert.equal(result.receiver,teammate);
 });
}
