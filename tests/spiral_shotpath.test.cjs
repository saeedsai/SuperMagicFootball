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
 const {SHOTPATHS}=await helper;let y=0,vy=0,z=0,vz=0,t=0;
 while(t<end-1e-12){const next=Math.min(end,t+1/fps),step=SHOTPATHS.spiralStep(shot,t,next),dt=next-t;
  vy+=step.deltaVy;y+=vy*dt+step.correctionY;vz+=step.deltaVz;z+=vz*dt+step.correctionZ;t=next;}
 return {y,vy,z,vz};
}
test('Tornado Shot is manifest-backed and spirals in mirrored bounded lanes',async()=>{
 const {SHOTPATHS}=await helper;
 assert.equal(config.shotTypes.tornado.behavior,'spiral');
 for(const direction of [-1,1]){
  const shot={id:'tornado',direction};
  for(let t=0;t<=SHOTPATHS.TRANSFORM_SECONDS;t+=.002){
   const sample=SHOTPATHS.spiralSample(shot,t);
   assert.ok(Number.isFinite(sample.offset)&&Number.isFinite(sample.velocity)&&Number.isFinite(sample.height)&&Number.isFinite(sample.verticalVelocity));
   assert.ok(Math.abs(sample.offset)<=42+1e-8);
   assert.ok(Math.abs(sample.velocity)<=190+1e-6);
   assert.ok(sample.height>=0&&sample.height<=28+1e-8);
   assert.ok(Math.abs(sample.verticalVelocity)<=110+1e-6);
  }
  const start=SHOTPATHS.spiralSample(shot,0),end=SHOTPATHS.spiralSample(shot,1.65);
  close(start.offset,0);close(start.velocity,0);close(start.height,0);close(start.verticalVelocity,0);
  close(end.offset,0);close(end.velocity,0);close(end.height,0);close(end.verticalVelocity,0);
  for(const t of [.2,.4,.8,1.2,1.5]){
   const a=SHOTPATHS.spiralSample(shot,t),b=SHOTPATHS.spiralSample({id:'tornado',direction:-direction},t);
   close(a.offset,-b.offset);close(a.velocity,-b.velocity);close(a.height,b.height);close(a.verticalVelocity,b.verticalVelocity);
  }
 }
});
test('spiral position and height are stable at 30/60/120 Hz and leave no drift',async()=>{
 const {SHOTPATHS}=await helper;
 for(const direction of [-1,1])for(const end of [.2,.4,.8,1.2,1.5,1.65,1.9]){
  const shot={id:'tornado',direction},target=SHOTPATHS.spiralSample(shot,end);
  for(const fps of [30,60,120]){const got=await run(shot,fps,end);close(got.y,target.offset);close(got.vy,target.velocity);close(got.z,target.height);close(got.vz,target.verticalVelocity);}
 }
});
test('invalid spiral tuning and clocks stay finite and within configured limits',async()=>{
 const {SHOTPATHS}=await helper;
 assert.deepEqual(SHOTPATHS.spiralProfile({spiralAmplitude:NaN,spiralHeight:Infinity}),{amplitude:42,height:28,direction:1});
 assert.deepEqual(SHOTPATHS.spiralProfile({spiralAmplitude:1e9,spiralHeight:-1e9,direction:-1}),{amplitude:65,height:8,direction:-1});
 for(const [from,to] of [[1,0],[NaN,1],[1,Infinity],[-Infinity,2]])
  assert.deepEqual(SHOTPATHS.spiralStep({},from,to),{deltaVy:0,correctionY:0,deltaVz:0,correctionZ:0});
});
test('live ball and keeper projection share the bounded spiral step',()=>{
 assert.equal((engine.match(/SHOTPATHS\.spiralStep\(/g)||[]).length,2);
 assert.match(engine,/if\(shot\?\.behavior==='spiral'\).*SHOTPATHS\.spiralStep\(/);
 assert.match(engine,/if\(b\.shot\?\.behavior==='spiral'\).*SHOTPATHS\.spiralStep\(/);
 assert.doesNotMatch(engine,/Math\.sin\(v\.age\*28\).*640/);
 assert.doesNotMatch(engine,/Math\.sin\(b\.age\*28\).*640/);
});
