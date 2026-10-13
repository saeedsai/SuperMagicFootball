import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false}};
const make=()=>{const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});return g;};
const g=make();
const runner=g.player(0,3),defender=g.player(1,2);
// Dash must have its own limited duration, cooldown and meaningful fatigue cost.
runner.z=0;runner.stun=0;runner.fatigue=0;runner.dashCooldown=0;
const originalFatigue=runner.fatigue;
assert.equal(g.triggerHyperdash(runner),true);
assert.ok(runner.dashTimer>.5&&runner.dashCooldown>4);
assert.ok(runner.fatigue>originalFatigue);
assert.equal(g.triggerHyperdash(runner),false,'cannot spam dash while active');
const dashCd=runner.dashCooldown;
g.resetKickoff(0);assert.equal(g.player(0,3).dashCooldown,dashCd,'dash cooldown survives goal kickoff');
const r=g.player(0,3);r.dashCooldown=0;r.dashTimer=0;r.fatigue=.88;
assert.equal(g.triggerHyperdash(r),false,'exhaustion blocks hyperdash');
r.fatigue=0;r.z=0;r.dashCooldown=0;
// The sprint combination must activate by sustained input, not instantaneously.
g.take(defender);defender.x=2300;defender.y=300;
// Isolate sprint mechanics from the newly physical, separately tested collision system.
for(const opponent of g.players.filter(p=>p.t===1)){opponent.x=2750;opponent.y=350+opponent.i*75;}
input.state[0]={x:1,y:0,sprint:1};
for(let i=0;i<36;i++)g.update(.02);
assert.ok(r.dashCooldown>3.0,'sprinting plus moving should activate hyperdash');
// Air heading depends on timed overlap in three dimensions, not any shoot press.
const g2=make(),h=g2.player(0,3),b=g2.ball;
b.owner=null;b.attacker=1;b.shot=null;h.stun=0;h.cd=0;
h.x=1200;h.y=550;h.z=73;
b.x=1240;b.y=552;b.z=102;b.vx=-120;b.vy=0;b.vz=0;
const before=h.fatigue;
assert.equal(g2.tryHeader(h),true,'close airborne ball must be heading target');
assert.equal(h.action,'header');assert.equal(b.attacker,0);
assert.equal(b.shooter,h.src.name);assert.ok(b.vx>350);
assert.ok(h.fatigue>before);
assert.equal(g2.tryHeader(h),false,'cooldown prevents repeated headers');
h.cd=0;h.z=0;assert.equal(g2.tryHeader(h),false,'ground players cannot head with this aerial move');
h.z=70; b.x=h.x+220;b.z=101;assert.equal(g2.tryHeader(h),false,'out of range cannot head');
// Jump + shoot command can perform a header during normal gameplay.
h.cd=0;b.x=h.x+30;b.y=h.y;b.z=100;b.owner=null;b.attacker=1;
g2.command(h,'shoot');assert.equal(h.action,'header');
// All keepers have regular dives, without the rare super ability skill.
const g3=make(),keeper=g3.player(1,0);assert.ok(keeper.keeper);
const ball=g3.ball;keeper.x=WORLD.field.x+WORLD.field.w-35;keeper.y=680;
ball.owner=null;ball.attacker=0;ball.shot=null;ball.x=keeper.x-92;ball.y=keeper.y+40;ball.z=75;ball.vx=680;ball.vy=12;ball.vz=0;ball.power=125;
keeper.diveCooldown=0;keeper.fatigue=0;
assert.equal(g3.tryKeeperDive(keeper,true),true);
assert.equal(keeper.action,'keeperDive');assert.ok(keeper.diveCooldown>2);
assert.equal(ball.attacker,1,'successful dive deflects shot in favor of goalkeeper team');
assert.ok(ball.vx<0,'goalkeeper deflection travels out of own goal');
assert.equal(g3.tryKeeperDive(keeper,true),false,'dive cannot be spammed');
const diveCd=keeper.diveCooldown;g3.resetKickoff(0);
assert.equal(g3.player(1,0).diveCooldown,diveCd,'dive cooldown survives goal kickoff');
const k=g3.player(1,0);k.diveCooldown=0;
ball.owner=null;ball.attacker=0;ball.x=k.x-70;ball.y=k.y+20;ball.z=300;ball.vx=500;
assert.equal(g3.tryKeeperDive(k),false,'too-high ball outside reach');
ball.z=30;ball.vx=-500;assert.equal(g3.tryKeeperDive(k),false,'keeper does not dive at ball moving away');
// Existing rare goalkeeper saves still remain callable and separate.
const g4=make(),rare=g4.player(0,0);rare.x=WORLD.field.x+35;rare.y=680;
g4.ball.owner=null;g4.ball.attacker=1;g4.ball.x=rare.x+100;g4.ball.y=rare.y;g4.ball.z=25;
assert.equal(g4.activateKeeperSuper(rare,true),true);
console.log('v0.8.1 AERIAL TEST PASS: hyperdash duration/cooldown/fatigue, timed heading, ordinary GK dives, save direction, old rare abilities');
