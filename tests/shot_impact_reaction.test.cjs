'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const artposeSource=fs.readFileSync(path.join(root,'src/modules/artpose.js'),'utf8').replace(/^export \{[^\n]+\};?\s*$/m,'');
const artposeContext=vm.createContext({});
vm.runInContext(artposeSource+'\nthis.confusionPose=ARTPOSE.confusionPose;',artposeContext);
const confusionPose=artposeContext.confusionPose;
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');

function makeContext(){
 const calls=[],target={globalAlpha:1};
 const ctx=new Proxy(target,{get(obj,key){if(key in obj)return obj[key];return (...args)=>calls.push([String(key),...args]);},set(obj,key,value){obj[key]=value;return true;}});
 return {ctx,calls};
}
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}

test('confusion pose is timer-bounded and reduced-flash freezes the comic eye motion',()=>{
 assert.deepEqual(JSON.parse(JSON.stringify(confusionPose(0,1,false))),{intensity:0,eyeSpin:3.2,headBob:0});
 assert.equal(confusionPose(.16,1,false).intensity,1);
 assert.equal(confusionPose(9,1,false).intensity,1,'invalidly long visual timers remain bounded');
 assert.notEqual(confusionPose(.8,.3,false).eyeSpin,confusionPose(.8,.6,false).eyeSpin);
 assert.notEqual(confusionPose(.8,.3,false).headBob,confusionPose(.8,.6,false).headBob);
 assert.deepEqual(JSON.parse(JSON.stringify(confusionPose(.8,.3,true))),{intensity:1,eyeSpin:0,headBob:0});
});

test('stun cue draws animated spiral pupils while retaining still reduced-flash cues',()=>{
 const cueSource=render.match(/function drawShotImpactCue\(ctx,p,time,reducedFlash=false\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(cueSource,'shot stun cue exists');
 assert.match(cueSource,/ARTPOSE\.confusionPose\(confused,time,reducedFlash\)/);
 assert.match(cueSource,/ctx\.arc\(0,0,2\.7,0,Math\.PI\*1\.65\)/,'spiral pupils are drawn inside the eyes');
 const drawCue=new Function('ARTPOSE','ellipse',`return (${cueSource});`)(
  {confusionPose},ellipse);
 const drawAt=(time,reducedFlash)=>{const state=makeContext();drawCue(state.ctx,{shotImpactConfusedTimer:.8},time,reducedFlash);return state;};
 const normalA=drawAt(.2,false),normalB=drawAt(.6,false),steadyA=drawAt(.2,true),steadyB=drawAt(.6,true);
 const spirals=state=>state.calls.filter(([name])=>name==='rotate');
 assert.notDeepEqual(spirals(normalA),spirals(normalB),'spiral eyes rotate over time');
 assert.deepEqual(spirals(steadyA),spirals(steadyB),'reduced-flash eyes stay still');
 assert.equal(normalA.ctx.globalAlpha,1,'the cue restores Canvas alpha');
});
