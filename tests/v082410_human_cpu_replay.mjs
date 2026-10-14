/** v0.8.24.10: deterministic complete regulation matches driven via the four-action input API.
 * Bot control is a repeatable scripted proxy, NOT evidence of real human skill/win rates.
 */
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {GameEngine,WORLD} from '../src/engine.js';
import {DEFAULT_OPTIONS} from '../src/data.js';
const seedRandom=(seed)=>{let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)};
const savedRandom=Math.random;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const norm=(dx,dy)=>{const m=Math.hypot(dx,dy);return m>1?{x:dx/m,y:dy/m}:{x:dx,y:dy}};
class ScriptInput {
 constructor(){this.state=[{},{}];this.current={};this.previous={};this.pressed={};this.releases={};}
 set(next){this.current=next;}
 poll(){this.pressed={};this.releases={};for(const a of ['pass','shoot','dribble','jump','pause']){
  this.pressed[a]=!!this.current[a]&&!this.previous[a];this.releases[a]=!this.current[a]&&!!this.previous[a];
 }this.state[0]={...this.current};this.state[1]={};this.previous={...this.current};}
 just(t,a){return t===0&&!!this.pressed[a];}
 released(t,a){return t===0&&!!this.releases[a];}
 tapDuration(){return 0;}
 canceled(){return false;}
}
function controlFrame(g,tick,policy){
 const p=g.controlledPlayer(0),b=g.ball,owner=b.owner;
 if(!p)return {};
 const owns=owner===p,teammate=owner?.t===0,goalX=WORLD.field.x+WORLD.field.w;
 if(owns){
  const attackY=clamp((WORLD.goalTop+WORLD.goalBottom)/2+(policy.lane*50),WORLD.goalTop+15,WORLD.goalBottom-15);
  const move=norm(goalX-p.x,attackY-p.y);
  const dist=goalX-p.x;
  // Different scripts exercise different decisions; each action is a real input edge/hold.
  const shoot=(dist<policy.shootRange || tick%233<4) && tick%9<4;
  const pass=!shoot && dist>policy.shootRange+120 && policy.passRate && tick%103===2;
  return {...move,shoot,pass,dribble:tick%181===3};
 }
 if(teammate){const move=norm(owner.x+35-p.x,owner.y-p.y);return move;}
 const target=owner||b;const move=norm(target.x-p.x,target.y-p.y);
 return {...move,jump:tick%240>10&&tick%240<48,pass:tick%71===5};
}
function replay({difficulty,seed,home,away,weather,formation,policy,secondsPerHalf=36}){
 Math.random=seedRandom(seed);
 const input=new ScriptInput();
 const options={...DEFAULT_OPTIONS,difficulty,weather,terrain:'Grass',condition:'Good',formation,halfSeconds:secondsPerHalf};
 const game=new GameEngine(options,input);game.init({home,away,options,humans:1});
 assert.equal(game.inControl(0),true);assert.equal(game.inControl(1),false);
 assert.equal(game.cpuLevel(game.player(1,3)),difficulty);
 const events={};const kicks={home:0,away:0},saves={home:0,away:0},keeperRebounds={home:0,away:0};
 game.onEvent=e=>{
  events[e.type]=(events[e.type]||0)+1;
  if(e.type==='kick'){if(e.player?.t===0)kicks.home++;else kicks.away++;}
  if(e.type==='save'){const side=e.player?.t===0?'home':'away';saves[side]++;if(e.deflected)keeperRebounds[side]++;}
 };
 const ownership=[0,0,0],samples={homeShots:0,awayShots:0,passes:0,controlledFrames:0,defensiveFrames:0};
 let halftime=0,frames=0,previousOwner=null,transitions=0,observedShoots=0,observedPasses=0;
 for(;frames<Math.ceil(secondsPerHalf*2*60)+3600;frames++){
  if(game.matchState==='paused'&&game.half===2){halftime++;game.matchState='play';}
  if(game.matchState==='penalty'||game.matchState==='finished')break; // regulation ended; finish any penalty shootout using the same controls
  assert.equal(game.matchState,'play','no unrelated pause during scripted match');
  const next=controlFrame(game,frames,policy);
  input.set(next);
  if(next.shoot)observedShoots++;if(next.pass)observedPasses++;
  game.update(1/30);
  const b=game.ball;
  const holder=b.owner?.t??2;
  ownership[holder]++;
  if(holder!==previousOwner){transitions++;previousOwner=holder;}
  const selected=game.controlledPlayer(0);
  if(selected?.controlled)samples.controlledFrames++;
  if(holder===1)samples.defensiveFrames++;
  if(frames%11===0){
   assert([b.x,b.y,b.z,b.vx,b.vy,b.vz||0].every(Number.isFinite),'finite ball physics');
   assert(game.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.fatigue>=0&&Number.isFinite(p.fatigue)),'finite players');
  }
 }
 assert(frames<Math.ceil(secondsPerHalf*2*60)+3600,'regulation terminates within bound');
 assert.equal(halftime,1,'halftime once');
 assert(game.half===2,'both halves played');
 assert(['penalty','finished'].includes(game.matchState),'regulation finished or reached tiebreak');
 assert(ownership.reduce((a,b)=>a+b,0)>secondsPerHalf*30,'substantial live possession sampled');
 assert(observedShoots>0,'scripted controls actually request shots');
 assert(samples.controlledFrames>0,'human controlled player actually updated');
 const regulationEnd=game.matchState,regulationScore=game.score.slice();
 let penaltyTicks=0;
 while(game.matchState==='penalty' && penaltyTicks<3600){
  // Human uses the regular Shoot action when the referee signals readiness;
  // CPU shootouts proceed autonomously using normal game AI.
  input.set({shoot:game.pk?.ready<=0 && game.pk?.shotTimer<=0 && penaltyTicks%9===0});
  game.updatePK(1/30);penaltyTicks++;
 }
 assert.equal(game.matchState,'finished','any tiebreak completes');
 assert(penaltyTicks<3600,'penalty shootout is bounded');
 return {difficulty,seed,home,away,weather,formation,policy:policy.id,secondsPerHalf,frames,halftime,regulationEnd,regulationScore,finalScore:game.score.slice(),penaltyTicks,ownershipFrames:ownership,kicks,saves,keeperRebounds,events,controlInputs:{shootHeldFrames:observedShoots,passHeldFrames:observedPasses},transitions};
}
const plans=[
 {id:'forward',lane:0,shootRange:570,passRate:false},
 {id:'passing',lane:1,shootRange:690,passRate:true},
 {id:'wide',lane:-1,shootRange:790,passRate:false}
];
const configs=[];
for(const difficulty of [0,1,2,3,4])for(const fixture of [0,1,2]){
 const teams=[[0,9],[9,0],[2,7]][fixture];
 configs.push({difficulty,seed:8241000+difficulty*137+fixture*791,home:teams[0],away:teams[1],weather:fixture===1?'Rain':'Clear',formation:['2-1-2','1-2-2','3-1-1'][fixture],policy:plans[fixture]});
}
let matches,repeat;
try{matches=configs.map(replay);repeat=replay(configs[4]);}finally{Math.random=savedRandom;}
assert.deepEqual(repeat,matches[4],'same seed + controls produces identical match events and outcomes');
assert.equal(matches.length,15);
const byDifficulty={};
for(const difficulty of [0,1,2,3,4]){
 const group=matches.filter(x=>x.difficulty===difficulty);
 byDifficulty[difficulty]={matches:group.length,regulationGoalsHome:group.reduce((n,x)=>n+x.regulationScore[0],0),regulationGoalsCPU:group.reduce((n,x)=>n+x.regulationScore[1],0),savesByCPU:group.reduce((n,x)=>n+x.saves.away,0),kicksByHumanTeam:group.reduce((n,x)=>n+x.kicks.home,0),possessionShareHuman:Number((group.reduce((n,x)=>n+x.ownershipFrames[0],0)/group.reduce((n,x)=>n+x.ownershipFrames.reduce((a,b)=>a+b,0),0)).toFixed(3)),endedInTiebreak:group.filter(x=>x.regulationEnd==='penalty').length};
}
const report={release:'0.8.24.10',testType:'Scripted four-action controller versus live CPU through both regulation halves',matchesCount:matches.length,fullRegulationMatches:matches.length,deterministicReplay:true,stepSeconds:1/30,byDifficulty,matches,limitations:['Scripted policy is not a human player; match statistics are not human win rates','Three fixtures per difficulty are far too few for statistical claims or retuning','Tied regulation scores are followed by in-engine penalty shootouts and recorded separately','Kick events count all kicks, not exclusively shots; use only as activity indicators','Performance on physical gamepads and phones is not tested']};
writeFileSync(new URL('../docs/HUMAN_CPU_REGULATION_REPLAYS_v082410.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('PASS v0.8.24.10 complete regulation scripted controller replays',JSON.stringify(byDifficulty));
