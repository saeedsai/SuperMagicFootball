'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const modulePromise=import('../src/modules/magic-hazards.js');
const field={x:0,y:0,w:1000,h:600};
const carrier={t:0,x:300,y:300,dx:1,dy:0,face:1};
const rival={t:1,x:258,y:300,z:0,stun:0,keeper:false};

test('banana peel spawns behind carrier and remains inside pitch',async()=>{
 const {placeBananaPeel,BANANA_LIFETIME,BANANA_ARM_TIME}=await modulePromise;
 const peel=placeBananaPeel([],carrier,field)[0];
 assert.equal(peel.kind,'banana');
 assert.equal(peel.team,0);
 assert.equal(peel.x,258);
 assert.equal(peel.y,300);
 assert.equal(peel.life,BANANA_LIFETIME);
 assert.equal(peel.arm,BANANA_ARM_TIME);
 const edge=placeBananaPeel([],{...carrier,x:2,y:2},field)[0];
 assert.ok(edge.x>=25&&edge.y>=25);
 const vertical=placeBananaPeel([],{...carrier,dx:0,dy:-1},field)[0];
 assert.equal(vertical.x,300);
 assert.equal(vertical.y,342);
});
test('banana peel arms before an opponent can slip',async()=>{
 const {placeBananaPeel,advanceBananaPeels}=await modulePromise;
 const first=placeBananaPeel([],carrier,field);
 const unarmed=advanceBananaPeels(first,[rival],.1);
 assert.equal(unarmed.slips.length,0);
 assert.equal(unarmed.hazards.length,1);
 const armed=advanceBananaPeels(unarmed.hazards,[rival],.15);
 assert.equal(armed.slips.length,1);
 assert.equal(armed.slips[0],rival);
 assert.equal(armed.hazards.length,0);
});
test('banana peel never affects allies, keepers, airborne or already stunned opponents',async()=>{
 const {placeBananaPeel,advanceBananaPeels}=await modulePromise;
 const peel=placeBananaPeel([],carrier,field);
 for(const player of [{...rival,t:0},{...rival,keeper:true},{...rival,z:25},{...rival,stun:.2}]){
  const result=advanceBananaPeels(peel,[player],.3);
  assert.equal(result.slips.length,0);
  assert.equal(result.hazards.length,1);
 }
});
test('banana peel expires, is consumed once and has bounded capacity',async()=>{
 const {placeBananaPeel,advanceBananaPeels,MAX_BANANA_PEELS}=await modulePromise;
 let peels=[];
 for(let i=0;i<15;i++)peels=placeBananaPeel(peels,{...carrier,x:300+i},field);
 assert.equal(peels.length,MAX_BANANA_PEELS);
 assert.equal(advanceBananaPeels(peels,[],3).hazards.length,0);
 const one=placeBananaPeel([],carrier,field);
 const hit=advanceBananaPeels(one,[rival],.3);
 assert.equal(hit.slips.length,1);
 assert.equal(advanceBananaPeels(hit.hazards,[rival],.3).slips.length,0);
});
test('two overlapping peels stun one rival once and preserve the unused peel',async()=>{
 const {placeBananaPeel,advanceBananaPeels}=await modulePromise;
 const peel=placeBananaPeel([],carrier,field);
 const hit=advanceBananaPeels([...peel,...peel],[rival],.3);
 assert.deepEqual(hit.slips,[rival]);
 assert.equal(hit.hazards.length,1,'unused peel remains armed for a different opponent');
 const other={...rival};
 const followup=advanceBananaPeels(hit.hazards,[{...rival,stun:.65},other],.1);
 assert.deepEqual(followup.slips,[other]);
 assert.equal(followup.hazards.length,0);
});
test('invalid ticks cannot extend or rewind hazard lifetime',async()=>{
 const {advanceBananaPeels}=await modulePromise;
 assert.throws(()=>advanceBananaPeels([],[],-.1),TypeError);
 assert.throws(()=>advanceBananaPeels([],[],NaN),TypeError);
});
test('engine uses the hazard model before ball physics and drops possession on slip',()=>{
 const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
 assert.match(engine,/this\.magicHazards=placeBananaPeel\(this\.magicHazards,p,F\)/);
 assert.match(engine,/this\.resolvePlayerContacts\(dt\);this\.updateMagicHazards\(dt\);this\.updateBall\(dt\)/);
 assert.match(engine,/const next=advanceBananaPeels\(this\.magicHazards,this\.players,dt\)/);
 assert.match(engine,/if\(this\.ball\.owner===victim\)\{\s*this\.ball\.owner=null/);
 assert.match(engine,/resetKickoff\(which=0\)\{this\._closeShotAudits\('kickoffReset'\);this\.magicHazards=\[\]/);
});
test('pitch renderer paints hazards without new assets or controls',()=>{
 const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
 assert.match(render,/function drawBananaPeels\(ctx,hazards\)/);
 assert.match(render,/drawBananaPeels\(ctx,game\.magicHazards\)/);
});
