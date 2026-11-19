'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const begin=engine.indexOf('  const leadX=slide&&target?');
const end=engine.indexOf('  if(slide){',begin);
assert.ok(begin>0&&end>begin,'read production tackle targeting expression');
const fragment=engine.slice(begin,end);
const calculate=(slide,target,p)=>vm.runInNewContext(
  '(function(slide,target,p,clamp,norm){'+fragment+'return dir;})',
  {}
)(slide,target,p,(v,a,b)=>Math.min(b,Math.max(a,v)),(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d};});
test('SLIDE-MOVING-CARRIER-LEAD-01: slide anticipates lateral sprint without changing ordinary tackle',()=>{
 const p={x:0,y:0,dx:1,dy:0,face:1};
 const moving={x:100,y:0,moveVX:0,moveVY:240};
 assert.ok(calculate(true,moving,p).y>0,'slide should lead lateral runner');
 assert.equal(calculate(false,moving,p).y,0,'ordinary poke remains unchanged');
 assert.equal(calculate(true,{...moving,moveVY:0},p).y,0,'stationary carrier unchanged');
 assert.equal(calculate(true,{...moving,moveVY:Infinity},p).y,0,'invalid motion neutral');
 assert.equal(calculate(true,null,p).y,0,'untargeted slide retains facing');
});
test('slide lead is capped and does not change the slide travel budget',()=>{
 const p={x:0,y:0,dx:1,dy:0,face:1};
 const fast=calculate(true,{x:100,y:0,moveVY:10000},p);
 const capped=calculate(true,{x:100,y:0,moveVY:22/.085},p);
 assert.ok(Math.abs(fast.y-capped.y)<1e-12,'lead capped at 22 units');
 assert.match(engine,/p\.slideRemaining=\(running\?148:104\)\*defenceReach/);
 assert.match(engine,/p\.slideDX=dir\.x;p\.slideDY=dir\.y/);
});
