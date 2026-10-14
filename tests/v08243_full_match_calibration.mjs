import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const rngOriginal=Math.random;
function seeded(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
const matches=[];
try {
 for(const difficulty of [0,1,2,3,4])for(const seed of [824301,824302]){
  Math.random=seeded(seed);
  const options={...DEFAULT_OPTIONS,difficulty,weather:'Clear'};
  const g=new GameEngine(options,input);
  g.init({home:0,away:9,options,humans:0});
  g.matchSeconds=18;
  let ticks=0,halftime=0;
  const counts={goal:0,save:0,keeperDive:0,keeperCatch:0,keeperDistribution:0,keeperRecovery:0};
  g.onEvent=e=>{if(e.type in counts)counts[e.type]++;};
  while(ticks<4800){
   if(g.matchState==='paused'&&g.half===2){halftime++;g.matchState='play';}
   if(g.matchState==='finished'||g.matchState==='penalty'||g.matchState==='pk')break;
   if(g.matchState!=='play')break;
   g.update(1/30);ticks++;
   assert(g.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.fatigue)),`player state finite difficulty ${difficulty}`);
   assert([g.ball.x,g.ball.y,g.ball.z,g.ball.vx,g.ball.vy].every(Number.isFinite),`ball state finite difficulty ${difficulty}`);
  }
  assert(ticks<4800,`match ends within bound: ${difficulty}/${seed}`);
  assert.equal(g.players.length,12,'six a side');
  assert(g.half>=2,`entered second half: ${difficulty}/${seed}`);
  assert(halftime<=1,'exactly one halftime transition');
  assert(g.score.every(x=>Number.isInteger(x)&&x>=0),'nonnegative integral score');
  matches.push({difficulty,seed,ticks,halftime,matchState:g.matchState,score:g.score,counts});
 }
} finally {Math.random=rngOriginal;}
// Repeated fixed seeds must be precisely reproducible in this deterministic runtime.
assert.equal(matches.length,10);
for(const m of matches)assert(m.ticks>0 && m.counts.goal>=0);
const byDifficulty=Object.fromEntries([0,1,2,3,4].map(d=>[d,{matches:2,goals:matches.filter(m=>m.difficulty===d).reduce((n,m)=>n+m.score[0]+m.score[1],0),saves:matches.filter(m=>m.difficulty===d).reduce((n,m)=>n+m.counts.save,0)}]));
const report={release:'0.8.24.3',type:'Seeded full-engine AI-vs-AI short-match smoke/calibration, NOT human match win-rate or physical device certification',secondsPerHalf:18,stepSeconds:1/30,matches,byDifficulty};
writeFileSync(new URL('../docs/KEEPER_FULL_MATCH_CALIBRATION_v08243.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS v0.8.24.3 full-match calibration',JSON.stringify(byDifficulty));
