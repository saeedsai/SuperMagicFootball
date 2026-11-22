'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const helperStart=source.indexOf('function keeperDistributionReceiverReady(');
const helperEnd=source.indexOf('function keeperOutletScore(',helperStart);
assert.ok(helperStart>=0&&helperEnd>helperStart,'production keeper receiver-readiness helper exists');
const receiverReady=vm.runInNewContext('(function(){'+source.slice(helperStart,helperEnd)+';return keeperDistributionReceiverReady;})()',{});

test('keeper receiver readiness rejects airborne, down, stunned and active recovery states',()=>{
 const base={keeper:false,down:false,stun:0,z:0,x:10,y:20,action:'idle',actionTimer:0};
 assert.equal(receiverReady(base),true);
 const unavailable=[
  {down:true},{keeper:true},{stun:.1},{z:19},{z:NaN},
  {slideTimer:.1},{shotImpactKnockdownPending:.1},
  {shotImpactKnockdownTimer:.1},{shotImpactRiseTimer:.1},
  {action:'shotDown'},{action:'shotGetUp'},
  {action:'slide',actionTimer:.1},{action:'hurt',actionTimer:.1}
 ];
 for(const patch of unavailable)assert.equal(receiverReady({...base,...patch}),false,JSON.stringify(patch));
 const legacy={...base};delete legacy.z;
 assert.equal(receiverReady(legacy),true,'legacy grounded players without z remain eligible');
 assert.equal(receiverReady({...base,action:'hurt',actionTimer:0}),true);
});

async function loadEngine(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {ENGINE}=await import('../src/modules/engine.js');
 return ENGINE;
}
function prepare(ENGINE,team,allUnavailable=false){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const keeper=game.player(team,0),field=ENGINE.WORLD.field,dir=team===0?1:-1;
 const x=team===0?field.x+38:field.x+field.w-38,y=field.y+field.h*.5;
 Object.assign(keeper,{x,y,z:0,down:false,stun:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 const mates=game.players.filter(q=>q.t===team&&!q.keeper);
 for(const q of mates)Object.assign(q,{down:true,stun:0,z:0,action:'idle',actionTimer:0,
  slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
  x:x+dir*180,y});
 for(const q of game.players.filter(q=>q.t!==team&&!q.keeper))
  Object.assign(q,{down:true,stun:0,z:0,action:'idle',actionTimer:0,x:x+dir*700,y:y+250});
 let ready=null;
 if(allUnavailable){
  Object.assign(mates[0],{down:false,z:42});
  Object.assign(mates[1],{down:false,action:'shotGetUp',actionTimer:.4});
  Object.assign(mates[2],{down:false,action:'slide',actionTimer:.4});
  Object.assign(mates[3],{down:false,action:'hurt',actionTimer:.4});
  Object.assign(mates[4],{down:false,shotImpactKnockdownTimer:.4});
 }else{
  Object.assign(mates[0],{down:false,x:x+dir*180,y,action:'hurt',actionTimer:.4});
  ready=mates[1];
  Object.assign(ready,{down:false,x:x+dir*390,y:y+90,action:'idle',actionTimer:0});
 }
 game.take(keeper);
 Object.assign(keeper,{action:'keeperHold',actionTimer:0,keeperHold:1});
 game.clock=5;
 return {game,keeper,mates,ready};
}

test('keeper short distribution skips a nearer teammate in active recovery on both sides',async()=>{
 const ENGINE=await loadEngine();
 for(const team of [0,1]){
  const {game,keeper,ready}=prepare(ENGINE,team,false);
  const originalRandom=Math.random;let distributed=false;
  try{Math.random=()=>.5;distributed=game.distributeKeeper(keeper);}
  finally{Math.random=originalRandom;}
  const event=game.events.find(e=>e.type==='keeperDistribution');
  assert.equal(distributed,true);
  assert.ok(event,JSON.stringify({team,events:game.events}));
  assert.equal(event.mode,'short');
  assert.equal(event.target,ready.src.name,'the active forward outlet should receive the throw');
  assert.equal(game.ball.owner,null);
  assert.equal(game.ball.pass,true);
 }
});

test('keeper uses open turf rather than an airborne or recovering teammate when nobody is ready',async()=>{
 const ENGINE=await loadEngine();
 const {game,keeper,mates}=prepare(ENGINE,0,true);
 const originalRandom=Math.random;let distributed=false;
 try{Math.random=()=>.5;distributed=game.distributeKeeper(keeper);}
 finally{Math.random=originalRandom;}
 const event=game.events.find(e=>e.type==='keeperDistribution');
 assert.equal(distributed,true);
 assert.ok(event,JSON.stringify({events:game.events}));
 assert.equal(event.mode,'long');
 assert.equal(event.target,null);
 assert.equal(event.emptySpace,true);
 assert.ok(mates.every(q=>q.down||q.z>18||q.action==='shotGetUp'||q.action==='slide'||
  q.action==='hurt'||q.shotImpactKnockdownTimer>0));
});
