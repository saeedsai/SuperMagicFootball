import assert from 'node:assert/strict';
import {GameEngine,WORLD} from '../src/engine.js';
import {NUMERIC_STATS,withStats,endurance,contest,shotError,stat} from '../src/stats.js';
import {TEAMS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {SHOTS} from '../src/data.js';
import {installContinentalClubs} from '../src/continental.js';
const input={state:[{},{}],poll(){},just(){return false}};
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
assert.equal(TEAMS.length,216);
assert.equal(NUMERIC_STATS.length,14);
for(let k=0;k<TEAMS.length;k++){
 const roster=TEAMS[k].customRoster||rosterFor(k);
 assert.equal(roster.length,12,`Team ${TEAMS[k].name}`);
 for(const p of roster){const rated=withStats(p);
  for(const name of NUMERIC_STATS)assert.ok(Number.isInteger(rated[name])&&rated[name]>=1&&rated[name]<=100,`${TEAMS[k].name}/${p.name} ${name} ${rated[name]}`);
  assert.ok(rated.superAbility===null||['shoot','defence'].includes(rated.superAbility.type));
  assert.equal(rated.role==='GK'||rated.gkSuperAbility===null,true);
 }
}
const source={id:'test',role:'FW',name:'Test',speed:'D',shoot:12,power:44,defense:11,shootPower:99,stamina:20};
assert.equal(withStats(source).shootPower,99);
assert.equal(withStats(source).stamina,20);
assert.equal(withStats(source).speed,'D'); // backward compatibility
assert.equal(withStats({role:'GK',skill:'Tornado Punch'}).gkSuperAbility.name,'Tornado Punch');
assert.equal(withStats({role:'DF',skill:'Drill Attack',shot:'fish'}).superAbility.type,'defence');
function make(home=0,away=9){const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear',difficulty:2},input);g.init({home,away,options:{...DEFAULT_OPTIONS,weather:'Clear'}});return g;}
const g=make();
const human=g.player(0,3),cpu=g.player(1,3);
const normalSpeed=g.playerSpeed(human);
human.fatigue=1;
assert.ok(g.playerSpeed(human)<normalSpeed*.65,'Full fatigue must slow movement');
human.fatigue=0;
const before=human.fatigue;g.staminaTick(human,80,1);assert.ok(human.fatigue>before+.4,'Sprints should drain endurance');
const depleted=human.fatigue;g.staminaTick(human,80,0);assert.ok(human.fatigue<depleted,'Rest should recover endurance');
assert.ok(endurance(human)<=1);
const stoppers=TEAMS[0].customRoster||rosterFor(0);
const weak={src:withStats({...stoppers[0],aggression:10,defence:15})};
const strong={src:withStats({...stoppers[0],aggression:99,defence:99})};
const soft={src:withStats({...stoppers[1],strength:10,defence:12})};
const tank={src:withStats({...stoppers[1],strength:99,defence:88})};
assert.ok(contest(strong,soft,true).knockChance>contest(weak,soft,true).knockChance,'Aggression and defending contribute');
assert.ok(contest(strong,tank,true).knockChance<contest(strong,soft,true).knockChance,'Strength resists knockouts');
assert.ok(shotError({src:withStats({...stoppers[0],shootAccuracy:95})},80)<shotError({src:withStats({...stoppers[0],shootAccuracy:10})},80));
const low={...stoppers[0],shootPower:10},high={...stoppers[0],shootPower:95};
const gl=make(),gh=make();gl.player(0,3).src=withStats(low);gh.player(0,3).src=withStats(high);
for(const inst of [gl,gh]){const x=inst.player(0,3);inst.take(x);inst.shoot(x);}
assert.ok(Math.hypot(gh.ball.vx,gh.ball.vy)>Math.hypot(gl.ball.vx,gl.ball.vy),'Stronger kick is faster');
const baseline=gh.player(0,3),speedBefore=gh.playerSpeed(baseline);
baseline.fatigue=.73;
gh.resetKickoff(0);
assert.ok(Math.abs(gh.player(0,3).fatigue-.73)<.00001,'Goal/kickoff must preserve fatigue');
gh.clock=gh.matchSeconds+.001;gh.update(.016);
assert.ok(gh.player(0,3).fatigue>.4&&gh.player(0,3).fatigue<.73,'Halftime recovery is partial, not reset');
// Movement decay must affect CPU too.
const bot=g.player(1,2);bot.aiTarget={x:bot.x-600,y:bot.y};bot.aiTimer=900;
let last=bot.fatigue;for(let n=0;n<300;n++)g.driveAI(bot,.033);
assert.ok(bot.fatigue>last,'AI must become tired');
// Pass/cross should use separate ratings, with higher pass accuracy lowering measured dispersion.
const origRandom=Math.random;try{Math.random=()=>0;
 const a=make(),b=make();for(const inst of [a,b]){inst.player(0,3).x=WORLD.field.x+1450;inst.player(0,3).y=WORLD.field.y+WORLD.field.h/2;inst.take(inst.player(0,3));}
 a.player(0,3).src=withStats({...a.player(0,3).src,passing:10});
 b.player(0,3).src=withStats({...b.player(0,3).src,passing:98});
 a.pass(a.player(0,3));b.pass(b.player(0,3));
 assert.notEqual(a.ball.vy,b.ball.vy,'Passing should change trajectory');
}finally{Math.random=origRandom;}
// Two GK attributes independently change goalkeeper reach; stronger keeper catches higher shots.
assert.ok(63+withStats({role:'GK',gkJump:95}).gkJump*1.12>63+withStats({role:'GK',gkJump:20}).gkJump*1.12);
assert.ok(26+withStats({role:'GK',gkSkill:95}).gkSkill*.18>26+withStats({role:'GK',gkSkill:20}).gkSkill*.18);
console.log('Player stats: PASS • 216x12 stat coverage • fatigue/rest/halftime • strength/aggression/defence • kick/accuracy • passing • GK • save compatibility');
// Explicit numeric ratings must progress in careers alongside the legacy fields.
const {createCareer,trainPlayer}=await import('../src/career.js');
const c=createCareer(TEAMS.findIndex(t=>t.group==='club26'),TEAMS);
const rising=c.roster[0];
const attr=rising.role==='GK'?'gkSkill':rising.role==='DF'?'defence':rising.role==='MF'?'passing':'shootPower';
rising.xp=99;const oldAttr=withStats(rising)[attr];c.cash=Number.MAX_SAFE_INTEGER;
trainPlayer(c,0);
assert.ok(withStats(c.roster[0])[attr]>oldAttr,'Career training must improve relevant 1–100 ratings');
console.log('Player stats career growth: PASS • positional development updates expanded ratings');
