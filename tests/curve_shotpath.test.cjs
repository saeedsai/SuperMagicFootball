'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/modules/shotpaths.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const config=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const helper=import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function close(a,b,eps=1e-7){assert.ok(Math.abs(a-b)<=eps,`expected ${a} ~= ${b}`);}
async function run(shot,fps,end){
 const {SHOTPATHS}=await helper;let y=0,vy=0,t=0;
 while(t<end-1e-12){const next=Math.min(end,t+1/fps),step=SHOTPATHS.curveStep(shot,t,next);vy+=step.deltaVy;y+=vy*(next-t)+step.correctionY;t=next;}
 return {y,vy};
}
test('Banana Shot uses the shared bounded signed double-bend path',async()=>{
 const {SHOTPATHS}=await helper;
 assert.equal(config.shotTypes.banana.behavior,'curve');
 for(const direction of [-1,1]){
  const shot={id:'banana',direction};
  const first=SHOTPATHS.curveSample(shot,.4),second=SHOTPATHS.curveSample(shot,1.2);
  assert.ok(direction*first.offset>0,`first bend follows signed direction ${direction}`);
  assert.ok(direction*second.offset<0,`second bend reverses direction ${direction}`);
  for(let t=0;t<=SHOTPATHS.TRANSFORM_SECONDS;t+=.002){
   const sample=SHOTPATHS.curveSample(shot,t);
   assert.ok(Number.isFinite(sample.offset)&&Number.isFinite(sample.velocity));
   assert.ok(Math.abs(sample.offset)<=38+1e-8);
   assert.ok(Math.abs(sample.velocity)<=170+1e-6);
  }
  for(const t of [0,.2,.4,.8,1.2,1.5,1.65,1.9]){
   const sample=SHOTPATHS.curveSample(shot,t);
   close(sample.offset,-SHOTPATHS.curveSample({id:'banana',direction:-direction},t).offset);
  }
 }
});
test('curve position and velocity are equivalent at 30/60/120 Hz and end without drift',async()=>{
 const {SHOTPATHS}=await helper;
 for(const direction of [-1,1])for(const end of [.19,.4,.8,1.2,1.5,1.65,1.9]){
  const shot={id:'banana',direction},target=SHOTPATHS.curveSample(shot,end);
  for(const fps of [30,60,120]){const got=await run(shot,fps,end);close(got.y,target.offset);close(got.vy,target.velocity);}
 }
 for(const direction of [-1,1]){
  const end=SHOTPATHS.curveSample({direction},1.65);
  close(end.offset,0);close(end.velocity,0);
  close((await run({direction},120,1.9)).y,0);close((await run({direction},120,1.9)).vy,0);
 }
});
test('curve path rejects invalid clocks and bounds optional amplitude tuning',async()=>{
 const {SHOTPATHS}=await helper;
 assert.deepEqual(SHOTPATHS.curveProfile({curveAmplitude:NaN}),{amplitude:38,direction:1});
 assert.deepEqual(SHOTPATHS.curveProfile({curveAmplitude:1e9,direction:-1}),{amplitude:60,direction:-1});
 assert.deepEqual(SHOTPATHS.curveProfile({curveAmplitude:-20}),{amplitude:12,direction:1});
 for(const [from,to] of [[1,0],[NaN,1],[1,Infinity],[-Infinity,2]])
  assert.deepEqual(SHOTPATHS.curveStep({direction:1},from,to),{deltaVy:0,correctionY:0});
});
test('live ball and keeper projection each use the same curve-step helper exactly once',()=>{
 assert.match(engine,/import \{SHOTPATHS\} from "\.\/shotpaths\.js";/);
 assert.equal((engine.match(/SHOTPATHS\.curveStep\(/g)||[]).length,2);
 assert.match(engine,/if\(shot\?\.behavior==='curve'\).*SHOTPATHS\.curveStep\(/);
 assert.match(engine,/if\(b\.shot\?\.behavior==='curve'\).*SHOTPATHS\.curveStep\(/);
 assert.doesNotMatch(engine,/Math\.sin\(v\.age\*3\.2\).*180/);
 assert.doesNotMatch(engine,/Math\.sin\(b\.age\*3\.2\).*180/);
});
