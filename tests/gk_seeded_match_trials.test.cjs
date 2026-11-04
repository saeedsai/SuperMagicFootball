/**
 * Bounded full-engine keeper/difficulty trial. This records seeded simulation
 * observations; scripted controls are not a human-play balance sample.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {fileURLToPath}=require('node:url');

const seedRandom=seed=>{
 let state=seed>>>0;
 return ()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const norm=(dx,dy)=>{
 const length=Math.hypot(dx,dy);
 return length>1?{x:dx/length,y:dy/length}:{x:dx,y:dy};
};

class ScriptInput {
 constructor(){this.state=[{},{}];this.current={};this.previous={};this.pressed={};this.releases={};}
 set(next){this.current=next;}
 poll(){
  this.pressed={};this.releases={};
  for(const action of ['pass','shoot','dribble','jump','pause']){
   this.pressed[action]=!!this.current[action]&&!this.previous[action];
   this.releases[action]=!this.current[action]&&!!this.previous[action];
  }
  this.state[0]={...this.current};this.state[1]={};this.previous={...this.current};
 }
 just(team,action){return team===0&&!!this.pressed[action];}
 released(team,action){return team===0&&!!this.releases[action];}
 tapDuration(){return 0;}
 canceled(){return false;}
}

function controlFrame(game,tick,policy,WORLD){
 const player=game.controlledPlayer(0),ball=game.ball,owner=ball.owner;
 if(!player)return {};
 const hasBall=owner===player,teammate=owner?.t===0;
 const goalX=WORLD.field.x+WORLD.field.w;
 if(hasBall){
  const targetY=clamp((WORLD.goalTop+WORLD.goalBottom)/2+policy.lane*50,
   WORLD.goalTop+15,WORLD.goalBottom-15);
  const move=norm(goalX-player.x,targetY-player.y),distance=goalX-player.x;
  const shoot=(distance<policy.shootRange||tick%233<4)&&tick%9<4;
  const pass=!shoot&&distance>policy.shootRange+120&&policy.passRate&&tick%103===2;
  return {...move,shoot,pass,dribble:tick%181===3};
 }
 if(teammate)return norm(owner.x+35-player.x,owner.y-player.y);
 const target=owner||ball;
 return {...norm(target.x-player.x,target.y-player.y),
  jump:tick%240>10&&tick%240<48,pass:tick%71===5};
}

const fixtures=[
 {home:0,away:9,weather:'Clear',formation:'2-1-2',lane:0,range:610,pass:false},
 {home:9,away:0,weather:'Rain',formation:'1-2-2',lane:1,range:730,pass:true},
 {home:2,away:7,weather:'Clear',formation:'3-1-1',lane:-1,range:860,pass:false},
 {home:7,away:2,weather:'Rain',formation:'1-3-1',lane:.5,range:640,pass:true},
 {home:5,away:10,weather:'Clear',formation:'2-2-1',lane:-.6,range:740,pass:true},
 {home:10,away:5,weather:'Clear',formation:'1-1-3',lane:.8,range:810,pass:false},
];

async function runTrials(){
 // Load the editable modular source directly. The checked-in src/engine.js is
 // a historical bundle; it is intentionally not used for current-source QA.
 const previousFetch=globalThis.fetch;
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(
  await fs.readFile(fileURLToPath(url),'utf8'))});
 let ENGINE,DATA;
 try{
  const assets=await import('../src/assets.js');
  await assets.loadAssets();
  [{ENGINE},{DATA}]=await Promise.all([
   import('../src/modules/engine.js'),import('../src/modules/data.js'),
  ]);
 }finally{
  if(previousFetch===undefined)delete globalThis.fetch;
  else globalThis.fetch=previousFetch;
 }
 const {GameEngine,WORLD}=ENGINE;
 const {DEFAULT_OPTIONS}=DATA;
 const configs=[];
 for(const difficulty of [0,1,2,3,4])for(let fixture=0;fixture<fixtures.length;fixture++){
  const f=fixtures[fixture];
  configs.push({difficulty,seed:82412000+difficulty*7001+fixture*1901,
   home:f.home,away:f.away,weather:f.weather,formation:f.formation,
   policy:{id:`varied-${fixture}`,lane:f.lane,shootRange:f.range,passRate:f.pass}});
 }
 const replay=({difficulty,seed,home,away,weather,formation,policy,secondsPerHalf=36})=>{
  Math.random=seedRandom(seed);
  const input=new ScriptInput();
  const options={...DEFAULT_OPTIONS,difficulty,weather,terrain:'Grass',condition:'Good',formation,halfSeconds:secondsPerHalf};
  const game=new GameEngine(options,input);
  game.init({home,away,options,humans:1});
  assert.equal(game.inControl(0),true);
  assert.equal(game.inControl(1),false);
  assert.equal(game.cpuLevel(game.player(1,3)),difficulty);
  const keeper=game.players.find(player=>player.t===1&&player.keeper);
  assert(keeper,'CPU goalkeeper exists');
  const keeperOrigin={x:keeper.x,y:keeper.y};
  let keeperPath=0,keeperMaxDisplacement=0,keeperMovingFrames=0,keeperAICalls=0;
  let phase='regulation',halftime=0,frames=0,previousOwner=null,transitions=0;
  let observedShoots=0,observedPasses=0;
  const stats={regulation:{keeperDiveAttempts:0,keeperContacts:0,keeperSaves:0,
   keeperDeflections:0,goalsAgainstCpu:0},shootout:{keeperDiveAttempts:0,
   keeperContacts:0,keeperSaves:0,keeperDeflections:0,goalsAgainstCpu:0}};
  const eventCounts={};
  game.onEvent=event=>{
   eventCounts[event.type]=(eventCounts[event.type]||0)+1;
   const target=stats[phase];
   if(event.type==='keeperDiveAttempt'&&event.team===1)target.keeperDiveAttempts++;
   if(event.type==='keeperContact'&&event.team===1)target.keeperContacts++;
   if(event.type==='save'&&event.player?.t===1){
    target.keeperSaves++;
    if(event.deflected)target.keeperDeflections++;
   }
   if(event.type==='goal'&&event.team===0)target.goalsAgainstCpu++;
  };
  const oldDrive=game.driveAI;
  game.driveAI=function(player,dt){
   if(player===keeper)keeperAICalls++;
   return oldDrive.call(this,player,dt);
  };
  const ownership=[0,0,0];
  try{
   for(;frames<Math.ceil(secondsPerHalf*2*60)+3600;frames++){
    if(game.matchState==='paused'&&game.half===2){halftime++;game.matchState='play';}
    // Current gameplay awards an in-match single PK for a valid slide foul in
    // the penalty area. Resolve that restart inline instead of mistaking it for
    // the post-regulation shootout and truncating the seeded full-match cohort.
    if(game.matchState==='penalty'&&[0,1].includes(game.pk?.inMatchTeam)){
     game.updatePK(1/30);continue;
    }
    if(game.matchState==='penalty'||game.matchState==='finished')break;
    assert.equal(game.matchState,'play','script encounters no unrelated pause');
    const inputState=controlFrame(game,frames,policy,WORLD);
    input.set(inputState);
    if(inputState.shoot)observedShoots++;
    if(inputState.pass)observedPasses++;
    const beforeX=keeper.x,beforeY=keeper.y;
    game.update(1/30);
    const step=Math.hypot(keeper.x-beforeX,keeper.y-beforeY);
    keeperPath+=step;
    if(step>.01)keeperMovingFrames++;
    keeperMaxDisplacement=Math.max(keeperMaxDisplacement,
     Math.hypot(keeper.x-keeperOrigin.x,keeper.y-keeperOrigin.y));
    const holder=game.ball.owner?.t??2;
    ownership[holder]++;
    if(holder!==(previousOwner??holder))transitions++;
    previousOwner=holder;
    if(frames%11===0){
     const b=game.ball;
     assert([b.x,b.y,b.z,b.vx,b.vy,b.vz||0].every(Number.isFinite),'ball remains finite');
     assert(game.players.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&
      p.fatigue>=0&&Number.isFinite(p.fatigue)),'players remain finite');
    }
   }
   assert(frames<Math.ceil(secondsPerHalf*2*60)+3600,'regulation is bounded');
   assert.equal(halftime,1,'one halftime transition');
   assert.equal(game.half,2,'both regulation halves played');
   assert(['penalty','finished'].includes(game.matchState),'regulation reached completion');
   assert(ownership.reduce((sum,value)=>sum+value,0)>secondsPerHalf*30,'live possession sampled');
   assert(observedShoots>0,'script requested shots');
   const regulationScore=game.score.slice();
   const regulationKeeperStats={...stats.regulation};
   phase='shootout';
   let penaltyTicks=0;
   while(game.matchState==='penalty'&&penaltyTicks<3600){
    input.set({shoot:game.pk?.ready<=0&&game.pk?.shotTimer<=0&&penaltyTicks%9===0});
    game.updatePK(1/30);penaltyTicks++;
   }
   assert.equal(game.matchState,'finished','tiebreak completes when present');
   assert(penaltyTicks<3600,'tiebreak loop is bounded');
   return {difficulty,seed,home,away,weather,formation,policy:policy.id,secondsPerHalf,
    frames,halftime,regulationScore,finalScore:game.score.slice(),penaltyTicks,
    goalsAgainstCpu:regulationScore[0],cpuKeeper:regulationKeeperStats,
    keeperMovement:{pathWorld:keeperPath,maxDisplacementWorld:keeperMaxDisplacement,
     movingFrames:keeperMovingFrames,aiCalls:keeperAICalls},ownershipFrames:ownership,
    possessionTransitions:transitions,controlInputs:{shootFrames:observedShoots,passFrames:observedPasses},
    regulationEvents:eventCounts,shootoutKeeperStats:stats.shootout};
  }finally{game.driveAI=oldDrive;}
 };
 const savedRandom=Math.random;
 let matches,repeat;
 try{matches=configs.map(replay);repeat=replay(configs[4]);}
 finally{Math.random=savedRandom;}
 assert.deepEqual(repeat,matches[4],'same seed/fixture/control policy reproduces all match metrics');
 const byDifficulty={};
 for(const difficulty of [0,1,2,3,4]){
  const group=matches.filter(match=>match.difficulty===difficulty);
  const mean=selector=>Number((group.reduce((sum,match)=>sum+selector(match),0)/group.length).toFixed(3));
  const min=selector=>Math.min(...group.map(selector));
  const max=selector=>Math.max(...group.map(selector));
  byDifficulty[difficulty]={matches:group.length,sampleN:group.length,
   cpuGoalsAgainst:group.reduce((sum,m)=>sum+m.goalsAgainstCpu,0),
   cpuKeeperSaves:group.reduce((sum,m)=>sum+m.cpuKeeper.keeperSaves,0),
   cpuKeeperDeflections:group.reduce((sum,m)=>sum+m.cpuKeeper.keeperDeflections,0),
   cpuKeeperDiveAttempts:group.reduce((sum,m)=>sum+m.cpuKeeper.keeperDiveAttempts,0),
   cpuKeeperContacts:group.reduce((sum,m)=>sum+m.cpuKeeper.keeperContacts,0),
   keeperPathWorldMean:mean(m=>m.keeperMovement.pathWorld),
   keeperPathWorldRange:[min(m=>m.keeperMovement.pathWorld),max(m=>m.keeperMovement.pathWorld)],
   keeperMaxDisplacementWorldMean:mean(m=>m.keeperMovement.maxDisplacementWorld),
   keeperMovingFramesMean:mean(m=>m.keeperMovement.movingFrames),
   shotsRequested:group.reduce((sum,m)=>sum+m.controlInputs.shootFrames,0)};
  assert(group.length===fixtures.length,'six fixtures at every CPU difficulty');
 }
 assert(matches.every(match=>match.controlInputs.shootFrames>0),'each match exercised shooting');
 assert(matches.every(match=>Number.isFinite(match.keeperMovement.pathWorld)&&
  Number.isFinite(match.keeperMovement.maxDisplacementWorld)),'keeper movement metrics are finite');
 return {test:'seeded full-engine scripted matches',sampleCount:matches.length,deterministicReplay:true,
  stepSeconds:1/30,secondsPerHalf:36,fixturesPerDifficulty:fixtures.length,
  limitations:['Scripted team-0 controls are a repeatable proxy, not a human skill or win-rate sample.',
   'Each difficulty has six fixture seeds; these small cohorts describe observations and do not set balance thresholds.',
   'Only the CPU-controlled away goalkeeper is measured for movement; home goalkeeper events are omitted.',
   'Regulation goals/saves are separated from penalty shootout outcomes.',
   'No browser, physical-device, hosted, or human-vs-CPU acceptance is claimed.'],byDifficulty,matches};
}

test('seeded complete matches report CPU keeper movement and outcomes by difficulty',async()=>{
 const report=await runTrials();
 assert.equal(report.sampleCount,30);
 assert.equal(Object.keys(report.byDifficulty).length,5);
 assert(report.deterministicReplay);
 console.log('GK_SEEDED_MATCH_TRIALS_PASS',JSON.stringify({
  sampleCount:report.sampleCount,fixturesPerDifficulty:report.fixturesPerDifficulty,
  deterministicReplay:report.deterministicReplay,byDifficulty:report.byDifficulty,
 }));
});
