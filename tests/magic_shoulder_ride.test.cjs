'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const vm=require('node:vm');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
const input=fs.readFileSync(path.join(root,'src/modules/input.js'),'utf8');
const F={x:0,y:0,w:1200,h:700};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m}};
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const stat=(p,key)=>p?.src?.[key]??50;

function method(name,nextMarker){
 const at=engine.indexOf(` ${name}(`);
 assert.ok(at>=0,`find ${name}`);
 const end=engine.indexOf(nextMarker,at);
 assert.ok(end>at,`find end of ${name}`);
 const close=engine.lastIndexOf('\n }',end);
 assert.ok(close>at,`find closing brace of ${name}`);
 return engine.slice(at,close+3).trim();
}
const trick=method('tryMagicTrick','\n updateSpinBumpFx(');
const begin=method('beginRideBall','\n cancelRideBall(');
const cancel=method('cancelRideBall','\n advanceRideBall(');
const advance=method('advanceRideBall','\n // Consume a Banana Peel');
const updateBallStart=engine.indexOf(' updateBall(dt){');
const updateBallEnd=engine.indexOf('\n burst(',updateBallStart);
assert.ok(updateBallStart>=0&&updateBallEnd>updateBallStart);
const updateBall=engine.slice(updateBallStart,updateBallEnd).trim();
const methods=vm.runInNewContext(`({${trick},${begin},${cancel},${advance},${updateBall}})`,{
 distance,norm,clamp,stat,F,WORLD:{goalTop:180,goalBottom:520},
 placeBananaPeel:items=>items,placeIcePatch:items=>items,rollDelta:()=>0,
});

function setup({side=0,x=600,y=330,teammateDistance=28}={}){
 const dir=side===0?1:-1,dy=side===0?.28:-.28;
 const carrier={t:side,i:2,x,y,dx:dir,dy,face:dir,z:0,stun:0,fatigue:0,keeper:false,
  src:{id:'carrier',name:'Carrier',magicTrick:'shoulderRide',dribbling:70,defence:30}};
 const passenger={t:side,i:3,x:x+dir*teammateDistance,y:y+6,dx:0,dy:0,face:dir,z:0,stun:0,keeper:false,
  src:{id:'mate',name:'Teammate',dribbling:60}};
 const rival={t:1-side,i:2,x:1100,y:650,dx:0,dy:0,face:-dir,z:0,stun:0,keeper:false,
  src:{id:'rival',name:'Rival',defence:20}};
 const events=[];
 const game={players:[carrier,passenger,rival],ball:{owner:carrier,x:0,y:0,z:0,vx:0,vy:0,vz:0},
  clock:1,fatigueLedger:[{},{}],magicHazards:[],rideBall:null,events,
  burst:()=>{},emit:(type,data)=>events.push({type,...data}),...methods};
 return {game,carrier,passenger,rival,events};
}

test('TR17 requires a nearby outfield teammate and does not charge a failed attempt',()=>{
 const noMate=setup({teammateDistance:100});
 assert.equal(noMate.game.tryMagicTrick(noMate.carrier),false);
 assert.equal(noMate.carrier.magicReadyAt,undefined);
 assert.equal(noMate.carrier.fatigue,0);
 const keeperMate=setup();keeperMate.passenger.keeper=true;
 assert.equal(keeperMate.game.tryMagicTrick(keeperMate.carrier),false);
});

test('TR17 mirrors the short ride and keeps ball and teammate aligned in both directions',()=>{
 for(const side of [0,1]){
  const {game,carrier,passenger}=setup({side});
  const start={x:carrier.x,y:carrier.y};
  assert.equal(game.tryMagicTrick(carrier),true);
  assert.equal(carrier.action,'rideBallCarrier');
  assert.equal(passenger.action,'rideBallPassenger');
  assert.equal(passenger.rideVisualZ,48);
  assert.equal(game.advanceRideBall(.36),true);
  const direction=side===0?1:-1;
  assert.equal(Math.sign(carrier.x-start.x),direction);
  assert.ok(Math.abs(passenger.x-carrier.x)<=8);
  assert.ok(Math.abs(passenger.y-carrier.y)<=8);
  game.updateBall(.016);
  assert.equal(game.ball.x,carrier.x+carrier.face*17);
  assert.equal(game.ball.y,carrier.y+12);
 }
});

test('TR17 cancels on opponent contact, loss of possession, boundary, and timer expiry',()=>{
 {
  const {game,carrier,rival,events}=setup();
  game.tryMagicTrick(carrier);
  rival.x=carrier.x+59;rival.y=carrier.y+8;
  assert.equal(game.advanceRideBall(.30),true);
  assert.equal(game.rideBall,null);
  assert.equal(events.at(-1).reason,'contact');
 }
 {
  const {game,carrier,passenger,events}=setup();
  game.tryMagicTrick(carrier);game.ball.owner=passenger;
  assert.equal(game.advanceRideBall(.1),true);
  assert.equal(events.at(-1).reason,'possession');
 }
 {
  const {game,carrier,events}=setup({x:1148});
  game.tryMagicTrick(carrier);
  assert.equal(game.advanceRideBall(.72),true);
  assert.equal(events.at(-1).reason,'boundary');
  assert.ok(carrier.x<=F.x+F.w-22);
 }
 {
  const {game,carrier,events}=setup();
  game.tryMagicTrick(carrier);
  assert.equal(game.advanceRideBall(.73),true);
  assert.equal(game.rideBall,null);
  assert.equal(events.at(-1).reason,'complete');
 }
});

test('TR17 keeps the caster cost on a defender counter and exposes the move through Studio/rendering',()=>{
 const {game,carrier,rival,events}=setup();
 rival.x=carrier.x+60;rival.y=carrier.y;rival.face=-carrier.face;rival.dx=-carrier.face;rival.src.defence=95;
 assert.equal(game.tryMagicTrick(carrier),true);
 assert.equal(game.rideBall,null);
 assert.equal(carrier.magicReadyAt,7);
 assert.equal(carrier.fatigue,.035);
 assert.equal(game.fatigueLedger[carrier.t].carrier,.035);
 assert.equal(events.find(e=>e.type==='magicTrick').countered,true);
 assert.match(ui,/id:'shoulderRide',name:'Shoulder Ride'/);
 assert.match(ui,/SHOULDER RIDE/i);
 assert.match(ui,/REACH STAR OR SUPERSTAR|Star or Superstar/);
 assert.match(render,/SHOULDER RIDE!/);
 assert.match(render,/rideVisualZ/);
 assert.match(engine,/hold DRIBBLE for one second/i);
});

function inertInput(){return{state:[{},{}],pulse:{},poll(){},just(){return false;},held(){return false;},axis(){return{x:0,y:0};},reset(){}};}
async function liveRuntime(){
 const previousFetch=globalThis.fetch;
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fsp.readFile(new URL(url),'utf8'))});
 try{
  const {loadAssets}=await import('../src/assets.js');await loadAssets();
  const [{ENGINE},{DATA}]=await Promise.all([import('../src/modules/engine.js'),import('../src/modules/data.js')]);
  return{ENGINE,DATA,restore(){if(previousFetch===undefined)delete globalThis.fetch;else globalThis.fetch=previousFetch;}};
 }catch(error){if(previousFetch===undefined)delete globalThis.fetch;else globalThis.fetch=previousFetch;throw error;}
}

test('TR17 real engine CPU pursuit cancels Shoulder Ride on both sides at 30/60/120Hz',async()=>{
 const {ENGINE,DATA,restore}=await liveRuntime();
 try{
  for(const side of [0,1])for(const fps of [30,60,120]){
   const options={...DATA.DEFAULT_OPTIONS,weather:'Clear',difficulty:3};
   const game=new ENGINE.GameEngine(options,inertInput());
   game.init({home:0,away:9,options,humans:0});game.matchState='play';game.cooldown=0;game.clock=5;
   const carrier=game.player(side,3),passenger=game.player(side,4),cpu=game.player(1-side,3);
   const forward=side===0?1:-1;
   for(const q of game.players){
    if([carrier,passenger,cpu].includes(q))continue;
    q.stun=5;q.moveVX=q.moveVY=0;
   }
   Object.assign(carrier,{x:1200,y:765,dx:forward,dy:0,face:forward,stun:0,fatigue:0,breath:100,magicReadyAt:0});
   Object.assign(passenger,{x:1200+forward*26,y:771,dx:0,dy:0,stun:0});
   Object.assign(cpu,{x:1200+forward*160,y:765,dx:-forward,dy:0,face:-forward,stun:0,z:0,cd:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null});
   carrier.src={...carrier.src,magicTrick:'shoulderRide'};game.take(carrier);
   assert.equal(game.tryMagicTrick(carrier),true,`start side ${side}`);
   const cost={ready:carrier.magicReadyAt,fatigue:carrier.fatigue};
   for(let frame=0;frame<fps&&game.rideBall;frame++)game.update(1/fps);
   const ended=game.events.findLast(event=>event.type==='rideBallEnd');
   assert.equal(game.rideBall,null,`ride ends side ${side} ${fps}Hz`);
   assert.ok(['contact','possession'].includes(ended?.reason),`CPU pursuit counters the ride before expiry: side ${side} ${fps}Hz; ${JSON.stringify({ended,cpu:{x:cpu.x,action:cpu.action},carrier:{x:carrier.x},elapsed:ended&&game.clock-5})}`);
   if(ended.reason==='possession')assert.notEqual(game.ball.owner,carrier,'CPU pressure breaks the ride possession state');
   assert.equal(cost.ready,11,'six-second trick cooldown remains paid after counter');
   assert.ok(Math.abs(cost.fatigue-.035)<1e-8,'caster retains the documented fatigue cost');
   assert.equal(carrier.rideBallState,undefined);assert.equal(passenger.rideBallState,undefined);
  }
  assert.match(input,/REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
 }finally{restore();}
});
