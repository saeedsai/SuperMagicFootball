'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fileURLToPath}=require('node:url');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
let apiPromise;
async function apis(){
 if(!apiPromise)apiPromise=(async()=>{
  const oldFetch=globalThis.fetch;
  try{
   globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
   const assets=await import('../src/assets.js');await assets.loadAssets();
  }finally{globalThis.fetch=oldFetch;}
  const [{ABILITIES},{SPECIALS},{STATS}]=await Promise.all([
   import('../src/modules/abilities.js'),import('../src/modules/specials.js'),import('../src/modules/stats.js')
  ]);
  return {ABILITIES,SPECIALS,STATS};
 })();
 return apiPromise;
}
function extractFunction(name,nextName){
 const start=ui.indexOf(`function ${name}(`),end=ui.indexOf(`function ${nextName}(`,start);
 assert.ok(start>=0&&end>start,`${name} source function exists`);return ui.slice(start,end);
}
function keeper(role='GK',extra={}){
 return {id:'stable-gk',name:'Fixture Keeper',role,statsVerified:true,
  stamina:80,strength:80,aggression:80,defence:80,speedRating:80,agility:80,dribbling:80,
  shootPower:80,shootAccuracy:80,heading:80,passing:80,crossing:80,gkDiving:80,gkSkill:80,
  appearance:{style:2},...extra};
}

test('goalkeeper Super Defence Studio respects verified caps, exclusivity, role and legacy choices',async()=>{
 const {ABILITIES,SPECIALS,STATS}=await apis();
 const stateSource=extractFunction('studioKeeperDefenceSaveState','studioKeeperDefenceTierGuide');
 const state=vm.runInNewContext(stateSource+';studioKeeperDefenceSaveState',{ABILITIES,SPECIALS});
 const gold=keeper('GK');
 assert.equal(STATS.verifiedRatingTierForPlayer(gold),'Gold');
 assert.equal(state('megaPalm',2,gold).invalid,false,'verified Gold may choose level 2');
 assert.equal(state('megaPalm',3,gold).invalid,true,'verified Gold cannot exceed level 2');
 assert.equal(state('megaPalm',1,keeper('GK',{statsVerified:false})).invalid,true,'inferred ratings cannot unlock keeper equipment');

 const legacy=keeper('GK',{statsVerified:false,gkSuperLevel:2,gkSuperAbility:{type:'defence',id:'megaPalm',name:'MEGA PALM',level:2,legacy:'kept'}});
 assert.equal(state('keep',2,legacy).unchanged,true,'legacy keeper choice remains keepable without verification');
 assert.equal(state('none',2,legacy).invalid,false,'legacy keeper choice remains removable');
 const roleChanged=keeper('DF',{statsVerified:false,gkSuperLevel:2,gkSuperAbility:{type:'defence',id:'oldKeeperMove',level:2}});
 assert.equal(state('keep',2,roleChanged).unchanged,true,'role changes do not discard grandfathered keeper equipment');
 assert.equal(state('megaPalm',2,roleChanged).invalid,true,'role-changed player cannot receive a new keeper move');

 const fieldConflict=keeper('GK',{superAbility:{type:'shoot',id:'nuts',level:2},shot:'nuts'});
 assert.equal(state('megaPalm',2,fieldConflict).invalid,true,'field and keeper specializations are exclusive');
 assert.equal(state('keep',1,fieldConflict).unchanged,true,'existing field specialization is preserved');

 const markup=ui.slice(ui.indexOf('function showPlayerStudio('),ui.indexOf('function getAppearance(){'));
 assert.match(markup,/GOALKEEPER SUPER DEFENCE/);
 assert.match(markup,/id="studioKeeperDefTierGuide" role="status" aria-live="polite"/);
 assert.match(markup,/id="studioKeeperDefSaveState" role="status" aria-live="polite"/);
 assert.match(markup,/studioKeeperChoices\(player,keeperDefenceTier\)/);
 assert.match(markup,/keeperDefenceTierSelect\.onchange=/);
 assert.match(markup,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.match(ui,/a==='saveStudioKeeperDefence'\)saveStudioKeeperDefence\(\)/);
});

test('removing absent goalkeeper equipment is a true no-op and preserves explicit legacy level',async()=>{
 const {ABILITIES,SPECIALS}=await apis();
 const stateSource=extractFunction('studioKeeperDefenceSaveState','studioKeeperDefenceTierGuide');
 const state=vm.runInNewContext(stateSource+';studioKeeperDefenceSaveState',{ABILITIES,SPECIALS});
 const unassigned=keeper('GK',{statsVerified:false,rating:100});
 const absent=ABILITIES.withStudioKeeper(unassigned,'none',3);
 assert.deepEqual(absent,unassigned,'remove must not materialize the rating-derived level');
 const absentState=state('none',3,unassigned);
 assert.equal(absentState.invalid,false);
 assert.equal(absentState.unchanged,true);
 assert.equal(absentState.disabled,true,'the UI must keep a no-op removal disabled');
 const normalizedNull=keeper('GK',{statsVerified:false,rating:100,gkSuperAbility:null});
 assert.deepEqual(ABILITIES.withStudioKeeper(normalizedNull,'none',3),normalizedNull,'normalized null placeholders remain untouched');
 assert.equal(state('none',3,normalizedNull).disabled,true);

 const legacy=keeper('GK',{statsVerified:false,gkSuperLevel:2,gkSuperAbility:{type:'defence',id:'legacyKeeper',level:2,legacy:'preserve'}});
 const removed=ABILITIES.withStudioKeeper(legacy,'none',1);
 assert.equal(removed.gkSuperAbility,undefined);
 assert.equal(removed.gkSuperLevel,2,'removal preserves an explicitly stored legacy level');
 assert.equal(legacy.gkSuperAbility.id,'legacyKeeper','source record remains immutable');
 assert.equal(state('none',2,legacy).unchanged,false,'removing a real assigned move remains a change to save');
});

test('goalkeeper Super Defence saves only the keeper slot and preserves Club/Career legacy semantics',async()=>{
 const {ABILITIES,SPECIALS}=await apis();
 const stateSource=extractFunction('studioKeeperDefenceSaveState','studioKeeperDefenceTierGuide');
 const handler=extractFunction('saveStudioKeeperDefence','saveAppearance');
 function run({record,choice,tier,careerMode=false}){
  const metrics={writes:[],careerSaves:0,refreshes:0,errors:[]};
  const context={
   studioCareerContext:careerMode,career:careerMode?{club:0,roster:[record]}:null,
   home:0,avatarIndex:0,edits:{},TEAMS:[{id:'fixture-team'}],roster:()=>[record],
   $:id=>({studioKeeperDefAbility:choice,studioKeeperDefTier:tier}[id]===undefined?null:{value:String({studioKeeperDefAbility:choice,studioKeeperDefTier:tier}[id])}),
   ABILITIES,SPECIALS,
   storeCharacterChanges:(key,payload)=>{metrics.writes.push({key,payload});return true;},
   saveCareer(){metrics.careerSaves++;},showPlayerStudio(){metrics.refreshes++;},alert:message=>metrics.errors.push(message)
  };
  const source=stateSource+'\n'+handler+'\nsaveStudioKeeperDefence();';
  vm.runInNewContext(source,context);return {metrics,context};
 }
 const original=keeper('GK'),added=run({record:original,choice:'megaPalm',tier:2});
 assert.deepEqual(added.metrics.errors,[]);assert.equal(added.metrics.writes.length,1);
 const saved=added.metrics.writes[0].payload['fixture-team'][0];
 assert.equal(saved.id,original.id);assert.equal(saved.gkSuperAbility.type,'defence');
 assert.equal(saved.gkSuperAbility.id,'megaPalm');assert.equal(saved.gkSuperAbility.level,2);
 assert.equal(saved.superAbility,undefined,'keeper equipment is stored separately from the field slot');
 assert.equal(original.gkSuperAbility,undefined,'source player remains immutable');

 const denied=run({record:keeper('GK',{statsVerified:false}),choice:'megaPalm',tier:1});
 assert.equal(denied.metrics.writes.length,0);assert.equal(denied.metrics.errors.length,1);
 const conflict=run({record:keeper('GK',{superAbility:{type:'defence',id:'drill'}}),choice:'megaPalm',tier:1});
 assert.equal(conflict.metrics.writes.length,0);assert.equal(conflict.metrics.errors.length,1);

 const existing=keeper('GK',{statsVerified:false,gkSuperLevel:2,gkSuperAbility:{type:'defence',id:'legacyKeeper',level:2,legacy:'untouched'}});
 const kept=run({record:existing,choice:'keep',tier:2});
 assert.equal(kept.metrics.writes.length,0);assert.equal(kept.metrics.refreshes,1);
 const removed=run({record:existing,choice:'none',tier:2});
 assert.equal(removed.metrics.writes.length,1);assert.equal(Object.hasOwn(removed.metrics.writes[0].payload['fixture-team'][0],'gkSuperAbility'),false);
 assert.equal(removed.metrics.writes[0].payload['fixture-team'][0].superAbility,undefined);

 const career=run({record:original,choice:'tornadoPunch',tier:2,careerMode:true});
 assert.equal(career.metrics.writes.length,1);assert.equal(career.metrics.writes[0].key,'managerCareer');
 assert.equal(career.metrics.careerSaves,1);assert.equal(career.context.career.roster[0].gkSuperAbility.id,'tornadoPunch');
});
