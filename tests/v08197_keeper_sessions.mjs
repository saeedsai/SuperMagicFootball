import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {GameEngine,WORLD,keeperDiveRecoverySeconds,keeperReactionReach} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const noop={state:[{},{}],poll(){},just(){return false},released(){return false}};
function make(){
 const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},noop);
 g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'},humans:0});
 g.cooldown=0;return g;
}
const strong={src:{id:'elite',role:'GK',gkSkill:95,gkDiving:92},fatigue:0};
const weak={src:{id:'rookie',role:'GK',gkSkill:25,gkDiving:28},fatigue:0};
const tired={...strong,fatigue:.95};
assert(keeperDiveRecoverySeconds(strong)<keeperDiveRecoverySeconds(weak),'elite GK recovers faster');
assert(keeperDiveRecoverySeconds(tired)>keeperDiveRecoverySeconds(strong),'fatigue extends recovery');
assert(keeperDiveRecoverySeconds(strong)>=1.45&&keeperDiveRecoverySeconds(tired)<=2.85);
const results=[];
// Uniform goal-mouth lanes plus slightly wider misses, evaluated for BOTH goal
// directions. These are repeatable shot trials, NOT a claimed real match save %.
const offsets=Array.from({length:55},(_,i)=>(i-27)*5);
const random=Math.random;
Math.random=()=>.99; // disable optional supernatural goalkeeper special for reproducible calibration
try {
 for(const team of [0,1])for(const group of [
   {name:'rookie',skill:25,diving:28,fatigue:0},
   {name:'mid',skill:60,diving:60,fatigue:0},
   {name:'elite',skill:95,diving:92,fatigue:0},
   {name:'elite_tired',skill:95,diving:92,fatigue:.95},
 ])for(const shotCase of [
   {name:'ordinary',speed:850,level:0,behavior:null},
   {name:'fast',speed:1800,level:0,behavior:null},
   {name:'zigzag_super5',speed:1900,level:5,behavior:'zigzag'},
 ]){
  let saves=0,goals=0,misses=0;
  for(const offset of offsets){
   const g=make(),k=g.player(team,0),b=g.ball,dir=team===0?-1:1;
   for(const p of g.players.filter(p=>!p.keeper)){p.x=1800;p.y=240;}
   k.src={...k.src,gkSkill:group.skill,gkDiving:group.diving};k.fatigue=group.fatigue;
   k.y=765;k.diveCooldown=0;k.stun=0;k.x=team===0?240:3400;
   b.owner=null;b.attacker=1-team;b.x=k.x-dir*280;b.y=765+offset;b.z=12;
   b.vx=dir*shotCase.speed;b.vy=0;b.vz=0;b.power=55;
   b.shot=shotCase.level?{behavior:shotCase.behavior,level:shotCase.level}:null;
   b.canCollect=.8;b.age=.13;b.trail=[];
   // Advance until saved or through keeper/goal line. Include the animation phase.
   let saved=false;
   for(let step=0;step<32;step++){
    g.updateBall(1/30);
    if(g.events.some(e=>e.type==='save'&&e.player===k)){saved=true;break;}
    if(g.score[1-team]>0)break;
    if(g.ball.vx*dir<0)break;
   }
   if(saved)saves++;
   else if(g.score[1-team]>0)goals++;
   else misses++;
  }
  results.push({team,group:group.name,shot:shotCase.name,saves,goals,other:misses,attempts:offsets.length});
 }
} finally {Math.random=random;}
for(const team of [0,1]){
 const rate=(group,shot)=>results.find(r=>r.team===team&&r.group===group&&r.shot===shot).saves;
 assert(rate('elite','ordinary')>rate('rookie','ordinary'),`better GK covers more normal lanes team ${team}`);
 assert(rate('elite_tired','fast')<=rate('elite','fast'),`tired goalkeeper cannot cover more fast shot lanes team ${team}`);
 assert(rate('elite','zigzag_super5')<=rate('elite','ordinary'),`level 5 erratic shots must not be easier team ${team}`);
}
// Full AI vs AI match durations through the actual engine update loop, not only
// isolated keeper dive calls. Fixed seeded RNG guarantees reproducibility.
let seed=0x71c3e;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const matches=[];const original=Math.random;Math.random=rand;
try{
 for(let i=0;i<4;i++){
  const g=make();g.matchSeconds=35;g.humans=0;
  let frames=0,events={goal:0,save:0,keeperDive:0,keeperCatch:0,keeperDistribution:0,keeperRecovery:0};
  g.onEvent=e=>{if(e.type in events)events[e.type]++;};
  while(g.matchState==='play'&&frames<13000){g.update(1/30);frames++;
   if(g.matchState==='paused'&&g.half===2){g.matchState='play';}
  }
  assert(frames<13000,`match ${i} must complete in bounded simulation`);
  assert(g.players.length===12,`match ${i} retains six players on each side`);
  assert(!g.players.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||!Number.isFinite(p.fatigue)),`match ${i} no NaN player states`);
  matches.push({match:i+1,frames,half:g.half,state:g.matchState,score:g.score,events});
 }
}finally{Math.random=original;}
const report={release:'0.8.19.7',description:'Deterministic GK shot-lane calibration and full AI match simulation. Not measured human gameplay save rate.',trialCount:results.reduce((n,r)=>n+r.attempts,0),results,matches};
writeFileSync(new URL('./KEEPER_CALIBRATION_v08197.json',import.meta.url),JSON.stringify(report,null,2));
console.log('v0.8.19.7 KEEPER SESSION QA PASS',JSON.stringify({trials:report.trialCount,matches:matches.length,scores:matches.map(m=>m.score),totals:matches.reduce((a,m)=>{for(const key of Object.keys(a))a[key]+=(m.events[key]||0);return a;},{goal:0,save:0,keeperDive:0,keeperCatch:0,keeperDistribution:0,keeperRecovery:0})}));
