import assert from 'node:assert/strict';
import {GameEngine,WORLD,tackleStunDuration} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const input={state:[{},{}],down:{},up:{},poll(){},held(t,k){return !!this.state[t]?.[k]},just(t,k){return !!this.down[k]},released(t,k){return !!this.up[k]}};
const gmake=()=>{const g=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);g.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});g.cooldown=0;g.driveAI=()=>{};return g;};
let seed=9876431;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
const originalRandom=Math.random;
try{
 Math.random=rng;
 // Both attacking directions, left/right keeper locations, and three skill levels.
 for(const team of [0,1])for(const keeperY of [WORLD.goalTop+37,(WORLD.goalTop+WORLD.goalBottom)/2,WORLD.goalBottom-37]){
  const g=gmake(),p=g.player(team,3),keeper=g.player(1-team,0);
  p.x=team===0?2050:1600;p.y=760;p.dy=0;
  keeper.y=keeperY;
  for(const q of g.players)if(q!==keeper&&q!==p){q.x=q.t?3390:320;q.y=1150;}
  const samples={};
  for(const accuracy of [12,50,98]){
   p.src.shootAccuracy=accuracy;
   let off=0,open=0,aims=[];
   for(let n=0;n<500;n++){
    g.take(p);p.cd=0;g.shoot(p);
    const aim=g.ball.targetY;
    assert(Number.isFinite(aim),'normal shot should report finite targetY');
    aims.push(aim);
    if(aim<WORLD.goalTop||aim>WORLD.goalBottom)off++;
    if(Math.abs(aim-keeperY)>95&&aim>WORLD.goalTop&&aim<WORLD.goalBottom)open++;
   }
   samples[accuracy]={off,open,aims};
  }
  assert(samples[98].off<samples[12].off,`low accuracy must miss more often (${team}/${keeperY})`);
  assert(samples[98].open>samples[12].open,`elite shooter should find the open keeper-free lane (${team}/${keeperY})`);
  const eliteMean=samples[98].aims.reduce((a,b)=>a+b,0)/500;
  if(keeperY<WORLD.goalTop+65)assert(eliteMean>(WORLD.goalTop+WORLD.goalBottom)/2,'upper keeper -> lower-space shooting');
  if(keeperY>WORLD.goalBottom-65)assert(eliteMean<(WORLD.goalTop+WORLD.goalBottom)/2,'lower keeper -> upper-space shooting');
 }
 // A lane blocker changes target selection when elite shooter recognizes an obstruction.
 {
  const g=gmake(),p=g.player(0,3),k=g.player(1,0),block=g.player(1,2);p.src.shootAccuracy=99;p.x=2080;p.y=765;k.y=650;
  for(const q of g.players)if(q!==p&&q!==k&&q!==block){q.x=q.t?3390:320;q.y=1150;}
  block.x=2800;block.y=840;
  let mean=0;for(let i=0;i<300;i++){g.take(p);g.shoot(p);mean+=g.ball.targetY;}mean/=300;
  assert(mean<WORLD.goalBottom-35,'shots should avoid blocked lower lane instead of always seeking far post');
 }
 // Tackles stun only on a successful hit, and the weak victim needs longer to recover.
 assert(tackleStunDuration(12,true) > tackleStunDuration(94,true));
 assert(tackleStunDuration(12,false) > tackleStunDuration(94,false));
 assert(tackleStunDuration(1,true)<=1.05 && tackleStunDuration(100,false)>=.22);
 function tryHit(strength,slide=false,invuln=0){
  const g=gmake(),attacker=g.player(0,3),victim=g.player(1,3);
  for(const q of g.players)if(q!==attacker&&q!==victim){q.x=q.t?3300:350;q.y=1100;}
  attacker.x=1600;attacker.y=700;attacker.cd=0;attacker.stun=0;
  victim.x=1640;victim.y=700;victim.stun=0;victim.invuln=invuln;victim.src.strength=strength;
  const old=Math.random;Math.random=()=>0;
  try{g.tackle(attacker,slide);}finally{Math.random=old}
  return {g,attacker,victim};
 }
 const weak=tryHit(12,true),strong=tryHit(94,true);
 assert(weak.victim.stun>strong.victim.stun,'victim Strength reduces successful tackle stun');
 assert(weak.g.events.some(e=>e.type==='tackleHit'),'hit emits tackle event');
 assert(weak.attacker.stun===0,'tackler must not be stunned by its own hit');
 const blocked=tryHit(12,true,2);assert.equal(blocked.victim.stun,0,'invulnerable opponent does not get stunned');
 const recovering=weak.victim.stun;
 weak.g.updatePlayers(recovering/2);assert(weak.victim.stun>0,'stun persists temporarily');
 for(let i=0;i<80;i++)weak.g.updatePlayers(.016);
 assert(weak.victim.stun<=0,'stun expires automatically');
 console.log('FIXING ISSUES PASS: goalkeeper-aware aim both ends, 3 accuracy levels, miss distributions, blocker lanes, strength-based tackle stun and recovery');
}finally{Math.random=originalRandom}
