'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
function active(player,patch={}){
 Object.assign(player,{x:0,y:0,z:0,stun:0,down:false,action:'idle',actionTimer:0,
  slideTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,
  shotImpactRiseTimer:0,aiTarget:null,aiTimer:0,aiAssistTarget:null,aiGiveAndGoRun:null,
  aiFirstTouchTarget:null,...patch});return player;
}
function makeFixture(AI,ENGINE,team){
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
 const field=ENGINE.WORLD.field,bounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
 const ownGoalX=team===0?bounds.xMin:bounds.xMax,attackTeam=1-team,attackDir=attackTeam===0?1:-1,centerY=(bounds.yMin+bounds.yMax)/2;
 const carrier=game.player(attackTeam,3),runner=game.player(attackTeam,4),primary=game.player(team,3),support=game.player(team,4),third=game.player(team,5);
 for(const q of game.players)if(![carrier,runner,primary,support,third].includes(q)&&!q.keeper){q.down=true;q.stun=1;}
 const carrierX=ownGoalX-attackDir*390,runnerX=ownGoalX-attackDir*175,runnerY=centerY+24;
 active(carrier,{x:carrierX,y:centerY});active(runner,{x:runnerX,y:runnerY,moveVX:attackDir*80});
 active(primary,{x:carrierX+attackDir*70,y:centerY+65});active(support,{x:carrierX+attackDir*40,y:centerY-130});
 const targetX=runnerX+attackDir*(80*.12+34),targetY=runnerY+(centerY-runnerY)*.12;
 active(third,{x:targetX-attackDir*70,y:targetY+10});
 Object.assign(game.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,attacker:attackTeam,lastTouchTeam:attackTeam,age:0,shot:null,strike:null,ordinaryShot:false,hideBallTimer:0});
 game.clock=2;const pressers=AI.defensivePressers(game.players,team,carrier);
 const assignment=AI.defensiveThirdManRunnerTarget(team,carrier,game.players,bounds,pressers.primary,pressers.support);
 return {game,field,bounds,team,attackDir,ownGoalX,centerY,carrier,runner,primary,support,third,pressers,assignment,targetX,targetY};
}
test('third CPU defender marks an unassigned central runner on both goal sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=makeFixture(AI,ENGINE,team);
  assert.equal(f.pressers.primary,f.primary,'nearest ready defender retains primary press');
  assert.equal(f.pressers.support,f.support,'next defender retains second-defender cover');
  assert.ok(f.assignment,JSON.stringify({team,pressers:f.pressers}));
  assert.equal(f.assignment.defender,f.third,'remaining ready defender takes runner mark');
  assert.equal(f.assignment.runner,f.runner);
  assert.ok(f.attackDir*(f.assignment.target.x-f.runner.x)>0,'mark point shades goal-side');
  assert.ok(f.assignment.target.x>=f.bounds.xMin+22&&f.assignment.target.x<=f.bounds.xMax-22);
  assert.ok(f.assignment.target.y>=f.bounds.yMin+23&&f.assignment.target.y<=f.bounds.yMax-23);
  f.game.driveAI(f.third,.016);
  assert.ok(Math.abs(f.third.aiTarget.x-f.assignment.target.x)<1e-6);
  assert.ok(Math.abs(f.third.aiTarget.y-f.assignment.target.y)<1e-6);
  assert.equal(f.game.ball.owner,f.carrier,'cover assignment does not alter possession');
 }
});
test('third-man mark rejects distant carriers, non-central or retreating runners and covered threats',async()=>{
 const {AI,ENGINE}=await loadModules();
 const cases=[
  ['carrier outside the defending third',f=>{f.carrier.x=f.ownGoalX-f.attackDir*620;}],
  ['runner too wide',f=>{f.runner.y=f.centerY+f.field.h*.36;}],
  ['runner behind the carrier',f=>{f.runner.x=f.ownGoalX-f.attackDir*520;}],
  ['runner already covered by a primary/support defender',f=>{f.primary.x=f.runner.x;f.primary.y=f.runner.y;}],
  ['runner accelerating away from goal',f=>{f.runner.moveVX=-f.attackDir*220;}]
 ];
 for(const team of [0,1])for(const [label,mutate] of cases){
  const f=makeFixture(AI,ENGINE,team);mutate(f);
  assert.equal(AI.defensiveThirdManRunnerTarget(team,f.carrier,f.game.players,f.bounds,f.primary,f.support),null,label+' (team '+team+')');
 }
});
test('third-man assignment yields to unavailable, human-controlled and committed defenders',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1])for(const mode of ['down','human','assist','give-and-go','first-touch']){
  const f=makeFixture(AI,ENGINE,team);
  if(mode==='down'){f.third.down=true;f.third.stun=1;}
  if(mode==='assist')f.third.aiAssistTarget={x:f.third.x,y:f.third.y};
  if(mode==='give-and-go')f.third.aiGiveAndGoRun={receiverId:'existing-run'};
  if(mode==='first-touch')f.third.aiFirstTouchTarget={x:f.third.x,y:f.third.y};
  const human=mode==='human'?f.third:null;
  assert.equal(AI.defensiveThirdManRunnerTarget(team,f.carrier,f.game.players,f.bounds,f.primary,f.support,human),null,mode+' (team '+team+')');
 }
});
test('third-man helper rejects malformed teams, bounds and missing primary/support assignments',async()=>{
 const {AI,ENGINE}=await loadModules(),f=makeFixture(AI,ENGINE,0);
 assert.equal(AI.defensiveThirdManRunnerTarget(2,f.carrier,f.game.players,f.bounds,f.primary,f.support),null);
 assert.equal(AI.defensiveThirdManRunnerTarget(0,f.carrier,f.game.players,{xMin:1,xMax:1,yMin:0,yMax:1},f.primary,f.support),null);
 assert.equal(AI.defensiveThirdManRunnerTarget(0,f.carrier,f.game.players,f.bounds,f.primary,null),null);
 assert.equal(AI.defensiveThirdManRunnerTarget(0,f.carrier,[],f.bounds,f.primary,f.support),null);
});
