import assert from 'node:assert/strict';
import {GameEngine} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
function create(){
 const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
 g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'},humans:2});
 g.cooldown=0;
 // Clear all opponents from selection unless the individual test positions them.
 return g;
}
for(const team of [0,1]){
 const g=create(),k=g.player(team,0);g.take(g.player(team,3));
 assert(g.keeperCollect(k,'test'));
 assert.equal(g.ball.owner,k);
 assert.equal(k.action,'keeperCatch');
 assert.equal(k.keeperHold,0);
 assert.equal(g.events.at(-1).type,'keeperCatch');
 // Keeper possession is reset for both directions when caught after play.
 k.keeperHold=.9;
 g.take(k);assert.equal(k.keeperHold,0);
 // Unpressured safe short throws.
 for(const enemy of g.players.filter(p=>p.t!==team)){enemy.x=team===0?3300:300;enemy.y=1200;}
 const receiver=g.player(team,2);receiver.x=k.x+(team===0?285:-285);receiver.y=k.y;
 assert(g.distributeKeeper(k,'short'));
 let event=g.events.filter(e=>e.type==='keeperDistribution').at(-1);
 assert.equal(event.mode,'short');assert.equal(k.action,'keeperThrow');
 assert(g.ball.vz<150);assert(g.ball.owner===null);
 assert.equal(k.keeperHold,0);
 // Under pressure, explicit short pass is overridden by safe long punt.
 g.take(k);
 const attacker=g.player(1-team,3);
 attacker.x=k.x+(team===0?100:-100);attacker.y=k.y;
 assert(g.distributeKeeper(k,'short'));
 event=g.events.filter(e=>e.type==='keeperDistribution').at(-1);
 assert.equal(event.mode,'long');assert(event.pressured);
 assert.equal(k.action,'keeperPunt');assert(g.ball.vz>=300);
 assert(g.ball.vx*(team===0?1:-1)>0,'long clearance must advance away from own goal');
}
// A marked receiver cannot be chosen for a short throw; select long even without
// pressure near the keeper. The defender sits between keeper and receiver.
{
 const g=create(),k=g.player(0,0);g.take(k);
 const mates=g.players.filter(p=>p.t===0&&!p.keeper);
 for(const m of mates){m.x=k.x+500;m.y=k.y;}
 for(const enemy of g.players.filter(p=>p.t===1)){enemy.x=k.x+390;enemy.y=k.y;}
 assert(g.distributeKeeper(k,'auto'));
 assert.equal(g.events.filter(e=>e.type==='keeperDistribution').at(-1).mode,'long');
}
// Safe goalkeepers hold the catch then distribute automatically even when the team
// has a human controller. The action should not require any fifth keeper button.
{
 const g=create(),k=g.player(0,0);g.keeperCollect(k);
 for(const enemy of g.players.filter(p=>p.t===1)){enemy.x=3100;enemy.y=1100;}
 g.realDriveAI=g.driveAI.bind(g);k.keeperHold=.7;k.cd=0;
 g.realDriveAI(k,.016);
 assert.equal(g.ball.owner,null);
 assert(g.events.some(e=>e.type==='keeperDistribution'));
}
// Low force dive saves should be caught rather than rebounding; high force dives
// may parry and should leave the ball loose. Both teams dive without input.
for(const team of [0,1]){
 const g=create(),k=g.player(team,0),b=g.ball;
 b.owner=null;b.attacker=1-team;b.shot=null;b.x=k.x+(team===0?48:-48);b.y=k.y;
 b.z=12;b.vx=team===0?-210:210;b.vy=0;b.power=3;k.diveCooldown=0;
 assert(g.tryKeeperDive(k));assert.equal(g.ball.owner,k);
 assert.equal(k.action,'keeperDiveCatch'); // diving catch now retains its directional animation
 assert(g.events.some(e=>e.type==='keeperDive'&&e.manual===false));
 g.ball.owner=null;b.attacker=1-team;b.x=k.x+(team===0?25:-25);b.y=k.y;
 b.z=12;b.vx=team===0?-1250:1250;b.vy=0;b.power=110;k.diveCooldown=0;
 assert(g.tryKeeperDive(k));assert.equal(g.ball.owner,null);
 assert(g.events.some(e=>e.type==='save'&&e.deflected));
}
console.log('v0.8.19 GOALKEEPERS: catches/throws/punts/pressure/blocked lanes/auto saves both teams: PASS');
