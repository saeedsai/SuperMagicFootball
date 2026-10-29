'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture() {
 const source = fs.readFileSync(path.join(__dirname, '../src/modules/ui.js'), 'utf8');
 const found = source.match(/function drawStudioEightViewGallery\(player,appearance\)\{[\s\S]*?\n\}\s*\n\/\/ STUDIO-101:/);
 assert.ok(found, 'the real Studio gallery renderer must be present');
 const method = found[0].replace(/\n\/\/ STUDIO-101:[\s\S]*$/, '');
 const calls = [];
 const pose = {value:'slide'};
 const status = {textContent:''};
 const directions = ['N','NE','E','SE','S','SW','W','NW'].map((label,i)=>({
  label,dx:Math.cos(i*Math.PI/4),dy:Math.sin(i*Math.PI/4),view:{kind:'side',side:i<4?1:-1}
 }));
 const context = () => ({
  clearRect(){},createLinearGradient(){return {addColorStop(){}};},
  fillRect(){},save(){},translate(){},scale(){},restore(){}
 });
 const canvases = Array.from({length:8},()=>({
  width:144,height:152,labels:[],
  getContext:context,
  setAttribute(key,value){this.labels.push([key,value]);}
 }));
 const root = {
  querySelectorAll(){return canvases;},
  querySelector(selector){const index=Number(selector.match(/view="(\d+)"/)?.[1]);return canvases[index];}
 };
 const sandbox = {
  studioGalleryOpen:true,studioGallerySignature:'',home:0,avatarIndex:2,
  STUDIO_DIRS:directions,TEAMS:[{id:'team'}],
  game:{player:()=>({team:0,i:3})},
  portraitFit:()=>({x:72,y:140,scale:1}),
  renderer:{drawPlayer(_ctx,player){calls.push(player);}},
  $:id=>id==='studioEightViewGallery'?root:id==='customPose'?pose:id==='studioEightViewPoseLabel'?status:null
 };
 vm.runInNewContext(method+'\nthis.drawGallery=drawStudioEightViewGallery;',sandbox);
 return {sandbox,pose,status,calls,canvases};
}

test('Studio compares the selected action in all eight directions',()=>{
 const f=fixture();
 f.sandbox.drawGallery({name:'Keeper',role:'GK'},{style:2});
 assert.equal(f.calls.length,8);
 assert.ok(f.calls.every(p=>p.action==='slide'&&p.keeper===true));
 assert.equal(f.status.textContent,'Comparing SLIDE in eight directions');
 assert.ok(f.canvases.every(c=>c.labels.some(([key,value])=>key==='aria-label'&&value.includes('slide pose'))));
});

test('changing pose invalidates gallery cache and run previews use movement vectors',()=>{
 const f=fixture();
 const player={name:'Striker',role:'FW'},appearance={style:1};
 f.sandbox.drawGallery(player,appearance);
 f.sandbox.drawGallery(player,appearance);
 assert.equal(f.calls.length,8,'unchanged still frames must not redraw');
 f.pose.value='run';
 f.sandbox.drawGallery(player,appearance);
 assert.equal(f.calls.length,16);
 const run=f.calls.slice(8);
 assert.ok(run.every(p=>p.action==='idle'&&p.anim===1.2));
 assert.ok(run.some(p=>p.dx!==0||p.dy!==0));
 assert.equal(f.status.textContent,'Comparing RUN in eight directions');
});

test('gallery preview never writes to saved player data',()=>{
 const f=fixture();
 const player={name:'Striker',role:'FW',appearance:{style:4}},appearance={style:1};
 const snapshot=JSON.stringify(player);
 f.sandbox.drawGallery(player,appearance);
 assert.equal(JSON.stringify(player),snapshot);
 assert.equal(appearance.style,1);
});
