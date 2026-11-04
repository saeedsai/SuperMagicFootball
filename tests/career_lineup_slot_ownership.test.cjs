'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const memory=()=>{const data=new Map();return {data,getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};};
const career=(club,attack,seed)=>({club,season:1,week:0,members:[club],fixtures:[[]],history:[],roster:Array.from({length:12},(_,i)=>({id:`player-${seed}-${i}`,role:i===0?'GK':i<4?'DF':i<8?'MF':'FW'})),table:{[club]:{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}},facilities:{training:1},cup:{stage:0},cash:100,teamPlan:{formation:'2-1-2',lineup:[0,1,2,4,8,9],captain:0,penalty:8,freeKick:4,corner:4,attack,defence:'Balanced'}});

test('same-club Career lineup plans remain isolated through slots, copy and backup round-trip',async()=>{
 const {CAREER_SLOTS}=await import('../src/modules/career_slots.js');
 const storage=memory(),vault=CAREER_SLOTS.create(storage);
 const first=career(42,'Balanced','a'),second=career(42,'Direct','b');
 const firstIds=first.roster.map(p=>p.id),secondIds=second.roster.map(p=>p.id);
 vault.save(1,first,'Career A');vault.save(2,second,'Career B');
 assert.equal(vault.load(1).teamPlan.attack,'Balanced');
 assert.equal(vault.load(2).teamPlan.attack,'Direct');
 assert.deepEqual(vault.load(1).roster.map(p=>p.id),firstIds);
 assert.deepEqual(vault.load(2).roster.map(p=>p.id),secondIds);
 const copy=vault.duplicate(1);assert.equal(vault.load(copy).teamPlan.attack,'Balanced');
 const backup=vault.exportBackup(),restoredDb=memory(),restored=CAREER_SLOTS.create(restoredDb);
 restored.importBackup(backup,{overwrite:true});
 assert.equal(restored.load(1).teamPlan.attack,'Balanced');
 assert.equal(restored.load(2).teamPlan.attack,'Direct');
 assert.equal(restored.load(copy).teamPlan.attack,'Balanced');
 assert.deepEqual(restored.load(1).roster.map(p=>p.id),firstIds);
 assert.deepEqual(restored.load(2).roster.map(p=>p.id),secondIds);
});

test('Career lineup UI reads, migrates and saves the plan inside its active slot',()=>{
 assert.match(ui,/function careerPlanFor\(c\).*?safePlan\(c\.teamPlan\?\?teamPlans\[TEAMS\[c\.club\]\?\.id\],c\.roster,c\.club\)/);
 assert.match(ui,/function ensureCareerTeamPlan\(c\).*?teamPlan:careerPlanFor\(c\).*?careerSlots\.save\(careerSlots\.active,migrated\)/);
 assert.match(ui,/function saveCareerPlan\(plan\).*?teamPlan:plan.*?careerSlots\.save\(careerSlots\.active,next\).*?career=next/);
 assert.match(ui,/fresh\.teamPlan=defaultPlan\(v,fresh\.roster\)/);
 assert.match(ui,/origin==='career'\?careerPlanFor\(career\):planFor\(index\)/);
 assert.match(ui,/mode==='career'&&career\?\.club===home\?careerPlanFor\(career\):planFor\(home\)/);
 const saveHandler=ui.slice(ui.indexOf("else if(a==='saveSquad')"),ui.indexOf("else if(a==='resetSquad')"));
 assert.match(saveHandler,/squadContext==='career'\)\{if\(saveCareerPlan\(plan\)\)showCareerSquad\(\);return;\}/);
 assert.doesNotMatch(saveHandler,/if\(squadContext==='career'\)[^;]*teamPlans\[/);
});

test('legacy Career plan migration snapshots the global club plan into only the active Career slot',()=>{
 const start=ui.indexOf('function careerPlanFor(c){'),end=ui.indexOf('\nif(career)career=ensureCareerTeamPlan(career);',start);
 assert.ok(start>=0&&end>start,'Career plan helpers are available as a bounded migration unit');
 const legacy={club:42,roster:[{id:'legacy-player'}]},shared={42:{formation:'2-1-2',lineup:[0,1,2,4,8,9],attack:'Direct'}};
 const saved=[],mirrored=[];
 const context={career:legacy,teamPlans:shared,TEAMS:{42:{id:42}},safePlan:(plan)=>({...plan}),careerSlots:{active:3,save:(slot,value)=>saved.push([slot,value])},store:{put:(key,value)=>mirrored.push([key,value])},console:{warn(){}}};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.ensureCareerTeamPlan=ensureCareerTeamPlan;',context);
 const migrated=context.ensureCareerTeamPlan(legacy);
 assert.deepEqual(migrated.teamPlan,shared[42]);
 assert.equal(saved.length,1);assert.equal(saved[0][0],3);assert.deepEqual(saved[0][1].teamPlan,shared[42]);
 assert.equal(mirrored.length,1);assert.equal(mirrored[0][0],'managerCareer');
 assert.equal(Object.hasOwn(legacy,'teamPlan'),false,'migration leaves the original legacy object intact');
 assert.deepEqual(shared[42],{formation:'2-1-2',lineup:[0,1,2,4,8,9],attack:'Direct'},'migration never mutates the non-Career plan map');
});

test('Career tactics storage failure leaves the active slot plan and shared team plan untouched',()=>{
 const handler=ui.slice(ui.indexOf("else if(a==='saveSquad')"),ui.indexOf("else if(a==='resetSquad')"));
 assert.match(ui,/function saveCareerPlan\(plan\).*?catch\(error\)\{alert\('Career tactics save failed: '\+error\.message\);return false;\}/);
 assert.match(handler,/if\(squadContext==='career'\)\{if\(saveCareerPlan\(plan\)\)showCareerSquad\(\);return;\}/);
 const careerBranch=handler.slice(handler.indexOf("if(squadContext==='career')"),handler.indexOf("teamPlans[TEAMS[ix].id]=plan"));
 assert.ok(careerBranch.length>0,'Career branch exits before the shared non-Career plan write');
 assert.doesNotMatch(careerBranch,/teamPlans\[/);
 const start=ui.indexOf('function saveCareerPlan(plan){'),end=ui.indexOf('\n',start);
 assert.ok(start>=0&&end>start,'isolated Career plan persistence helper exists');
 const before={club:42,teamPlan:{attack:'Balanced'}},plan={attack:'Direct'},writes=[],alerts=[];
 const context={career:before,careerSlots:{active:2,save(){throw Error('simulated quota failure')}},store:{put(...args){writes.push(args)}},alert(message){alerts.push(message)}};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.saveCareerPlan=saveCareerPlan;',context);
 assert.equal(context.saveCareerPlan(plan),false);
 assert.equal(context.career,before,'failed slot write must not publish the candidate Career in memory');
 assert.equal(writes.length,0,'legacy Career mirror must not advance after failed slot write');
 assert.match(alerts[0],/simulated quota failure/);
});
