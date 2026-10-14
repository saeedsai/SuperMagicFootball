import assert from 'node:assert/strict';
import {GameEngine,WORLD,predictKeeperShot,predictedKeeperLane,keeperReactionReach} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const test=()=>{const g=new GameEngine({...DEFAULT_OPTIONS,difficulty:2,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,difficulty:2,weather:'Clear'},humans:1});g.cooldown=0;return g};
let tested=0;
for(const side of [0,1])for(const level of [0,1,3,5])for(const behavior of ['normal','zigzag','curve','homing'])for(const fps of [30,60,120]){
 const g=test(),k=g.player(side,0),dir=side===0?-1:1;
 k.x=side===0?250:3390;k.y=765;k.fatigue=0;
 const b=g.ball;b.owner=null;b.attacker=1-side;b.x=k.x-dir*440;b.y=765+((tested%5)-2)*28;b.z=15;b.vx=dir*800;b.vy=18;b.vz=0;b.age=.1;
 b.shot=level?{level,behavior,aimY:760,direction:1}:null;
 const snapshot=JSON.stringify(b),pred=predictKeeperShot(k,b);
 assert.equal(JSON.stringify(b),snapshot,'prediction must not alter the live ball');
 assert(pred===null||Number.isFinite(pred.y),'predicted lane finite');
 const lane=predictedKeeperLane(k,b,.16);
 assert(Number.isFinite(lane)&&lane>=WORLD.goalTop+15&&lane<=WORLD.goalBottom-15,'keeper lane bounded');
 assert(Object.values(keeperReactionReach(k,b)).every(Number.isFinite),'keeper reach components finite');
 // Frame rates must not alter the *input* to the deterministic prediction.
 assert.equal(predictedKeeperLane(k,b,.16),lane);
 const frame=1/fps;
 for(let i=0;i<Math.floor(.15/frame);i++){
  g.updateBall(frame);
  assert(Number.isFinite(b.x)&&Number.isFinite(b.y),'ball state finite after integration');
 }
 tested++;
}
// Shots moving away from keeper must never cause clairvoyant prediction.
for(const side of [0,1]){
 const g=test(),k=g.player(side,0),b=g.ball;
 b.owner=null;b.attacker=1-side;b.vx=side===0?800:-800;
 assert.equal(predictKeeperShot(k,b),null);
}
console.log('PASS v0.8.24.3 moving-keeper forecast and 30/60/120Hz bounded integration:',tested,'fixtures');
