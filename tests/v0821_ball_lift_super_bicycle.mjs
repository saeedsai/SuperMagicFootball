/** New four-button sequence: held Dribble -> Jump lifts stationary ball;
 * release Dribble; new Jump -> Shoot performs powerful normal-ball bicycle.
 */
import assert from 'node:assert/strict';
import {GameEngine,BALL_LIFT_HOLD_SECONDS,BALL_LIFT_WINDOW_SECONDS} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],justFlags:{},releaseFlags:{},poll(){},just(t,k){return !!this.justFlags[k]},released(t,k){return !!this.releaseFlags[k]},tapDuration(){return 0}};
function fixture(){
 input.state=[{},{}];input.justFlags={};input.releaseFlags={};
 const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
 g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 g.cooldown=0;g.autoSwitch=()=>false;g.driveAI=()=>{};
 const p=g.player(0,3);g.take(p);g.events.length=0;
 for(const q of g.players)if(q!==p){q.x=q.t?3300:350;q.y=1100;}
 p.x=1600;p.y=770;p.face=1;p.cd=0;
 return {g,p};
}
function step(g,state,just={},released={},n=1,dt=.016){input.state[0]=state;input.justFlags=just;input.releaseFlags=released;for(let i=0;i<n;i++){g.updatePlayers(dt);input.justFlags={};input.releaseFlags={};}}
const originalRandom=Math.random;
try{
 Math.random=()=>.5;
 assert(BALL_LIFT_HOLD_SECONDS>.2&&BALL_LIFT_HOLD_SECONDS<.4);
 assert(BALL_LIFT_WINDOW_SECONDS>=1.2&&BALL_LIFT_WINDOW_SECONDS<=2.0);
 for(const team of [0,1]){
  const {g,p}=fixture();if(team===1){g.humans=2;const opposite=g.player(1,3);g.take(opposite);g.ball.owner=opposite;g.controlled[1]=3;for(const q of g.players)if(q!==opposite){q.x=400;q.y=1100;}opposite.x=1800;opposite.y=770;opposite.cd=0;input.state[0]={};input.justFlags={};}
  const actor=team===0?p:g.player(1,3);
  const set=(state,just={},released={},n=1,dt=.016)=>{input.state[team]=state;input.justFlags=just;input.releaseFlags=released;for(let i=0;i<n;i++){g.updatePlayers(dt);input.justFlags={};input.releaseFlags={};}};
  set({dribble:1,x:0,y:0},{dribble:true}, {}, 1);
  set({dribble:1,x:0,y:0}, {}, {}, 19);
  assert(actor.dribbleHold>=BALL_LIFT_HOLD_SECONDS);
  set({dribble:1,jump:1,x:0,y:0},{jump:true});
  assert.equal(g.ball.owner,null,'ball lifts without ownership');
  assert.equal(g.ball.liftOwner,actor,'only carrier can finish lift');
  assert.equal(actor.z,0,'player stays on the ground during lift');
  assert(g.ball.z>45&&g.ball.vz>0,'ball rises vertically');
  assert.equal(g.ball.shot,null,'no transformation while lifting');
  assert(g.events.some(e=>e.type==='ballLift'));
  set({}, {}, {jump:true,dribble:true});
  set({jump:1}, {jump:true});
  assert(actor.z>0,'second Jump causes real airborne motion');
  set({dribble:1},{dribble:true});set({}, {},{dribble:true});set({dribble:1},{dribble:true});
  assert(g.events.some(e=>e.type==='superBicycleShot'));
  assert.equal(actor.action,'superBicycle');
  assert(g.ball.shot,'specialist super bicycle now shares the regular Super Shot transformation');
  assert.equal(g.ball.liftOwner,null);
  assert(Math.hypot(g.ball.vx,g.ball.vy)>900,'super bicycle is a genuinely strong shot');
  assert.equal(actor.ballLiftWindow,0);
  assert.equal(g.events.filter(e=>e.type==='superBicycleShot').length,1);
  set({dribble:1});
  assert.equal(g.events.filter(e=>e.type==='superBicycleShot').length,1,'no duplicate shots while held');
 }
 // Pressing both quickly is NOT the delayed hold gesture.
 {const {g,p}=fixture();step(g,{dribble:1,jump:1},{dribble:true,jump:true});assert(!g.events.some(e=>e.type==='ballLift'));assert(g.events.some(e=>e.type==='bicycleShot'),'quick chord retains standard bicycle');
  assert.equal(g.ball.liftOwner,undefined);assert.equal(p.ballLiftWindow,0);}
 // Invalid preconditions (not the carrier, goalkeeper, airborne) cannot lift.
 {const {g,p}=fixture();p.z=20;p.dribbleHold=.50;assert.equal(g.tryBallLift(p),false);p.z=0;
  p.stun=.3;assert.equal(g.tryBallLift(p),false);p.stun=0;
  g.ball.owner=null;assert.equal(g.tryBallLift(p),false);}
 // Previous feature must still work: bicycle action from ordinary Jump+Dribble.
 {const {g,p}=fixture();assert.equal(g.tryBicycleShot(p),true);assert(g.events.some(e=>e.type==='bicycleShot'));}
 // Losing the ball or running out of time cancels a primed lift.
 {const {g,p}=fixture();p.dribbleHold=.31;assert(g.tryBallLift(p));
  const enemy=g.player(1,3);g.take(enemy);assert.equal(p.ballLiftWindow,0);assert.equal(g.ball.liftOwner,null);assert.equal(g.trySuperBicycle(p),false);}
 {const {g,p}=fixture();p.dribbleHold=.31;assert(g.tryBallLift(p));
  step(g,{}, {}, {},100,.02);assert.equal(p.ballLiftWindow,0);assert.equal(g.ball.liftOwner,null);}
 console.log('PASS v0.8.21: hold-order lift, both teams, grounded carrier, airborne follow-up, unified special-power shot, no duplicates, invalid states, timeout and possession loss, ordinary bicycle preserved');
}finally{Math.random=originalRandom;}
