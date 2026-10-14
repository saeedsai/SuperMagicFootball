/** v0.8.24.9: real-engine ordinary-shot range and CPU difficulty probes.
 * A controlled open lane is intentional: this checks ball flight rather than
 * asserting uncalibrated keeper save probabilities or match win rates.
 */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
import {aiTuning} from '../src/ai.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const originalRandom=Math.random;
function seeded(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function trial({team=1,difficulty=2,distance=750,step=1/60,seed=1,mode='shot',scenario='base'}){
 Math.random=seeded(seed);
 const options={...DEFAULT_OPTIONS,difficulty,weather:'Clear',terrain:'Grass',condition:'Good'};
 const g=new GameEngine(options,input);
 g.init({home:0,away:9,options,humans:1});g.cooldown=0;
 const shooter=g.player(team,3),keeper=g.player(1-team,0);
 for(const p of g.players)if(!p.keeper&&p!==shooter){p.x=1800;p.y=225;}
 const goal=team===0?WORLD.field.x+WORLD.field.w:WORLD.field.x;
 shooter.x=goal+(team===0?-1:1)*distance;
 shooter.y=765;shooter.face=team===0?1:-1;shooter.dy=0;
 shooter.src={...shooter.src,shootAccuracy:84,shootPower:85};
 keeper.x=goal+(team===0?1:-1)*100;keeper.y=1100;
 g.take(shooter);
 const cpuLevel=g.cpuLevel(shooter);
 if(mode==='shot')assert(g.shoot(shooter));
 else g.freeBall(shooter,goal-shooter.x,0,700,{power:5,pass:true,z:14,vz:20});
 const flag=g.ball.ordinaryShot===true;
 const aimY=g.ball.targetY;
 let minGoalDistance=Infinity,goals=0,saves=0;
 for(let frame=0;frame<Math.ceil(5/step);frame++){
  g.updateBall(step);
  minGoalDistance=Math.min(minGoalDistance,Math.abs(g.ball.x-goal));
  if(g.events.some(e=>e.type==='save')){saves=1;break;}
  if(g.events.some(e=>e.type==='goal')){goals=1;break;}
 }
 assert([g.ball.x,g.ball.y,g.ball.z,g.ball.vx,g.ball.vy].every(Number.isFinite));
 return {team,difficulty,cpuLevel,mode,scenario,distance,seed,step,flag,aimY,goals,saves,minGoalDistance};
}
const rows=[];
try{
 for(const difficulty of [0,1,2,3,4])for(const team of [0,1])for(const seed of Array.from({length:20},(_,i)=>i+1234)){
  rows.push(trial({team,difficulty,seed,distance:750}));
 }
 for(const team of [0,1])for(const step of [1/30,1/60,1/120])for(let seed=1234;seed<1254;seed++){
  rows.push(trial({team,seed,step,distance:750,mode:'pass',scenario:'framerate'}));
 }
 for(const team of [0,1])for(const distance of [600,750,950])for(const step of [1/30,1/60,1/120])for(let seed=1234;seed<1244;seed++){
  rows.push(trial({team,seed,step,distance,scenario:'framerate'}));
 }
}finally{Math.random=originalRandom;}
const shotRows=rows.filter(r=>r.mode==='shot');
assert(shotRows.every(r=>r.flag),'regular goal-directed kicks are identified');
assert(rows.filter(r=>r.mode==='pass').every(r=>!r.flag),'passes never receive ordinary-shot momentum');
assert(rows.filter(r=>r.team===1).every(r=>r.cpuLevel===r.difficulty),'CPU-only difficulty actually applies in a human-vs-CPU fixture');
assert(rows.filter(r=>r.team===0).every(r=>r.cpuLevel===2),'human team baseline stays Normal');
for(const team of [0,1])for(const difficulty of [0,1,2,3,4]){
 const sample=rows.filter(r=>r.mode==='shot'&&r.team===team&&r.difficulty===difficulty&&r.distance===750&&r.step===1/60);
 assert(sample.length>=20);
 assert(sample.filter(r=>r.goals).length>=12,`reliable medium-range scoring opportunity to empty keeper lane: ${team}/${difficulty}`);
}
for(const team of [0,1]){
 const passes=rows.filter(r=>r.mode==='pass'&&r.team===team);
 assert(passes.every(r=>!r.flag),'passes retain existing non-shot drag even when deliberately aimed toward goal');
 for(const distance of [600,750,950]){
  const counts=[1/30,1/60,1/120].map(step=>rows.filter(r=>r.mode==='shot'&&r.team===team&&r.distance===distance&&r.step===step&&r.scenario==='framerate').reduce((n,r)=>n+r.goals,0));
  assert(Math.max(...counts)-Math.min(...counts)<=3,`shot outcomes broadly stable between frame steps ${team}/${distance}: ${counts}`);
 }
}
// Direct rolling-ball regression: a ground ball must not acquire an extra
// bounce/drag every second update at 120Hz. Compare equivalent simulated time.
const ground=[];
try{
 for(const step of [1/30,1/60,1/120]){
  Math.random=seeded(824800);
  const options={...DEFAULT_OPTIONS,weather:'Clear'};
  const g=new GameEngine(options,input);g.init({home:0,away:9,options,humans:1});
  g.ball={...g.ball,x:1800,y:850,z:0,vx:500,vy:100,vz:0,owner:null,shot:null,ordinaryShot:false,power:0,attacker:-1,canCollect:30,age:0,trail:[]};
  for(let frame=0;frame<Math.round(1/step);frame++)g.updateBall(step);
  ground.push({hz:Math.round(1/step),vx:g.ball.vx,vy:g.ball.vy,x:g.ball.x,y:g.ball.y});
 }
}finally{Math.random=originalRandom;}
const speedRange=Math.max(...ground.map(r=>r.vx))-Math.min(...ground.map(r=>r.vx));
assert(speedRange<3,`resting ball drag is frame-step consistent: ${JSON.stringify(ground)}`);
const summary={release:'0.8.24.9',label:'Controlled real-engine shot flight to open keeper lane; NOT real human win-rate, CPU full match or physical hardware',fixtures:rows.length,groundBallFrameTests:ground,shots:shotRows.length,passes:rows.length-shotRows.length,goalCountsByDifficulty:Object.fromEntries([0,1,2,3,4].map(d=>[d,rows.filter(r=>r.mode==='shot'&&r.team===1&&r.difficulty===d&&r.distance===750&&r.step===1/60&&r.scenario==='base').reduce((n,r)=>n+r.goals,0)])),mediumRangeGoalCount:rows.filter(r=>r.mode==='shot'&&r.distance===750&&r.goals).length,limitations:['Keeper is held away from the shot path to isolate ball-flight drag','Does not establish human-vs-CPU score fairness or real moving-GK save percentages','CPU difficulty changes aiming, but these shots are controlled open-lane probes','Hardware input, sound, and FPS must be separately validated']};
writeFileSync(new URL('../docs/CPU_SHOT_RANGE_CALIBRATION_v08248.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log('PASS ordinary shot range / CPU policy',JSON.stringify(summary));
