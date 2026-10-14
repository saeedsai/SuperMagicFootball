import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {AI_LEVELS,aiTuning} from '../src/ai.js';
import {DEFAULT_OPTIONS} from '../src/data.js';

// Prior AI-vs-AI calibration reports labeled five difficulties, but the game
// intentionally uses baseline Normal tactics if there is no human opponent.
// Verify actual player-facing difficulty separately rather than inferring it
// from AI-versus-AI goals/saves under humans=0.
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const originalRandom=Math.random;
const results=[];
try {
 for (const humans of [0,1,2]) {
  for (let difficulty=0;difficulty<5;difficulty++) {
   const options={...DEFAULT_OPTIONS,difficulty,weather:'Clear'};
   const game=new GameEngine(options,input);
   game.init({home:0,away:9,options,humans});
   const cpu=game.player(1,3),home=game.player(0,3);
   const expectedLevel=humans===1?difficulty:2;
   assert.equal(game.cpuLevel(cpu),expectedLevel,'effective difficulty derives from match mode');
   assert.equal(game.cpuLevel(home),2,'teammate baseline remains unchanged');
   assert.equal(aiTuning(game.cpuLevel(cpu)).name,AI_LEVELS[expectedLevel].name);
   // Use the same non-random draw for every profile to isolate aimError.
   cpu.x=1900;cpu.y=(WORLD.goalTop+WORLD.goalBottom)/2;cpu.dy=0;cpu.cd=0;
   game.take(cpu);
   Math.random=()=>.85;
   assert.equal(game.shoot(cpu),true,'CPU player fires a valid ordinary shot');
   assert(Number.isFinite(game.ball.targetY));
   results.push({humans,difficulty,effectiveLevel:expectedLevel,targetY:game.ball.targetY});
  }
 }
} finally {Math.random=originalRandom;}
for (const humans of [0,2]) {
 const aims=results.filter(r=>r.humans===humans).map(r=>r.targetY);
 assert.equal(new Set(aims.map(n=>n.toFixed(8))).size,1,'non-single-player difficulty must not create false balance curves');
}
const solo=results.filter(r=>r.humans===1);
assert.equal(new Set(solo.map(r=>r.targetY.toFixed(8))).size,5,'all five single-player CPU shot profiles have observable effect');
for (let i=1;i<solo.length;i++)assert(solo[i].targetY<solo[i-1].targetY,`CPU aim spread must decrease for matching random input from level ${i-1} to ${i}`);
assert.deepEqual(solo.map(r=>r.effectiveLevel),[0,1,2,3,4]);
console.log('PASS v0.8.24.6 CPU-difficulty calibration policy: 15 scenario fixtures, 5 single-player CPU aim profiles; AI-vs-AI is Normal by design');
