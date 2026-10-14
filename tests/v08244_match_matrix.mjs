import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
function randomSeed(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
const original=Math.random,results=[];
const fixtures=[{home:0,away:9},{home:9,away:0},{home:2,away:7}];
try {
  for(const difficulty of [0,1,2,3,4])for(const [index,fixture] of fixtures.entries()) {
    const seed=824440+index*97+difficulty*7919;Math.random=randomSeed(seed);
    const options={...DEFAULT_OPTIONS,difficulty,weather:'Clear'};
    const engine=new GameEngine(options,input);
    engine.init({...fixture,options,humans:0});engine.matchSeconds=60;
    let ticks=0,halftimes=0,peakBallSpeed=0;
    const events={};engine.onEvent=e=>{events[e.type]=(events[e.type]||0)+1;};
    while(ticks<12000){
      if(engine.matchState==='paused' && engine.half===2){halftimes++;engine.matchState='play';}
      if(['finished','penalty','pk'].includes(engine.matchState))break;
      assert.equal(engine.matchState,'play',`unexpected state ${engine.matchState}`);
      engine.update(1/30);ticks++;
      const b=engine.ball;const speed=Math.hypot(b.vx,b.vy);peakBallSpeed=Math.max(peakBallSpeed,speed);
      assert([b.x,b.y,b.z,b.vx,b.vy,b.vz||0].every(Number.isFinite),'finite ball');
      assert(engine.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.fatigue)),'finite players');
      assert(engine.score.every(x=>Number.isInteger(x)&&x>=0),'valid score');
    }
    assert(ticks<12000,'match completes');assert(engine.half>=2,'second half');assert(halftimes<=1,'halftime bounded');
    results.push({difficulty,effectiveCpuDifficulty:[engine.cpuLevel(engine.player(0,3)),engine.cpuLevel(engine.player(1,3))],seed,...fixture,ticks,score:[...engine.score],goals:engine.score[0]+engine.score[1],saves:events.save||0,events,peakBallSpeed:Number(peakBallSpeed.toFixed(3)),finishedState:engine.matchState});
  }
} finally {Math.random=original;}
assert.equal(results.length,15);
const byDifficulty=Object.fromEntries([0,1,2,3,4].map(d=>{const r=results.filter(x=>x.difficulty===d);return [d,{matches:r.length,goals:r.reduce((s,x)=>s+x.goals,0),saves:r.reduce((s,x)=>s+x.saves,0),avgPeakBallSpeed:Number((r.reduce((s,x)=>s+x.peakBallSpeed,0)/r.length).toFixed(3))}];}));
const report={release:'0.8.24.6',label:'Seeded AI-vs-AI full-engine scenarios; all teams deliberately use Normal AI and requested difficulty does NOT vary their tuning',calibrationValidForCpuDifficultyComparison:false,secondsPerHalf:60,stepSeconds:1/30,fixtures,results,byDifficulty,limitations:['AI-vs-AI humans=0 uses Normal AI on both teams at every requested difficulty: these five groups are NOT a CPU difficulty comparison','Three fixture pairs per difficulty are too few for statistical balance conclusions','All-AI play is not human-versus-CPU performance','Hardware and browser performance require separate testing']};
writeFileSync(new URL('../docs/KEEPER_MATCH_MATRIX_v08246.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS v0.8.24.6 AI-vs-AI neutral-policy match matrix',JSON.stringify(byDifficulty));
