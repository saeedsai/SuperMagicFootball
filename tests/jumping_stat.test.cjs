const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const stats=fs.readFileSync(path.join(root,'src/modules/stats.js'),'utf8');
const mechanics=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const jumpBody=engine.match(/ jump\(p\)\{([\s\S]*?)\n \}\n\n \/\/ Resolve impact/);
assert.ok(jumpBody,'engine jump method is present');
const jump=new Function('p','stat',`const self=this;\n${jumpBody[1]}`);
function simulate(jumping,double=false){
 const p={stun:0,z:double?30:0,vz:0,jumpCount:double?1:0,fatigue:0,t:0,src:{name:'Player'}};
 const events=[],costs=[];
 const ctx={spendStamina:(_p,k)=>costs.push(k==='jump'?1+(100-jumping)/100:1),emit:(...e)=>events.push(e)};
 assert.equal(jump.call(ctx,p,()=>jumping),true);
 return {p,cost:costs[0],events};
}
test('jumping is a canonical editable numeric attribute',()=>{
 assert.ok(mechanics.numericStats.includes('jumping'));
 assert.match(stats,/jumping:Math\.round\(Math\.max\(1,Math\.min\(100,overall\)\)\)/);
});
test('100 jumping retains original single and double jump impulses and minimum cost',()=>{
 const single=simulate(100),double=simulate(100,true);
 assert.equal(single.p.vz,420);assert.equal(double.p.vz,535);
 assert.equal(double.p.z,44);assert.equal(single.cost,1);assert.equal(double.cost,1);
});
test('lower jumping ratings reduce both jump heights and increase stamina cost',()=>{
 for(const low of [1,35,70,99]){
  const first=simulate(low),second=simulate(low,true);
  assert.ok(first.p.vz<420);assert.ok(second.p.vz<535);
  assert.ok(second.p.z<44);assert.ok(first.cost>1);assert.ok(second.cost>1);
 }
});
test('jump impulses and stamina cost improve monotonically with jumping',()=>{
 const ratings=[1,25,50,75,100].map(j=>({j,first:simulate(j),double:simulate(j,true)}));
 for(let i=1;i<ratings.length;i++){
  assert.ok(ratings[i].first.p.vz>ratings[i-1].first.p.vz);
  assert.ok(ratings[i].double.p.vz>ratings[i-1].double.p.vz);
  assert.ok(ratings[i].first.cost<ratings[i-1].first.cost);
 }
});
