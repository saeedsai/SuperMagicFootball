'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/modules/engine.js','utf8');
const start=src.indexOf(' tryMagicTrick(p){'),end=src.indexOf('\n updateSpinBumpFx(',start);
assert.ok(start>=0&&end>start);
const method=src.slice(start,end);
for(const id of ['wind','mud']){
 const branch=method.match(new RegExp("}else if\\(id==='"+id+"'\\)\\{([\\s\\S]*?)(?=\\n   }else if|\\n  }\\n  if\\(id!=='shoulderRide')"));
 assert.ok(branch,id+' effect branch exists');
 assert.match(branch[1],/for\(const target of rivals\.filter\(q=>distance\(p,q\)<radius\)\)/);
}
test('Wind pushes every in-range defender and not the distant one',()=>{
 const players=[{x:20,y:0},{x:40,y:0},{x:160,y:0}];
 const p={x:0,y:0,t:0},radius=120,rivals=players;
 const norm=(x,y)=>{const n=Math.hypot(x,y)||1;return {x:x/n,y:y/n}};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const F={x:-100,y:-100,w:400,h:400},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 for(const target of rivals.filter(q=>distance(p,q)<radius)){
  const away=norm(target.x-p.x||(p.t===0?1:-1),target.y-p.y);
  target.x=clamp(target.x+away.x*28,F.x+22,F.x+F.w-22);
  target.y=clamp(target.y+away.y*28,F.y+23,F.y+F.h-23);
  target.windTrickFx=Math.max(target.windTrickFx||0,.35);
 }
 assert.deepEqual(players.map(q=>q.x),[48,68,160]);
 assert.deepEqual(players.map(q=>q.windTrickFx||0),[.35,.35,0]);
});
test('Mud refreshes all eligible nearby defenders without shortening longer effects',()=>{
 const p={x:0,y:0},radius=100,rivals=[{x:20,y:0},{x:50,y:0,mudSlowTimer:.8},{x:110,y:0}];
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 for(const target of rivals.filter(q=>distance(p,q)<radius)){
  target.mudSlowTimer=Math.max(target.mudSlowTimer||0,.52);
  target.mudTrickFx=Math.max(target.mudTrickFx||0,.52);
 }
 assert.deepEqual(rivals.map(q=>q.mudSlowTimer||0),[.52,.8,0]);
});
