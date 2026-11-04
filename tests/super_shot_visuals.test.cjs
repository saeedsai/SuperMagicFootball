'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
const ids=['silverCarp','dice','pineapple','apple','coconut','orange','strawberry','dolphin','wave'];
const artposeSource=fs.readFileSync(path.join(root,'src/modules/artpose.js'),'utf8').replace(/export \{ARTPOSE\};?\s*$/,'');
const ARTPOSE=vm.runInNewContext(artposeSource+'\nARTPOSE',{});

function makeContext(){
 const calls=[],target={globalAlpha:1};
 const ctx=new Proxy(target,{get(obj,key){if(key in obj)return obj[key];return (...args)=>{calls.push([String(key),...args]);};},
  set(obj,key,value){obj[key]=value;return true;}});
 return {ctx,calls};
}
function ellipse(ctx,x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();}
function poly(ctx,pts,col,stroke){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fillStyle=col;ctx.fill();if(stroke){ctx.lineWidth=2;ctx.strokeStyle=stroke;ctx.stroke();}}
function line(ctx,pts,color,width=2){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();}
function rr(ctx,x,y,w,h,r,col,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=col;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}

test('Super Shot launch pose makes a bounded deterministic tumble pulse and returns to neutral over the launched timer',()=>{
 for(const face of [-1,1]){
  const samples=[1.1,.825,.55,.275,0].map(timer=>({...ARTPOSE.shotImpactLaunchPose('launched',timer,face)}));
  assert.deepEqual(samples[0],{angle:0,armSpread:0},'launch begins from neutral');
  assert.deepEqual(samples[4],{angle:0,armSpread:0},'launch settles to neutral at the existing action endpoint');
  assert.equal(Math.sign(samples[2].angle),face,'body tilt follows player facing');
  assert.ok(Math.abs(samples[2].angle)<=.78&&Math.abs(samples[2].angle)>.7,'mid-flight tumble remains bounded and readable');
  assert.equal(samples[2].armSpread,1,'arms open through the middle of the launch');
  for(let i=0;i<samples.length;i++){
   assert.deepEqual(samples[i],{...ARTPOSE.shotImpactLaunchPose('launched',[1.1,.825,.55,.275,0][i],face)},'pose is deterministic');
   assert.ok(Number.isFinite(samples[i].angle)&&Number.isFinite(samples[i].armSpread));
   assert.ok(Math.abs(samples[i].angle)<=.78&&samples[i].armSpread>=0&&samples[i].armSpread<=1);
  }
  assert.ok(Math.abs(samples[0].angle)<Math.abs(samples[1].angle)&&Math.abs(samples[1].angle)<Math.abs(samples[2].angle));
  assert.ok(Math.abs(samples[2].angle)>Math.abs(samples[3].angle)&&Math.abs(samples[3].angle)>Math.abs(samples[4].angle));
 }
 for(const action of ['idle','shotDown','shotGetUp','hurt'])assert.deepEqual({...ARTPOSE.shotImpactLaunchPose(action,.55,1)},{angle:0,armSpread:0},action);
 assert.deepEqual({...ARTPOSE.shotImpactLaunchPose('launched',5,1)},{angle:0,armSpread:0},'timer above the launch interval clamps to its start');
 assert.deepEqual({...ARTPOSE.shotImpactLaunchPose('launched',-1,1)},{angle:0,armSpread:0},'negative timer clamps to its neutral endpoint');
});

test('transformed shots use slow orbital finish detail and a steady reduced-flash version',()=>{
 const source=render.match(/function drawSuperShotOrbitCue\(ctx,time,color,reducedFlash=false\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(source,'shared orbital glint cue exists');
 const drawCue=new Function('poly',`${source};return drawSuperShotOrbitCue;`)(poly);
 const sample=(time,reducedFlash)=>{const state=makeContext();drawCue(state.ctx,time,'#8cecff',reducedFlash);return state.calls;};
 assert.notDeepEqual(sample(0,false),sample(.5,false),'orbital highlight progresses with shot time');
 assert.deepEqual(sample(0,true),sample(.5,true),'reduced-flash cue remains stationary');
 assert.ok(sample(.5,false).some(([name])=>name==='ellipse'),'cue draws an orbit arc');
 assert.ok(sample(.5,false).some(([name])=>name==='lineTo'),'cue draws a readable glint');
});

const start=render.indexOf(' drawTransformation(ctx,s,t,reducedFlash=false,ballModel=\'classic\'){');
const end=render.indexOf('\n drawTornado(',start);
assert.ok(start>=0&&end>start,'transformation renderer is available');
const methodSource=render.slice(start,end).trim();
const orbitSource=render.match(/function drawSuperShotOrbitCue\(ctx,time,color,reducedFlash=false\)\{[\s\S]*?\n\}/)?.[0];
const drawOrbit=new Function('poly',`${orbitSource};return drawSuperShotOrbitCue;`)(poly);
const Probe=new Function('PI','clamp','ellipse','poly','line','rr','drawSuperShotOrbitCue',`return class Probe { ${methodSource} };`)(Math.PI,(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),ellipse,poly,line,rr,drawOrbit);
function draw(id,time=.36,reducedFlash=false){
 const {ctx,calls}=makeContext(),probe=new Probe();
 probe.drawSoccerBall=(context,x,y,r,model,rotation)=>calls.push(['soccerBall',x,y,r,model,rotation]);
 probe.drawTransformation(ctx,{id,transformSeconds:1.65},time,reducedFlash,'classic');
 return calls;
}

test('new Super Shot IDs each draw a distinct procedural form at match scale',()=>{
 const signatures=new Map();
 for(const id of ids){
  const calls=draw(id);
  assert.ok(calls.some(([name])=>['ellipse','moveTo','roundRect'].includes(name)),`${id} draws recognizable geometry`);
  signatures.set(id,JSON.stringify(calls));
 }
 assert.equal(new Set(signatures.values()).size,ids.length,'new shots do not fall back to one shared icon');
 for(const id of ids)assert.match(render,new RegExp(`id==='${id}'`),`${id} has an explicit renderer case`);
});

test('bird wing motion varies across flight phases and remains steady with reduced flash',()=>{
 const rotations=calls=>calls.filter(([name])=>name==='rotate').map(([,angle])=>angle);
 assert.notDeepEqual(rotations(draw('bird',0,false)),rotations(draw('bird',.2,false)),'wing rotations flap during flight');
 assert.deepEqual(rotations(draw('bird',0,true)),rotations(draw('bird',.2,true)),'reduced-flash freezes bird animation');
});

test('shot impact cues use renderer timers and expose downed and confused poses without gameplay writes',()=>{
 assert.match(render,/const shotLaunchPose=ARTPOSE\.shotImpactLaunchPose\(p\.action,p\.actionTimer,p\.face\)/);
 assert.match(render,/else if\(shotLaunchPose\.armSpread>0\)ctx\.rotate\(shotLaunchPose\.angle\)/);
 assert.match(render,/signatureMotion,shotLaunchPose,celebrate:p\.action==='celebrate'/);
 const characterArt=fs.readFileSync(path.join(root,'src/modules/characterart.js'),'utf8');
 assert.match(characterArt,/const launch=clamp\(Number\(opt\.shotLaunchPose\?\.armSpread\)\|\|0,0,1\)/);
 assert.match(render,/shotImpactKnockdownTimer/);
 assert.match(render,/knockdownPose=p\.action==='shotDown'&&knockdownTimer>0\?1:0/);
 assert.match(render,/ctx\.rotate\(\(p\.face\|\|1\)\*1\.32\*knockdownPose\)/);
 assert.match(render,/ARTPOSE\.shotImpactRecoveryPose\(p\.action,p\.actionTimer,p\.face\)/);
 assert.match(render,/else if\(p\.action==='shotGetUp'\)\{\s*ctx\.translate\(0,-impactRecovery\.lift\);\s*ctx\.rotate\(impactRecovery\.angle\);/);
 assert.match(render,/const shotRecovery=p\.action==='shotGetUp'\?impactRecovery\.support:0/);
 assert.match(fs.readFileSync(path.join(root,'src/modules/artpose.js'),'utf8'),/function shotImpactRecoveryPose\(action,actionTimer=\.24,face=1\)/);
 assert.match(render,/shotImpactConfusedTimer/);
 assert.match(render,/drawShotImpactCue\(ctx,p,this\.time,!!game\.options\?\.reducedFlash\)/);
 const cueSource=render.match(/function drawShotImpactCue\(ctx,p,time,reducedFlash=false\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(cueSource,'confusion cue renderer exists');
 const drawCue=new Function('ellipse','ARTPOSE',`return (${cueSource});`)(ellipse,{confusionPose:(timer,time,reduced)=>({headBob:reduced?0:Math.sin(time*3.2)*1.4,eyeSpin:reduced?0:time*3.2})});
 const drawAt=(time,reducedFlash)=>{const sample=makeContext();drawCue(sample.ctx,{shotImpactConfusedTimer:.6},time,reducedFlash);return sample;};
 const sample=drawAt(1.2,false);
 assert.ok(sample.calls.some(([name])=>name==='ellipse'),'confusion draws eyes and orbiting birds');
 assert.equal(sample.ctx.globalAlpha,1,'cue restores Canvas alpha');
 const transforms=calls=>calls.filter(([name])=>name==='translate'||name==='rotate');
 assert.notDeepEqual(transforms(drawAt(1,false).calls),transforms(drawAt(2,false).calls),'birds orbit at a steady speed');
 assert.deepEqual(transforms(drawAt(1,true).calls),transforms(drawAt(2,true).calls),'reduced-flash keeps birds still');
});

test('underground fish-family shots replace the transformed sprite with a steady ground wake',()=>{
 const startBall=render.indexOf(' drawBall(ctx,game){'),endBall=render.indexOf('\n // These are visual-only cues',startBall);
 assert.ok(startBall>=0&&endBall>startBall,'drawBall method is available');
 const ballMethod=render.slice(startBall,endBall).trim();
 const makeProbeBall=cue=>new Function('ARTPOSE','ellipse','drawSpiralRibbon','clamp','drawUndergroundShotTell',`return class ProbeBall { drawBallShadow(){} ${ballMethod} };`)(
  {keeperGrip:()=>null},ellipse,()=>{},(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),cue);
 const renderBall=(id,underground,reducedFlash=false)=>{
  const {ctx,calls}=makeContext(),probe=new (makeProbeBall((_ctx,b,reduced,time)=>calls.push(['groundWake',b.x,b.y,reduced,time])))();probe.time=.8;
  probe.drawTransformation=()=>calls.push(['transformedSprite']);probe.drawSoccerBall=()=>calls.push(['soccerBall']);
  const game={options:{reducedFlash,ballModel:'classic'},ball:{owner:null,x:340,y:250,z:0,vx:520,vy:24,age:.3,trail:[],shot:{id,behavior:id,underground,trail:'#68dbe0',color:'#68dbe0'}}};
  probe.drawBall(ctx,game);return calls;
 };
 for(const id of ['silverCarp','dolphin','wave']){
  const calls=renderBall(id,true,true);
  assert.ok(calls.some(([name])=>name==='groundWake'),`${id} has a ground wake`);
  assert.ok(!calls.some(([name])=>name==='transformedSprite'||name==='soccerBall'),`${id} sprite is hidden underground`);
 }
 assert.ok(renderBall('silverCarp',false).some(([name])=>name==='transformedSprite'),'the transformed sprite returns above ground');
 assert.match(render,/function drawUndergroundShotTell\(ctx,b,reducedFlash=false,time=0\)/);
 const cueSource=render.match(/function drawUndergroundShotTell\(ctx,b,reducedFlash=false,time=0\)\{[\s\S]*?\n\}/)?.[0];
 const drawCue=new Function('ellipse',`return (${cueSource});`)(ellipse);
 const sample=(time,reducedFlash)=>{const state=makeContext();drawCue(state.ctx,{x:200,y:190,vx:400,vy:60},reducedFlash,time);return state.calls.filter(([name])=>name==='ellipse');};
 assert.notDeepEqual(sample(0,false),sample(1,false),'the open ripple moves with shot time');
 assert.deepEqual(sample(0,true),sample(1,true),'reduced-flash keeps the ripple steady');
});
