'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf('function keeperParrySide(');
const end=source.indexOf('function keeperOutletScore(',start);
assert.ok(start>=0&&end>start,'locate production keeper parry helper');
const helper=vm.runInNewContext('(function(F,clamp,distance){'+source.slice(start,end)+';return keeperParrySide;})',{})(
 {y:0,h:680},(v,a,b)=>Math.max(a,Math.min(b,v)),(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)
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
test('nearly equal rebound lanes retain the shot-angle fallback',()=>{
 assert.equal(helper(keeper(0),[rival(210,340)],-1),-1);
});
test('actual dive deflection uses the selected side without changing outward speed or catch threshold',()=>{
 assert.ok(source.includes('b.vy=dy*4+keeperParrySide(p,this.players,dy)*115'));
 assert.ok(source.includes('b.vx=sign*(290+skill*4.1)'));
 assert.ok(source.includes('if(force<saveQuality*.62)'));
});
