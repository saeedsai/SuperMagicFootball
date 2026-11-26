'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const start=engine.indexOf(' tackle(p,slide=false,slideBall=null){');
const end=engine.indexOf('\n  resolveSpinBumper(',start);
assert.ok(start>=0&&end>start,'extract the production tackle method');
const safeMath=Object.assign(Object.create(Math),{random:()=>1});
const tackle=vm.runInNewContext('({'+engine.slice(start,end)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 norm:(x,y)=>{const m=Math.hypot(x,y)||1;return{x:x/m,y:y/m};},
 clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
 stat:(p,k)=>p.src?.[k]??50,
 contest:()=>({knockChance:1,duration:.2}),
 moraleFactor:()=>1,tackleStunDuration:()=>.2,Math:safeMath
}).tackle;
test('normal PASS poke stores the real diagonal strike direction for facing and counter reads',()=>{
 const carrier={t:0,x:100,y:100,z:0,stun:0,invuln:0,down:false,src:{strength:50}};
 const defender={t:1,x:160,y:120,z:0,stun:0,cd:0,invuln:0,face:-1,dx:-1,dy:0,
  moveVX:0,moveVY:0,src:{speedRating:50}};
 const game={ball:{owner:carrier},players:[defender,carrier],spendStamina(){},burst(){},emit(){}};
 assert.equal(tackle.call(game,defender,false),true);
 const toward={x:carrier.x-160,y:carrier.y-120},length=Math.hypot(toward.x,toward.y);
 const expected={x:toward.x/length,y:toward.y/length};
 assert.equal(defender.action,'punch');
 assert.ok(defender.actionTimer>0);
 assert.ok(Math.abs(defender.dx-expected.x)<1e-9);
 assert.ok(Math.abs(defender.dy-expected.y)<1e-9);
 assert.equal(defender.face,-1);
 assert.ok(defender.x<160&&defender.y<120,'poke still advances along its selected strike vector');
 assert.equal(defender.cd,.57);
});
