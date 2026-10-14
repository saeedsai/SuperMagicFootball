/** v0.8.24.9: game-engine single-player shot trials with active CPU keeper and defenders.
 * These are seeded controller-initiated attacks, NOT true human win-rate estimates.
 */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';

const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
function seeded(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
const originalRandom=Math.random;
const midfield=(WORLD.goalTop+WORLD.goalBottom)/2;
const trials=[];
try{
 for(const difficulty of [0,1,2,3,4])for(const [pairIndex,[home,away]] of [[0,9],[9,0],[2,7]].entries())for(const distance of [570,850])for(const seedIndex of [0,1,2,3]){
  const seed=824900+difficulty*1013+pairIndex*117+distance+seedIndex*13;
  Math.random=seeded(seed);
  const options={...DEFAULT_OPTIONS,difficulty,weather:'Clear',terrain:'Grass',condition:'Good'};
  const g=new GameEngine(options,input);g.init({home,away,options,humans:1});g.matchSeconds=45;
  // No goalkeeper or defender is frozen: all of them update under real CPU AI.
  const shooter=g.player(0,3),keeper=g.player(1,0);
  const goalX=WORLD.field.x+WORLD.field.w;
  shooter.x=goalX-distance;shooter.y=midfield+((seedIndex%2)?85:-85);shooter.z=0;shooter.dy=0;shooter.face=1;shooter.cd=0;
  // Maintain deterministic, plausible defensive cover instead of an intentionally empty lane.
  const defenders=g.players.filter(p=>p.t===1&&!p.keeper);
  defenders[0].x=goalX-260;defenders[0].y=midfield+((seedIndex%2)?65:-65);
  defenders[1].x=goalX-390;defenders[1].y=midfield-155;
  keeper.x=goalX-44;keeper.y=midfield;keeper.stun=0;keeper.diveCooldown=0;
  g.take(shooter);
  const before=g.score.slice();const events=[];
  g.onEvent=e=>{if(['goal','save','shot','keeperDive','tackle','playerCollision'].includes(e.type))events.push(e.type)};
  assert.equal(g.cpuLevel(keeper),difficulty,'active CPU keeper should use selected difficulty');
  assert.equal(g.inControl(0),true);assert.equal(g.inControl(1),false);
  assert.equal(g.shoot(shooter),true,'controlled player shot begins');
  let steps=0,keeperMoved=false,defenderMoved=false;
  const ky=keeper.y,dy=defenders[0].y,kx=keeper.x,dx=defenders[0].x;
  for(;steps<Math.ceil(3.2*60);steps++){
   g.update(1/60);
   keeperMoved||=Math.hypot(keeper.x-kx,keeper.y-ky)>1;
   defenderMoved||=Math.hypot(defenders[0].x-dx,defenders[0].y-dy)>1;
   assert(g.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.fatigue)),'player state stays finite');
   assert([g.ball.x,g.ball.y,g.ball.z,g.ball.vx,g.ball.vy].every(Number.isFinite),'ball state stays finite');
   if(g.score[0]>before[0]||events.includes('save'))break;
   // Ball no longer in play as a shot after collection by field player.
   if(steps>30 && g.ball.owner && g.ball.owner!==shooter)break;
  }
  trials.push({difficulty,home,away,seed,distance,steps,goal:g.score[0]>before[0],save:events.includes('save'),keeperMoved,defenderMoved,events,ballOwnerTeam:g.ball.owner?.t??null});
 }
}finally{Math.random=originalRandom;}
assert.equal(trials.length,120);
assert(trials.every(r=>r.keeperMoved),'live keeper must react to every approach');
assert(trials.every(r=>r.defenderMoved),'CPU defenders must be active');
const byDifficulty=Object.fromEntries([0,1,2,3,4].map(d=>{const rows=trials.filter(t=>t.difficulty===d);return[d,{shots:rows.length,goals:rows.filter(x=>x.goal).length,saves:rows.filter(x=>x.save).length,defenderReactions:rows.filter(x=>x.defenderMoved).length}]}));
const report={release:'0.8.24.9',type:'Seeded controlled-player shots vs moving CPU keeper and defenders in full GameEngine.update',trials:trials.length,stepsPerSecond:60,goalkeeperFrozen:false,defendersFrozen:false,realHumanInput:false,byDifficulty,trials,limitations:['Controlled scripted shots, not real humans or whole match statistics','120 attempts / 24 per difficulty insufficient for dependable win-rate or save-probability claims','Team and shooter matchups affect variation; goalkeeper reactions are not isolated from defenders','Real controllers, browsers and cross-device performance are separate QA']};
writeFileSync(new URL('../docs/SINGLE_PLAYER_CPU_CALIBRATION_v08249.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS single-player live-keeper CPU calibration',JSON.stringify(byDifficulty));
