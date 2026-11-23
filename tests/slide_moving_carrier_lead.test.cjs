'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const begin=engine.indexOf('  const leadSeconds=slide ?');
const end=engine.indexOf('  if(slide){',begin);
assert.ok(begin>0&&end>begin,'read production tackle targeting expression');
const fragment=engine.slice(begin,end);
const calculate=(slide,target,p,slideBall=null)=>vm.runInNewContext(
  '(function(slide,target,p,slideBall,clamp,norm){'+fragment+'return dir;})',
  {defensivePokeBallSideRead:()=>false}
).call({ball:{owner:target}},slide,target,p,slideBall,
  (v,a,b)=>Math.min(b,Math.max(a,v)),(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d};});
test('TACKLE-MOVING-CARRIER-LEAD-01: PASS poke and SHOOT slide anticipate lateral runners with different lead strength',()=>{
 const p={x:0,y:0,dx:1,dy:0,face:1};
 const moving={x:100,y:0,moveVX:0,moveVY:240};
 const slide=calculate(true,moving,p),poke=calculate(false,moving,p);
 assert.ok(slide.y>0,'slide should lead lateral runner');
 assert.ok(poke.y>0&&poke.y<slide.y,'ordinary PASS poke gets a shorter lead');
 assert.equal(calculate(false,{...moving,moveVY:0},p).y,0,'stationary poke target unchanged');
 assert.equal(calculate(false,{...moving,moveVY:Infinity},p).y,0,'invalid poke motion neutral');
 assert.equal(calculate(true,{...moving,moveVY:0},p).y,0,'stationary slide target unchanged');
 assert.equal(calculate(true,{...moving,moveVY:Infinity},p).y,0,'invalid slide motion neutral');
 assert.equal(calculate(true,null,p).y,0,'untargeted slide retains facing');
});
test('poke and slide leads are capped and do not change the slide travel budget',()=>{
 const p={x:0,y:0,dx:1,dy:0,face:1};
 const fastSlide=calculate(true,{x:100,y:0,moveVY:10000},p);
 const cappedSlide=calculate(true,{x:100,y:0,moveVY:22/.085},p);
 const fastPoke=calculate(false,{x:100,y:0,moveVY:10000},p);
 const cappedPoke=calculate(false,{x:100,y:0,moveVY:12/.055},p);
 assert.ok(Math.abs(fastSlide.y-cappedSlide.y)<1e-12,'slide lead capped at 22 units');
 assert.ok(Math.abs(fastPoke.y-cappedPoke.y)<1e-12,'poke lead capped at 12 units');
 assert.match(engine,/p\.slideRemaining=\(running\?148:104\)\*defenceReach/);
 assert.match(engine,/p\.slideDX=dir\.x;p\.slideDY=dir\.y/);
});
