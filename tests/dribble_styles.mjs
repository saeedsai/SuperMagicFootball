import assert from 'node:assert/strict';
import {DRIBBLE_STYLES,assignedDribbleType,dribbleStyle,dribbleOdds} from '../src/dribbles.js';
import {NUMERIC_STATS,withStats} from '../src/stats.js';
import {GameEngine,WORLD} from '../src/engine.js';
import {TEAMS,rosterFor,SHOTS,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
assert.equal(DRIBBLE_STYLES.length,10);
assert.equal(new Set(DRIBBLE_STYLES.map(s=>s.id)).size,10);
assert.equal(NUMERIC_STATS.includes('dribbling'),true);
assert.equal(TEAMS.length,216);
const used=new Set();
for(let i=0;i<TEAMS.length;i++){
 const team=TEAMS[i].customRoster||rosterFor(i);assert.equal(team.length,12);
 for(let p of team){let rated=withStats(p);assert.ok(DRIBBLE_STYLES.some(s=>s.id===rated.dribbleType));assert.ok(rated.dribbling>=1&&rated.dribbling<=100);used.add(rated.dribbleType);}
}
assert.equal(used.size,10,'All 10 types appear in shipped squads');
assert.equal(assignedDribbleType({id:'a',name:'Lionel Messi'}),assignedDribbleType({id:'other-club',name:'Lionel Messi'}));
assert.equal(assignedDribbleType({name:'Test',dribbleType:'nutmeg'}),'nutmeg');
assert.notEqual(assignedDribbleType({name:'Test',dribbleType:'invalid'}),'invalid');
let sample={dribbling:85,agility:80,fatigue:0};let low={defence:20,aggression:20},high={defence:96,aggression:96};
assert.ok(dribbleOdds(sample,low,dribbleStyle('stepovers'))>dribbleOdds(sample,high,dribbleStyle('stepovers')));
assert.ok(dribbleOdds({dribbling:10,agility:10,fatigue:.8},high,dribbleStyle('stepovers'))<dribbleOdds(sample,high,dribbleStyle('stepovers')));
const input={state:[{},{}],pulse:{},poll(){},just(t,k){return !!this.pulse[k]},held(){return false}};
function match(){let g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;g.clock=5;return g;}
const positionDeltas=new Set();const origRand=Math.random;
try{
 Math.random=()=>0;
 for(let style of DRIBBLE_STYLES){
  const g=match(),p=g.player(0,3);g.take(p);p.src=withStats({...p.src,dribbleType:style.id,dribbling:90,agility:90});p.x=1000;p.y=650;p.dx=.8;p.dy=.1;p.cd=0;
  for(let q of g.players)if(q!==p){q.x=2500+q.i*60;q.y=950;}
  const beforeFat=p.fatigue;
  assert.equal(g.tryDribbleTrick(p),true,style.name);
  const ev=g.events.find(e=>e.type==='dribbleTrick');assert.equal(ev?.style,style.id);assert.equal(ev?.success,true);
  assert.ok(p.trickGuard>0&&p.trickCd>0&&p.trickFx>0,style.name);
  assert.ok(p.fatigue>beforeFat,style.name);
  assert.equal(g.ball.owner,p);
  if(style.loft){g.updateBall(.016);assert.ok(g.ball.z>p.z+12,`Loft visually raises ball: ${style.id}`);}
  assert.equal(g.tryDribbleTrick(p),false,'cooldown cannot repeat move');
  positionDeltas.add(`${Math.round(p.x-1000)}:${Math.round(p.y-650)}`);
  g.updatePlayers(.016); assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
 }
 assert.equal(positionDeltas.size,10,'All styles have different travel profiles');
 // Strong defense can read and block a dribble, and the ball may spill.
 const g=match(),p=g.player(0,3),def=g.player(1,3);g.take(p);p.src=withStats({...p.src,dribbleType:'nutmeg',dribbling:10,agility:10});
 def.src=withStats({...def.src,defence:100,aggression:100});p.x=1000;p.y=650;p.face=1;p.dx=1;p.dy=0;def.x=p.x+42;def.y=p.y;def.stun=0;
 Math.random=()=>.99;g.tryDribbleTrick(p);assert.equal(g.events.find(e=>e.type==='dribbleTrick').success,false);
 assert.equal(g.ball.owner,null,'A failed challenge can spill possession');
 // AI: CPU uses its own assigned skill when pressured, not keyboard shortcuts.
 const cpu=match(),bot=cpu.player(1,3),enemy=cpu.player(0,3);cpu.take(bot);bot.aiTimer=0;bot.cd=0;bot.trickCd=0;enemy.x=bot.x+60;enemy.y=bot.y+5;
 Math.random=()=>0;cpu.driveAI(bot,.03);
 assert.ok(cpu.events.some(e=>e.type==='dribbleTrick'&&e.ai===true),'AI executes its unique dribble');
}finally{Math.random=origRand;}
console.log('v0.8.7 DRIBBLE STYLES PASS — 216 teams, 2592 players, 10 profiles, stamina/cooldowns, defensive counters, AI, identity stability');
