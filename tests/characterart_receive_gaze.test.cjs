'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const artposePromise=import(pathToFileURL(path.resolve(__dirname,'../src/modules/artpose.js')).href);
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
test('production renderer forwards receive gaze and preserves the idle fallback',()=>{
 const fs=require('node:fs'),render=fs.readFileSync(path.resolve(__dirname,'../src/modules/render.js'),'utf8');
 const character=fs.readFileSync(path.resolve(__dirname,'../src/modules/characterart.js'),'utf8');
 assert.match(render,/const receiveGaze=ARTPOSE\.receiveGaze\(p,game\.ball,view\)/);
 assert.match(render,/receiveGaze,reducedFlash/);
 assert.match(character,/const gaze=receiveGaze\|\|idleGazePose/);
 assert.match(character,/clamp\(Number\(gazeX\)\|\|0,-2\.1,2\.1\)/);
});