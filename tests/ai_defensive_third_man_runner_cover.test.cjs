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
 const carrier=game.player(attackTeam,3),runner=game.player(attackTeam,4),primary=game.player(team,3),support=game.player(team,4),third=game.player(team,5),alternate=game.player(team,2);
 for(const q of game.players)if(![carrier,runner,primary,support,third,alternate].includes(q)&&!q.keeper){q.down=true;q.stun=1;}
 const carrierX=ownGoalX-attackDir*390,runnerX=ownGoalX-attackDir*175,runnerY=centerY+24;
 active(carrier,{x:carrierX,y:centerY});active(runner,{x:runnerX,y:runnerY,moveVX:attackDir*80});
 active(primary,{x:carrierX+attackDir*70,y:centerY+65});active(support,{x:carrierX+attackDir*40,y:centerY-130});
 const targetX=runnerX+attackDir*(80*.12+34),targetY=runnerY+(centerY-runnerY)*.12;
 active(third,{x:targetX-attackDir*70,y:targetY+10});
 active(alternate,{down:true,x:targetX-attackDir*82,y:targetY+10});
 Object.assign(game.ball,{owner:carrier,x:carrier.x,y:carrier.y,z:0,vx:0,vy:0,vz:0,pass:false,passTarget:null,attacker:attackTeam,lastTouchTeam:attackTeam,age:0,shot:null,strike:null,ordinaryShot:false,hideBallTimer:0});
 game.clock=2;const pressers=AI.defensivePressers(game.players,team,carrier);
 const assignment=AI.defensiveThirdManRunnerTarget(team,carrier,game.players,bounds,pressers.primary,pressers.support);
 return {game,field,bounds,team,attackDir,ownGoalX,centerY,carrier,runner,primary,support,third,alternate,pressers,assignment,targetX,targetY};
}
test('third CPU defender marks an unassigned central runner on both goal sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=makeFixture(AI,ENGINE,team);
  assert.equal(f.pressers.primary,f.primary,'nearest ready defender retains primary press');
  assert.equal(f.pressers.support,f.support,'next defender retains second-defender cover');
  assert.ok(f.assignment,JSON.stringify({team,pressers:f.pressers}));
  assert.equal(f.assignment.secondary,undefined,'a single eligible runner must not create a second mark');
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
test('third-man marking prefers a bounded projected arrival over a slightly nearer defender moving away',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=makeFixture(AI,ENGINE,team);
  f.third.moveVX=-f.attackDir*200;
  active(f.alternate,{x:f.targetX-f.attackDir*82,y:f.targetY+10,moveVX:f.attackDir*200,moveVY:0});
  const assignment=AI.defensiveThirdManRunnerTarget(team,f.carrier,f.game.players,f.bounds,f.primary,f.support);
  assert.ok(Math.hypot(f.third.x-f.targetX,f.third.y-f.targetY)<Math.hypot(f.alternate.x-f.targetX,f.alternate.y-f.targetY),
   'the moving-away defender is currently closer');
  assert.equal(assignment?.defender,f.alternate,'the defender projected into the mark should win');
  f.game.driveAI(f.alternate,.016);
  assert.ok(Math.abs(f.alternate.aiTarget.x-assignment.target.x)<1e-6);
  assert.ok(Math.abs(f.alternate.aiTarget.y-assignment.target.y)<1e-6);
  assert.equal(f.game.ball.owner,f.carrier,'arrival selection must not alter possession');

  const bounded=makeFixture(AI,ENGINE,team);
  bounded.third.moveVX=-bounded.attackDir*200;
  active(bounded.alternate,{x:bounded.targetX-bounded.attackDir*110,y:bounded.targetY+10,
   moveVX:bounded.attackDir*200,moveVY:0});
  const boundedAssignment=AI.defensiveThirdManRunnerTarget(team,bounded.carrier,bounded.game.players,
   bounded.bounds,bounded.primary,bounded.support);
  assert.equal(boundedAssignment?.defender,bounded.third,
   'a materially closer marker must remain preferred beyond the capped arrival tie-break');
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
test('third-man coverage follows projected marker arrival instead of static proximity',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const away=makeFixture(AI,ENGINE,team);
  active(away.support,{x:away.runner.x+away.attackDir*40,y:away.runner.y+76,moveVY:200});
  const uncovered=AI.defensiveThirdManRunnerTarget(team,away.carrier,away.game.players,
   away.bounds,away.primary,away.support);
  assert.ok(Math.hypot(away.support.x-away.runner.x,away.support.y-away.runner.y)<92,
   'the existing support is currently within the legacy coverage radius');
  assert.ok(uncovered,'a support defender moving away must not count as an effective mark');
  assert.equal(uncovered.defender,away.third,'the available third defender should cover the exposed runner');

  const closing=makeFixture(AI,ENGINE,team);
  active(closing.support,{x:closing.runner.x+closing.attackDir*40,y:closing.runner.y+76,moveVY:-200});
  const covered=AI.defensiveThirdManRunnerTarget(team,closing.carrier,closing.game.players,
   closing.bounds,closing.primary,closing.support);
  assert.equal(covered,null,'a support defender projected into the runner lane must retain the mark');
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

test('third-man marking assigns a second ready defender only to a separate comparable central runner',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=makeFixture(AI,ENGINE,team);
  const secondRunner=f.game.player(1-team,5),secondDefender=f.game.player(team,1);
  active(secondRunner,{x:f.ownGoalX-f.attackDir*190,y:f.centerY-105,moveVX:f.attackDir*50});
  const assignmentTargetX=secondRunner.x+f.attackDir*(50*.12+34);
  const assignmentTargetY=secondRunner.y+Math.min(18,(f.centerY-secondRunner.y)*.12);
  active(secondDefender,{x:assignmentTargetX-f.attackDir*75,y:assignmentTargetY+8,moveVX:f.attackDir*35});
  const assignment=AI.defensiveThirdManRunnerTarget(team,f.carrier,f.game.players,f.bounds,
   f.primary,f.support);
  assert.equal(assignment?.defender,f.third,'best defender retains the first central mark');
  assert.equal(assignment?.runner,f.runner,'best runner remains the first mark');
  assert.equal(assignment?.secondary?.defender,secondDefender,'a separate ready defender receives the second mark');
  assert.equal(assignment?.secondary?.runner,secondRunner,'the second mark must cover a distinct runner');
  assert.ok(Math.hypot(assignment.target.x-assignment.secondary.target.x,
   assignment.target.y-assignment.secondary.target.y)>=88,'the two marks must occupy distinct lanes');
  f.game.driveAI(f.third,.016);
  f.game.driveAI(secondDefender,.016);
  assert.ok(Math.abs(f.third.aiTarget.x-assignment.target.x)<1e-6);
  assert.ok(Math.abs(f.third.aiTarget.y-assignment.target.y)<1e-6);
  assert.ok(Math.abs(secondDefender.aiTarget.x-assignment.secondary.target.x)<1e-6);
  assert.ok(Math.abs(secondDefender.aiTarget.y-assignment.secondary.target.y)<1e-6);
  assert.equal(f.game.ball.owner,f.carrier,'two marks must not alter possession');
  assert.equal(AI.defensiveThirdManRunnerTarget(team,f.carrier,f.game.players,f.bounds,
   f.primary,f.support,secondDefender)?.secondary,undefined,
   'human-controlled defenders cannot receive the secondary mark');

  const overlap=makeFixture(AI,ENGINE,team);
  const overlapRunner=overlap.game.player(1-team,5),overlapDefender=overlap.game.player(team,1);
  active(overlapRunner,{x:overlap.runner.x,y:overlap.runner.y+12,moveVX:overlap.attackDir*40});
  active(overlapDefender,{x:overlap.third.x,y:overlap.third.y+10});
  const overlapping=AI.defensiveThirdManRunnerTarget(team,overlap.carrier,overlap.game.players,
   overlap.bounds,overlap.primary,overlap.support);
  assert.equal(overlapping?.secondary,undefined,'overlapping runner lanes must not attract duplicate marks');
 }
});
