'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const helperSource=fs.readFileSync(path.join(root,'src/modules/shotpaths.js'),'utf8');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
const config=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const helper=import('data:text/javascript;base64,'+Buffer.from(helperSource).toString('base64'));
test('Nuts and Horse retain their existing ricochet identities and bounded bank tuning',()=>{
 for(const id of ['nuts','horse'])assert.equal(config.shotTypes[id].behavior,'ricochet');
 assert.equal(config.shotTypes.nuts.speed,1.18);assert.equal(config.shotTypes.horse.speed,1.3);
});
test('a ricochet may bank twice, then exits special bank behavior',async()=>{
 const {SHOTPATHS}=await helper;
 assert.equal(SHOTPATHS.MAX_RICOCHET_BOUNCES,2);
 const first=SHOTPATHS.ricochetBounce(0,-1000);
 assert.deepEqual(first,{bounces:1,velocity:650,active:true,reflected:true});
 const second=SHOTPATHS.ricochetBounce(first.bounces,-1000,.72);
 assert.deepEqual(second,{bounces:2,velocity:720,active:false,reflected:true});
 assert.equal(SHOTPATHS.ricochetBounce(0,100,.65,-1).velocity,65,'top-edge correction points back toward the pitch');
 assert.equal(SHOTPATHS.ricochetBounce(0,-100,.65,1).velocity,-65,'bottom-edge correction points back toward the pitch');
 assert.equal(SHOTPATHS.ricochetBounce(0,100,.72,-1).velocity,72,'left end-line correction points back toward the pitch');
 assert.equal(SHOTPATHS.ricochetBounce(0,-100,.72,1).velocity,-72,'right end-line correction points back toward the pitch');
 assert.deepEqual(SHOTPATHS.ricochetBounce(second.bounces,-1000),{bounces:2,velocity:0,active:false,reflected:false});
 for(const bad of [NaN,Infinity,-Infinity])
  assert.deepEqual(SHOTPATHS.ricochetBounce(0,bad),{bounces:0,velocity:0,active:false,reflected:false});
 assert.deepEqual(SHOTPATHS.ricochetBounce(999,1000),{bounces:2,velocity:0,active:false,reflected:false});
});
test('keeper prediction and live top/bottom/end-line banks share the capped helper',()=>{
 assert.equal((engine.match(/SHOTPATHS\.ricochetBounce\(/g)||[]).length,5);
 assert.match(engine,/if\(shot\?\.behavior==='ricochet'\).*SHOTPATHS\.ricochetBounce\(/);
 assert.match(engine,/if\(b\.shot\?\.behavior==='ricochet'\).*SHOTPATHS\.ricochetBounce\(/);
 assert.match(engine,/ricochetBounce\(shot\.ricochetBounces,v\.vy,\.65,-1\)/);
 assert.match(engine,/ricochetBounce\(shot\.ricochetBounces,v\.vy,\.65,1\)/);
 assert.match(engine,/ricochetBounce\(b\.shot\.ricochetBounces,b\.vx,\.72,b\.x>F\.x\+F\.w\/2\?1:-1\)/);
 assert.doesNotMatch(engine,/Math\.sin\(v\.age\*17\).*420/);
 assert.doesNotMatch(engine,/Math\.sin\(b\.age\*17\).*420/);
 assert.match(engine,/this\.ball=\{x:MID,y:F\.y\+F\.h\*\.5,z:0,vx:0,vy:0,vz:0,owner:null,shot:null/);
});
test('ricochet shots keep using the visible recorded transformation trail',()=>{
 const drawBall=render.match(/drawBall\(ctx,game\)\{[\s\S]*?\n drawSoccerBall\(/)?.[0]||'';
 assert.match(drawBall,/if\(b\.trail\)\{for\(let i=0;i<b\.trail\.length;i\+\+\)/);
 assert.match(drawBall,/ellipse\(ctx,p\.x,p\.y-p\.z,underground\?2\+i\*\.12:4\+i\*\.55,underground\?1\.5\+i\*\.1:3\+i\*\.43,underground\?'#68dbe0':shot\.trail\)/);
});
