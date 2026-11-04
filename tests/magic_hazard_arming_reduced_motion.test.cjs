'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const render=fs.readFileSync('src/modules/render.js','utf8');
const source=render.match(/function drawHazardArmingCue\(ctx,hazard,radius,armDuration,color,reducedFlash=false\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(source,'hazard arming cue renderer exists');
function context(){
 const calls=[];
 const ctx={globalAlpha:1,save(){calls.push(['save']);},restore(){calls.push(['restore']);},beginPath(){calls.push(['beginPath']);},
  arc(...args){calls.push(['arc',...args]);},stroke(){calls.push(['stroke']);}};
 return {ctx,calls};
}
const draw=new Function('PI',`return (${source});`)(Math.PI);
const frame=(arm,reducedFlash)=>{const state=context();draw(state.ctx,{x:80,y:40,arm,life:1},21,.25,'#fff1a3',reducedFlash);return state.calls;};

test('banana and ice arming cues stay visible but stationary with reduced motion',()=>{
 assert.match(render,/drawBananaPeels\(ctx,game\.magicHazards,!!game\.options\?\.reducedFlash\)/);
 assert.match(render,/drawIcePatches\(ctx,game\.magicHazards,!!game\.options\?\.reducedFlash\)/);
 const low=frame(.08,true),high=frame(.21,true);
 assert.deepEqual(low,high,'reduced-motion cue geometry does not sweep as arming time advances');
 assert.ok(low.some(([name])=>name==='stroke'),'warning ring remains visible');
 const normalLow=frame(.08,false).find(([name])=>name==='arc');
 const normalHigh=frame(.21,false).find(([name])=>name==='arc');
 assert.notDeepEqual(normalLow,normalHigh,'standard mode retains its timed arming progress cue');
});
