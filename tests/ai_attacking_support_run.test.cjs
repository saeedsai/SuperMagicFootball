'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadAI(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();return (await import('../src/modules/ai.js')).AI;}
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,homeY:y,stun:0,z:0,...extra});

test('attacking support runner advances toward goal in a safer mirrored lane',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
  const runner=player('runner',team,carrier.x+dir*50,300);
  const blocker=player('blocker',1-team,carrier.x+dir*160,188);
  const result=AI.attackingSupportRun([carrier,runner,blocker],team,carrier,null,bounds);
  assert.equal(result?.runner,runner);
  assert.equal(result.target.x,carrier.x+dir*160);
  assert.equal(result.target.y,412,'runner should use the lateral lane away from the defender');
 }
});

test('human, keeper, recovering, sliding, downed and airborne teammates cannot consume the support run',async()=>{
 const AI=await loadAI(),carrier=player('carrier',0,400,300),human=player('human',0,430,300);
 const unavailable=[
  player('keeper',0,420,300,{keeper:true}),player('stunned',0,425,300,{stun:.2}),
  player('down',0,426,300,{down:true}),player('sliding',0,427,300,{slideTimer:.2}),
  player('pending',0,428,300,{shotImpactKnockdownPending:.2}),
  player('knocked-down',0,429,300,{shotImpactKnockdownTimer:.2}),
  player('getting-up',0,431,300,{shotImpactRiseTimer:.2}),
  player('airborne',0,432,300,{z:30}),player('assisting',0,433,300,{aiAssistTarget:{expires:5}})
 ];
 const available=player('available',0,460,300);
 const result=AI.attackingSupportRun([carrier,human,...unavailable,available],0,carrier,human,bounds);
 assert.equal(result?.runner,available);
});

test('support run avoids a teammate already occupying its arrival lane',async()=>{
 const AI=await loadAI(),carrier=player('carrier',0,400,300),runner=player('runner',0,450,300);
 const laneMate=player('lane-mate',0,550,188,{aiAssistTarget:{expires:5}});
 const result=AI.attackingSupportRun([carrier,runner,laneMate],0,carrier,null,bounds);
 assert.equal(result?.runner,runner);
 assert.equal(result.target.y,412);
});

test('support target stays inside pitch bounds and malformed/no-space inputs fall back',async()=>{
 const AI=await loadAI(),carrier=player('carrier',0,900,30),runner=player('runner',0,850,30);
 const result=AI.attackingSupportRun([carrier,runner],0,carrier,null,bounds);
 assert.equal(result?.target.x,976);
 assert.ok(result.target.y>=bounds.yMin&&result.target.y<=bounds.yMax);
 assert.equal(AI.attackingSupportRun([carrier,runner],0,carrier,null,null),null);
 assert.equal(AI.attackingSupportRun([carrier],0,carrier,null,bounds),null);
 assert.equal(AI.attackingSupportRun([carrier,runner],1,carrier,null,bounds),null);
});
