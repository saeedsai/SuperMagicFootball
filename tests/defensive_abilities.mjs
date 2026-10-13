import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
import {DEFENCE_MOVES,KEEPER_MOVES,fieldAbility,keeperAbility} from '../src/abilities.js';
const fakeInput={state:[{},{}],poll(){},just(){return false}};
const game=()=>{const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},fakeInput);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});return g;};
const g=game();const iw=g.players.find(x=>x.src.id==='jp4'),hor=g.players.find(x=>x.src.id==='jp3');const cal=g.rosters[0].find(x=>x.id==='jp11');
assert.equal(fieldAbility(iw.src).id,'drill');assert.equal(fieldAbility(hor.src).id,'burst');
assert.equal(keeperAbility(cal).id,'tornadoPunch');assert.equal(keeperAbility(g.players.find(x=>x.src.id==='jp5')?.src).id,'megaPalm');
assert.equal(Object.keys(DEFENCE_MOVES).length,2);assert.equal(Object.keys(KEEPER_MOVES).length,2);
assert.equal(fieldAbility(g.players.find(x=>x.src.id==='jp1').src),null);
// Drill charge: positioned adjacent to attacker, knockdown, ball dislodged, cost and cooldown.
let victim=g.player(1,2);iw.x=1000;iw.y=600;victim.x=1110;victim.y=610;victim.invuln=0;victim.stun=0;g.take(victim);const fat=iw.fatigue;
assert.equal(g.activateDefence(iw),true);assert.equal(g.ball.owner,null);assert.ok(victim.stun>0);assert.equal(iw.action,'defenceSuper');assert.ok(iw.abilityCd>7);assert.ok(iw.fatigue>fat);assert.equal(g.activateDefence(iw),false,'cooldown must prevent replay');
// Re-enable after cooldown, range check and strength resistance.
iw.abilityCd=0;victim.invuln=0;victim.stun=0;victim.x=2200;victim.y=800;for(const other of g.players.filter(q=>q.t===1&&q!==victim)){other.x=3000;other.y=1100;}assert.equal(g.activateDefence(iw),false,'no target in range');assert.equal(iw.abilityCd,0,'failed activation should not spend cooldown');
// Shock burst can hit multiple targets simultaneously.
hor.x=1600;hor.y=700;const targets=[g.player(1,1),g.player(1,3)];targets[0].x=1650;targets[0].y=700;targets[1].x=1570;targets[1].y=740;for(const t of targets){t.stun=0;t.invuln=0;}assert.equal(g.activateDefence(hor),true);assert.ok(targets.every(t=>t.stun>.2));assert.ok(hor.abilityCd>8);assert.equal(g.activateDefence(hor),false);
// Keeper abilities are playable independently of ability metadata. Need incoming loose shot.
const k=g.player(0,0);k.x=WORLD.field.x+35;k.y=680;g.ball.owner=null;g.ball.x=k.x+120;g.ball.y=k.y+30;g.ball.z=40;g.ball.vx=-600;g.ball.vy=0;g.ball.vz=0;g.ball.shot={behavior:'curve'};g.ball.attacker=1;
assert.equal(g.activateKeeperSuper(k,true),true);assert.ok(g.ball.vx>0,'outgoing ball must travel away from own goal');assert.equal(g.ball.shot,null);assert.equal(g.ball.attacker,0);assert.equal(k.action,'keeperSuper');assert.ok(k.abilityCd>8);assert.equal(g.activateKeeperSuper(k,true),false);
const keepFat=k.fatigue,keepCd=k.abilityCd;g.resetKickoff(0);assert.equal(g.player(0,0).abilityCd,keepCd,'keeper cooldown persists after kickoff');assert.equal(g.player(0,0).fatigue,keepFat,'fatigue persists after kickoff');
// Injury/stun and exhausted stamina must block activation.
let back=g.players.find(x=>x.src.id==='jp4');back.stun=1;assert.equal(g.activateDefence(back),false);back.stun=0;back.abilityCd=0;back.fatigue=.99;assert.equal(g.activateDefence(back),false);
// No unassigned magic goalkeeper skill for generic opponents.
assert.equal(keeperAbility(g.player(1,0).src),null);
// Regression: original arcade shot still available for normal shooting players.
const shooter=g.player(0,3);g.take(shooter);shooter.specialCd=0;g.shoot(shooter,true);assert.equal(g.ball.shot.id,shooter.src.shot);
console.log('v0.8.0 DEFENSIVE/GK ABILITIES PASS: 2 field + 2 GK; collisions, stamina, cooldowns, keeper clearance, persistence, no-regression shots');
