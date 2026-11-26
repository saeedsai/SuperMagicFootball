'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const start=engine.indexOf('function carrierTurnAwareVelocity(');
const end=engine.indexOf('\nfunction defensivePokeBallSideRead(',start);
assert.ok(start>=0&&end>start,'extract the production shot-blocker projection helpers');
const helperSource=engine.slice(start,end);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const helpers=vm.runInNewContext('(()=>{'+helperSource+';return {defensiveShotBlockerPoint};})()',{clamp});
const project=helpers.defensiveShotBlockerPoint;

test('CPU shot blocker projection accounts for Agility-limited live turns on both teams',()=>{
 for(const team of [0,1]){
  const base={t:team,x:300,y:500,moveVX:0,moveVY:200,dx:0,dy:-1};
  const high=project({...base,src:{agility:95}},.30);
  const low=project({...base,src:{agility:1}},.30);
  assert.ok(high.y<low.y,'high Agility turns farther into the live lane on team '+team);
  assert.ok(high.y<base.y,'high Agility can reverse the projected lateral movement');
  assert.ok(low.y>base.y,'low Agility retains more of its existing momentum');
  assert.ok(Math.abs(high.y-base.y)<=45&&Math.abs(low.y-base.y)<=45,'both axes remain within the shot-read lead cap');
 }
});

test('neutral, slow and legacy-velocity blockers preserve linear fallback',()=>{
 const neutral={x:100,y:200,moveVX:120,moveVY:-80,dx:0,dy:0};
 const point=project(neutral,.12);
 assert.ok(Math.abs(point.x-114.4)<1e-9);
 assert.ok(Math.abs(point.y-190.4)<1e-9);
 const slow={x:10,y:20,moveVX:20,moveVY:-30,dx:0,dy:-1,src:{agility:100}};
 const slowPoint=project(slow,.12);
 assert.ok(Math.abs(slowPoint.x-12.4)<1e-9);
 assert.ok(Math.abs(slowPoint.y-16.4)<1e-9);
 const legacy={x:0,y:0,vx:50,vy:-40,dx:1,dy:0};
 const legacyPoint=project(legacy,.12);
 assert.ok(Math.abs(legacyPoint.x-6)<1e-9);
 assert.ok(Math.abs(legacyPoint.y+4.8)<1e-9);
});

test('shot blocker projection fails closed and caps each axis independently',()=>{
 assert.equal(project({x:NaN,y:0,moveVX:100,moveVY:0},.2),null);
 assert.equal(project({x:0,y:0,moveVX:100,moveVY:0},NaN),null);
 const fast=project({x:20,y:30,moveVX:1000,moveVY:-1000,dx:1,dy:-1},.34);
 assert.ok(Math.abs(fast.x-20)<=45&&Math.abs(fast.y-30)<=45);
 const start=engine.indexOf(' shoot(p,special=false');
 const end=engine.indexOf('\n pass(p,long=false',start);
 const shoot=engine.slice(start,end);
 assert.match(shoot,/cpuShooter\?\s*defensiveShotBlockerPoint/,'only CPU shot-lane scoring uses the movement projection');
});
