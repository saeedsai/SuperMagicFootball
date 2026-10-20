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
function close(a,b,eps=1e-7){assert.ok(Math.abs(a-b)<=eps,'expected '+a+' ~= '+b);}
async function run(shot,fps,end=1.9){
 const {SHOTPATHS}=await helper;let y=0,vy=0,t=0;
 while(t<end-1e-12){const next=Math.min(end,t+1/fps),step=SHOTPATHS.zigzagStep(shot,t,next);vy+=step.deltaVy;y+=vy*(next-t)+step.correctionY;t=next;}
 return {y,vy};
}
test('Books and Serpent have unique manifest-backed zigzag amplitude and frequency',async()=>{
 const {SHOTPATHS}=await helper;
 for(const [id,amp,freq] of [['books',28,10],['serpent',45,15]]){
  const profile=SHOTPATHS.zigzagProfile({id});
  assert.deepEqual(profile,{amplitude:amp,frequency:freq,direction:1});
  assert.equal(config.shotTypes[id].behavior,'zigzag');
  assert.equal(config.shotTypes[id].zigzagAmplitude,amp);
  assert.equal(config.shotTypes[id].zigzagFrequency,freq);
 }
});
test('both mirror directions and 30/60/120Hz agree with exact trajectory samples',async()=>{
 const {SHOTPATHS}=await helper;
 for(const id of ['books','serpent'])for(const direction of [-1,1])for(const end of [.16,.32,.8,1.34,1.65,1.9]){
  const shot={id,direction},target=SHOTPATHS.zigzagSample(shot,end);
  for(const fps of [30,60,120]){const got=await run(shot,fps,end);close(got.y,target.offset);close(got.vy,target.velocity);}
 }
});
test('zigzag fades to zero with no residual velocity or lateral drift after 1.65s',async()=>{
 const {SHOTPATHS}=await helper;
 for(const id of ['books','serpent']){
  const shot={id,direction:1};
  for(const end of [1.65,1.9,2.4]){
   const sample=SHOTPATHS.zigzagSample(shot,end);close(sample.offset,0);close(sample.velocity,0);
   const integrated=await run(shot,120,end);close(integrated.y,0);close(integrated.vy,0);
  }
  assert.deepEqual(SHOTPATHS.zigzagStep(shot,1.65,1.85),{deltaVy:0,correctionY:0});
 }
});
test('nonfinite/negative clocks and tuning cannot generate unbounded zigzag',async()=>{
 const {SHOTPATHS}=await helper;
 const shot={id:'serpent',zigzagAmplitude:NaN,zigzagFrequency:Infinity};
 assert.deepEqual(SHOTPATHS.zigzagProfile(shot),{amplitude:45,frequency:15,direction:1});
 for(const [from,to] of [[1,0],[NaN,1],[1,Infinity],[-Infinity,2]]){
  assert.deepEqual(SHOTPATHS.zigzagStep(shot,from,to),{deltaVy:0,correctionY:0});
 }
 assert.deepEqual(SHOTPATHS.zigzagProfile({zigzagAmplitude:1e9,zigzagFrequency:-999}),{amplitude:65,frequency:6,direction:1});
 for(let t=0;t<1.65;t+=.003){
  const sample=SHOTPATHS.zigzagSample(shot,t);
  assert.ok(Math.abs(sample.offset)<=45+1e-9);
 }
});
test('shot helpers are deterministic and do not mutate gameplay configuration',async()=>{
 const {SHOTPATHS}=await helper;
 const shot=Object.freeze({...config.shotTypes.serpent,id:'serpent',direction:-1});
 const before=JSON.stringify(shot);
 assert.deepEqual(SHOTPATHS.zigzagStep(shot,.2,.48),SHOTPATHS.zigzagStep(shot,.2,.48));
 assert.equal(JSON.stringify(shot),before);
 assert.ok(Object.isFrozen(SHOTPATHS));
});
test('actual live updateBall and keeper plane prediction invoke one shared helper',()=>{
 assert.match(engine,/import \{SHOTPATHS\} from "\.\/shotpaths\.js";/);
 assert.equal((engine.match(/SHOTPATHS\.zigzagStep\(/g)||[]).length,2);
 assert.match(engine,/if\(shot\?\.behavior==='zigzag'\).*SHOTPATHS\.zigzagStep\(/);
 assert.match(engine,/if\(b\.shot\?\.behavior==='zigzag'\).*SHOTPATHS\.zigzagStep\(/);
 assert.doesNotMatch(engine,/s\.behavior==='swim'\|\|s\.behavior==='zigzag'/);
 assert.match(engine,/this\.trySweptKeeperDive\(previousBall\)/);
 assert.match(engine,/this\.tryBreakthroughKeeper\(previousBall\)/);
 assert.match(engine,/this\.wind\.y\*dt\*\.24/);
});
