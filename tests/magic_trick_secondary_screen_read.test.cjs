'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadAI(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();return (await import('../src/modules/ai.js')).AI;}
function carrier(overrides={}){return {t:0,x:100,y:400,dx:1,dy:0,face:1,firstTouchOutletReadTimer:.8,firstTouchControlTimer:0,firstTouchPressure:.6,hideBallTimer:0,...overrides};}
function defender(overrides={}){return {t:1,x:50,y:400,dx:0,dy:0,face:1,defence:80,stun:0,invuln:0,down:false,z:0,action:'idle',actionTimer:0,...overrides};}
test('a second defender screening the visible first-touch carry lane reads a trick when the nearest marker is turned away',async()=>{
 const AI=await loadAI(),p=carrier(),nearest=defender({x:55,face:-1}),screen=defender({x:165,face:-1,defence:92});
 const read=AI.defensiveMagicTrickReadTarget(p,[nearest,screen],true);
 assert.equal(read?.defender,screen);assert.equal(read?.screened,true);assert.equal(read?.gap,65);
 assert.equal(AI.defensiveMagicTrickReadTarget(p,[nearest,screen],false),null);
});
test('the first-touch screen read mirrors when the carrier attacks left',async()=>{
 const AI=await loadAI(),p=carrier({t:1,x:200,dx:-1,face:-1}),screen=defender({x:135,face:1});
 const read=AI.defensiveMagicTrickReadTarget(p,[screen],true);
 assert.equal(read?.defender,screen);assert.equal(read?.screened,true);
});
test('ordinary Magic Trick reads still require a nearby active defender closing and facing the carrier',async()=>{
 const AI=await loadAI(),p=carrier({firstTouchOutletReadTimer:0,firstTouchPressure:0}),closing=defender({x:50,dx:1,face:1});
 const read=AI.defensiveMagicTrickReadTarget(p,[closing],true);
 assert.equal(read?.defender,closing);assert.equal(read?.screened,false);
 assert.equal(AI.defensiveMagicTrickReadTarget(p,[{...closing,face:-1}],true),null);
 assert.equal(AI.defensiveMagicTrickReadTarget(p,[{...closing,dx:0}],true),null);
});
test('unavailable, airborne, recovering, hidden-ball and backwards first-touch states cannot create a lane read',async()=>{
 const AI=await loadAI(),p=carrier(),screen=defender({x:165,face:-1});
 for(const patch of [{down:true},{stun:.2},{invuln:.2},{z:30},{action:'shotDown'},{action:'shotGetUp'},
  {action:'slide',actionTimer:.2},{action:'hurt',actionTimer:.2},{shotImpactKnockdownPending:.2},
  {shotImpactKnockdownTimer:.2},{shotImpactRiseTimer:.2}]){
  assert.equal(AI.defensiveMagicTrickReadTarget(p,[{...screen,...patch}],true),null);
 }
 assert.equal(AI.defensiveMagicTrickReadTarget({...p,hideBallTimer:.3},[screen],true),null);
 assert.equal(AI.defensiveMagicTrickReadTarget({...p,firstTouchOutletReadTimer:0},[screen],true),null);
 assert.equal(AI.defensiveMagicTrickReadTarget({...p,dx:-1},[screen],true),null);
});
