'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/modules/render.js','utf8');
const match=source.match(/function drawOrdinaryBallWake\(ctx,b,reducedFlash=false\)\{[\s\S]*?\n\}/);
assert.ok(match,'production ordinary-shot wake helper exists');

function sample(ball,reducedFlash=false){
 const calls=[],state={globalAlpha:1},stack=[];
 const ctx=new Proxy(state,{get(target,key){if(key==='save')return ()=>{stack.push({...state});calls.push(['save']);};if(key==='restore')return ()=>{Object.assign(state,stack.pop()||{});calls.push(['restore']);};if(key in target)return target[key];return (...args)=>calls.push([String(key),...args]);},set(target,key,value){target[key]=value;return true;}});
 const draw=new Function(`${match[0]};return drawOrdinaryBallWake;`)();
 const before=JSON.stringify(ball),drawn=draw(ctx,ball,reducedFlash);
 return {calls,state,drawn,unchanged:before===JSON.stringify(ball)};
}

test('ordinary high-speed shot wake is path-following, layered, thresholded and visual-only',()=>{
 const ball={x:120,y:100,z:10,vx:500,vy:120,trail:[{x:70,y:84,z:0},{x:91,y:91,z:3},{x:110,y:97,z:8}]};
 const normal=sample(ball),reduced=sample(ball,true),slow=sample({...ball,vx:285,vy:0,trail:[]});
 assert.equal(normal.drawn,true);assert.equal(reduced.drawn,true);assert.equal(slow.drawn,false);
 assert.equal(normal.calls.filter(([name])=>name==='stroke').length,2,'soft outer ribbon plus narrow core');
 assert.ok(normal.calls.some(([name,x,y])=>name==='moveTo'&&x===70&&y===84),'wake follows recorded ball path');
 assert.ok(normal.calls.some(([name,x,y])=>name==='lineTo'&&x===120&&y===90),'wake terminates at current ball height');
 assert.equal(normal.unchanged,true);assert.equal(reduced.unchanged,true);
 assert.ok(normal.calls.filter(([name])=>name==='stroke').length===reduced.calls.filter(([name])=>name==='stroke').length);
 assert.equal(reduced.state.globalAlpha,1,'reduced-flash canvas alpha is restored');
});
