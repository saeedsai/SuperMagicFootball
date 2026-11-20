'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf(' tryMagicTrick(p){');
const end=source.indexOf('\n updateSpinBumpFx(',start);
assert.ok(start>=0&&end>start,'magic trick resolution exists');
const method=source.slice(start,end);
assert.match(method,/const rivals=this\.players\.filter\(q=>q\.t!==p\.t/);
assert.doesNotMatch(method,/\(\(id!=='wind'&&id!=='mud'\)\|\|q\.z<20\)/,'airborne counters must remain in rival pool');
const jump=method.match(/const fieldTrickJumped=(.*?);/);
const slide=method.match(/const fieldTrickSlid=(.*?);/);
assert.ok(jump&&slide,'Wind/Mud area counter predicates exist');
const jumpCounter=new Function('fieldTrick','rivals','p','radius','distance','return '+jump[1]+';');
const slideCounter=new Function('fieldTrick','rivals','p','radius','distance','return '+slide[1]+';');
const caster={x:0,y:0},dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const idle={x:10,y:0,z:0,action:'idle',actionTimer:0};
const jumping={x:50,y:0,z:32,action:'jump',actionTimer:.12};
const sliding={x:55,y:0,z:0,action:'slide',actionTimer:.15};
test('second airborne defender counters while nearest defender idles',()=>assert.equal(jumpCounter(true,[idle,jumping],caster,100,dist),true));
test('second sliding defender counters while nearest defender idles',()=>assert.equal(slideCounter(true,[idle,sliding],caster,100,dist),true));
test('expired jumps and slides cannot counter',()=>{
 assert.equal(jumpCounter(true,[idle,{...jumping,actionTimer:0}],caster,100,dist),false);
 assert.equal(slideCounter(true,[idle,{...sliding,actionTimer:0}],caster,100,dist),false);
});
test('outside radius and grounded jumps cannot counter',()=>{
 assert.equal(jumpCounter(true,[idle,{...jumping,x:120}],caster,100,dist),false);
 assert.equal(jumpCounter(true,[idle,{...jumping,z:10}],caster,100,dist),false);
});
test('unrelated tricks do not activate Wind/Mud counters',()=>{
 assert.equal(jumpCounter(false,[jumping],caster,100,dist),false);
 assert.equal(slideCounter(false,[sliding],caster,100,dist),false);
});
