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
 const game=new ENGINE.GameEngine({halfSeconds:120},'quick',0,0,1);
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
 assert.notEqual(game.ball.passTarget,runner.src.id);
 const next=fixture(ENGINE);
 assert.equal(next.game.pass(next.carrier,false,false,{preferredTarget:next.runner,supportRun:true}),true);
 assert.equal(next.game.ball.passTarget,next.runner.src.id);
});

const fs=require('node:fs');
const path=require('node:path');
test('driveAI wires the pressure-checked support runner into the existing PASS action',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 assert.match(source,/attackingSupportPass\(this\.players,t,owner,supportRun\)/);
 assert.match(source,/preferredTarget:supportPassTarget,supportRun:true/);
});
