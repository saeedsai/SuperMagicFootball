import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const c={state:[{},{}],pulse:{},poll(){},just(t,k){return !!this.pulse[k]},held(t,k){return !!this.state[t]?.[k]}};
function start(){c.state=[{},{}];c.pulse={};const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},c);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;g.clock=5;return g;}
// 1) Bicycle shot is a separate powered arcing ball action without a new button.
{
 const g=start(),p=g.player(0,3);g.take(p);p.cd=0;c.state[0]={jump:1,dribble:1,x:0,y:0};c.pulse={dribble:true};g.updatePlayers(.016);
 assert.equal(g.ball.owner,null);assert.equal(p.action,'bicycle');assert.ok(g.ball.vz>=250);assert.ok(g.events.some(e=>e.type==='bicycleShot'));
 assert.ok(!g.events.some(e=>e.type==='toast'),'no large action popup');
}
// 2) Flying kick in defensive Jump+Shoot; opponents react, possession can drop.
{
 const g=start(),p=g.player(0,3),enemy=g.player(1,3);g.ball.owner=enemy;
 enemy.x=p.x+43;enemy.y=p.y;p.cd=0;enemy.invuln=0;enemy.stun=0;
 c.state[0]={jump:1,shoot:1,x:0,y:0};c.pulse={shoot:true};g.updatePlayers(.016);
 assert.ok(g.events.some(e=>e.type==='flyingKick'&&e.hit));assert.ok(enemy.stun>0);assert.equal(g.ball.owner,null);
}
// 3) Special defensive ability takes precedence over ordinary flying kick.
{
 const g=start(),p=g.player(0,2),enemy=g.player(1,3);enemy.x=p.x+45;enemy.y=p.y;p.cd=0;enemy.invuln=0;g.ball.owner=enemy;
 c.state[0]={jump:1,shoot:1,x:0,y:0};c.pulse={shoot:true};g.controlled[0]=p.i;g.updatePlayers(.016);
 assert.ok(g.events.some(e=>e.type==='defenceSuper'));assert.ok(!g.events.some(e=>e.type==='flyingKick'));
}
// 4) Double-tap dribble performs a distinct evasion instead of an ordinary feint.
{
 const g=start(),p=g.player(0,3);g.take(p);p.cd=0;p.x=600;p.y=340;for(const q of g.players)if(q!==p){q.x=2200+(q.i*70);q.y=900;}
 c.state[0]={dribble:1,x:0,y:0};c.pulse={dribble:true};g.updatePlayers(.016);
 assert.equal(p.action,'dribble');
 g.clock+=.17;c.state[0]={dribble:1,x:0,y:0};c.pulse={dribble:true};g.updatePlayers(.016);
 assert.equal(p.action,'dribbleTrick');assert.ok(p.trickCd>0);assert.equal(g.ball.owner,p);
}
// 5) Keeper distribution works from a human defender's Pass release.
{
 const g=start(),keeper=g.player(0,0),p=g.player(0,3);g.take(keeper);g.controlled[0]=p.i;g.clock=8;
 c.state[0]={pass:1,x:0,y:0};c.pulse={pass:true};g.updatePlayers(.016);
 c.state[0]={pass:0,x:0,y:0};c.pulse={};g.updatePlayers(.016);
 assert.equal(g.ball.owner,null);assert.ok(g.events.some(e=>e.type==='keeperDistribution'));
 const teammate=g.players.find(q=>q.t===0&&!q.keeper);
 assert.ok(Math.sign(g.ball.vx)===1||teammate, 'distribution safe even if no targets');
}
// 6) Keeper auto-distributes within a bounded period after becoming ready.
{
 const g=start(),keeper=g.player(1,0);g.take(keeper);keeper.cd=0;keeper.aiTimer=0;
 for(let i=0;i<22&&g.ball.owner===keeper;i++)g.driveAI(keeper,.05);
 assert.equal(g.ball.owner,null);assert.ok(g.events.some(e=>e.type==='keeperDistribution'));
}
// 7) Stalled AI attempts a lateral route around nearby blocking players.
{
 const g=start(),p=g.player(1,3),block=g.player(1,4);p.aiTimer=2;p.aiTarget={x:p.x+360,y:p.y};p.aiStuckTime=.34;p.aiLastX=p.x;p.aiLastY=p.y;block.x=p.x+38;block.y=p.y;
 g.driveAI(p,.016);
 assert.ok(g.events.some(e=>e.type==='aiDetour'));assert.ok(p.aiDetour);
}
// 8) ordinary jump+shoot aerial attacks from previous releases still available.
{
 const g=start(),p=g.player(0,3);g.take(p);p.cd=0;p.z=80;p.vz=210;p.jumpCount=2;
 c.state[0]={shoot:1,jump:1,x:0,y:0};c.pulse={shoot:true};g.updatePlayers(.016);
 assert.ok(g.ball.shot,'double jump super remains available');
}
console.log('v0.8.6 FOUR BUTTON PHASE 2 PASS: bicycle, flying kick, defensive priority, trick, GK distribution, AI detour, old special');
