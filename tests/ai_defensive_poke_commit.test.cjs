'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

let ENGINE;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 ({ENGINE}=await import('../src/modules/engine.js'));
});

const player=(t,x,y,extra={})=>({t,x,y,keeper:false,down:false,stun:0,invuln:0,z:0,dx:1,dy:0,face:1,...extra});
function commit(defender,carrier){
 return ENGINE.GameEngine.prototype.defensivePokeCommitWindow.call({},defender,carrier);
}

test('closing grounded carriers open the bounded early PASS-poke window in both directions',()=>{
 const rightDefender=player(0,1000,700,{dx:1,dy:0,face:1});
 const rightCarrier=player(1,1088,700,{moveVX:-240,moveVY:0});
 assert.equal(commit(rightDefender,rightCarrier),true);
 const leftDefender=player(1,1088,700,{dx:-1,dy:0,face:-1});
 const leftCarrier=player(0,1000,700,{moveVX:240,moveVY:0});
 assert.equal(commit(leftDefender,leftCarrier),true);
});

test('retreating, lateral and insufficiently closing carriers keep the existing timing',()=>{
 const defender=player(0,1000,700,{dx:1,dy:0,face:1});
 assert.equal(commit(defender,player(1,1088,700,{moveVX:240,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1088,700,{moveVX:0,moveVY:240})),false);
 assert.equal(commit(defender,player(1,1088,700,{moveVX:-80,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1088,700)),false);
 assert.equal(commit(defender,player(1,1088,700,{moveVX:NaN,moveVY:NaN,vx:-300,vy:0})),false,
  'legacy velocity must not override the zero-motion fallback used by the actual poke');
});

test('the early window follows the existing poke lead and 16-unit step contact budget',()=>{
 const defender=player(0,1000,700,{dx:1,dy:0,face:1});
 assert.equal(commit(defender,player(1,1089,700,{moveVX:-240,moveVY:0})),true);
 assert.equal(commit(defender,player(1,1090,700,{moveVX:-240,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1095,700,{moveVX:-300,moveVY:0})),false);
 assert.equal(commit(defender,player(1,1095,700,{moveVX:-240,moveVY:0})),false);
});

test('the early poke respects forward arc, player eligibility and finite coordinates',()=>{
 const carrier=player(1,1088,700,{moveVX:-240,moveVY:0});
 assert.equal(commit(player(0,1000,700,{dx:0,dy:1,face:1}),carrier),false);
 for(const invalid of [
  {down:true},{stun:.2},{invuln:.2},{z:20},{z:NaN},{action:'shotDown'},
  {action:'shotGetUp'},{keeper:true},{x:Infinity}
 ]) assert.equal(commit(player(1,1000,700,{dx:1,dy:0,face:1}),{...carrier,...invalid}),false,JSON.stringify(invalid));
 assert.equal(commit(player(0,1000,700),player(0,1088,700,{moveVX:-240,moveVY:0})),false);
 assert.equal(commit(player(0,1000,700),null),false);
});

test('ordinary CPU defenders use the adaptive poke window while primary press keeps its dedicated read',()=>{
 const source=fs.readFileSync('src/modules/engine.js','utf8');
 assert.ok(source.includes('(distance(p,owner)<68||this.defensivePokeCommitWindow(p,owner))'));
 assert.ok(source.includes('if(carrierDistance<74){'));
 assert.ok(source.includes('defensiveFirstTouchSlide(p,owner,this.playerSpeed(p))'));
});
