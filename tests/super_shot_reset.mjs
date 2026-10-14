import assert from 'node:assert/strict';
import {GameEngine,SUPER_SHOT_TRANSFORM_SECONDS} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false}};
const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
const p=g.players.find(x=>!x.keeper&&x.t===0&&x.src.superAbility?.type==='shoot');
g.take(p);g.shoot(p,true);
assert.ok(g.ball.shot,'super shot starts transformed');
assert.equal(g.ball.age,0);
let ended=0;g.on?.('shotTransformEnd',()=>ended++);
for(let i=0;i<40;i++){
  // Keep it in flight without goals/players to isolate transformation expiry.
  g.ball.x=1600;g.ball.y=400;g.ball.z=220;
  g.ball.vx=0;g.ball.vy=0;g.ball.vz=0;g.ball.canCollect=5;
  g.updateBall(.05);
}
assert.ok(g.ball.age>=SUPER_SHOT_TRANSFORM_SECONDS);
assert.equal(g.ball.shot,null,'visual reverts to regular ball');
assert.equal(g.ball.trail.length,0,'transformed trail is cleared');
g.take(p);assert.equal(g.ball.shot,null,'possession has a normal ball');
p.specialCd=0;
g.shoot(p,true);assert.ok(g.ball.shot,'next super shot transforms afresh');
g.resetKickoff(0);assert.equal(g.ball.shot,null,'kickoff resets appearance');
console.log('Super-shot transformation reset: passed');
