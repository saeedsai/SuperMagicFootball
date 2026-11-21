'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadEngine(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {ENGINE}=await import('../src/modules/engine.js');
 return ENGINE;
}

function fixture(ENGINE,keeperTeam=0){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const keeper=game.players.find(p=>p.t===keeperTeam&&p.keeper);
 const attackingTeam=1-keeperTeam,attackDir=keeperTeam===0?-1:1;
 const carrier=game.players.find(p=>p.t===attackingTeam&&p.i===3);
 const runner=game.players.find(p=>p.t===attackingTeam&&p.i===4);
 const centerY=game.ball.y;
 carrier.x=keeper.x-attackDir*180;carrier.y=centerY-300;
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
 return {game,keeper,carrier,runner,attackDir,centerY};
}

function targetY(f){
 f.game.driveAI(f.keeper,1/60);
 assert.ok(f.keeper.aiTarget,'goalkeeper must receive an AI positioning target');
 return f.keeper.aiTarget.y;
}

test('goalkeeper shades toward an active central cutback runner on both attacking sides',async()=>{
 const ENGINE=await loadEngine();
 for(const keeperTeam of [0,1]){
  const base=fixture(ENGINE,keeperTeam);base.runner.down=true;
  const baseline=targetY(base);
  const threat=fixture(ENGINE,keeperTeam);
  const adjusted=targetY(threat),delta=adjusted-baseline;
  assert.ok(delta*(threat.runner.y-baseline)>0,
   'keeper should shade toward the central runner instead of tracking only the wide carrier');
  assert.ok(Math.abs(delta)>=8,'a real but modest cutback read should be visible');
  assert.ok(Math.abs(delta)<=58+1e-9,'cutback shading must remain tightly bounded');
 }
});

test('keeper retains its ordinary lane for central or distant carriers and unavailable or off-lane runners',async()=>{
 const ENGINE=await loadEngine();
 const cases=[
  f=>{f.carrier.y=f.centerY-40;},
  f=>{f.carrier.x=f.keeper.x-f.attackDir*520;},
  f=>{f.runner.y=f.centerY+430;},
  f=>{f.runner.x=f.carrier.x+f.attackDir*90;},
  f=>{f.runner.action='shotGetUp';f.runner.actionTimer=.4;}
 ];
 for(const keeperTeam of [0,1]){
  for(const configure of cases){
   const baselineFixture=fixture(ENGINE,keeperTeam);configure(baselineFixture);baselineFixture.runner.down=true;
   const baseline=targetY(baselineFixture);
   const candidate=fixture(ENGINE,keeperTeam);configure(candidate);
   assert.equal(targetY(candidate),baseline,
    'without a central active runner behind a wide byline carrier, keeper must keep its normal lane');
  }
 }
});
