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

test('validated loose-ball landing press uses bounded momentum to select the defender who can arrive first',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,target={x:500,y:300,landingRead:true};
  const nearerRetreating=player('nearer-retreating',target.x-dir*100,target.y,{moveVX:-dir*220,moveVY:0});
  const fartherClosing=player('farther-closing',target.x-dir*110,target.y,{moveVX:dir*220,moveVY:0});
  nearerRetreating.t=team;fartherClosing.t=team;
  const ordinary=AI.defensivePressers([nearerRetreating,fartherClosing],team,{x:target.x,y:target.y});
  assert.equal(ordinary.primary,nearerRetreating,'ordinary ball targets retain distance-first ordering');
  const landing=AI.defensivePressers([nearerRetreating,fartherClosing],team,target);
  assert.equal(landing.primary,fartherClosing,'a defender closing on the landing can beat a slightly nearer retreating defender');
  assert.equal(landing.support,nearerRetreating,'the other ready defender remains available for goal-side cover');
 }
});

test('validated landing support selects the defender already arriving at the goal-side cover pocket',async()=>{
 const AI=await loadAI();
 for(const team of [0,1]){
  const dir=team===0?1:-1,target={x:500,y:300,landingRead:true};
  const cover={x:target.x-dir*26,y:target.y};
  const primary=player('primary',target.x,target.y);
  const atPocket=player('at-pocket',cover.x,cover.y,{moveVX:dir*220,moveVY:0});
  const closing=player('closing',cover.x-dir*4,cover.y,{moveVX:dir*33,moveVY:0});
  for(const p of [primary,atPocket,closing])p.t=team;
  const legacy=AI.defensivePressers([primary,atPocket,closing],team,target);
  assert.equal(legacy.primary,primary);
  assert.equal(legacy.support,atPocket,'without a cover target, legacy landing-center ordering is retained');
  const arrival=AI.defensivePressers([primary,atPocket,closing],team,target,null,cover);
  assert.equal(arrival.primary,primary);
  assert.equal(arrival.support,closing,'a farther defender already moving into the pocket wins the support assignment');
 }
});
