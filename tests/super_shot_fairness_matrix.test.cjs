'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const CATALOG=JSON.parse(fs.readFileSync(path.join(ROOT,'data/mechanics/gameplay.json'),'utf8')).shotTypes;
let runtimePromise;
function runtime(){
 if(!runtimePromise){
  globalThis.window={addEventListener(){}};
  globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
  let bundle=fs.readFileSync(path.join(__dirname,'.generated/game.js'),'utf8');
  const ui=bundle.indexOf('// Supermagic Football v0.8.25.30 | UI |');
  if(ui>=0)bundle=bundle.slice(0,ui);
  bundle+='\nexport {ENGINE,INPUT,DATA,SPECIALS};';
  runtimePromise=import('data:text/javascript;base64,'+Buffer.from(bundle).toString('base64'));
 }
 return runtimePromise;
}
async function launch(id,attackingTeam,fps,{offset=0,keeper=false,level=2,distance=520}={}){
 const {ENGINE,INPUT,DATA,SPECIALS}=await runtime(),options={...DATA.DEFAULT_OPTIONS,weather:'Clear',terrain:'Grass',condition:'Good'};
 const game=new ENGINE.GameEngine(options,new INPUT.Input());
 game.init({home:0,away:9,humans:2,options});
 const field=ENGINE.WORLD.field,center=(ENGINE.WORLD.goalTop+ENGINE.WORLD.goalBottom)/2;
 const direction=attackingTeam===0?1:-1,goalX=direction>0?field.x+field.w:field.x;
 const aimY=center+offset,startX=goalX-direction*distance,spec=CATALOG[id];
 const relativeLevelSpeed=SPECIALS.shotVelocityModifier(id,level)/SPECIALS.shotVelocityModifier(id,2);
 game.events=[];game.score=[0,0];game.wind={x:0,y:0};
 if(keeper){
  const goalie=game.player(1-attackingTeam,0);
  goalie.x=goalX-direction*70;goalie.y=center;goalie.stun=0;goalie.diveCooldown=0;
  goalie.diveIntentCooldown=0;goalie.fatigue=0;game.players=[goalie];
 }else game.players=[];
 game.ball={...game.ball,x:startX,y:aimY,z:0,vx:direction*1250*spec.speed*relativeLevelSpeed,vy:0,vz:0,owner:null,
  shot:{...spec,id,level,direction,aimY,homingOffset:0,transformSeconds:1.65},
  strike:keeper?{kind:'super',energy:200,hits:0,originX:startX-direction*100,originY:aimY}:null,
  attacker:attackingTeam,lastTouchTeam:attackingTeam,trail:[],age:0,power:keeper?200:0,
  canCollect:0,targetY:aimY,pass:false,ordinaryShot:false};
 const oldRandom=Math.random;
 try{
  if(keeper)Math.random=()=>.999999; // fix the one-shot automatic GK special roll for repeatable saves
  for(let i=0;i<fps*4;i++){
   game.updateBall(1/fps);
   if(game.events.some(event=>event.type==='goal'||event.type==='save'))break;
   // A non-goal end-line impact clamps and reverses at six units inside the edge.
   // Allow a valid mouth crossing to advance one more step into score adjudication.
   const outsideGoal=game.ball.y<=ENGINE.WORLD.goalTop||game.ball.y>=ENGINE.WORLD.goalBottom||game.ball.z>=125;
   if(!keeper&&outsideGoal&&(game.ball.x<=field.x+8||game.ball.x>=field.x+field.w-8))break;
  }
 }finally{Math.random=oldRandom;}
 const outcome=game.events.some(event=>event.type==='goal')?'goal':
  game.events.some(event=>event.type==='save')?'save':'miss';
 return {outcome,score:game.score[attackingTeam],events:game.events.map(event=>event.type)};
}

test('all 32 Super Shots keep centered accuracy, mirrored lanes, and frame-rate outcomes',async()=>{
 const counts={};
 for(const id of Object.keys(CATALOG))for(const team of [0,1])for(const offset of [-100,0,100]){
  const outcomes=[];
  for(const fps of [30,60,120]){
   const result=await launch(id,team,fps,{offset});
   if(offset===0)assert.equal(result.outcome,'goal',`${id}, team ${team}, center lane, ${fps} Hz`);
   outcomes.push(result.outcome);
   counts[`${id}:${team}:${offset}:${fps}`]=result.outcome;
  }
  assert.equal(new Set(outcomes).size,1,`${id}, team ${team}, lane ${offset}: frame-rate result parity ${outcomes}`);
 }
 for(const id of Object.keys(CATALOG))for(const offset of [-100,0,100])for(const fps of [30,60,120])
  assert.equal(counts[`${id}:0:${offset}:${fps}`],counts[`${id}:1:${offset}:${fps}`],`${id}, lane ${offset}: mirrored-team result parity`);
 assert.equal(Object.keys(counts).length,32*2*3*3);
});

test('all 32 Super Shots preserve upper/lower goal-mouth misses across teams and frame rates',async()=>{
 let checked=0;
 for(const id of Object.keys(CATALOG))for(const team of [0,1])for(const offset of [-210,210]){
  const outcomes=[];
  for(const fps of [30,60,120]){
   const result=await launch(id,team,fps,{offset});
   assert.equal(result.outcome,'miss',`${id}, team ${team}, lane ${offset}, ${fps} Hz`);
   assert.equal(result.score,0);
   outcomes.push(result.outcome);checked++;
  }
  assert.equal(new Set(outcomes).size,1,`${id}, team ${team}, miss lane ${offset}: frame-rate result parity`);
 }
 assert.equal(checked,32*2*2*3);
});

test('a fixed centered keeper resolves all transformed Super Shots symmetrically and consistently',async()=>{
 let saves=0;
 for(const id of Object.keys(CATALOG))for(const team of [0,1]){
  const outcomes=[];
  for(const fps of [30,60,120]){
   const result=await launch(id,team,fps,{keeper:true});
   assert.equal(result.outcome,'save',`${id}, team ${team}, ${fps} Hz`);
   assert.ok(result.events.includes('keeperContact'),`${id}, team ${team}, ${fps} Hz: contact was resolved`);
   assert.equal(result.score,0);
   outcomes.push(result.outcome);saves++;
  }
  assert.equal(new Set(outcomes).size,1,`${id}, team ${team}: frame-rate result parity`);
 }
 assert.equal(saves,32*2*3);
});

test('all 32 Super Shots keep mirrored and frame-rate outcomes at level extremes and near/far launch points',async()=>{
 let checked=0;
 for(const id of Object.keys(CATALOG))for(const level of [1,5])for(const distance of [420,620])for(const team of [0,1]){
  const outcomes=[];
  for(const fps of [30,60,120]){
   const result=await launch(id,team,fps,{level,distance});
   outcomes.push(result.outcome);checked++;
  }
  assert.equal(new Set(outcomes).size,1,`${id}, level ${level}, launch ${distance}, team ${team}: frame-rate parity ${outcomes}`);
  const mirror=await launch(id,1-team,60,{level,distance});checked++;
  assert.equal(outcomes[1],mirror.outcome,`${id}, level ${level}, launch ${distance}: mirrored-team parity`);
 }
 assert.equal(checked,32*2*2*2*4);
});
