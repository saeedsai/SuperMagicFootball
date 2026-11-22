'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const target={x:500,y:300};
const defender=(x,y,patch={})=>({
 t:0,keeper:false,x,y,stun:0,down:false,slideTimer:0,
 shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
 z:0,action:'idle',actionTimer:0,...patch
});

test('CPU press assignments skip airborne, downed and impact-recovering players',async()=>{
 const {AI}=await loadModules();
 const unavailable=[
  defender(500,300,{z:88,action:'jump'}),
  defender(501,300,{action:'shotDown'}),
  defender(502,300,{action:'shotGetUp'}),
  defender(503,300,{action:'slide',actionTimer:.24}),
  defender(504,300,{action:'hurt',actionTimer:.24}),
  defender(505,300,{shotImpactKnockdownPending:.2}),
  defender(506,300,{shotImpactKnockdownTimer:.2}),
  defender(507,300,{shotImpactRiseTimer:.2}),
  defender(508,300,{z:NaN}),
  defender(509,300,{down:true}),
  defender(510,300,{stun:.2})
 ];
 const primary=defender(530,300),support=defender(565,365);
 const assigned=AI.defensivePressers([...unavailable,primary,support],0,target,null);
 assert.equal(assigned.primary,primary,'nearest eligible grounded defender presses');
 assert.equal(assigned.support,support,'next eligible defender provides cover');
});

test('legacy defenders without a height field remain eligible and stable ties preserve input order',async()=>{
 const {AI}=await loadModules();
 const legacy=defender(520,300,{z:undefined});
 const grounded=defender(540,300);
 const tied=defender(520,300,{z:0});
 const assigned=AI.defensivePressers([legacy,tied,grounded],0,target,null);
 assert.equal(assigned.primary,legacy);
 assert.equal(assigned.support,tied);
});

test('driveAI keeps an airborne nearest teammate out of both press and support roles on both sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const dir=team===0?1:-1,primary=game.player(team,3),support=game.player(team,4),airborne=game.player(team,5);
  const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
  for(const p of game.players){
   p.aiTarget=null;p.aiTimer=0;p.aiAssistTarget=null;p.aiGiveAndGoRun=null;
   p.action='idle';p.actionTimer=0;p.z=0;p.down=true;p.stun=1;
  }
  for(const p of [primary,support]){
   Object.assign(p,{x:x-dir*18,y:y+(p===support?65:0),down:false,stun:0,z:0,
    action:'idle',actionTimer:0,slideTimer:0,shotImpactKnockdownPending:0,
    shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,aiTarget:null,aiTimer:0});
  }
  Object.assign(airborne,{x:x-dir*2,y:y+1,down:false,stun:0,z:88,
   action:'jump',actionTimer:0,slideTimer:0,aiTarget:null,aiTimer:0});
  Object.assign(game.ball,{owner:null,pass:false,shot:null,strike:null,ordinaryShot:false,
   x,y,z:0,vx:0,vy:0,vz:0,canCollect:0,age:2,lastTouchTeam:1-team,attacker:1-team});
  game.clock=5;
  game.driveAI(primary,.016);game.driveAI(support,.016);
  assert.ok(Math.hypot(primary.aiTarget.x-x,primary.aiTarget.y-y)<1e-6,
   'the grounded primary, not the closer airborne teammate, attacks the ball');
  assert.ok(Math.abs(support.aiTarget.x-(x-dir*110))<1e-6);
  assert.ok(Math.abs(support.aiTarget.y-(y+95))<1e-6,
   'the second grounded defender retains the normal cover position');
 }
});
