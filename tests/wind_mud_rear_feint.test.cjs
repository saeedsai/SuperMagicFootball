'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const start=source.indexOf(' reactToWindMudTrick(p,dt,reactionSeconds){');
const end=source.indexOf('\n resolveMaceSweep(',start);
assert.ok(start>=0&&end>start,'Wind/Mud reaction method exists');
const react=vm.runInNewContext('({'+source.slice(start,end)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)
}).reactToWindMudTrick;
function attempt(carrierPatch={},defenderPatch={}){
 const carrier={t:1,keeper:false,src:{magicTrick:'wind'},x:0,y:0,dribbleHold:.5,...carrierPatch};
 const defender={t:0,keeper:false,src:{},x:0,y:60,z:0,face:1,dx:0,dy:0,moveVX:0,moveVY:0,
  stun:0,down:false,action:'idle',actionTimer:0,...defenderPatch};
 const game={ball:{owner:carrier},players:[carrier,defender],jumps:0,
  jump(p){this.jumps++;p.z=22;p.action='jump';p.actionTimer=.28;return true;}};
 react.call(game,defender,0,0,0);
 return game.jumps;
}
test('horizontal facing reads a front wind-up and rejects a clear rear feint',()=>{
 assert.equal(attempt({x:60},{face:1}),1);
 assert.equal(attempt({x:-55},{face:1}),0);
 assert.equal(attempt({x:-60},{face:-1}),1);
 assert.equal(attempt({x:60},{face:-1}),0);
});
test('lateral peripheral wind-ups remain readable while a small rear offset stays within the existing tolerance',()=>{
 assert.equal(attempt({x:-20,y:80},{face:1}),1);
 assert.equal(attempt({x:-25,y:80},{face:1}),0);
});
test('vertical movement heading distinguishes front and rear wind-ups',()=>{
 assert.equal(attempt({y:-60},{y:0,dx:0,dy:-1,face:1}),1);
 assert.equal(attempt({y:60},{y:0,dx:0,dy:-1,face:1}),0);
 assert.equal(attempt({y:60},{y:0,dx:0,dy:1,face:-1}),1);
 assert.equal(attempt({y:-60},{y:0,dx:0,dy:1,face:-1}),0);
});
test('diagonal movement heading rejects a carrier behind the defender but keeps the lateral edge readable',()=>{
 const diagonal=Math.SQRT1_2;
 assert.equal(attempt({x:42,y:-42},{x:0,y:0,dx:diagonal,dy:-diagonal}),1);
 assert.equal(attempt({x:-42,y:120},{x:0,y:60,dx:diagonal,dy:-diagonal}),0);
 assert.equal(attempt({x:60,y:120},{x:0,y:60,dx:diagonal,dy:-diagonal}),1);
});
test('stationary defenders retain the legacy horizontal-facing fallback',()=>{
 assert.equal(attempt({x:60},{dx:0,dy:0,moveVX:0,moveVY:0,face:1}),1);
 assert.equal(attempt({x:-60},{dx:0,dy:0,moveVX:0,moveVY:0,face:1}),0);
});
