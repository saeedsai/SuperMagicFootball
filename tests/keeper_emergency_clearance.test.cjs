/** Keeper blocked-field emergency clearance: exercise production method on both sides. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=source.indexOf('\n keeperClearanceTarget(p,scored,opponents){');
const end=source.indexOf('\n distributeKeeper(p,mode=',start);
assert(start>=0&&end>start,'production keeper clearance method exists');
const F={x:0,y:0,w:1800,h:1200};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const method=vm.runInNewContext('({'+source.slice(start,end)+'})',{
 F,distance,clamp:(x,a,b)=>Math.max(a,Math.min(b,x))
}).keeperClearanceTarget;

const goalie=t=>({t,x:t===0?100:1700,y:600});
const game=resolver=>({keeperClearanceTarget:method,keeperPassingLane:(p,q)=>resolver(q,p)});

for(const t of [0,1]){
 test('blocked corridors: team '+t+' selects least-interceptable emergency lane',()=>{
  const p=goalie(t);
  const g=game(q=>({clear:false,endpoint:200,interception:q.y>800?90:10}));
  const target=g.keeperClearanceTarget(p,[],[]);
  assert.equal(target.receiver,null);
  assert.equal(target.y,F.y+F.h*.78);
  assert((target.x-p.x)*(t===0?1:-1)>0,'emergency clearance still moves forward');
 });
 test('clear empty turf takes priority over emergency choice, team '+t,()=>{
  const p=goalie(t);
  const g=game(q=>({clear:q.y<400,endpoint:150,interception:q.y<400?130:80}));
  const target=g.keeperClearanceTarget(p,[],[]);
  assert.equal(target.y,F.y+F.h*.22);
  assert.equal(target.receiver,null);
 });
 test('safe receiver is still preferred to blocked empty turf, team '+t,()=>{
  const p=goalie(t);
  const q={t,x:p.x+(t===0?1:-1)*1050,y:500};
  const g=game(()=>({clear:false,endpoint:150,interception:20}));
  const target=g.keeperClearanceTarget(p,[{q,safe:{clear:true,endpoint:3000,interception:2000}}],[]);
  assert.equal(target.receiver,q);
  assert.equal(target.x,q.x);
 });
}
