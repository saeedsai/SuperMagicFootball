'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const model=import('../src/modules/magic-hazards.js');
const field={x:0,y:0,w:1000,h:600},carrier={t:0,x:300,y:300,dx:1,dy:0,face:1};
const rival={t:1,x:252,y:300,z:0,stun:0,keeper:false};
test('Ice Patch drops behind carrier, arms, chills grounded rival once',async()=>{
 const p=await model,ice=p.placeIcePatch([],carrier,field);
 assert.equal(ice.length,1);assert.equal(ice[0].kind,'ice');assert.equal(ice[0].team,0);
 assert.equal(ice[0].x,252);assert.equal(ice[0].arm,p.ICE_ARM_TIME);
 const unarmed=p.advanceIcePatches(ice,[rival],.1);
 assert.equal(unarmed.slips.length,0);
 const armed=p.advanceIcePatches(unarmed.hazards,[rival],.2);
 assert.equal(armed.slips.length,1);assert.equal(armed.hazards.length,0);
 assert.equal(p.advanceIcePatches(armed.hazards,[rival],.1).slips.length,0);
});
test('Ice Patch protects teammates, keeper, airborne and stunned players',async()=>{
 const p=await model,ice=p.placeIcePatch([],carrier,field);
 for(const player of [{...rival,t:0},{...rival,keeper:true},{...rival,z:25},{...rival,stun:.1}]){
  const r=p.advanceIcePatches(ice,[player],.4);
  assert.equal(r.slips.length,0);assert.equal(r.hazards.length,1);
 }
});
test('Ice Patch expires, caps count, rejects negative time and preserves banana traps',async()=>{
 const p=await model;let active=p.placeBananaPeel([],carrier,field);
 for(let i=0;i<15;i++)active=p.placeIcePatch(active,{...carrier,x:300+i},field);
 assert.equal(active.filter(h=>h.kind==='ice').length,p.MAX_ICE_PATCHES);
 assert.equal(active.filter(h=>h.kind==='banana').length,1);
 assert.equal(p.advanceIcePatches(active,[],3).hazards.length,0);
 assert.throws(()=>p.advanceIcePatches(active,[],-.1),TypeError);
});
test('Ice Patch is wired into runtime and painted independently',()=>{
 const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 const render=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
 assert.match(engine,/this\.magicHazards=placeIcePatch\(this\.magicHazards,p,F\)/);
 assert.match(engine,/const ice=advanceIcePatches\(this\.magicHazards,this\.players,dt\)/);
 assert.match(engine,/this\.magicHazards=\[\.\.\.next\.hazards,\.\.\.ice\.hazards\]/);
 assert.match(render,/function drawIcePatches\(ctx,hazards\)/);
 assert.match(render,/drawIcePatches\(ctx,game\.magicHazards\)/);
});

test('Banana and Ice hazards coexist when alternating placements and trimming capacity',async()=>{
 const p=await model;
 let active=[];
 for(let i=0;i<15;i++){
  active=p.placeIcePatch(active,{...carrier,x:300+i},field);
  active=p.placeBananaPeel(active,{...carrier,x:400+i},field);
 }
 assert.equal(active.filter(h=>h.kind==='ice').length,p.MAX_ICE_PATCHES);
 assert.equal(active.filter(h=>h.kind==='banana').length,p.MAX_BANANA_PEELS);
 const bananaCount=active.filter(h=>h.kind==='banana').length;
 active=p.placeIcePatch(active,carrier,field);
 assert.equal(active.filter(h=>h.kind==='banana').length,bananaCount);
 const iceCount=active.filter(h=>h.kind==='ice').length;
 active=p.placeBananaPeel(active,carrier,field);
 assert.equal(active.filter(h=>h.kind==='ice').length,iceCount);
});
test('Ice and Banana aging never consumes the other hazard type',async()=>{
 const p=await model;
 let active=p.placeBananaPeel([],carrier,field);
 active=p.placeIcePatch(active,carrier,field);
 const banana=p.advanceBananaPeels(active,[],.1);
 const ice=p.advanceIcePatches(active,[],.1);
 assert.equal(banana.hazards.length,1);
 assert.equal(ice.hazards.length,1);
 assert.equal(banana.hazards[0].kind,'banana');
 assert.equal(ice.hazards[0].kind,'ice');
});
