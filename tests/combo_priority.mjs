import assert from 'node:assert/strict';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],pulse:{},held(t,k){return !!this.state[t]?.[k]},just(t,k){return !!this.pulse[k]}};
const step=(g,s,pressed={})=>{input.state[0]={x:0,y:0,...s};input.pulse=pressed;g.updatePlayers(.016)};
const setup=()=>{input.state=[{},{}];input.pulse={};let g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;let p=g.player(0,3);g.take(p);g.controlled[0]=p.i;p.cd=0;p.stun=0;for(const q of g.players)if(q!==p){q.x=q.t?3050:680;q.y=q.i*65+270;}return {g,p};};
// Both orders produce a single cross, not a normal pass followed by a jump.
for(const order of ['pass-first','jump-first','simultaneous']){
 const {g,p}=setup();
 if(order==='pass-first')step(g,{pass:1},{pass:true});
 if(order==='jump-first')step(g,{jump:1},{jump:true});
 step(g,{pass:1,jump:1},order==='pass-first'?{jump:true}:order==='jump-first'?{pass:true}:{pass:true,jump:true});
 assert.equal(g.ball.owner,null,order+' must release ball');
 assert(g.ball.vz>=220,order+' must send an elevated cross, not ground pass');
 assert.equal(p.z,0,order+' must not cause a player jump');
 const initial=g.ball.vz;
 step(g,{pass:1,jump:1});
 assert.equal(g.ball.vz,initial,order+' cannot repeat while held');
 step(g,{});
 assert.equal(p.z,0,order+' must not fire a delayed jump when released');
}
// A normal tap remains a pass; holding jump alone accelerates and never launches a cross.
{
 const {g,p}=setup();step(g,{pass:1},{pass:true});step(g,{});assert.equal(g.ball.owner,null);assert(g.ball.vz<220);
}
{
 const {g,p}=setup();step(g,{jump:1,x:1},{jump:true});for(let i=0;i<24;i++)step(g,{jump:1,x:1});assert.equal(p.z,0);step(g,{});assert.equal(p.z,0);
}
// Jump+Dribble bicycle respects both orderings and never adds a second jump to the shot.
for(const order of ['dribble-first','jump-first','simultaneous']){
 const {g,p}=setup();
 if(order==='dribble-first')step(g,{dribble:1},{dribble:true});
 if(order==='jump-first')step(g,{jump:1},{jump:true});
 p.cd=0; // test chord priority independent from normal feint cooldown
 step(g,{jump:1,dribble:1},order==='dribble-first'?{jump:true}:order==='jump-first'?{dribble:true}:{dribble:true,jump:true});
 assert.equal(g.ball.owner,null,order+' bicycle must release the ball');
 assert.equal(g.ball.shot,null,order+' bicycle must remain an ordinary football');
 assert.equal(p.action,'bicycle',order+' must preserve bicycle animation instead of jump');
 assert.equal(p.jumpCount,0,order+' must not run an extra jump');
 const count=g.events.filter(e=>e.type==='bicycleShot').length;
 step(g,{jump:1,dribble:1});assert.equal(g.events.filter(e=>e.type==='bicycleShot').length,count,order+' must fire once');
}
console.log('COMBO PRIORITY PASS: order-independent cross/bicycle, no double action, old pass & sprint');
