const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.join(__dirname,'..');
const engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8');
const spendBody=engine.match(/ spendStamina\(p,kind\)\{([\s\S]*?)\}\n halftimeRecovery\(/);
assert.ok(spendBody,'engine spendStamina method is present');
const spend=new Function('p','kind','stat','actionFatigue','levelModifiers','abilityLevel','superShotFatigueMultiplier','PHYSICS_TUNING',spendBody[1]);
async function fatigueAt(jumping){
 const {FITNESS}=await import(pathToFileURL(path.join(root,'src/modules/fitness.js')).href);
 const p={t:0,src:{id:'jump-regression',jumping,stamina:70},fatigue:0};
 const ctx={fatigueLedger:[{}]};
 const stat=(player,key)=>player.src[key];
 spend.call(ctx,p,'jump',stat,FITNESS.actionFatigue,()=>1,()=>1,()=>1,{});
 assert.equal(ctx.fatigueLedger[0][p.src.id],p.fatigue);
 return p.fatigue;
}
test('real jump fatigue is strictly lower at every higher jumping rating',async()=>{
 const costs=await Promise.all([1,10,25,40,50,60,75,90,100].map(fatigueAt));
 for(let i=1;i<costs.length;i++)assert.ok(costs[i]<costs[i-1],`ratings ${i-1}/${i} must not plateau: ${costs}`);
});
test('jumping 100 preserves previous cost; jumping 1 costs 1.99x',async()=>{
 const {FITNESS}=await import(pathToFileURL(path.join(root,'src/modules/fitness.js')).href);
 const old=FITNESS.actionFatigue(0,70,'jump',1);
 assert.ok(Math.abs(await fatigueAt(100)-old)<1e-12);
 assert.ok(Math.abs((await fatigueAt(1))/old-1.99)<1e-12);
});
test('modifier cap for non-jump actions stays at 1.5',async()=>{
 const {FITNESS}=await import(pathToFileURL(path.join(root,'src/modules/fitness.js')).href);
 assert.equal(FITNESS.actionFatigue(0,70,'tackle',2),FITNESS.actionFatigue(0,70,'tackle',1.5));
});
