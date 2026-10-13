import assert from 'node:assert/strict';
import {TEAMS,SHOTS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {withStats} from '../src/stats.js';
import {abilityLevel,levelModifiers,shotVelocityModifier,LEVEL_FIVE_STARS,LEVEL_FOUR_STARS} from '../src/special_levels.js';
import {GameEngine,WORLD} from '../src/engine.js';
import {actionFatigue} from '../src/fitness.js';
import {abilityReady,DEFENCE_MOVES} from '../src/abilities.js';
const input={state:[{},{}],poll(){},just(){return false}};
const game=()=>{const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;return g;};
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
assert.equal(TEAMS.length,216);
const high4=new Set(),high5=new Set();let entries=0;
for(const [i,t] of TEAMS.entries())for(const p of (t.customRoster||rosterFor(i))){
 const s=withStats(p);entries++;
 for(const key of ['superShotLevel','superDefenceLevel','gkSuperLevel'])assert(Number.isInteger(s[key])&&s[key]>=1&&s[key]<=5,`${t.name}/${p.name} ${key}`);
 if(s.superShotLevel===4)high4.add(p.name);
 if(s.superShotLevel===5)high5.add(p.name);
 if(s.fictional)assert.equal(s.superShotLevel,1,'Academy placeholders must not get high levels');
}
assert.equal(entries,2592);
assert(high5.size>0&&high5.size<=4,'Level 5 is limited to four unique superstar identities');
assert(high4.size>0&&high4.size<=12,'Level 4 is limited to twelve named stars');
for(const name of high5)assert(LEVEL_FIVE_STARS.includes(name));
for(const name of high4)assert(LEVEL_FOUR_STARS.includes(name));
for(let lvl=1;lvl<=5;lvl++){const m=levelModifiers(lvl);assert.equal(m.level,lvl);assert(m.power>=1&&m.power<=1.23);assert(m.fatigue>=.67999&&m.fatigue<=1);if(lvl>1){assert(m.power>levelModifiers(lvl-1).power);assert(m.fatigue<levelModifiers(lvl-1).fatigue);}}
assert.equal(shotVelocityModifier('fish',5),1,'Fish must not become a guaranteed fast shot');
assert.equal(shotVelocityModifier('ghost',5),1);
assert(shotVelocityModifier('cannon',5)>1);
assert.equal(abilityLevel({name:'Lionel Messi',fictional:true,rating:99},'shot'),1);
assert.equal(abilityLevel({name:'Lionel Messi',rating:91},'shot'),5);
assert.equal(abilityLevel({name:'Lionel Messi',rating:91,superShotLevel:2},'shot'),2,'Saved/manual override wins');
assert.equal(abilityLevel({name:'Erling Haaland',rating:92,superShotLevel:9},'shot'),5,'Bad overrides are ignored');
const cost1=actionFatigue(0,75,'super',levelModifiers(1).fatigue),cost5=actionFatigue(0,75,'super',levelModifiers(5).fatigue);
assert(cost1>cost5&&cost5>0);
// Real shot mechanics: same shot type, power & movement, different tiers.
function shotAtLevel(lvl){const g=game(),p=g.player(0,3);p.src={...p.src,superShotLevel:lvl};g.take(p);g.shoot(p,true);return {power:g.ball.power,speed:Math.hypot(g.ball.vx,g.ball.vy),fatigue:p.fatigue,shot:g.ball.shot};}
const s1=shotAtLevel(1),s5=shotAtLevel(5);
assert(s5.power>s1.power*1.19,'Higher level increases shot impact');
assert(s5.fatigue<s1.fatigue,'Higher level lowers super fatigue');
assert.equal(s1.shot.id,s5.shot.id,'Existing transformation is preserved');
// Defensive special: same move, larger stun and smaller stamina cost on level 5.
function defendAtLevel(lvl){const g=game(),p=g.players.find(q=>q.src.id==='jp4'),victim=g.player(1,2);p.src={...p.src,superDefenceLevel:lvl};p.x=1000;p.y=600;victim.x=1110;victim.y=610;victim.invuln=0;victim.stun=0;g.take(victim);assert(g.activateDefence(p));return {stun:victim.stun,fatigue:p.fatigue,level:g.events.filter(e=>e.type==='defenceSuper').at(-1).level};}
const d1=defendAtLevel(1),d5=defendAtLevel(5);assert(d5.stun>d1.stun);assert(d5.fatigue<d1.fatigue);assert.equal(d5.level,5);
// Keeper specials scale strength and preserve the shot clearance rules.
function keeperAtLevel(lvl){const g=game(),p=g.player(0,0);p.src={...p.src,gkSuperLevel:lvl};p.x=WORLD.field.x+30;p.y=700;g.ball.owner=null;g.ball.x=p.x+90;g.ball.y=p.y;g.ball.z=50;g.ball.attacker=1;g.ball.vx=-500;assert(g.activateKeeperSuper(p,true));return {vx:g.ball.vx,fatigue:p.fatigue,level:g.events.filter(e=>e.type==='keeperSuper').at(-1).level};}
const k1=keeperAtLevel(1),k5=keeperAtLevel(5);assert(k5.vx>k1.vx);assert(k5.fatigue<k1.fatigue);assert.equal(k5.level,5);
// Readiness has matching stamina discount for rare defence moves.
const possible={src:{superAbility:{type:'defence',id:'drill'},superDefenceLevel:5},fatigue:.935,stun:0,abilityCd:0,keeper:false};
assert(abilityReady(possible,DEFENCE_MOVES.drill),'Level 5 lower cost supports readiness');
possible.src.superDefenceLevel=1;assert(!abilityReady(possible,DEFENCE_MOVES.drill));
console.log(`v0.8.16 SPECIAL TIERS PASS — ${entries} roster entries; ${high4.size} level-4 names; ${high5.size} level-5 names; impact, fatigue, defence, keeper, override and slow-shot invariants`);
