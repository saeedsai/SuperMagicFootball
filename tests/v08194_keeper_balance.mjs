import assert from 'node:assert/strict';
import {GameEngine,WORLD,keeperReactionReach} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],poll(){},just(){return false},released(){return false}};
function game(team=0){
 const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
 g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'},humans:2});
 g.cooldown=0;
 const k=g.player(team,0);
 k.stun=0;k.diveCooldown=0;k.fatigue=0;k.y=(WORLD.goalTop+WORLD.goalBottom)/2;
 // Move non-keepers out of the shot path to isolate shot-vs-goalkeeper behavior.
 for(const p of g.players.filter(p=>!p.keeper)){p.x=WORLD.field.x+WORLD.field.w*.5;p.y=WORLD.field.y+80;}
 return {g,k};
}
function fire(team,{speed=25000,offset=0,z=12,power=90,shot=null}={}){
 const {g,k}=game(team),dir=team===0?-1:1,b=g.ball;
 b.owner=null;b.attacker=1-team;b.x=k.x-dir*290;b.y=k.y+offset;
 b.z=z;b.vx=dir*speed;b.vy=0;b.vz=0;b.power=power;b.shot=shot;
 b.canCollect=.7;b.age=0;b.trail=[];
 g.updateBall(.029);
 return {g,k,b};
}
for(const team of [0,1]){
 const center=fire(team);
 assert(center.g.events.some(e=>e.type==='keeperDive'&&e.team===team&&!e.manual),`fast shot ${team} cannot skip keeper plane`);
 assert(center.g.events.some(e=>e.type==='save'),`fast shot ${team} has save event`);
 assert.equal(center.g.score[1-team],0,'intercepted shot must not score');
 const corner=fire(team,{offset:WORLD.goalBottom-WORLD.goalTop-30});
 assert.equal(corner.g.events.some(e=>e.type==='keeperDive'),false,'out-of-reach ball must not cause automatic dive');
 assert.equal(corner.g.score[1-team],0,'out-of-goalmouth ball must not score');
 const farCorner=fire(team,{offset:125});
 assert.equal(farCorner.g.events.some(e=>e.type==='keeperDive'),false,'fast wide placement must beat central keeper');
 assert.equal(farCorner.g.score[1-team],1,'in-goal-mouthed unguarded shot must be a goal');
 const high=fire(team,{z:250});
 assert(!high.g.events.some(e=>e.type==='keeperDive'),'high ball beyond keeper jump reach must not be a save');
 const away=game(team);away.g.ball.owner=null;away.g.ball.attacker=1-team;
 away.g.ball.x=away.k.x;away.g.ball.y=away.k.y;away.g.ball.z=12;
 away.g.ball.vx=team===0?800:-800;
 assert(!away.g.tryKeeperDive(away.k),'keeper does not dive at ball moving away');
}
const build=(skill,jump=55,fatigue=0)=>({src:{id:`gk-${skill}`,role:'GK',gkSkill:skill,gkDiving:jump,rating:skill},fatigue});
const shot=(speed,level=0)=>({vx:speed,vy:0,shot:level?{level}:null});
const low=keeperReactionReach(build(25,35),shot(1400));
const high=keeperReactionReach(build(95,90),shot(1400));
assert(high.y>low.y+25,'high skill and jump must produce noticeably better lateral coverage');
assert(keeperReactionReach(build(70),shot(600)).y>keeperReactionReach(build(70),shot(2400)).y,'fast shots reduce response radius');
assert(keeperReactionReach(build(70),shot(900)).y>keeperReactionReach(build(70),shot(900,5)).y,'higher super shot level reduces effective reach');
assert(keeperReactionReach(build(70),shot(900)).y>keeperReactionReach(build(70,55,1),shot(900)).y,'exhaustion should reduce save coverage');
// Reproducible grid: shot speed and goalkeeper attributes measurably change the
// proportion of goal-mouth lanes a keeper can cover; this is NOT a real match save rate.
const yOffsets=Array.from({length:61},(_,i)=>(i-30)*5);
const coverage=(p,b)=>{const reach=keeperReactionReach(p,b);return yOffsets.filter(y=>Math.abs(y)<=reach.y).length/yOffsets.length;};
const weakCoverage=coverage(build(25,35),shot(1400));
const strongCoverage=coverage(build(95,90),shot(1400));
const slowCoverage=coverage(build(70),shot(600));
const fastCoverage=coverage(build(70),shot(2400));
assert(strongCoverage>weakCoverage&&slowCoverage>fastCoverage);
console.log('v0.8.19.4 GK BALANCE PASS: swept saves both goal directions; wide/high/away misses; skill, speed, super level and fatigue response');
console.log('DETERMINISTIC KEEPER-LANE COVERAGE (not real match save %)',JSON.stringify({weakCoverage,strongCoverage,slowCoverage,fastCoverage}));
