'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const mechanics=JSON.parse(fs.readFileSync(path.join(__dirname,'../data/mechanics/gameplay.json'),'utf8'));
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8').replace(/\r\n/g,'\n');
const render=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
function extract(name,next){const at=engine.indexOf(` ${name}(`);assert.ok(at>=0,name);const end=engine.indexOf(next,at);assert.ok(end>at,next);const close=engine.lastIndexOf('\n }',end);assert.ok(close>at,name+' end');return engine.slice(at,close+3).trim();}
const tryMagic=extract('tryMagicTrick','\n updateSpinBumpFx(');
const updateAt=engine.indexOf('updateTeleportTrail(p,dt){'),updateEnd=engine.indexOf('\n  }',updateAt)+4;
assert.ok(updateAt>=0&&updateEnd>updateAt,'updateTeleportTrail end');
const updateTrail=engine.slice(updateAt,updateEnd).trim();
const stat=(p,k)=>p?.src?.[k]??50,distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m};},clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const F=mechanics.world.field;
const methods=Function('stat','distance','norm','clamp','F','placeBananaPeel','placeIcePatch',`return ({${tryMagic},${updateTrail}})`)(stat,distance,norm,clamp,F,()=>[],()=>[]);
function setup({trick='teleport',x=500,y=350,defender={}}={}){
 const carrier={t:0,x,y,dx:1,dy:0,face:1,z:0,stun:0,keeper:false,fatigue:.1,magicReadyAt:0,teleportTrail:null,src:{id:'caster',name:'Caster',magicTrick:trick,dribbling:85}};
 const rival={t:1,x:1000,y:600,dx:0,dy:0,face:-1,z:0,stun:0,keeper:false,action:'idle',actionTimer:0,src:{id:'defender',name:'Defender',defence:35},...defender};
 const events=[],game={...methods,clock:4,ball:{owner:carrier},players:[carrier,rival],fatigueLedger:[{},{}],magicHazards:[],events,burst(){},emit(type,data){events.push({type,...data})}};
 return {game,carrier,rival,events};
}
test('TR18 successful Teleport stores only bounded visual origin and destination while preserving move and costs',()=>{
 const {game,carrier,events}=setup();
 assert.equal(game.tryMagicTrick(carrier),true);assert.equal(carrier.x,585);assert.equal(carrier.y,350);
 assert.deepEqual(carrier.teleportTrail,{fromX:500,fromY:350,toX:585,toY:350,remaining:.42,duration:.42});
 assert.equal(carrier.magicReadyAt,10);assert.equal(carrier.fatigue,.135);assert.equal(game.ball.owner,carrier);
 assert.equal(events.find(e=>e.type==='magicTrick').countered,false);
});
test('TR18 retains pitch clamps and a grounded forward slide counter creates no trail',()=>{
 const edge=setup({x:F.x+F.w-24});assert.equal(edge.game.tryMagicTrick(edge.carrier),true);
 assert.equal(edge.carrier.x,F.x+F.w-23);assert.equal(edge.carrier.teleportTrail,null);
 const blocked=setup({x:500,defender:{x:550,y:350,action:'slide',actionTimer:.3,z:0,face:-1}});
 assert.equal(blocked.game.tryMagicTrick(blocked.carrier),true);assert.equal(blocked.carrier.x,500);
 assert.equal(blocked.carrier.teleportTrail,null);assert.equal(blocked.events.find(e=>e.type==='magicTrick').countered,true);
 assert.equal(blocked.carrier.magicReadyAt,10);assert.equal(blocked.carrier.fatigue,.135);
});
for(const fps of [30,60,120])test(`TR18 trail expires deterministically at ${fps} Hz`,()=>{
 const {game,carrier}=setup();game.tryMagicTrick(carrier);let elapsed=0;
 while(carrier.teleportTrail&&elapsed<.6){game.updateTeleportTrail(carrier,1/fps);elapsed+=1/fps;}
 assert.equal(carrier.teleportTrail,null);assert.ok(Math.abs(elapsed-Math.ceil(.42*fps-1e-9)/fps)<1e-9);
});
test('TR18 unrelated Tricks cannot inherit a Teleport trail',()=>{
 const {game,carrier}=setup();game.tryMagicTrick(carrier);assert.ok(carrier.teleportTrail);
 carrier.magicReadyAt=0;carrier.src.magicTrick='banana';game.tryMagicTrick(carrier);
 assert.equal(carrier.teleportTrail,null);assert.ok(game.magicHazards.length>=0);
});
test('TR18 renderer validates bounds and uses a time-steady reduced-flash cue',()=>{
 assert.match(render,/drawTeleportTrail\(ctx,p\.teleportTrail/);
 assert.match(render,/drawTeleportTrail\(ctx,trail,reducedFlash=false\)/);
 assert.match(render,/length<1\|\|length>120/);
 assert.match(render,/reducedFlash\?\[\]:\[9,7\]/);
 assert.match(render,/const marker=reducedFlash \? \.5 : progress/);
});
