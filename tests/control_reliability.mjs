import assert from 'node:assert/strict';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],down:{},up:{},poll(){},held(t,k){return !!this.state[t]?.[k]},just(t,k){return !!this.down[k]},released(t,k){return !!this.up[k]}};
function make(){input.state=[{},{}];input.down={};input.up={};const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;g.coordinateAiCombos=()=>{};g.driveAI=()=>{};return g;}
function set(s={},down={},up={}){input.state[0]=s;input.down=down;input.up=up;}
{
 const g=make(),p=g.player(0,3);g.take(p);p.cd=0;
 set({pass:1},{pass:true});g.updatePlayers(.016);assert.equal(g.ball.owner,p);
 set({}, {},{pass:true});g.updatePlayers(.016);
 assert.equal(g.ball.owner,null,'ordinary pass on release must free the ball');
}
{
 const g=make(),p=g.player(0,3);g.take(p);p.cd=0;
 set({}, {pass:true},{pass:true});g.updatePlayers(.016);
 assert.equal(g.ball.owner,null,'a press/release pair between rendered frames must still pass');
}
{
 const g=make(),p=g.player(0,3);g.take(p);p.cd=0;
 for(let i=0;i<22;i++){set({pass:1,x:0,y:0},i===0?{pass:true}:{});g.updatePlayers(.016)}
 set({}, {},{pass:true});g.updatePlayers(.016);
 assert.equal(g.ball.owner,null);assert.ok(g.ball.vz>=150,'holding Pass makes an aerial long pass');
}
{
 const g=make(),p=g.player(0,3);g.take(p);p.cd=0;
 set({}, {shoot:true},{shoot:true});g.updatePlayers(.016);
 assert.equal(g.ball.owner,null,'very fast Shoot tap must trigger a normal shot');
}
{
 const g=make(),p=g.player(0,3);g.take(p);p.cd=0;
 set({x:1,y:0},{jump:true},{jump:true});g.updatePlayers(.016);
 assert.equal(p.jumpCount,1,'very fast moving Jump tap must jump exactly once, not double-jump');
}
{
 const g=make(),p=g.player(0,3);g.take(p);p.cd=0;p.z=0;p.vz=0;p.fatigue=0;
 set({jump:1,x:1,y:0},{jump:true});g.updatePlayers(.016);
 assert.ok(p.z<3,'holding Jump while running with the ball must not launch immediately');
 for(let i=0;i<21;i++){set({jump:1,x:1,y:0});g.updatePlayers(.016)}
 assert.equal(p.jumpCount,0,'holding Jump for sprint never initiates a jump');
 set({x:1,y:0},{},{jump:true});g.updatePlayers(.016);
 assert.equal(p.jumpCount,0,'releasing the sprint must not trigger a late jump');
}
{
 const g=make(),p=g.player(0,3);g.take(p);p.cd=0;
 set({jump:1,x:1},{jump:true});g.updatePlayers(.016);
 set({x:1},{},{jump:true});g.updatePlayers(.016);
 assert.equal(p.jumpCount,1,'short Jump tap must still work when moving with the ball');
}
{
 const g=make(),p=g.player(0,3);g.ball.owner=g.player(1,3);g.controlled[0]=p.i;
 set({dribble:1},{dribble:true});g.updatePlayers(.016);
 assert.notEqual(g.controlled[0],p.i,'defensive Dribble is a manual switch');
 assert.ok(g.manualSwitchGrace[0]>.5,'manual switch must be protected from immediate auto switch');
}
{
 const g=make(),p=g.player(0,3),near=g.players.find(q=>q.t===0&&!q.keeper&&q!==p);
 g.ball.owner=null;g.ball.x=2850;g.ball.y=690;p.x=1250;p.y=690;near.x=2800;near.y=690;
 g.controlled[0]=p.i;g.manualSwitchGrace[0]=0;
 set({x:1,y:0});assert.equal(g.autoSwitch(0,.19),false);
 assert.equal(g.autoSwitch(0,.19),true,'auto switch must work while joystick is steering');
 assert.equal(g.controlled[0],near.i);
}
console.log('v0.8.17 CONTROL RELIABILITY PASS — short/long/rapid passing, jump run/tap, manual switch grace, steering auto-switch');

// Very short tapped Jump while defending now jumps; long hold remains defensive sprint.
{
 const g=make(),p=g.player(0,3);g.ball.owner=g.player(1,3);g.controlled[0]=p.i;
 set({x:1,jump:1},{jump:true});g.updatePlayers(.016);
 assert.equal(p.jumpCount,0,'defensive Jump should defer until tap vs hold is known');
 set({x:1},{},{jump:true});g.updatePlayers(.016);
 assert.equal(p.jumpCount,1,'defensive short Jump should never be silently ignored');
}

// Goalkeeper no longer requires a human Jump command to defend.
{
 const g=make(),keeper=g.player(0,0),b=g.ball;
 g.humans=2;g.ball.owner=null;keeper.x=190;keeper.y=670;keeper.diveCooldown=keeper.stun=0;
 b.x=keeper.x+80;b.y=keeper.y+8;b.z=45;b.vx=-90;b.vy=0;b.vz=0;b.attacker=1;b.canCollect=.7;b.power=65;
 set({},{},{});g.updateBall(.001);
 assert(keeper.diveCooldown>0,'keeper must dive autonomously for human-controlled team');
 assert(g.events.some(e=>e.type==='keeperDive'&&!e.manual));
}
