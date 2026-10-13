import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const control={state:[{},{}],pulse:{},poll(){},held(t,a){return !!this.state[t]?.[a]},just(t,a){return !!this.pulse[a]}};
function setup(){control.state=[{},{}];control.pulse={};const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},control);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;return g;}
{
 const g=setup(),p=g.player(0,3);g.take(p);g.events.length=0;
 g.shoot(p,true);assert.ok(g.ball.shot,'special still fires');assert.ok(!g.events.some(e=>e.type==='toast'),'super shots do not display popups');
}
{
 const g=setup(),p=g.player(0,3);g.take(p);
 const keeper=g.players.find(q=>q.t===1&&q.keeper);keeper.y=WORLD.goalTop+22;
 const random=Math.random;Math.random=()=>.5;
 try{
  p.src.shootAccuracy=100;g.shoot(p,false);
  const high=p.y+g.ball.vy/g.ball.vx*(WORLD.field.x+WORLD.field.w-p.x);
  g.take(p);p.src.shootAccuracy=18;g.shoot(p,false);
  const low=p.y+g.ball.vy/g.ball.vx*(WORLD.field.x+WORLD.field.w-p.x);
  assert.ok(high>low+55,'high accuracy intentionally selects far uncovered corner');
 }finally{Math.random=random}
}
{
 const g=setup(),p=g.player(0,3);g.take(p);p.cd=0;
 g.dribble(p);assert.equal(p.action,'dribble');
 g.ball.owner=null;g.controlled[0]=3;g.dribble(p);assert.notEqual(g.controlled[0],3,'defensive dribble switches player');
}
{
 const g=setup(),p=g.player(0,3);g.take(p);p.x=1800;p.y=680;
 g.ball.owner=null;g.ball.x=3000;g.ball.y=670;g.controlled[0]=3;
 const near=g.players.find(q=>q.t===0&&!q.keeper&&q!==p);near.x=2990;near.y=670;
 assert.equal(g.autoSwitch(0,.15),false,'auto-switch is delayed, preventing sudden control jumps');
 assert.equal(g.autoSwitch(0,.5),true);assert.equal(g.controlled[0],near.i);
 g.controlled[0]=3;control.state[0]={sprint:1};assert.equal(g.autoSwitch(0),false,'sprinting manual control is respected');
}
{
 const g=setup(),p=g.player(0,3);g.take(p);p.fatigue=0;
 assert.ok(g.jump(p));p.z=70;p.vz=170;assert.ok(g.jump(p));assert.equal(p.jumpCount,2);
 control.state[0]={shoot:1,jump:1,x:0,y:0};control.pulse={shoot:true};g.cooldown=0;p.cd=0;
 g.updatePlayers(.016);assert.ok(g.ball.shot,'four-button double Jump + Shoot fires a transformed special');
}
{
 const g=setup(),p=g.player(0,3);g.take(p);p.cd=0;
 control.state[0]={pass:1,jump:1,x:0,y:0};control.pulse={jump:true};g.updatePlayers(.016);
 assert.ok(g.ball.owner===null&&g.ball.vz>190,'holding Pass + pressing Jump crosses the ball');
}
{
 const g=setup(),p=g.player(0,3);g.take(p);
 control.state[0]={pass:1};control.pulse={pass:true};g.updatePlayers(.016);
 assert.equal(g.ball.owner,p,'pass only fires on release');
 control.state[0]={pass:0};control.pulse={};g.updatePlayers(.016);
 assert.equal(g.ball.owner,null,'short Pass works on release');
}
console.log('v0.8.4 FOUR BUTTON CONTROLS PASS: no super popups, keeper-aware aim, dribble/switch, auto-switch, double jump super, cross, pass tap');
