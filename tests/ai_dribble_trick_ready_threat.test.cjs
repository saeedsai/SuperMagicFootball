'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
let ENGINE;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {ENGINE:engine}=await import('../src/modules/engine.js');
 ENGINE=engine;
});
function attempt(team,{nearestPatch={},farPatch={},byAI=true,random=.4}={}){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.player(team,3),nearest=game.player(1-team,3),far=game.player(1-team,4);
 const field=ENGINE.WORLD.field,dir=team===0?1:-1,x=field.x+field.w*.5,y=field.y+field.h*.5;
 for(const q of game.players)if(q!==carrier&&q!==nearest&&q!==far)
  Object.assign(q,{down:true,stun:1,z:0,action:'idle',actionTimer:0});
 Object.assign(carrier,{x,y,z:0,down:false,stun:0,invuln:0,action:'run',actionTimer:0,
  dx:dir,dy:0,face:dir,moveVX:0,moveVY:0,cd:0,trickCd:0,dribbleCooldown:0,fatigue:0,breath:1});
 Object.assign(carrier.src,{dribbleType:'stepovers',dribbling:10,agility:10,stamina:80});
 Object.assign(nearest,{x:x+dir*40,y:y-50,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
  dx:0,dy:0,face:-dir,moveVX:0,moveVY:0});
 Object.assign(nearest.src,{defence:100,aggression:100});
 Object.assign(far,{x:x+dir*80,y:y+40,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
  dx:0,dy:0,face:-dir,moveVX:0,moveVY:0});
 Object.assign(far.src,{defence:1,aggression:1});
 Object.assign(nearest,nearestPatch);Object.assign(far,farPatch);
 game.take(carrier);
 Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false,shot:null,strike:null,ordinaryShot:false});
 game.clock=1;
 const start=game.events.length,originalRandom=Math.random;
 try{Math.random=()=>random;assert.equal(game.tryDribbleTrick(carrier,byAI),true);}
 finally{Math.random=originalRandom;}
 const event=game.events.slice(start).find(e=>e.type==='dribbleTrick');
 assert.ok(event,'the real engine should emit the dribble-trick result');
 return {event,yDelta:carrier.y-y,owner:game.ball.owner===carrier};
}
test('CPU trick duel ignores downed, invulnerable and recovery-state nearest opponents on both sides',()=>{
 const unavailable=[['downed',{down:true}],['invulnerable',{invuln:.4}],['shot-down',{action:'shotDown',actionTimer:.3}],
  ['getting-up',{action:'shotGetUp',actionTimer:.3}],['hurt-recovery',{action:'hurt',actionTimer:.3}],
  ['pending-impact',{shotImpactKnockdownPending:.3}],['impact-knockdown',{shotImpactKnockdownTimer:.3}],
  ['impact-rise',{shotImpactRiseTimer:.3}]];
 for(const team of [0,1])for(const [name,patch] of unavailable){
  const row=attempt(team,{nearestPatch:patch});
  assert.equal(row.event.ai,true,JSON.stringify({team,name,row}));
  assert.equal(row.event.success,true,JSON.stringify({team,name,row}));
  assert.ok(row.yDelta<0,JSON.stringify({team,name,row}));
  assert.equal(row.owner,true,JSON.stringify({team,name,row}));
 }
});
test('CPU still respects the nearest active defender and an active slide remains a real threat',()=>{
 for(const team of [0,1]){
  const active=attempt(team);
  assert.equal(active.event.success,false,JSON.stringify({team,active}));
  assert.ok(active.yDelta>0,JSON.stringify({team,active}));
  const slide=attempt(team,{nearestPatch:{action:'slide',actionTimer:.3,slideTimer:.3,slideRemaining:120}});
  assert.equal(slide.event.success,false,JSON.stringify({team,slide}));
  assert.ok(slide.yDelta>0,JSON.stringify({team,slide}));
 }
});
test('when no ready rival exists the CPU uses the existing uncontested trick path, while human targeting is unchanged',()=>{
 for(const team of [0,1]){
  const free=attempt(team,{nearestPatch:{down:true},farPatch:{down:true}});
  assert.equal(free.event.success,true,JSON.stringify({team,free}));
  assert.equal(free.owner,true,JSON.stringify({team,free}));
  const human=attempt(team,{nearestPatch:{down:true},byAI:false});
  assert.equal(human.event.ai,false,JSON.stringify({team,human}));
  assert.equal(human.event.success,false,JSON.stringify({team,human}));
  assert.ok(human.yDelta>0,JSON.stringify({team,human}));
 }
});
