'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf(' rollKeeper(p){');
const end=source.indexOf('\n command(p,a)',start);
assert.ok(start>=0&&end>start,'rollKeeper exists');
const method=source.slice(start,end);
const run=new Function('receiverAction','timer',`
 const keeper={t:0,keeper:true,x:0,y:0,stun:0,src:{id:1,name:'Keeper'}};
 const receiver={t:0,keeper:false,x:240,y:0,z:0,stun:0,action:receiverAction,actionTimer:timer,src:{id:2,name:'Runner'}};
 const ball={owner:keeper};
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const stat=()=>50;
 const keeperOutletScore=(p,q)=>distance(p,q);
 const obj={players:[keeper,receiver],ball,matchState:'play',manualSwitchGrace:[0,0],
  inControl:()=>true,keeperPassingLane:()=>({clear:true}),
  freeBall(){ball.owner=null;},emit(){},
  ${method.trim()}
 };
 return {result:obj.rollKeeper(keeper),owner:ball.owner};
`);
test('keeper retains possession when only teammate is recoiling',()=>{
 const outcome=run('hurt',.3);
 assert.equal(outcome.result,false);
 assert.ok(outcome.owner);
});
test('keeper may roll after recoil timer expires',()=>assert.equal(run('hurt',0).result,true));
test('keeper may roll to standing teammate',()=>assert.equal(run('idle',.3).result,true));
test('active slide remains ineligible',()=>assert.equal(run('slide',.3).result,false));
