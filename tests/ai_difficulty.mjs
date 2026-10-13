import assert from 'node:assert/strict';
import {AI_LEVELS,aiTuning} from '../src/ai.js';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],pressed:[{},{}],poll(){},just(){return false}};
function match(level){
 const opts={...DEFAULT_OPTIONS,weather:'Clear',difficulty:level};
 const g=new GameEngine(opts,input);
 g.init({home:0,away:9,options:opts});
 return g;
}
assert.deepEqual(AI_LEVELS.map(a=>a.name),['Rookie','Easy','Normal','Hard','Expert']);
assert.equal(aiTuning(0).id,0,'Rookie must not default to Normal');
assert.equal(aiTuning(4).id,4);
assert.equal(aiTuning(-10).id,0);
assert.equal(aiTuning(99).id,4);
assert.equal(aiTuning('nope').id,2);
for(let i=1;i<5;i++){
 const lo=AI_LEVELS[i-1],hi=AI_LEVELS[i];
 assert.ok(lo.speed<hi.speed&&lo.reaction>hi.reaction&&lo.aimError>hi.aimError&&lo.pressure<hi.pressure&&lo.tackleRate<hi.tackleRate,`Difficulty must be monotonic at level ${i}`);
}
// Full-speed movement when AI has a stable target; level choice affects CPU, not P1.
const speeds=[];
for(let level=0;level<5;level++){
 const g=match(level),p=g.player(1,3);
 p.aiTimer=2;p.aiTarget={x:p.x+999,y:p.y};const start=p.x;
 g.driveAI(p,0.1);speeds.push(Math.abs(p.x-start));
 assert.equal(g.cpuLevel(g.player(0,0)),2,'AI assistants on P1 stay Normal');
 assert.equal(g.cpuLevel(p),level,'P2 CPU follows user difficulty');
}
for(let i=1;i<5;i++)assert.ok(speeds[i]>speeds[i-1],`CPU speed does not rise: ${speeds}`);
// Keeper awareness is held over the preset reaction interval and recalculated for Expert.
{
 const novice=match(0),expert=match(4);
 for(const g of [novice,expert]){
   const p=g.player(1,0);
   g.driveAI(p,0.01);
   g.ball.owner=null;g.ball.x=WORLD.field.x+40;g.ball.y=WORLD.field.y+200;
 }
 const nr=novice.player(1,0),er=expert.player(1,0);
 const beforeN=nr.aiTarget.y,beforeE=er.aiTarget.y;
 novice.driveAI(nr,0.11);expert.driveAI(er,0.11);
 assert.equal(nr.aiTarget.y,beforeN,'Rookie must retain last seen keeper target until reaction window');
 assert.notEqual(er.aiTarget.y,beforeE,'Expert must update keeper target faster');
}
// Normal shot power is unchanged by difficulty; CPU shot aim becomes more precise.
{
 const prev=Math.random;
 Math.random=()=>0; // largest miss in any symmetric error range
 try{
  const kickY=[];
  for(let lvl=0;lvl<5;lvl++){
   const g=match(lvl),p=g.player(1,3);
   p.x=WORLD.field.x+WORLD.field.w*.1;p.y=(WORLD.goalTop+WORLD.goalBottom)/2;p.dy=0;
   g.take(p);g.shoot(p,false);
   // Measure miss from the tactical open corner, not from the goal centre:
   // accurate players intentionally avoid the goalkeeper now.
   const keeper=g.players.find(q=>q.t!==p.t&&q.keeper);
   const top=WORLD.goalTop+(WORLD.goalBottom-WORLD.goalTop)*.19;
   const bottom=WORLD.goalBottom-(WORLD.goalBottom-WORLD.goalTop)*.19;
   const corner=Math.abs(keeper.y-top)>Math.abs(keeper.y-bottom)?top:bottom;
   const accuracy=p.src.shootAccuracy;
   const ideal=(WORLD.goalTop+WORLD.goalBottom)/2+(corner-(WORLD.goalTop+WORLD.goalBottom)/2)*Math.max(0,Math.min(1,(accuracy-20)/80));
   const projected=p.y+(g.ball.vy/g.ball.vx)*((WORLD.field.x-p.x));
   kickY.push(Math.abs(projected-ideal));
  }
  for(let i=1;i<5;i++)assert.ok(kickY[i]<kickY[i-1],`CPU accuracy did not improve: ${kickY}`);
 }finally{Math.random=prev}
}
// Running all five variants must remain finite; simulated matches must not crash.
for(const level of [0,1,2,3,4]){
 const g=match(level);
 for(let t=0;t<1500;t++){
  g.update(1/60);
  if(g.matchState==='paused')g.matchState='play';
  if(g.matchState==='penalty')g.updatePK(1/60);
  if(g.matchState==='finished')break;
 }
 for(const p of g.players)assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),`Invalid AI player position level ${level}`);
 assert.ok(Number.isFinite(g.ball.x)&&Number.isFinite(g.ball.y),`Invalid ball at ${level}`);
}
console.log('AI difficulty: PASS • 5 separate profiles • Rookie zero bug fixed • speed/reaction/accuracy • all-level stability');
