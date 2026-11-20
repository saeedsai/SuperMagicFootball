'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/modules/engine.js','utf8');
const start=src.indexOf(' tryMagicTrick(p){'),end=src.indexOf('\n updateSpinBumpFx(',start);
assert.ok(start>=0&&end>start);
const method=src.slice(start,end);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}};
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const F={x:-100,y:-100,w:400,h:400};
function executeEffect(id,p,rivals,radius){
 const branch=method.match(new RegExp("}else if\\(id==='"+id+"'\\)\\{([\\s\\S]*?)(?=\\n   }else if|\\n  }\\n  if\\(id!=='shoulderRide')"));
 assert.ok(branch,id+' effect branch exists');
 assert.match(branch[1],/for\(const target of rivals\.filter\(/);
 // Run the actual production effect branch, not a duplicate of its logic.
 new Function('p','rivals','radius','distance','norm','clamp','F',branch[1])(p,rivals,radius,distance,norm,clamp,F);
}
test('Wind pushes both in-range defenders and not the distant one',()=>{
 const players=[{x:20,y:0},{x:40,y:0},{x:160,y:0}];
 executeEffect('wind',{x:0,y:0,t:0},players,120);
 assert.deepEqual(players.map(q=>q.x),[48,68,160]);
 assert.deepEqual(players.map(q=>q.windTrickFx||0),[.35,.35,0]);
});
test('Mud slows all nearby defenders without shortening existing slow',()=>{
 const players=[{x:20,y:0},{x:50,y:0,mudSlowTimer:.8},{x:110,y:0}];
 executeEffect('mud',{x:0,y:0},players,100);
 assert.deepEqual(players.map(q=>q.mudSlowTimer||0),[.52,.8,0]);
 assert.deepEqual(players.map(q=>q.mudTrickFx||0),[.52,.52,0]);
});

test('Jumping above ground level evades Mud but low jump remains vulnerable',()=>{
 const players=[{x:20,y:0,z:35},{x:40,y:0,z:10},{x:60,y:0,z:20},{x:80,y:0}];
 executeEffect('mud',{x:0,y:0},players,100);
 assert.deepEqual(players.map(q=>q.mudSlowTimer||0),[0,.52,0,.52]);
 assert.deepEqual(players.map(q=>q.mudTrickFx||0),[0,.52,0,.52]);
});

test('Wind halves push on high airborne defenders without affecting low jumpers',()=>{
 const players=[{x:30,y:0,z:25},{x:50,y:0,z:10},{x:70,y:0,z:20},{x:90,y:0,z:NaN}];
 executeEffect('wind',{x:0,y:0,t:0},players,120);
 assert.deepEqual(players.map(q=>q.x),[44,78,84,118]);
 assert.deepEqual(players.map(q=>q.windTrickFx),[.35,.35,.35,.35]);
});
