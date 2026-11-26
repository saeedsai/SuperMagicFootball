'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const aiSource=fs.readFileSync('src/modules/ai.js','utf8');
const turnStart=aiSource.indexOf('function carrierTurnAwareVelocity(');
const turnEnd=aiSource.indexOf('\n\n// Assign the closest available AI player',turnStart);
assert.ok(turnStart>=0&&turnEnd>turnStart,'locate the production Agility-turn helper');
const turnVelocity=vm.runInNewContext('(function(){'+aiSource.slice(turnStart,turnEnd)+';return carrierTurnAwareVelocity;})()');
const start=source.indexOf('function keeperParrySide(');
const end=source.indexOf('function keeperOutletScore(',start);
assert.ok(start>=0&&end>start,'locate production keeper parry helper');
const helper=vm.runInNewContext('(function(F,clamp,distance,defensiveCarrierTurnVelocity){'+source.slice(start,end)+';return keeperParrySide;})',{})( 
 {y:0,h:680},(v,a,b)=>Math.max(a,Math.min(b,v)),(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),turnVelocity
);
const keeper=(t=0)=>({t,x:t===0?80:1520,y:340,keeper:true});
const rival=(x,y,extra={})=>({t:1,x,y,stun:0,z:0,down:false,...extra});
test('parry redirects below an attacker occupying the upper rebound lane',()=>{
 assert.equal(helper(keeper(0),[rival(210,300)],-1),1);
});
test('parry redirects above an attacker occupying the lower rebound lane',()=>{
 assert.equal(helper(keeper(0),[rival(210,380)],1),-1);
});
test('away-side keeper mirrors the forward rebound corridor',()=>{
 assert.equal(helper(keeper(1),[rival(1390,300,{t:0})],-1),1);
});
test('no nearby pressure preserves the original shot-angle direction',()=>{
 assert.equal(helper(keeper(0),[],-1),-1);
 assert.equal(helper(keeper(0),[rival(900,100)],1),1);
});
test('stunned, downed, knocked-down, hurt and high-airborne opponents do not bias the parry',()=>{
 const inactive=[
  rival(210,300,{stun:1}),rival(210,300,{down:true}),
  rival(210,300,{shotImpactKnockdownTimer:.2}),
  rival(210,300,{action:'hurt',actionTimer:.3}),rival(210,300,{z:40})
 ];
 assert.equal(helper(keeper(0),inactive,-1),-1);
});
test('parry anticipates an attacker moving into the preferred rebound lane',()=>{
 assert.equal(helper(keeper(0),[rival(250,470,{moveVX:0,moveVY:-300})],1),-1);
});
test('parry movement projection mirrors for the away-side keeper',()=>{
 assert.equal(helper(keeper(1),[rival(1350,470,{t:0,moveVX:0,moveVY:-300})],1),-1);
});

test('parry includes a runner outside the current radius when bounded motion can enter the rebound corridor',()=>{
 const k=keeper(0),runner=rival(450,450,{moveVX:-300,moveVY:0});
 assert.ok(Math.hypot(runner.x-k.x,runner.y-k.y)>360,'runner starts outside the old scan radius');
 assert.ok(Math.hypot(runner.x-144-k.x,runner.y-k.y)<360,'the existing capped lead enters the keeper neighborhood');
 assert.equal(helper(k,[runner],1),-1,'the late runner occupies the preferred lower rebound lane');
});

test('parry excludes runners beyond the maximum per-axis projected scan envelope',()=>{
 const k=keeper(0),runner=rival(700,450,{moveVX:-300,moveVY:0});
 assert.ok(Math.hypot(runner.x-k.x,runner.y-k.y)>360+Math.SQRT2*150);
 assert.equal(helper(k,[runner],1),1,'a runner that cannot enter the bounded neighborhood does not bias the lane');
});
test('parry movement projection falls back to legacy velocity fields',()=>{
 assert.equal(helper(keeper(0),[rival(250,470,{vx:0,vy:-300})],1),-1);
});
test('a stationary attacker retains the original shot-angle side when both lanes remain similar',()=>{
 assert.equal(helper(keeper(0),[rival(130,250,{moveVX:0,moveVY:0})],1),1);
});
test('nearly equal rebound lanes retain the shot-angle fallback',()=>{
 assert.equal(helper(keeper(0),[rival(210,340)],-1),-1);
});
test('selected clear side controls the actual rebound direction even with a large shot-angle offset',()=>{
 const side=helper(keeper(0),[rival(210,300)],-50);
 const reboundVy=side*(115+Math.abs(-50)*4);
 assert.equal(side,1);
 assert.ok(reboundVy>0,'the selected clear lane must control the rebound sign');
 assert.equal(Math.abs(reboundVy),315,'parry magnitude remains the previous shot-angle magnitude');
});
test('no-pressure rebound preserves the original shot-angle direction and magnitude',()=>{
 for(const dy of [-50,0,50]){
  const reboundVy=helper(keeper(0),[],dy)*(115+Math.abs(dy)*4);
  assert.equal(reboundVy,Math.sign(dy||1)*(115+Math.abs(dy)*4));
 }
});
test('keeper parry chooses the clear lane from Agility-limited attacker turns on both goals',()=>{
 for(const team of [0,1]){
  const k=keeper(team),dir=team===0?1:-1;
  const marker=(agility,turning=true,invalid=false)=>rival(k.x+dir*120,k.y,{
   t:1-team,moveVX:0,moveVY:-300,
   dx:invalid?NaN:(turning?dir*.01:0),dy:invalid?Infinity:(turning?1:0),
   src:{agility}
  });
  assert.equal(helper(k,[marker(100)],1),-1,
   'an elite runner turning into the preferred lower lane must make the keeper use the upper lane (team '+team+')');
  assert.equal(helper(k,[marker(1)],1),1,
   'a low-Agility runner still moving away must not falsely block the lower lane (team '+team+')');
  assert.equal(helper(k,[marker(100,false)],1),1,
   'neutral input must preserve the exact linear fallback (team '+team+')');
  assert.equal(helper(k,[marker(100,true,true)],1),1,
   'invalid input must preserve the exact linear fallback (team '+team+')');
 }
});

test('actual dive deflection uses the selected side without changing outward speed or catch threshold',()=>{
 assert.ok(source.includes('b.vy=keeperParrySide(p,this.players,dy)*(115+Math.abs(dy)*4)'));
 assert.ok(source.includes('b.vx=sign*(290+skill*4.1)'));
 assert.ok(source.includes('const catchThreshold=saveQuality*.62*(1-.10*fatigue)'));
 assert.ok(source.includes('if(force<catchThreshold)'));
});

test('shot-impact pending/rise and explicit shot-down/get-up poses do not bias the parry',()=>{
 const inactive=[
  rival(210,300,{shotImpactKnockdownPending:.2}),
  rival(210,300,{shotImpactRiseTimer:.2}),
  rival(210,300,{action:'shotDown',actionTimer:.3}),
  rival(210,300,{action:'shotGetUp',actionTimer:.3})
 ];
 for(const player of inactive){
  assert.equal(helper(keeper(0),[player],-1),-1,JSON.stringify(player));
 }
});
