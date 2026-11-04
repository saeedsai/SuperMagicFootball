'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {fileURLToPath}=require('node:url');

let EngineApisPromise;
async function engineApis(){
 if(!EngineApisPromise)EngineApisPromise=(async()=>{
  const previousFetch=globalThis.fetch;
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(fileURLToPath(url),'utf8'))});
  try{
   const assets=await import('../src/assets.js');
   await assets.loadAssets();
   const [{ENGINE},{DATA}]=await Promise.all([
    import('../src/modules/engine.js'),import('../src/modules/data.js'),
   ]);
   return {ENGINE,DATA};
  }finally{
   if(previousFetch===undefined)delete globalThis.fetch;
   else globalThis.fetch=previousFetch;
  }
 })();
 return EngineApisPromise;
}

class InputStub{
 constructor(){this.state=[{},{}];}
 poll(){}
 just(){return false}
 held(){return false}
 released(){return false}
 tapDuration(){return 0}
 canceled(){return false}
}

function countInBounds(point,field){
 return Number.isFinite(point.x)&&Number.isFinite(point.y)&&
  point.x>=field.x+23-1e-8&&point.x<=field.x+field.w-23+1e-8&&
  point.y>=field.y+24-1e-8&&point.y<=field.y+field.h-24+1e-8;
}

async function setup(ENGINE,DATA,{team,x,y,dx,dy,face}){
 const input=new InputStub();
 const game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},input);
 game.init({home:0,away:9,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
 const caster=game.player(team,3);
 caster.src={...caster.src,magicTrick:'teleport'};
 Object.assign(caster,{x,y,dx,dy,face,stun:0,z:0,keeper:false,fatigue:.2,magicReadyAt:0});
 for(const p of game.players){
  if(p===caster)continue;
  p.x=ENGINE.WORLD.field.x+ENGINE.WORLD.field.w/2;
  p.y=ENGINE.WORLD.field.y+ENGINE.WORLD.field.h/2;
  p.dx=p.dy=0;p.stun=0;p.invuln=0;p.z=0;p.action='idle';p.actionTimer=0;
 }
 game.ball.owner=caster;
 game.ball.x=caster.x;game.ball.y=caster.y;game.clock=4;
 return {game,caster,input};
}

test('real Teleport stays finite, in-bounds and displacement-capped at every pitch edge for both teams',async()=>{
 const {ENGINE,DATA}=await engineApis();
 const field=ENGINE.WORLD.field;
 const centerX=field.x+field.w/2,centerY=field.y+field.h/2;
 for(const team of [0,1]){
  const horizontal=team===0?1:-1;
  const vectors=[
   {edge:'left goal end',x:field.x+29,y:centerY,dx:0,dy:0,face:-1},
   {edge:'right goal end',x:field.x+field.w-29,y:centerY,dx:0,dy:0,face:1},
   {edge:'top touchline',x:centerX,y:field.y+30,dx:horizontal*.7071067811865476,dy:-.7071067811865476,face:horizontal},
   {edge:'bottom touchline',x:centerX,y:field.y+field.h-30,dx:-horizontal*.7071067811865476,dy:.7071067811865476,face:-horizontal},
  ];
  for(const scenario of vectors){
  const {game,caster}=await setup(ENGINE,DATA,{team,...scenario});
  const origin={x:caster.x,y:caster.y},initialFatigue=caster.fatigue;
  assert.equal(game.tryMagicTrick(caster),true,`${team}/${scenario.edge} cast should resolve`);
  const displacement=Math.hypot(caster.x-origin.x,caster.y-origin.y);
  assert.ok(countInBounds(caster,field),`team ${team} ${scenario.edge}: ${JSON.stringify(caster)}`);
  assert.ok(displacement>0&&displacement<=85+1e-8,
   `team ${team} ${scenario.edge}: moved ${displacement} units`);
  assert.equal(game.ball.owner,caster,`team ${team} ${scenario.edge}: teleport retains possession`);
  assert.equal(caster.magicReadyAt,game.clock+6);
  assert.equal(caster.fatigue,initialFatigue+.035);
  const result=game.events.filter(event=>event.type==='magicTrick').at(-1);
  assert.equal(result?.trick,'teleport');assert.equal(result?.countered,false);
  }
 }
});

test('noneligible Teleport casts do not move the player or consume cooldown or fatigue',async()=>{
 const {ENGINE,DATA}=await engineApis();
 const field=ENGINE.WORLD.field;
 const initial={team:0,x:field.x+field.w/2,y:field.y+field.h/2,dx:1,dy:0,face:1};
 const cases=[
  {name:'no possession',apply:({game})=>{game.ball.owner=null}},
  {name:'cooldown active',apply:({game,caster})=>{caster.magicReadyAt=game.clock+1}},
  {name:'stunned',apply:({caster})=>{caster.stun=.2}},
  {name:'goalkeeper',apply:({caster})=>{caster.keeper=true}},
 ];
 for(const scenario of cases){
  const context=await setup(ENGINE,DATA,initial);
  scenario.apply(context);
  const {game,caster}=context;
  const origin={x:caster.x,y:caster.y},readyAt=caster.magicReadyAt,fatigue=caster.fatigue;
  assert.equal(game.tryMagicTrick(caster),false,scenario.name);
  assert.deepEqual({x:caster.x,y:caster.y},origin,`${scenario.name}: no movement`);
  assert.equal(caster.magicReadyAt,readyAt,`${scenario.name}: readiness unchanged`);
  assert.equal(caster.fatigue,fatigue,`${scenario.name}: fatigue unchanged`);
  assert.equal(game.events.some(event=>event.type==='magicTrick'),false,`${scenario.name}: no cast event`);
 }
});
