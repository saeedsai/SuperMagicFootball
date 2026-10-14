/** A closer ineligible outfield player must not suppress a reachable goalkeeper. */
import assert from 'node:assert/strict';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
g.init({home:0,away:9,humans:1,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
g.tryKeeperDive=()=>false;
g.trySweptKeeperDive=()=>false;
const k=g.player(0,0),f=g.players.find(p=>p.t===0&&!p.keeper);
for(const p of g.players){p.x=340;p.y=240;p.stun=0;}
const reset=(fX,kX,z)=>{
 f.x=fX;f.y=800;k.x=kX;k.y=800;k.fatigue=0;
 Object.assign(g.ball,{x:1200,y:800,z,vx:0,vy:0,vz:0,owner:null,attacker:-1,shot:null,ordinaryShot:false,canCollect:0,age:1,trail:[],power:0});
};
reset(1204,1222,51);g.updateBall(1/120);
assert.equal(g.ball.owner,k,'outfield is too short for aerial ball but goalkeeper can claim it');
reset(1229,1235,0);g.updateBall(1/120);
assert.equal(g.ball.owner,k,'closer outfielder outside smaller radius must not suppress keeper');
reset(1204,1270,53);g.updateBall(1/120);
assert.equal(g.ball.owner,null,'keeper cannot collect from beyond its own reach');
reset(1204,1222,0);g.updateBall(1/120);
assert.equal(g.ball.owner,f,'eligible closer outfield player still collects first');
console.log('PASS v0.8.24.11 goalkeeper/outfield collection candidate eligibility (4 scenarios)');
