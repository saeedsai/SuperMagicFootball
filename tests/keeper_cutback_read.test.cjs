'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadEngine(){
 const {loadAssetsFromNode,GAME_ASSETS}=await import('../src/assets.js');
 const assets=await loadAssetsFromNode();
 const {ENGINE}=await import('../src/modules/engine.js');
 return {ENGINE,field:assets.mechanics.world.field};
}

function fixture(ENGINE,field,keeperTeam=0){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const keeper=game.players.find(p=>p.t===keeperTeam&&p.keeper);
 const attackingTeam=1-keeperTeam,attackDir=keeperTeam===0?-1:1;
 const ownGoalX=keeperTeam===0?field.x:field.x+field.w;
 const centerY=field.y+field.h/2;
 const carrier=game.players.find(p=>p.t===attackingTeam&&p.i===3);
 const runner=game.players.find(p=>p.t===attackingTeam&&p.i===4);
 const runner2=game.players.find(p=>p.t===attackingTeam&&p.i===5);
 keeper.x=ownGoalX+(keeperTeam===0?34:-34);keeper.y=centerY;
 keeper.homeX=keeper.x;keeper.homeY=keeper.y;
 carrier.x=ownGoalX-attackDir*220;carrier.y=centerY-300;
 carrier.stun=0;carrier.down=false;carrier.z=0;carrier.action='idle';carrier.actionTimer=0;
 runner.x=carrier.x-attackDir*150;runner.y=centerY+40;
 runner.moveVX=attackDir*70;runner.moveVY=0;
 runner.stun=0;runner.down=false;runner.z=0;runner.action='idle';runner.actionTimer=0;
 for(const p of game.players){
  if(p.t===attackingTeam&&!p.keeper&&p!==carrier&&p!==runner)p.down=true;
 }
 game.ball.owner=carrier;game.ball.x=carrier.x;game.ball.y=carrier.y;
 game.ball.vx=0;game.ball.vy=0;game.ball.vz=0;game.ball.z=0;
 game.ball.attacker=attackingTeam;game.ball.pass=false;game.ball.passTarget=null;
 game.ball.passTeam=null;game.ball.shot=null;game.ball.strike=null;game.ball.ordinaryShot=false;
 keeper.stun=0;keeper.down=false;keeper.z=0;keeper.aiTimer=0;keeper.aiTarget=null;
 keeper.aiAssistTarget=null;keeper.diveIntentPending=false;keeper.diveCooldown=0;
 return {game,keeper,carrier,runner,runner2,attackDir,centerY};
}

function targetY(f){
 f.game.driveAI(f.keeper,1/60);
 assert.ok(f.keeper.aiTarget,'goalkeeper must receive an AI positioning target');
 return f.keeper.aiTarget.y;
}

test('goalkeeper shades toward an active central cutback runner on both attacking sides',async()=>{
 const {ENGINE,field}=await loadEngine();
 for(const keeperTeam of [0,1]){
  const base=fixture(ENGINE,field,keeperTeam);base.runner.down=true;
  const baseline=targetY(base);
  const threat=fixture(ENGINE,field,keeperTeam);
  const adjusted=targetY(threat),delta=adjusted-baseline;
  assert.ok(delta*(threat.runner.y-baseline)>0,
   'keeper should shade toward the central runner instead of tracking only the wide carrier');
  assert.ok(Math.abs(delta)>=8,'a real but modest cutback read should be visible');
  assert.ok(Math.abs(delta)<=58+1e-9,'cutback shading must remain tightly bounded');
 }
});

test('keeper shades toward the projected lateral path of a moving cutback runner',async()=>{
 const {ENGINE,field}=await loadEngine();
 for(const keeperTeam of [0,1]){
  const still=fixture(ENGINE,field,keeperTeam);still.runner.moveVY=0;
  const stillY=targetY(still);
  const positive=fixture(ENGINE,field,keeperTeam);positive.runner.moveVY=220;
  const positiveY=targetY(positive);
  const negative=fixture(ENGINE,field,keeperTeam);negative.runner.moveVY=-220;
  const negativeY=targetY(negative);
  assert.ok(positiveY>stillY+1,'keeper should lead a runner moving toward the positive lateral lane');
  assert.ok(negativeY<stillY-1,'keeper should lead a runner moving toward the negative lateral lane');
  assert.ok(positiveY-stillY<=5.2,'positive lateral lead must remain bounded');
  assert.ok(stillY-negativeY<=5.2,'negative lateral lead must remain bounded');
 }
});

test('keeper retains its ordinary lane for central or distant carriers and unavailable or off-lane runners',async()=>{
 const {ENGINE,field}=await loadEngine();
 const cases=[
  f=>{f.carrier.y=f.centerY-40;},
  f=>{f.carrier.x=f.keeper.x-f.attackDir*520;},
  f=>{f.runner.y=f.centerY+430;},
  f=>{f.runner.x=f.carrier.x+f.attackDir*90;},
  f=>{f.runner.action='shotGetUp';f.runner.actionTimer=.4;}
 ];
 for(const keeperTeam of [0,1]){
  for(const configure of cases){
   const baselineFixture=fixture(ENGINE,field,keeperTeam);configure(baselineFixture);baselineFixture.runner.down=true;
   const baseline=targetY(baselineFixture);
   const candidate=fixture(ENGINE,field,keeperTeam);configure(candidate);
   assert.equal(targetY(candidate),baseline,
    'without a central active runner behind a wide byline carrier, keeper must keep its normal lane');
  }
 }
});


test('keeper selects the runner projected to arrive centrally rather than the currently closest runner',async()=>{
 const {ENGINE,field}=await loadEngine();
 for(const keeperTeam of [0,1])for(const wing of [-1,1]){
  const configure=(f,mode)=>{
   f.carrier.y=f.centerY+wing*300;
   f.game.ball.x=f.carrier.x;f.game.ball.y=f.carrier.y;
   f.runner.x=f.carrier.x-f.attackDir*150;
   f.runner2.x=f.runner.x;
   f.runner.y=f.centerY-wing*40;
   f.runner2.y=f.centerY-wing*58;
   f.runner.moveVX=f.attackDir*70;f.runner2.moveVX=f.attackDir*70;
   f.runner.moveVY=-wing*180;
   f.runner2.moveVY=wing*180;
   for(const p of [f.runner,f.runner2]){
    p.stun=0;p.z=0;p.action='idle';p.actionTimer=0;p.slideTimer=0;
   }
   f.runner.down=mode==='alternative-only';
   f.runner2.down=mode==='runner-only';
  };
  const runnerOnly=fixture(ENGINE,field,keeperTeam);configure(runnerOnly,'runner-only');
  const runnerOnlyY=targetY(runnerOnly);
  const alternativeOnly=fixture(ENGINE,field,keeperTeam);configure(alternativeOnly,'alternative-only');
  const alternativeOnlyY=targetY(alternativeOnly);
  const both=fixture(ENGINE,field,keeperTeam);configure(both,'both');
  const bothY=targetY(both);
  assert.ok(Math.abs(bothY-alternativeOnlyY)<1e-7,
   'team '+keeperTeam+' wing '+wing+': the arriving central runner should win the two-runner choice');
  assert.ok(Math.abs(bothY-runnerOnlyY)>1.5,
   'team '+keeperTeam+' wing '+wing+': the runner moving out of the lane must not keep priority');
 }
});

function markRunnerWithDefender(f,runner,recovering=false){
 const marker=f.game.players.find(p=>p.t===f.keeper.t&&!p.keeper&&p.i===4);
 assert.ok(marker,'fixture needs an outfield marker');
 const lead=value=>Math.max(-18,Math.min(18,(Number(value)||0)*.12));
 Object.assign(marker,{x:runner.x+lead(runner.moveVX),y:runner.y+lead(runner.moveVY),
  z:0,down:false,stun:0,slideTimer:0,shotImpactKnockdownPending:0,
  shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
  action:recovering?'hurt':'idle',actionTimer:recovering?.4:0,
  moveVX:0,moveVY:0});
 return marker;
}

test('keeper does not shade toward a tightly marked cutback runner, but ignores recovering markers',async()=>{
 const {ENGINE,field}=await loadEngine();
 for(const keeperTeam of [0,1]){
  const baselineFixture=fixture(ENGINE,field,keeperTeam);
  baselineFixture.runner.down=true;
  const baseline=targetY(baselineFixture);
  const marked=fixture(ENGINE,field,keeperTeam);
  markRunnerWithDefender(marked,marked.runner);
  assert.equal(targetY(marked),baseline,'a ready marker removes the uncovered cutback read');
  const recovering=fixture(ENGINE,field,keeperTeam);
  markRunnerWithDefender(recovering,recovering.runner,true);
  assert.notEqual(targetY(recovering),baseline,'a hurt-recovering defender must not falsely mark the runner');
 }
});

test('keeper selects an open alternative when the best cutback runner is tightly marked',async()=>{
 const {ENGINE,field}=await loadEngine();
 for(const keeperTeam of [0,1])for(const wing of [-1,1]){
  const configure=(f,mark)=>{
   f.carrier.y=f.centerY+wing*300;
   f.game.ball.x=f.carrier.x;f.game.ball.y=f.carrier.y;
   f.runner.x=f.carrier.x-f.attackDir*150;f.runner2.x=f.runner.x;
   f.runner.y=f.centerY-wing*58;f.runner2.y=f.centerY-wing*130;
   f.runner.moveVX=f.attackDir*70;f.runner2.moveVX=f.attackDir*70;
   f.runner.moveVY=wing*180;f.runner2.moveVY=-wing*180;
   for(const p of [f.runner,f.runner2]){p.down=false;p.stun=0;p.z=0;p.action='idle';p.actionTimer=0;p.slideTimer=0;}
   if(mark)markRunnerWithDefender(f,f.runner);
  };
  const alternative=fixture(ENGINE,field,keeperTeam);configure(alternative,false);alternative.runner.down=true;
  const alternativeY=targetY(alternative);
  const marked=fixture(ENGINE,field,keeperTeam);configure(marked,true);
  assert.equal(targetY(marked),alternativeY,'the open alternative should win after the best runner is marked');
  const unmarked=fixture(ENGINE,field,keeperTeam);configure(unmarked,false);
  assert.notEqual(targetY(unmarked),alternativeY,'without a marker the higher-quality runner should control the shade');
 }
});
