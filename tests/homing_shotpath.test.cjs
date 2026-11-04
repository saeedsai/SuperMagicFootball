'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const helperSource=fs.readFileSync(path.join(root,'src/modules/shotpaths.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const config=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const helper=import('data:text/javascript;base64,'+Buffer.from(helperSource).toString('base64'));
function close(a,b,eps=1e-7){assert.ok(Math.abs(a-b)<=eps,`expected ${a} ~= ${b}`);}
async function run(shot,fps,end){
 const {SHOTPATHS}=await helper;let y=0,vy=0,t=0;
 while(t<end-1e-12){const next=Math.min(end,t+1/fps),step=SHOTPATHS.homingStep(shot,t,next),dt=next-t;vy+=step.deltaVy;y+=vy*dt+step.correctionY;t=next;}
 return {y,vy};
}
test('Target and Eagle retain the manifest homing behavior and flight tuning',()=>{
 for(const id of ['target','eagle'])assert.equal(config.shotTypes[id].behavior,'homing');
 assert.equal(config.shotTypes.target.speed,1.26);assert.equal(config.shotTypes.eagle.speed,1.47);
});
test('homing correction is smooth, signed, bounded and reaches its capped lane target',async()=>{
 const {SHOTPATHS}=await helper;assert.equal(SHOTPATHS.MAX_HOMING_OFFSET,70);
 for(const offset of [-70,-38,0,38,70]){
  const start=SHOTPATHS.homingSample({homingOffset:offset},0),end=SHOTPATHS.homingSample({homingOffset:offset},1.65);
  close(start.offset,0);close(start.velocity,0);close(end.offset,offset);close(end.velocity,0);
  for(let t=0;t<=1.65;t+=.002){const sample=SHOTPATHS.homingSample({homingOffset:offset},t);
   assert.ok(Number.isFinite(sample.offset)&&Number.isFinite(sample.velocity));
   assert.ok(Math.abs(sample.offset)<=70+1e-8);assert.ok(Math.abs(sample.velocity)<=64+1e-6);
  }
  for(const t of [.2,.4,.8,1.2,1.5,1.65,1.9]){
   const target=SHOTPATHS.homingSample({homingOffset:offset},t);
   for(const fps of [30,60,120]){const got=await run({homingOffset:offset},fps,t);close(got.y,target.offset);close(got.vy,target.velocity);}
  }
  const settled=await run({homingOffset:offset},120,2.1);close(settled.y,offset);close(settled.vy,0);
 }
});
test('malformed targets and clocks safely produce no homing displacement',async()=>{
 const {SHOTPATHS}=await helper;
 for(const bad of [NaN,Infinity,-Infinity,'not-a-number']){
  assert.deepEqual(SHOTPATHS.homingProfile({homingOffset:bad}),{offset:0});
  assert.deepEqual(SHOTPATHS.homingSample({homingOffset:bad},.4),{offset:0,velocity:0});
 }
 assert.deepEqual(SHOTPATHS.homingProfile({homingOffset:1e9}),{offset:70});
 assert.deepEqual(SHOTPATHS.homingProfile({homingOffset:-1e9}),{offset:-70});
 for(const [from,to] of [[1,0],[NaN,1],[1,Infinity],[-Infinity,2]])
  assert.deepEqual(SHOTPATHS.homingStep({homingOffset:40},from,to),{deltaVy:0,correctionY:0});
});
test('live and predicted flights share the eased step and shooting retains selected aim',()=>{
 assert.equal((engine.match(/SHOTPATHS\.homingStep\(/g)||[]).length,2);
 assert.match(engine,/if\(shot\?\.behavior==='homing'\|\|shot\?\.behavior==='dolphin'\)[\s\S]*?SHOTPATHS\.homingStep\(/);
 assert.match(engine,/if\(b\.shot\?\.behavior==='homing'\|\|b\.shot\?\.behavior==='dolphin'\)[\s\S]*?SHOTPATHS\.homingStep\(/);
 assert.match(engine,/b\.shot\.homingOffset=clamp\(targetY-straightY,-SHOTPATHS\.MAX_HOMING_OFFSET,SHOTPATHS\.MAX_HOMING_OFFSET\)/);
 assert.match(engine,/\(spec\.behavior==='homing'\|\|spec\.behavior==='dolphin'\)\?dy\*\.82:dy/);
 assert.doesNotMatch(engine,/\(s\.aimY-b\.y\)\*1\.2/);
});
