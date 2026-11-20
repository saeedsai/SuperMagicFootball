'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/modules/engine.js','utf8');
const start=src.indexOf(' tryMagicTrick(p){'),end=src.indexOf('\n updateSpinBumpFx(',start);
assert.ok(start>=0&&end>start);
const method=src.slice(start,end);
const match=method.match(/const teleportParried=([\s\S]*?);\n  \/\/ HIDE-BALL-PASS-01/);
assert.ok(match,'production Teleport slide counter exists');
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const check=(rivals,p={x:0,y:0,dx:1,dy:0,face:1})=>
 new Function('id','rivals','p','radius','distance','norm','inRange','rival','return '+match[1])('teleport',rivals,p,95,distance,norm,true,rivals[0]);
const defender=(x,y,action='slide',timer=.3,z=0)=>({x,y,action,actionTimer:timer,z});
test('second defender slide blocks teleport when nearer opponent is idle',()=>{
 assert.equal(check([defender(12,0,'idle'),defender(60,8)]),true);
});
test('expired or airborne slides cannot block',()=>{
 assert.equal(check([defender(12,0,'idle'),defender(60,8,'slide',0)]),false);
 assert.equal(check([defender(12,0,'idle'),defender(60,8,'slide',.3,25)]),false);
});
test('rearward and wide slides do not block',()=>{
 assert.equal(check([defender(12,0,'idle'),defender(-40,0)]),false);
 assert.equal(check([defender(12,0,'idle'),defender(60,45)]),false);
});
test('near slide still blocks and remote slide does not',()=>{
 assert.equal(check([defender(60,0)]),true);
 assert.equal(check([defender(120,0)]),false);
});
