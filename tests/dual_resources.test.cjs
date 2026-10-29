const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function load(file,symbol,context={}){
 const source=fs.readFileSync(path.join(root,file),'utf8')
   .replace(/^import .*;\s*$/gm,'').replace(/^export \{.*\};?\s*$/gm,'');
 const realm={...context};
 vm.runInNewContext(source+'\nthis.__value='+symbol+';',realm,{filename:file});
 return realm.__value;
}
const F=load('src/modules/fitness.js','FITNESS');
const C=load('src/modules/career.js','CAREER',{FITNESS:F});

test('breath capacity ranges from three to ten seconds and increases with stamina',()=>{
 assert.equal(F.breathCapacity(1),3);
 assert.equal(F.breathCapacity(100),10);
 assert.ok(F.breathCapacity(60)>F.breathCapacity(30));
});
test('expensive repeated actions drain breath; higher stamina reduces action drain',()=>{
 const a=F.breathCapacity(20),b=F.breathCapacity(90);
 const aSpent=a-F.spendBreath(a,20,'super');
 const bSpent=b-F.spendBreath(b,90,'super');
 assert.ok(aSpent>bSpent);
 assert.ok(F.spendBreath(0,20,'super')>=0);
 assert.ok(F.spendBreath(a,20,'jump')<a);
 assert.ok(F.spendBreath(a,20,'tackle')<a);
 assert.ok(F.spendBreath(a,20,'shoot')<a);
 assert.ok(F.spendBreath(a,20,'dribbleTrick')<a);
});
test('rest recovers breath and sprint drains it; better stamina recovers faster',()=>{
 assert.ok(F.breathTick(0,90,2,0)>F.breathTick(0,20,2,0));
 assert.ok(F.breathTick(4,50,2,1.7)<4);
 assert.equal(F.breathTick(1000,50,1,0),F.breathCapacity(50));
 assert.ok(F.breathPenalty(0,60)>F.breathPenalty(F.breathCapacity(60),60));
});
test('Energy recovery follows 30/50/10 cumulative daily schedule at mid stamina',()=>{
 const e=10;
 assert.equal(F.recoverEnergy(e,0,50.5),10);
 assert.equal(F.recoverEnergy(e,1,50.5),40);
 assert.equal(F.recoverEnergy(e,2,50.5),90);
 assert.equal(F.recoverEnergy(e,3,50.5),100);
 assert.equal(F.recoverEnergy(e,15,50.5),100);
 assert.ok(F.recoverEnergy(10,1,100)>F.recoverEnergy(10,1,1));
});
test('legacy condition remains readable while explicit Energy drives initial fatigue',()=>{
 assert.ok(Math.abs(F.initialFatigue({energy:35,condition:100})-.65)<1e-9);
 assert.equal(F.initialFatigue({energy:100}),0);
 assert.equal(F.initialFatigue({condition:100}),0);
});
test('Career match record saves depleted Energy and restores for next fixture',()=>{
 const p={id:'x',name:'Test',condition:100,stamina:50.5,energy:100};
 const c={roster:[p],season:1,week:1,history:[],lastResult:{kind:'cup'},nextFixtureRestDays:1};
 const result=C.recordMatchFitness(c,[{id:'x',seconds:100,fatigue:.8,condition:70}]);
 assert.equal(p.energy,50); // 20% after match + 30 percentage points on day one
 assert.equal(result.restDays,1);
 assert.equal(p.condition,70);
 assert.ok(C.recoverCareerEnergy(c,2).roster[0].energy>=99);
});
