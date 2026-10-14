import assert from 'node:assert/strict';
import {GameEngine,WORLD,predictKeeperShot,predictedKeeperLane,keeperReactionReach} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
let checked=0;
for(const difficulty of [0,1,2,3,4])for(const side of [0,1])for(const fatigue of [0,.5,1])for(const behavior of ['normal','zigzag','homing','curve']){
 const g=new GameEngine({...DEFAULT_OPTIONS,difficulty},input);
 g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,difficulty,weather:'Clear'},humans:1});
 const keeper=g.player(side,0),b=g.ball,dir=side===0?-1:1;
 keeper.x=side===0?230:3410;keeper.y=755;keeper.fatigue=fatigue;
 b.owner=null;b.attacker=1-side;b.x=keeper.x-dir*300;b.y=710;b.z=45;b.vx=dir*710;b.vy=45;b.vz=15;b.age=.04;
 b.shot=behavior==='normal'?null:{level:5,behavior,aimY:800,direction:-1};
 const frozen=JSON.stringify(b),pred=predictKeeperShot(keeper,b),lane=predictedKeeperLane(keeper,b,.18),reach=keeperReactionReach(keeper,b);
 assert.equal(JSON.stringify(b),frozen,'forecast does not change live state');
 assert(pred===null||[pred.y,pred.z,pred.time].every(Number.isFinite),'valid predicted crossing');
 assert(Number.isFinite(lane)&&lane>=WORLD.goalTop+15&&lane<=WORLD.goalBottom-15);
 assert(Object.values(reach).every(Number.isFinite));
 // Mirrored ball travel away from this goal must not be treated as an incoming shot.
 b.vx=-dir*710;assert.equal(predictKeeperShot(keeper,b),null);
 checked++;
}
console.log('PASS v0.8.24.3 goalkeeper difficulty/fatigue/shot-direction matrix:',checked,'fixtures');
