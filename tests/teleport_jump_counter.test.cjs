'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf("const teleportJumpBlocked=");
const end=source.indexOf("\n  // HIDE-BALL-POKE-CONE-01",start);
assert.ok(start>=0&&end>start,'extract complete production teleport jump counter');
const expression=source.slice(start,end).replace(/^const teleportJumpBlocked=/,'').replace(/;\s*$/,'');
const evaluate=vm.runInNewContext('(id,rivals,p,radius,norm,distance)=>('+expression+')');
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m}};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const carrier={x:100,y:100,dx:1,dy:0,face:1};
const rival=(x,y,action='jump',z=35,actionTimer=.18)=>({x,y,action,z,actionTimer});
const blocked=(list,id='teleport',range=95)=>evaluate(id,list,carrier,range,norm,distance);
test('timed jump in the Teleport landing corridor counters the trick',()=>{
 assert.equal(blocked([rival(185,100)]),true);
 assert.equal(blocked([rival(185,139)]),false,'wide jump misses');
 assert.equal(blocked([rival(80,100)]),false,'behind carrier misses');
 assert.equal(blocked([rival(185,100,'idle')]),false,'inactive jump misses');
 assert.equal(blocked([rival(185,100,'jump',10)]),false,'early low jump misses');
 assert.equal(blocked([rival(185,100,'jump',35,0)]),false,'expired jump misses');
 assert.equal(blocked([rival(185,100,'jump',35,NaN)]),false,'invalid timer misses');
 assert.equal(blocked([rival(196,100)]),false,'out of range misses');
 assert.equal(blocked([rival(185,100)],'banana'),false,'other tricks unchanged');
});
test('a second defender can intercept when the nearer defender is idle',()=>{
 assert.equal(blocked([rival(120,100,'idle'),rival(185,100)]),true);
});
test('teleport jump counter is wired into real Magic Trick resolution',()=>{
 assert.match(source,/teleportParried\|\|teleportJumpBlocked\|\|hideBallPoked/);
});
