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
 assert.match(engine,/const ice=advanceIcePatches\(this\.magicHazards,this\.players,dt,next\.slips\)/);
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

test('defensive SHOOT slide sweeps nearby enemy Ice and Banana traps before triggering',async()=>{
 const p=await model;
 const slide={...rival,action:'slide',actionTimer:.3};
 let active=p.placeBananaPeel([],carrier,field);
 active=p.placeIcePatch(active,carrier,field);
 const result=p.disarmMagicHazards(active,[slide]);
 assert.equal(result.disarmed.length,2);
 assert.equal(result.hazards.length,0);
 assert.deepEqual(result.disarmed.map(e=>e.hazard.kind).sort(),['banana','ice']);
 assert.ok(result.disarmed.every(e=>e.player===slide));
 assert.equal(p.advanceBananaPeels(result.hazards,[slide],.4).slips.length,0);
 assert.equal(p.advanceIcePatches(result.hazards,[slide],.4).slips.length,0);
});
test('ground trap slide counter excludes allies, keepers, stunned, airborne, idle and distant players',async()=>{
 const p=await model,active=p.placeIcePatch([],carrier,field);
 const sliding={...rival,action:'slide',actionTimer:.3};
 for(const defender of [
  {...sliding,t:0},{...sliding,keeper:true},{...sliding,stun:.1},
  {...sliding,z:25},{...sliding,action:'idle'},{...sliding,actionTimer:0},
  {...sliding,x:800},{...sliding,x:NaN}
 ]){
  const result=p.disarmMagicHazards(active,[defender]);
  assert.equal(result.disarmed.length,0,JSON.stringify(defender));
  assert.equal(result.hazards.length,1,JSON.stringify(defender));
 }
 assert.throws(()=>p.disarmMagicHazards(null,[]),TypeError);
 assert.throws(()=>p.disarmMagicHazards([],null),TypeError);
});
test('trap slide counter is called before collision and emits visual feedback without new input',()=>{
 const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 const update=engine.slice(engine.indexOf(' updateMagicHazards(dt){'),engine.indexOf(' // v0.8.7:',engine.indexOf(' updateMagicHazards(dt){')));
 assert.match(engine,/import \{placeBananaPeel,advanceBananaPeels,placeIcePatch,advanceIcePatches,disarmMagicHazards\}/);
 assert.match(update,/const cleared=disarmMagicHazards\(this\.magicHazards,this\.players\)/);
 assert.match(update,/this\.emit\('magicHazardDisarmed'/);
 assert.ok(update.indexOf('disarmMagicHazards(')<update.indexOf('advanceBananaPeels('));
 assert.ok(update.indexOf('disarmMagicHazards(')<update.indexOf('advanceIcePatches('));
 assert.match(engine,/this\.resolvePlayerContacts\(dt\);this\.updateMagicHazards\(dt\);this\.updateBall\(dt\)/);
});

test('overlapping Banana Peels stun each grounded rival only once per physics tick',async()=>{
 const p=await model;
 const active=p.placeBananaPeel(p.placeBananaPeel([],carrier,field),carrier,field);
 const one=p.advanceBananaPeels(active,[rival],.4);
 assert.deepEqual(one.slips,[rival]);
 assert.equal(one.hazards.length,1,'unused overlapping peel must survive');
 const second={...rival};
 const two=p.advanceBananaPeels(active,[rival,second],.4);
 assert.deepEqual(two.slips,[rival,second],'separate rivals can each trigger a trap');
 assert.equal(two.hazards.length,0);
});
test('overlapping Ice Patches preserve unused trap and never double-chill a rival',async()=>{
 const p=await model;
 const active=p.placeIcePatch(p.placeIcePatch([],carrier,field),carrier,field);
 const one=p.advanceIcePatches(active,[rival],.4);
 assert.deepEqual(one.slips,[rival]);
 assert.equal(one.hazards.length,1,'second patch remains available');
 const second={...rival};
 const two=p.advanceIcePatches(active,[rival,second],.4);
 assert.deepEqual(two.slips,[rival,second]);
 assert.equal(two.hazards.length,0);
});
test('Banana priority preserves overlapping Ice Patch for a different opponent',async()=>{
 const p=await model;
 const active=p.placeIcePatch(p.placeBananaPeel([],carrier,field),carrier,field);
 const banana=p.advanceBananaPeels(active,[rival],.4);
 const ice=p.advanceIcePatches(active,[rival],.4,banana.slips);
 assert.deepEqual(banana.slips,[rival]);
 assert.deepEqual(ice.slips,[]);
 assert.equal(ice.hazards.length,1,'Ice Patch must not be consumed by an already-slipping rival');
 const other={...rival};
 const multi=p.advanceIcePatches(active,[rival,other],.4,banana.slips);
 assert.deepEqual(multi.slips,[other],'Ice Patch should instead affect a second grounded rival');
 assert.throws(()=>p.advanceIcePatches(active,[rival],.4,null),TypeError);
});
test('engine passes same-tick Banana victims to Ice model',()=>{
 const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 assert.match(engine,/const ice=advanceIcePatches\(this\.magicHazards,this\.players,dt,next\.slips\)/);
});
