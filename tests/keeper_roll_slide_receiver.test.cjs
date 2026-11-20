'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf(' rollKeeper(p){');
const end=source.indexOf('\n command(p,a)',start);
assert.ok(start>=0&&end>start,'rollKeeper method exists');
const method=source.slice(start,end);
const makeRun=new Function('players','ball','keeper',`
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const stat=()=>50;
 const obj={players,ball,matchState:'play',manualSwitchGrace:[0,0],
  inControl:()=>true,keeperPassingLane:()=>({clear:true}),
  freeBall(){ball.owner=null;},emit(){},
  ${method.trim()}
 };
 return obj.rollKeeper(keeper);
`);
function scenario(sliding,remaining=.3){
 const keeper={t:0,keeper:true,x:0,y:0,stun:0,src:{id:1,name:'Keeper'}};
 const receiver={t:0,keeper:false,x:240,y:0,z:0,stun:0,action:sliding?'slide':'idle',actionTimer:remaining,src:{id:2,name:'Receiver'}};
 const ball={owner:keeper};
 return {run:()=>makeRun([keeper,receiver],ball,keeper),ball};
}
test('active slide cannot receive goalkeeper DRIBBLE rollout',()=>{
 const {run,ball}=scenario(true);
 assert.equal(run(),false);
 assert.ok(ball.owner,'keeper retains possession');
});
test('standing receiver remains available',()=>assert.equal(scenario(false).run(),true));
test('receiver becomes eligible after slide timer expires',()=>assert.equal(scenario(true,0).run(),true));
