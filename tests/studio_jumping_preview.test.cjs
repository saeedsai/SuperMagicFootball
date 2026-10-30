'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=read('src/modules/engine.js'),ui=read('src/modules/ui.js');
const jumpSource=engine.match(/ jump\(p\)\{([\s\S]*?)\n \}\n\n \/\/ Resolve impact/);
assert.ok(jumpSource,'actual engine jump method remains extractable');
const jump=new Function('p','stat','jumpMetrics',jumpSource[1]);
const previewSource=ui.match(/function studioJumpPreview\(jumping\)\{([\s\S]*?)\n\}\nfunction studioStatPreview/);
assert.ok(previewSource,'actual Studio Jumping preview remains extractable');
const studioJumpPreview=new Function('jumping','jumpMetrics',previewSource[1]);
async function metrics(){return (await import(pathToFileURL(path.join(root,'src/modules/jumpmetrics.js')).href)).JUMPMETRICS.jumpMetrics}
function jumpAt(rating,double,jumpMetrics){
 const p={src:{jumping:rating},t:0,stun:0,z:double?20:0,vz:0,jumpCount:double?1:0,fatigue:0};
 const calls=[];
 const context={spendStamina:(player,kind)=>calls.push(kind),emit:(event)=>calls.push(event)};
 assert.equal(jump.call(context,p,(player,key)=>player.src[key],jumpMetrics),true);
 assert.ok(calls.includes('jump'));
 return p;
}
test('jump metric endpoints preserve original impulses and costs',async()=>{
 const calc=await metrics(),lo=calc(1),hi=calc(100);
 assert.equal(lo.heightRatio,.30);
 assert.equal(lo.energyCostMultiplier,1.99);
 assert.equal(hi.heightRatio,1);
 assert.equal(hi.firstImpulse,420);
 assert.equal(hi.doubleImpulse,535);
 assert.equal(hi.doubleLift,14);
 assert.equal(hi.energyCostMultiplier,1);
});
test('Jumping height and energy are strictly monotonic for every rating',async()=>{
 const calc=await metrics();
 for(let i=2;i<=100;i++){
  const a=calc(i-1),b=calc(i);
  assert.ok(b.heightRatio>a.heightRatio,'height '+i);
  assert.ok(b.firstImpulse>a.firstImpulse,'impulse '+i);
  assert.ok(b.energyCostMultiplier<a.energyCostMultiplier,'Energy cost '+i);
 }
 assert.equal(calc(101).rating,100);
 assert.equal(calc(-10).rating,1);
 assert.equal(calc(Number.NaN).rating,1);
});
test('real jump method consumes shared profile for both single and double jumps',async()=>{
 const calc=await metrics();
 for(const rating of [1,50,100]){
  const p=jumpAt(rating,false,calc),double=jumpAt(rating,true,calc),m=calc(rating);
  assert.equal(p.vz,m.firstImpulse);
  assert.equal(p.z,m.initialLift);
  assert.equal(double.vz,m.doubleImpulse);
  assert.equal(double.z,20+m.doubleLift);
 }
});
test('Studio shows the same live height and Energy costs as gameplay',async()=>{
 const calc=await metrics();
 for(const rating of [1,45,75,100]){
  const value=studioJumpPreview(rating,calc),m=calc(rating);
  assert.ok(value.includes('JUMPING '+rating+'/100'));
  assert.ok(value.includes('LEAP HEIGHT '+Math.round(m.heightRatio*100)+'%'));
  assert.ok(value.includes('JUMP ENERGY COST ×'+m.energyCostMultiplier.toFixed(2)));
 }
});
test('Studio stat editor includes Jumping and uses the canonical attribute count',()=>{
 assert.match(ui,/jumping:'Jumping'/);
 assert.match(ui,/Change any of the \$\{NUMERIC_STATS.length\} match attributes/);
 assert.match(ui,/id="studioJumpPreview"/);
 assert.match(ui,/aria-live="polite"/);
 assert.match(ui,/if\(jump\)jump.textContent=studioJumpPreview\(stats.jumping\)/);
});
test('Studio updates live Jumping preview and handles invalid input without save writes',async()=>{
 const calc=await metrics();
 const block=ui.match(/function studioStatPreview\(\)\{([\s\S]*?)\n\}\nfunction saveStudioStats/);
 assert.ok(block,'Studio stat preview function exists');
 const labels={studioStatOVR:{textContent:''},studioJumpPreview:{textContent:''}};
 let invalid=false;
 const ctx={
  $:id=>labels[id],career:null,home:0,avatarIndex:0,roster:()=>[{id:'p1',role:'FW'}],
  readStudioStats:()=>{if(invalid)throw Error('Invalid Jumping');return {jumping:60}},
  overallForPosition:()=>77,
  studioJumpPreview:rating=>studioJumpPreview(rating,calc)
 };
 const preview=vm.runInNewContext('(function(){'+block[1]+'})',ctx);
 preview();assert.equal(labels.studioStatOVR.textContent,'POSITION OVR: 77');
 assert.match(labels.studioJumpPreview.textContent,/JUMPING 60\/100/);
 invalid=true;preview();assert.match(labels.studioStatOVR.textContent,/Invalid Jumping/);
 assert.match(labels.studioJumpPreview.textContent,/Enter valid stats/);
});
test('both offline shell and generated QA fixture include the shared module',()=>{
 for(const p of ['sw.js','scripts/build.py']){
  const source=read(p);
  assert.match(source,/'fitness','jumpmetrics','playeridentity'/,p);
 }
 assert.match(engine,/import \{JUMPMETRICS\} from "\.\/jumpmetrics\.js"/);
 assert.match(ui,/import \{JUMPMETRICS\} from "\.\/jumpmetrics\.js"/);
});
