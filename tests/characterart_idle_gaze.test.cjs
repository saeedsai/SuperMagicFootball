'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const characterSource=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const renderSource=fs.readFileSync('src/modules/render.js','utf8');
const CHARACTER_ART=vm.runInNewContext(characterSource+'\nCHARACTER_ART',{});

test('idle gaze is deterministic, staggered, bounded and returns to center',()=>{
 const gaze=CHARACTER_ART.idleGaze;
 assert.deepEqual(JSON.parse(JSON.stringify(gaze(0,0))),{x:0,y:0});
 assert.ok(gaze(2.8,0).x>.89,'first glance reaches a small rightward offset');
 assert.ok(gaze(4.65,0).x<-.89,'second glance reaches a small leftward offset');
 assert.deepEqual(JSON.parse(JSON.stringify(gaze(3.8,0))),{x:0,y:0},'gaze returns to center between glances');
 assert.deepEqual(JSON.parse(JSON.stringify(gaze(7.2,0))),JSON.parse(JSON.stringify(gaze(0,0))),'schedule repeats on its deterministic cycle');
 assert.notDeepEqual(JSON.parse(JSON.stringify(gaze(2.8,0))),JSON.parse(JSON.stringify(gaze(2.8,1))),'players look at staggered times');
 for(const index of [0,1,8,22])for(let t=0;t<30;t+=.13){
  const pose=gaze(t,index);assert.ok(Number.isFinite(pose.x)&&Number.isFinite(pose.y));
  assert.ok(Math.abs(pose.x)<=.9&&Math.abs(pose.y)<=.55);
 }
 for(const time of [NaN,Infinity,-Infinity,-1])assert.deepEqual(JSON.parse(JSON.stringify(gaze(time,0))),{x:0,y:0});
});

test('gaze moves only pupils and is gated off during reduced-flash, action, hurt and cry poses',()=>{
 assert.match(characterSource,/const gaze=idleBreath&&!opt\.hurt&&!opt\.cry&&!opt\.reducedFlash\?idleGaze\(opt\.time,p\.i\):\{x:0,y:0\}/);
 assert.match(characterSource,/Only the iris\/pupil move; the sclera, eyelids, brows and face remain fixed/);
 assert.match(characterSource,/face\(c,k,av,colors\.skin,colors\.hair,\{\.\.\.opt,blink,gazeX:gaze\.x,gazeY:gaze\.y\}\)/);
 assert.match(renderSource,/reducedFlash:\!\!game\.options\?\.reducedFlash/);
});
