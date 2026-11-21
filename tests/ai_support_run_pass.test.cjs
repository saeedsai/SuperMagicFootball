'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {AI}=await import('../src/modules/ai.js');
 const {ENGINE}=await import('../src/modules/engine.js');
 return {AI,ENGINE};
}

function fixture(ENGINE){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.players.find(p=>p.t===0&&p.i===3);
 const runner=game.players.find(p=>p.t===0&&p.i===4);
 const decoy=game.players.find(p=>p.t===0&&p.i===1);
 carrier.x=250;carrier.y=300;carrier.dx=1;carrier.dy=0;
 runner.x=420;runner.y=188;runner.dx=1;runner.dy=-.5;
 decoy.x=330;decoy.y=300;decoy.dx=1;decoy.dy=0;
 for(const p of game.players){
  if(p.t===0&&p!==carrier&&p!==runner&&p!==decoy){p.x=340;p.y=300;}
  if(p.t===1){p.x=850;p.y=550;p.stun=0;p.down=false;p.z=0;p.action='idle';}
 }
 game.ball.owner=carrier;
 return {game,carrier,runner,decoy,defender:game.players.find(p=>p.t===1&&!p.keeper)};
}

test('AI support pass selects the runner only after reaching a clear forward lane',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x+8,y:runner.y-6}};
 const target=AI.attackingSupportPass(game.players,0,carrier,supportRun);
 assert.equal(target,runner);
 assert.equal(game.pass(carrier,false,false,{preferredTarget:target,supportRun:true}),true);
 assert.equal(game.ball.passTarget,runner.src.id);
});

test('support-run PASS leads a moving receiver using bounded world velocity',async()=>{
 const {ENGINE}=await loadModules();
 const stationary=fixture(ENGINE),moving=fixture(ENGINE),fast=fixture(ENGINE);
 for(const f of [stationary,moving,fast]){f.runner.dx=0;f.runner.dy=0;f.runner.moveVX=0;f.runner.moveVY=0;}
 moving.runner.moveVX=1000;fast.runner.moveVX=5000;
 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  assert.equal(stationary.game.pass(stationary.carrier,false,false,{preferredTarget:stationary.runner,supportRun:true}),true);
  assert.equal(moving.game.pass(moving.carrier,false,false,{preferredTarget:moving.runner,supportRun:true}),true);
  assert.equal(fast.game.pass(fast.carrier,false,false,{preferredTarget:fast.runner,supportRun:true}),true);
 }finally{Math.random=originalRandom;}
 const slope=game=>game.ball.vy/game.ball.vx;
 assert.ok(slope(moving.game)>slope(stationary.game),'forward receiver motion moves the pass aim ahead');
 assert.ok(Math.abs(slope(fast.game)-slope(moving.game))<1e-9,'extreme receiver speed cannot exceed the lead cap');
});

test('active grounded defenders block a support-run pass corridor or arrival point',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=(carrier.x+runner.x)/2;defender.y=(carrier.y+runner.y)/2;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),null);
 defender.x=runner.x+28;defender.y=runner.y+12;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),null);
});

test('downed, high-airborne and too-late recovering defenders do not block the ground lane',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=(carrier.x+runner.x)/2;defender.y=(carrier.y+runner.y)/2;
 defender.down=true;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
 defender.down=false;defender.z=40;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
 defender.z=0;defender.stun=2;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
});

test('a runner who has not entered the support lane is not force-selected',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,{runner,target:{x:runner.x+220,y:runner.y+20}}),null);
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,null),null);
});

test('support-run preference is opt-in and ordinary AI receiver ranking remains the fallback',async()=>{
 const {ENGINE}=await loadModules();
 const {game,carrier,runner}=fixture(ENGINE);
 assert.equal(game.pass(carrier,false,false,{preferredTarget:runner}),true);
 assert.equal(game.events.at(-1)?.mode,'ai');
 const next=fixture(ENGINE);
 assert.equal(next.game.pass(next.carrier,false,false,{preferredTarget:next.runner,supportRun:true}),true);
 assert.equal(next.game.ball.passTarget,next.runner.src.id);
 assert.equal(next.game.events.at(-1)?.mode,'supportRun');
});

test('a grounded defender projected into the support-run lane cancels the preferred receiver',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=335;defender.y=320;defender.moveVX=0;defender.moveVY=-450;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),null);
});

test('a defender moving away from the support-run lane does not block the clear pass',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=335;defender.y=320;defender.moveVX=0;defender.moveVY=300;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
});

test('invalid defender velocity remains neutral for support-run lane prediction',async()=>{
 const {AI,ENGINE}=await loadModules();
 const {game,carrier,runner,defender}=fixture(ENGINE);
 const supportRun={runner,target:{x:runner.x,y:runner.y}};
 defender.x=335;defender.y=320;defender.moveVX=NaN;defender.moveVY=NaN;
 assert.equal(AI.attackingSupportPass(game.players,0,carrier,supportRun),runner);
});

const fs=require('node:fs');
const path=require('node:path');
test('driveAI wires the pressure-checked support runner into the existing PASS action',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 assert.match(source,/attackingSupportPass\(this\.players,t,owner,supportRun\)/);
 assert.match(source,/preferredTarget:supportPassTarget,supportRun:true/);
});
