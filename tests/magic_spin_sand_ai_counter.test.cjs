'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const aiData=mechanics.aiLevels,F=mechanics.world.field;
const start=engine.indexOf(' reactToSpinSandTrick(p,dt,reactionSeconds){');
const end=engine.indexOf('\n reactToScreamTrick(',start);
assert.ok(start>=0&&end>start,'extract the real Spin Bump/Sand Trap CPU response');
const react=vm.runInNewContext('({'+engine.slice(start,end)+'})',{distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)})
 .reactToSpinSandTrick;
const trickStart=engine.indexOf(' tryMagicTrick(p){'),trickEnd=engine.indexOf(' updateSpinBumpFx(p,dt){',trickStart);
assert.ok(trickStart>=0&&trickEnd>trickStart,'extract the real Magic Trick resolver');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return{x:x/m,y:y/m};};
const resolve=vm.runInNewContext('({'+engine.slice(trickStart,trickEnd)+'})',{
 F,clamp,norm,distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??50,
 STATS:{verifiedRatingTierForPlayer:p=>p?.statsVerified&&p.verifiedTier||null},
 placeBananaPeel:()=>[],placeIcePatch:()=>[],fieldAbility:()=>null,abilityLevel:()=>0,levelModifiers:()=>({})
}).tryMagicTrick;

function fixture(side,id='spinBump',distance=60){
 const carrier={t:1-side,x:F.x+F.w/2,y:F.y+F.h/2,keeper:false,stun:0,fatigue:0,face:side? -1:1,dx:side?-1:1,dy:0,
  dribbleHold:.35,src:{id:'carrier',name:'Carrier',magicTrick:id,dribbling:70,statsVerified:true,verifiedTier:'Gold'}};
 const target={t:side,x:carrier.x+(side?-distance:distance),y:carrier.y,keeper:false,stun:0,z:0,action:'idle',actionTimer:0,
  dx:0,dy:0,face:side?1:-1,src:{id:'cpu',name:'CPU',defence:40,strength:60}};
 const other={t:side,x:carrier.x+(side?-230:230),y:carrier.y+170,keeper:false,stun:0,z:0,action:'idle',actionTimer:0,src:{id:'other'}};
  const events=[],game={ball:{owner:carrier},players:[carrier,target,other],clock:2,magicHazards:[],fatigueLedger:[{},{}],events,
  jumps:0,jump(p){this.jumps++;p.z=22;p.action='jump';p.actionTimer=.5;return true;},
  burst(){},emit:(type,data)=>events.push({type,...data})};
 return{game,carrier,target,events};
}

test('CPU jumps Spin Bump and Sand Trap warnings across difficulty, teams and 30/60/120 Hz',()=>{
 for(const id of ['spinBump','sandTrap'])for(const side of [0,1])for(const fps of [30,60,120])for(let level=1;level<aiData.length;level++){
  const {game,carrier,target}=fixture(side,id),dt=1/fps,reaction=aiData[level].reaction;
  let elapsed=.35,jumpedAt=null;
  while(elapsed<1){elapsed=Math.min(1,elapsed+dt);carrier.dribbleHold=elapsed;
   react.call(game,target,dt,reaction);if(game.jumps){jumpedAt=elapsed;break;}}
  assert.ok(jumpedAt!==null&&jumpedAt<1,`${id}, ${aiData[level].name}, team ${side}, ${fps}Hz`);
  carrier.dribbleHold=1;
  assert.equal(resolve.call(game,carrier),true,`${id} still activates after countering`);
  assert.equal(target.stun,0,`${id} airborne JUMP counters the actual runtime effect`);
  assert.equal(game.events.at(-1).countered,true);
 }
});

test('only the nearest grounded in-range CPU responds; existing jumps/slides are respected',()=>{
 for(const id of ['spinBump','sandTrap'])for(const side of [0,1]){
  for(const options of [{distance:82},{distance:60,otherNear:true},{distance:60,trick:'freeze'}]){
   const state=fixture(side,id,options.distance);
   if(options.trick)state.carrier.src.magicTrick=options.trick;
   if(options.otherNear){state.game.players[2].x=state.target.x+(side?12:-12);state.game.players[2].y=state.target.y;}
   react.call(state.game,state.target,.02,.09);assert.equal(state.game.jumps,0,JSON.stringify(options));
  }
  const jumping=fixture(side,id);Object.assign(jumping.target,{z:22,action:'jump',actionTimer:.3});
  react.call(jumping.game,jumping.target,.02,.09);assert.equal(jumping.game.jumps,0);
  const sliding=fixture(side,id);Object.assign(sliding.target,{action:'slide',actionTimer:.3});
  react.call(sliding.game,sliding.target,.02,.09);assert.equal(sliding.game.jumps,0);assert.equal(sliding.target.actionTimer,.3);
 }
});

test('the live AI dispatch preserves its four-button action schema',()=>{
 assert.match(engine,/if\(this\.reactToSpinSandTrick\(p,dt,ai\.reaction\)\|\|p\.aiSpinSandThreat\)return/);
 const input=fs.readFileSync('src/modules/input.js','utf8');
 assert.match(input,/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});
