'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

const load=()=>import(pathToFileURL(path.resolve('src/modules/shotfeel.js')).href);
function slide(overrides={}) {
 return {x:105,y:-35,stun:0,action:'slide',actionTimer:.16,slideTimer:.16,
  slideRemaining:120,slideSpeed:595,slideDX:0,slideDY:1,moveVX:0,moveVY:595,...overrides};
}
function legacyCappedPressure(from,to,rival){
 const dx=to.x-from.x,dy=to.y-from.y,segment=dx*dx+dy*dy;
 const lookahead=Math.min(.35,Math.max(.12,Math.sqrt(segment)/1400));
 const vx=Number.isFinite(rival.moveVX)?rival.moveVX:0;
 const vy=Number.isFinite(rival.moveVY)?rival.moveVY:0;
 const futureX=rival.x+Math.max(-65,Math.min(65,vx*lookahead));
 const futureY=rival.y+Math.max(-65,Math.min(65,vy*lookahead));
 const marker=Math.max(0,1-Math.hypot(futureX-to.x,futureY-to.y)/90)*.12;
 const t=((futureX-from.x)*dx+(futureY-from.y)*dy)/segment;
 const lateral=Math.hypot(futureX-from.x-t*dx,futureY-from.y-t*dy);
 const blocker=t>.045&&t<.97?Math.max(0,1-lateral/75)*.19:0;
 return Math.min(.32,marker+blocker);
}

test('directed ground-pass pressure catches a real-speed time-aligned slide sweep missed by the old 65-unit cap in both directions',async()=>{
 const {SHOTFEEL}=await load();
 for(const [from,to,defender] of [
  [{x:0,y:0},{x:160,y:112},slide()],
  [{x:500,y:0},{x:340,y:112},slide({x:395})]
 ]){
  const legacy=legacyCappedPressure(from,to,defender);
  const pressure=SHOTFEEL.passingLanePressure(from,to,[defender]);
  assert.ok(legacy<.10,JSON.stringify({from,to,defender,legacy}));
  assert.ok(pressure>=.15,JSON.stringify({from,to,defender,pressure}));
  assert.ok(pressure<=.32,'the combined lane-pressure score remains bounded');
 }
});

test('retreating, late, exhausted, expired and malformed slides do not falsely close a ground-pass lane',async()=>{
 const {SHOTFEEL}=await load();
 const from={x:0,y:0},to={x:160,y:112};
 for(const defender of [
  slide({slideDY:-1,moveVY:-595}),
  slide({y:-140}),
  slide({actionTimer:.03,slideTimer:.03,slideRemaining:20}),
  slide({actionTimer:0,moveVY:0}),
  slide({slideTimer:0,moveVY:0}),
  slide({slideDX:0,slideDY:0,moveVY:0}),
  slide({slideRemaining:0,moveVY:0})
 ]){
  const pressure=SHOTFEEL.passingLanePressure(from,to,[defender]);
  assert.ok(pressure<.10,JSON.stringify({defender,pressure}));
 }
});

test('ordinary moving and stationary defenders retain their established ground-pass pressure',async()=>{
 const {SHOTFEEL}=await load();
 const from={x:0,y:0},to={x:160,y:112};
 const runner={x:80,y:-35,stun:0,action:'run',moveVX:0,moveVY:500};
 const marker={x:80,y:56,stun:0,action:'idle',moveVX:0,moveVY:0};
 assert.ok(SHOTFEEL.passingLanePressure(from,to,[runner])>=.10);
 assert.ok(SHOTFEEL.passingLanePressure(from,to,[marker])>=.10);
});
