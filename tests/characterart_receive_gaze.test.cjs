'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const artposePromise=import(pathToFileURL(path.resolve(__dirname,'../src/modules/artpose.js')).href);
const characterArtPromise=import(pathToFileURL(path.resolve(__dirname,'../src/modules/characterart.js')).href);
const player=(patch={})=>({x:100,y:100,action:'receive',actionTimer:.2,preview:false,...patch});
const ball=(patch={})=>({x:180,y:100,z:0,owner:null,...patch});
test('receiving eyes track the incoming ball in local facing coordinates on both sides',async()=>{
 const {ARTPOSE}=await artposePromise;
 const right=ARTPOSE.receiveGaze(player(),ball(),{side:1});
 const leftFacing=ARTPOSE.receiveGaze(player(),ball({x:20}),{side:-1});
 const behind=ARTPOSE.receiveGaze(player(),ball({x:20}),{side:1});
 assert.ok(right.x>2&&right.y===0,JSON.stringify(right));
 assert.ok(leftFacing.x>2&&leftFacing.y===0,JSON.stringify(leftFacing));
 assert.ok(behind.x< -2,JSON.stringify(behind));
});
test('receive gaze anticipates a bounded incoming velocity in local facing coordinates',async()=>{
 const {ARTPOSE}=await artposePromise;
 const stationary=ARTPOSE.receiveGaze(player(),ball({x:300}),{side:1});
 const approaching=ARTPOSE.receiveGaze(player(),ball({x:300,vx:-200}),{side:1});
 const mirrored=ARTPOSE.receiveGaze(player(),ball({x:300,vx:-200}),{side:-1});
 const fast=ARTPOSE.receiveGaze(player(),ball({x:300,vx:-1000}),{side:1});
 assert.ok(approaching.x>stationary.x,JSON.stringify({stationary,approaching}));
 assert.ok(approaching.x>.65&&approaching.x<.75,JSON.stringify(approaching));
 assert.ok(mirrored.x<-.65&&mirrored.x>-.75,JSON.stringify(mirrored));
 assert.ok(fast.x<=2.1&&fast.x>approaching.x,JSON.stringify(fast));
});
test('receive gaze follows projected ball height and remains bounded',async()=>{
 const {ARTPOSE}=await artposePromise;
 const high=ARTPOSE.receiveGaze(player(),ball({x:100,z:80}),{side:1});
 const low=ARTPOSE.receiveGaze(player(),ball({x:100,y:180,z:0}),{side:1});
 assert.ok(high.y< -1.2,JSON.stringify(high));
 assert.ok(low.y>1.2,JSON.stringify(low));
 for(const side of [-1,1])for(const x of [-220,-100,0,100,220]){
  const gaze=ARTPOSE.receiveGaze(player(),ball({x:100+x}),{side});
  if(gaze){assert.ok(Math.abs(gaze.x)<=2.1);assert.ok(Math.abs(gaze.y)<=1.35);}
 }
});
test('receive gaze rejects distant, owned, preview, non-receiving and invalid states without mutation',async()=>{
 const {ARTPOSE}=await artposePromise,p=player(),incoming=ball();
 assert.equal(ARTPOSE.receiveGaze(p,ball({x:331}),{side:1}),null);
 assert.equal(ARTPOSE.receiveGaze(p,{...incoming,owner:p},{side:1}),null);
 assert.equal(ARTPOSE.receiveGaze(p,{...incoming,owner:{}},{side:1}),null);
 assert.equal(ARTPOSE.receiveGaze({...p,preview:true},incoming,{side:1}),null);
 assert.equal(ARTPOSE.receiveGaze({...p,action:'idle'},incoming,{side:1}),null);
 assert.equal(ARTPOSE.receiveGaze(p,ball({x:NaN}),{side:1}),null);
 const before=JSON.stringify({p,incoming});ARTPOSE.receiveGaze(p,incoming,{side:1});
 assert.equal(JSON.stringify({p,incoming}),before);
});
test('standard Character Art fallback turns the shared reception brace into bounded knee, stance and balance-arm articulation',async()=>{
 const {CHARACTER_ART}=await characterArtPromise;
 const neutral=CHARACTER_ART.receiveArticulation({brace:0});
 const half=CHARACTER_ART.receiveArticulation({brace:.5});
 const full=CHARACTER_ART.receiveArticulation({brace:1});
 const invalid=CHARACTER_ART.receiveArticulation({brace:NaN});
 const over=CHARACTER_ART.receiveArticulation({brace:4});
 assert.deepEqual(neutral,{brace:0,kneeFlex:0,ankleSet:0,stance:0,armOpen:0,armDrop:0});
 assert.deepEqual(invalid,neutral,'invalid pressure fails safely to neutral');
 assert.equal(half.brace,.5);
 assert.equal(half.kneeFlex,1.6);
 assert.equal(half.ankleSet,.6);
 assert.equal(half.stance,.9);
 assert.equal(half.armOpen,2.6);
 assert.equal(half.armDrop,1.2);
 assert.deepEqual(over,full,'pressure is bounded to the existing unit envelope');
 assert.equal(full.kneeFlex,3.2);
 assert.equal(full.armOpen,5.2);
});
test('production renderer forwards receive gaze and the shared receive pose to the standard fallback',()=>{
 const fs=require('node:fs'),render=fs.readFileSync(path.resolve(__dirname,'../src/modules/render.js'),'utf8');
 const character=fs.readFileSync(path.resolve(__dirname,'../src/modules/characterart.js'),'utf8');
 assert.match(render,/const receiveGaze=ARTPOSE\.receiveGaze\(p,game\.ball,view\)/);
 const drawArgs=render.match(/CHARACTER_ART\.draw\(ctx,p,av,team,view,\{([\s\S]*?)\}\);/);
 assert.ok(drawArgs,'the production Character Art draw call must remain present');
 assert.match(drawArgs[1],/receiveGaze,receivePose:p\.action==='receive'\?ARTPOSE\.receivePose\(p\.actionTimer,p\.firstTouchPressure\|\|0\):null,carryShieldLean:/);
 assert.match(drawArgs[1],/carryShieldSide:/);
 assert.match(drawArgs[1],/carryShieldStrength:/);
 assert.match(drawArgs[1],/reducedFlash:/);
 assert.match(character,/const gaze=receiveGaze\|\|idleGazePose/);
 assert.match(character,/receiveArticulation\(opt\.receivePose\)/);
 assert.match(character,/clamp\(Number\(gazeX\)\|\|0,-2\.1,2\.1\)/);
});