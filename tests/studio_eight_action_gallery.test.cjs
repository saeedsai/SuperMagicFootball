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
 const phaseLabel={textContent:''};
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
  setAttribute(key,value){this.labels.push([key,value]);},
  buttonLabels:[],
  closest(selector){return selector==='[data-studio-pick]'?{setAttribute:(key,value)=>this.buttonLabels.push([key,value])}:null;}
 }));
 const root = {
  querySelectorAll(){return canvases;},
  querySelector(selector){const index=Number(selector.match(/view="(\d+)"/)?.[1]);return canvases[index];}
 };
 const sandbox = {
  studioGalleryOpen:true,studioGallerySignature:'',studioGalleryFrame:1,home:0,avatarIndex:2,
  STUDIO_DIRS:directions,TEAMS:[{id:'team'}],
  game:{player:()=>({team:0,i:3})},
  portraitFit:()=>({x:72,y:140,scale:1}),
  renderer:{drawPlayer(_ctx,player){calls.push(player);}},
  $:id=>id==='studioEightViewGallery'?root:id==='customPose'?pose:id==='studioEightViewPoseLabel'?status:id==='studioGalleryPhaseLabel'?phaseLabel:null
 };
 vm.runInNewContext(method+'\nthis.drawGallery=drawStudioEightViewGallery;',sandbox);
 return {sandbox,pose,status,phaseLabel,calls,canvases};
}

test('Studio compares the selected action in all eight directions',()=>{
 const f=fixture();
 f.sandbox.drawGallery({name:'Keeper',role:'GK'},{style:2});
 assert.equal(f.calls.length,8);
 assert.ok(f.calls.every(p=>p.action==='slide'&&p.keeper===true));
 assert.equal(f.status.textContent,'Comparing SLIDE frame 2 of 4 in eight directions');
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
 assert.ok(run.every(p=>p.action==='idle'&&p.anim===.9));
 assert.ok(run.some(p=>p.dx!==0||p.dy!==0));
 assert.equal(f.status.textContent,'Comparing RUN frame 2 of 4 in eight directions');
});

test('gallery preview never writes to saved player data',()=>{
 const f=fixture();
 const player={name:'Striker',role:'FW',appearance:{style:4}},appearance={style:1};
 const snapshot=JSON.stringify(player);
 f.sandbox.drawGallery(player,appearance);
 assert.equal(JSON.stringify(player),snapshot);
 assert.equal(appearance.style,1);
});


test('action phase scrubber redraws all eight views without mutating the selected player',()=>{
 const f=fixture();
 const player={name:'Keeper',role:'GK',appearance:{style:4}},appearance={style:2};
 const before=JSON.stringify(player);
 f.sandbox.drawGallery(player,appearance);
 assert.equal(f.calls.length,8);
 assert.equal(f.phaseLabel.textContent,'FRAME 2 / 4');
 const first=f.calls[0];
 assert.equal(first.actionTimer,.28);
 assert.equal(first.diveElapsed,.16);
 f.sandbox.studioGalleryFrame=3;
 f.sandbox.drawGallery(player,appearance);
 assert.equal(f.calls.length,16);
 assert.equal(f.phaseLabel.textContent,'FRAME 4 / 4');
 assert.equal(f.calls[8].actionTimer,.04);
 assert.equal(f.calls[8].diveElapsed,.42);
 f.sandbox.drawGallery(player,appearance);
 assert.equal(f.calls.length,16,'unchanged phase should remain cached');
 assert.equal(JSON.stringify(player),before);
 assert.equal(appearance.style,2);
});

test('phase slider has keyboard/touch accessible wiring and cannot create a fifth match control',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(source,/id="studioGalleryPhase"[^>]*type="range" min="0" max="3" step="1"/);
 assert.match(source,/if\(e\.target\.id==='studioGalleryPhase'\)/);
 assert.match(source,/Number\.isInteger\(frame\)&&frame>=0&&frame<=3/);
 assert.match(source,/studioGalleryFrame=frame;drawCustomizer\(\)/);
});

test('motion phase slider spans the full eight-view grid on desktop and mobile',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../style.css'),'utf8');
 assert.match(css,/\.studioGalleryTimeline\{grid-column:1\/-1;/);
});

// STUDIO-GALLERY-A11Y-PHASE-01: verify the real eight-canvas render path.
test('screen readers receive the exact action and phase on each focusable gallery tile',()=>{
 const f=fixture(),player={name:'Goalkeeper',role:'GK'},appearance={style:2};
 f.sandbox.drawGallery(player,appearance);
 for(let i=0;i<8;i++){
  assert.deepEqual(f.canvases[i].labels.at(-1),['aria-label',f.sandbox.STUDIO_DIRS[i].label+' slide pose, frame 2 of 4']);
  assert.deepEqual(f.canvases[i].buttonLabels.at(-1),['aria-label','Show '+f.sandbox.STUDIO_DIRS[i].label+' slide frame 2 of 4 in main player preview']);
 }
 f.sandbox.studioGalleryFrame=3;
 f.sandbox.drawGallery(player,appearance);
 assert.equal(f.status.textContent,'Comparing SLIDE frame 4 of 4 in eight directions');
 assert.deepEqual(f.canvases[0].labels.at(-1),['aria-label','N slide pose, frame 4 of 4']);
 assert.deepEqual(f.canvases[0].buttonLabels.at(-1),['aria-label','Show N slide frame 4 of 4 in main player preview']);
 f.pose.value='kick';
 f.sandbox.drawGallery(player,appearance);
 assert.deepEqual(f.canvases[7].labels.at(-1),['aria-label','NW kick pose, frame 4 of 4']);
 assert.equal(f.calls.length,24);
});
test('unchanged Studio gallery frames keep their cached accessible labels without extra redraws',()=>{
 const f=fixture(),player={name:'Forward',role:'FW'},appearance={style:1};
 f.sandbox.drawGallery(player,appearance);
 const count=f.canvases[0].buttonLabels.length;
 f.sandbox.drawGallery(player,appearance);
 assert.equal(f.canvases[0].buttonLabels.length,count);
 assert.equal(f.calls.length,8);
 const markup=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(markup,/id="studioEightViewPoseLabel"[^>]*role="status" aria-live="polite"/);
});
