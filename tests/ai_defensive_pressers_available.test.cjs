'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadAI(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();return (await import('../src/modules/ai.js')).AI;}
const player=(name,x,y,extra={})=>({name,t:0,keeper:false,x,y,stun:0,...extra});
test('AI pressing skips unavailable defenders before assigning primary and cover',async()=>{
 const AI=await loadAI(),target={x:1000,y:600};
 const human=player('human',1001,600),keeper=player('keeper',1002,600,{keeper:true});
 const unavailable=[
  player('knocked-down',1004,600,{shotImpactKnockdownTimer:.5}),
  player('knockdown-pending',1006,600,{shotImpactKnockdownPending:.2}),
  player('getting-up',1008,600,{shotImpactRiseTimer:.24}),
  player('sliding',1010,600,{slideTimer:.35}),
  player('marked-down',1012,600,{down:true}),
  player('stunned',1014,600,{stun:.4})
 ];
 const primary=player('ready-primary',1080,600),cover=player('ready-cover',1090,720),far=player('far-formation-player',1400,400);
 const result=AI.defensivePressers([human,keeper,...unavailable,primary,cover,far],0,target,human);
 assert.equal(result.primary,primary,'nearest available teammate must take the press');
 assert.equal(result.support,cover,'next local available teammate must provide cover');
});
test('AI pressing returns no assignment when every teammate is unavailable',async()=>{
 const AI=await loadAI(),target={x:1000,y:600};
 const unavailable=[
  player('stunned',1001,600,{stun:.5}),player('sliding',1002,600,{slideTimer:.3}),
  player('knocked-down',1003,600,{shotImpactKnockdownTimer:.4}),
  player('pending',1004,600,{shotImpactKnockdownPending:.2}),
  player('getting-up',1005,600,{shotImpactRiseTimer:.2}),player('down-flag',1006,600,{down:true})
 ];
 assert.deepEqual(AI.defensivePressers(unavailable,0,target),{primary:null,support:null});
});
test('healthy pressing order and human/keeper exclusions remain unchanged',async()=>{
 const AI=await loadAI(),target={x:1000,y:600};
 const human=player('human',1001,600),keeper=player('keeper',1002,600,{keeper:true});
 const nearest=player('nearest',1050,600),second=player('second',1060,700);
 const result=AI.defensivePressers([human,keeper,nearest,second],0,target,human);
 assert.equal(result.primary,nearest);assert.equal(result.support,second);
});
