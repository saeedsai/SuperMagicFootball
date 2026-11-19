'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf('  const slideClosingContact=(p,q)=>');
const end=source.indexOf('  const targets=this.players.filter',start);
assert.ok(start>0&&end>start,'production contact helper found');
const check=vm.runInNewContext('(function(distance){'+source.slice(start,end)+'return slideClosingContact;})',{})((a,b)=>Math.hypot(a.x-b.x,a.y-b.y));
const p={x:0,y:0};
test('closing runners enter slide contact while retreating and lateral runners do not',()=>{
 assert.equal(check(p,{x:70,y:0,moveVX:-200,moveVY:0}),true);
 assert.equal(check(p,{x:70,y:0,moveVX:200,moveVY:0}),false);
 assert.equal(check(p,{x:70,y:0,moveVX:0,moveVY:200}),false);
});
test('contact stays bounded and ordinary range works',()=>{
 assert.equal(check(p,{x:63,y:0,moveVX:0,moveVY:0}),true);
 assert.equal(check(p,{x:76,y:0,moveVX:-10000,moveVY:0}),false);
 assert.equal(check(p,{x:75,y:0,moveVX:-10000,moveVY:0}),true);
 assert.equal(check(p,{x:70,y:0,moveVX:Infinity,moveVY:0}),false);
 assert.match(source,/q\.invuln<=0/);
 assert.match(source,/p\.slideRemaining=\(running\?148:104\)\*defenceReach/);
});
