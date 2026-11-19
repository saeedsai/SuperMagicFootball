'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf("const teleportJumpBlocked=");
const end=source.indexOf(";\n  // HIDE-BALL-PASS-01",start);
assert.ok(start>=0&&end>start,'extract production teleport jump counter');
const expression=source.slice(start,end).replace(/^const teleportJumpBlocked=/,'');
const evaluate=vm.runInNewContext('(id,inRange,rival,p,norm)=>('+expression+')');
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m}};
const carrier={x:100,y:100,dx:1,dy:0,face:1};
const rival=(x,y,action='jump',z=35)=>({x,y,action,z});
test('timed jump in teleport landing corridor counters the trick',()=>{
 assert.equal(evaluate('teleport',true,rival(185,100),carrier,norm),true);
 assert.equal(evaluate('teleport',true,rival(185,145),carrier,norm),false,'wide jump misses');
 assert.equal(evaluate('teleport',true,rival(80,100),carrier,norm),false,'behind carrier misses');
 assert.equal(evaluate('teleport',true,rival(185,100,'idle'),carrier,norm),false,'inactive jump misses');
 assert.equal(evaluate('teleport',true,rival(185,100,'jump',10),carrier,norm),false,'early low jump misses');
 assert.equal(evaluate('teleport',false,rival(185,100),carrier,norm),false,'out of range misses');
 assert.equal(evaluate('banana',true,rival(185,100),carrier,norm),false,'other tricks unchanged');
});
test('teleport jump counter is wired into real Magic Trick resolution',()=>{
 assert.match(source,/teleportParried\|\|teleportJumpBlocked\|\|hideBallPoked/);
});
