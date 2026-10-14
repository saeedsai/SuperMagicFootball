import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {GameEngine, keeperAutoSuperEligible, keeperReactionReach, WORLD} from '../src/engine.js';
import {AI_LEVELS} from '../src/ai.js';
import {DEFAULT_OPTIONS} from '../src/data.js';

const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
function game(difficulty=2){const g=new GameEngine({...DEFAULT_OPTIONS,difficulty,weather:'Clear'},input);
 g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,difficulty,weather:'Clear'},humans:1});
 g.cooldown=0;return g;}
const rng=Math.random;
// Focused regression: only one 14% auto-save attempt per eligible incoming
// transformed shot, regardless of frame count; no roll on an outgoing shot.
try {
 for(const side of [0,1]){
  const g=game(), k=g.player(side,0),dir=side===0?-1:1;
  k.src={...k.src,gkSuperAbility:{type:'defence',id:'megaPalm'}};
  k.x=side===0?270:3370;k.y=765;k.abilityCd=0;k.fatigue=0;k.stun=0;
  g.ball={...g.ball,owner:null,attacker:1-side,shot:{behavior:'normal',level:2},x:k.x-dir*170,y:765,z:20,vx:dir*600,vy:0,vz:0,age:0,canCollect:1,power:80,trail:[]};
  assert(keeperAutoSuperEligible(k,g.ball),'fixture should be eligible');
  let calls=0;
  g.activateKeeperSuper=()=>{calls++;return false;};
  g.tryKeeperDive=()=>false;g.trySweptKeeperDive=()=>false;
  Math.random=()=>.01;
  for(let i=0;i<18;i++)g.updateBall(1/120);
  assert.equal(calls,1,`only one auto keeper super attempt at 120 Hz team ${side}`);
  assert.equal(g.ball.shot?.keeperAutoConsidered,true);
  // Different incoming shot allows exactly one fresh attempt.
  g.ball.shot={behavior:'normal',level:3};g.ball.x=k.x-dir*170;g.ball.vx=dir*600;g.ball.age=0;
  for(let i=0;i<8;i++)g.updateBall(1/60);
  assert.equal(calls,2);
  g.ball.shot={behavior:'normal',level:2};g.ball.x=k.x-dir*170;g.ball.vx=-dir*600;
  for(let i=0;i<5;i++)g.updateBall(1/60);
  assert.equal(calls,2,'away-going shots never trigger auto keeper supers');
  assert.equal(keeperAutoSuperEligible(k,g.ball),false);
  g.ball.shot={behavior:'normal',level:4};g.ball.vx=dir*600;g.ball.y=WORLD.goalTop-120;
  assert.equal(keeperAutoSuperEligible(k,g.ball),false,'shots clearly outside goal cannot trigger super');
 }
}finally{Math.random=rng;}

// Representative on-field shot trials by keeper quality, mirrored goal,
// shot transformation / level, and all selectable difficulty profiles.
// This is a fixed-lane synthetic QA matrix, not a human match save percentage.
const shots=[
 {name:'ordinary',speed:850,level:0,behavior:null},
 {name:'fast',speed:1800,level:0,behavior:null},
 {name:'super_straight_1',speed:1850,level:1,behavior:'normal'},
 {name:'super_zigzag_3',speed:1900,level:3,behavior:'zigzag'},
 {name:'super_zigzag_5',speed:1900,level:5,behavior:'zigzag'},
];
const keepers=[{name:'rookie',skill:25,diving:28,fatigue:0},{name:'elite',skill:95,diving:92,fatigue:0},{name:'elite_tired',skill:95,diving:92,fatigue:.95}];
const offsets=Array.from({length:23},(_,i)=>(i-11)*12);
const results=[];let speedSamples=[];
Math.random=()=>.99; // disabled rare supers and reproducible particles
try {
 for(const difficulty of AI_LEVELS.map(a=>a.id))for(const side of [0,1])for(const profile of keepers)for(const shot of shots){
  let saves=0,goals=0,other=0;
  for(const offset of offsets){
   const g=game(difficulty),k=g.player(side,0),b=g.ball,dir=side===0?-1:1;
   for(const p of g.players.filter(p=>!p.keeper)){p.x=1800;p.y=240;}
   k.src={...k.src,gkSkill:profile.skill,gkDiving:profile.diving,gkSuperAbility:null};
   k.y=765;k.x=side===0?240:3400;k.fatigue=profile.fatigue;k.diveCooldown=0;k.stun=0;
   b.owner=null;b.attacker=1-side;b.x=k.x-dir*280;b.y=765+offset;b.z=12;
   b.vx=dir*shot.speed;b.vy=0;b.vz=0;b.power=55;b.age=.13;
   b.shot=shot.level?{behavior:shot.behavior,level:shot.level}:null;
   b.canCollect=.8;b.trail=[];
   let saved=false;
   for(let i=0;i<32;i++){
    g.updateBall(1/30);
    if(g.events.some(e=>e.type==='save'&&e.player===k)){saved=true;break;}
    if(g.score[1-side]>0||g.ball.vx*dir<0)break;
   }
   if(saved)saves++;else if(g.score[1-side]>0)goals++;else other++;
  }
  results.push({difficulty,team:side,keeper:profile.name,shot:shot.name,saves,goals,other,n:offsets.length});
 }
} finally{Math.random=rng;}
for(const difficulty of AI_LEVELS.map(a=>a.id))for(const team of [0,1]){
 const n=(keeper,shot)=>results.find(r=>r.difficulty===difficulty&&r.team===team&&r.keeper===keeper&&r.shot===shot).saves;
 assert(n('elite','ordinary')>n('rookie','ordinary'),`strong GK better ${difficulty}/${team}`);
 assert(n('elite_tired','fast')<=n('elite','fast'),`fatigue bound ${difficulty}/${team}`);
 assert(n('elite','super_zigzag_5')<=n('elite','ordinary'),`super5 no easier ${difficulty}/${team}`);
 assert(n('elite','super_zigzag_5')<=n('elite','super_straight_1'),`advanced super no easier ${difficulty}/${team}`);
}
// Difficulty controls AI anticipation/movement, not keeper stats: isolated
// shots with deliberately frozen keeper position should be invariant to it.
for(const row of results.filter(r=>r.difficulty>0)){
 const baseline=results.find(r=>r.difficulty===0&&r.team===row.team&&r.keeper===row.keeper&&r.shot===row.shot);
 assert.equal(row.saves,baseline.saves,'difficulty must not secretly buff frozen GK save radius');
}
// No obvious synthetic shot-mirroring advantage (two attacking directions).
for(const a of results.filter(r=>r.team===0)){
 const b=results.find(r=>r.difficulty===a.difficulty&&r.team===1&&r.keeper===a.keeper&&r.shot===a.shot);
 assert(Math.abs(a.saves-b.saves)<=2,`mirrored bias ${a.keeper}/${a.shot}`);
}
const bench=game(),start=performance.now();let steps=0;
let s=0x8242026;const random=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
Math.random=random;
try {bench.matchSeconds=30;while(steps<5400&&bench.matchState==='play'){bench.update(1/60);steps++;}}finally{Math.random=rng;}
const elapsedMs=performance.now()-start;
assert(steps>500&&elapsedMs<45000,'bounded simulation perf sanity');
assert(bench.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.fatigue)));
const report={version:'0.8.24',trialCount:results.length*offsets.length,profileCount:AI_LEVELS.length,description:'Mirrored fixed-lane synthetic goalkeeper coverage; all five difficulties (GK held fixed). Not real-game save probability.',autoSuperRule:'One 14% consideration per incoming transformed shot when eligible, never per frame',rows:results,frameBenchmark:{simulatedFrames:steps,secondsSimulated:steps/60,wallMs:Math.round(elapsedMs),environment:'Node headless (not device FPS)'}};
writeFileSync(new URL('../docs/KEEPER_FAIRNESS_MATRIX_v0824.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('v0.8.24 GK FAIRNESS PASS',JSON.stringify({trials:report.trialCount,profiles:report.profileCount,simulation:report.frameBenchmark}));
