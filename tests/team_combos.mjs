import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},held(){return false}};
const make=()=>{const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});return g};
const g=make(),p=g.player(0,3),ally=g.player(0,4),enemy=g.player(1,3);
// Controlled launch requires a nearby grounded teammate and appropriate energy.
g.ball.owner=null;p.x=1400;p.y=650;ally.x=p.x+55;ally.y=p.y+10;ally.z=0;ally.stun=0;ally.cd=0;ally.fatigue=0;p.stun=0;p.fatigue=0;p.z=0;p.vz=0;p.comboCooldown=0;
assert.equal(g.tryTeammateLaunch(p),true);
assert.equal(p.assistBy,ally.src.name);assert.equal(p.comboActive,true);assert.ok(p.vz>=600);
assert.equal(ally.action,'assistBoost');assert.ok(ally.fatigue>0&&p.fatigue>0);
assert.equal(g.tryTeammateLaunch(p),false,'cooldown and air prevent repeated launch');
const cd=p.comboCooldown;g.resetKickoff(0);assert.equal(g.player(0,3).comboCooldown,cd,'cooldown survives a goal / kickoff');
const g2=make(),jumper=g2.player(0,3),donor=g2.player(0,4),ball=g2.ball;
ball.owner=null;jumper.x=1400;jumper.y=650;donor.x=1460;donor.y=650;donor.cd=0;donor.z=0;
jumper.fatigue=0;donor.fatigue=0;
input.held=(t,a)=>a==='pass';
g2.command(jumper,'jump');assert.equal(jumper.comboActive,false,'human Pass + Jump no longer auto-launches');
jumper.z=0;jumper.vz=0;jumper.cd=0;assert.equal(g2.tryTeammateLaunch(jumper),true,'legacy AI team launch remains internally available');
const fatigueBefore=jumper.fatigue;
// Near the apex, transforming super shot retains its underlying original character profile.
jumper.z=218;jumper.vz=100;jumper.cd=0;ball.owner=null;ball.x=jumper.x+22;ball.y=jumper.y;ball.z=230;ball.attacker=1;
g2.command(jumper,'special');
assert.equal(jumper.action,'comboSuper');assert.ok(ball.shot?.id,'transformed ball metadata retained');
assert.equal(ball.attacker,0);assert.ok(ball.vx>0);assert.equal(ball.shooter,jumper.src.name);assert.ok(jumper.fatigue>fatigueBefore);
const superCd=jumper.specialCd;assert.ok(superCd>3);
assert.equal(g2.tryFlipKick(jumper,true),false,'one-shot cooldown prevents re-kicking');
// Too early or too late makes an ordinary volley, not a special transformation.
const g3=make(),k=g3.player(0,3),b=g3.ball;
b.owner=null;k.z=160;k.vz=490;k.cd=0;k.comboActive=true;k.comboWindow=.8;b.x=k.x+10;b.y=k.y;b.z=173;b.attacker=1;
assert.equal(g3.tryFlipKick(k,true),true);assert.equal(k.action,'flipKick');assert.equal(b.shot,null,'mistimed super does not transform');
// A normal jump can still flip kick but cannot invent a special without a teammate.
const g4=make(),f=g4.player(0,3),b4=g4.ball;
b4.owner=null;f.z=125;f.vz=0;f.cd=0;b4.x=f.x+30;b4.y=f.y;b4.z=132;
assert.equal(g4.tryFlipKick(f,true),true);assert.equal(b4.shot,null);assert.equal(f.action,'flipKick');
// Stomp landing produces a stagger and can strip the opposing ball carrier.
const g5=make(),stomper=g5.player(0,3),e=g5.player(1,3);
stomper.x=1400;stomper.y=700;stomper.z=3;stomper.vz=-150;stomper.comboActive=true;stomper.comboWindow=.5;
e.x=1430;e.y=710;e.stun=0;e.invuln=0;g5.take(e);
g5.updatePlayers(.034);
assert.equal(stomper.comboActive,false);assert.ok(e.stun>.1,'collision applies knockdown');assert.equal(g5.ball.owner,null,'stomp dislodges ball carrier');
// Blocked actions must not burn a move or alter gameplay when no teammate is nearby.
const g6=make(),l=g6.player(0,3);g6.ball.owner=null;l.x=1250;l.y=350;
for(const q of g6.players)if(q.t===0&&q!==l){q.x=2500;q.y=1000;}
assert.equal(g6.tryTeammateLaunch(l),false);assert.equal(l.comboCooldown,0);
const normal=g6.jump(l);assert.equal(normal,true);assert.equal(l.comboActive,false);
console.log('v0.8.2 TEAM COMBOS PASS: launch eligibility, stamina, cooldown continuity, apex special, mistimed flip, solo flip, landing collision, normal jump');
