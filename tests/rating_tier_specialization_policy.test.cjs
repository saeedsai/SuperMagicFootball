'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {fileURLToPath}=require('node:url');

let apisPromise;
function apis(){
 if(!apisPromise)apisPromise=(async()=>{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(fileURLToPath(url),'utf8'))});
  const assets=await import('../src/assets.js');
  await assets.loadAssets();
  const [{ABILITIES},{STATS}]=await Promise.all([
   import('../src/modules/abilities.js'),import('../src/modules/stats.js'),
  ]);
  return {assets,ABILITIES,STATS};
 })();
 return apisPromise;
}

function verifiedPlayer(role,ovr,extra={}){
 return {id:`verified-${role}-${ovr}`,name:'Tier Fixture',role,statsVerified:true,
  rating:55,stamina:ovr,strength:ovr,aggression:ovr,defence:ovr,speedRating:ovr,
  agility:ovr,dribbling:ovr,shootPower:ovr,shootAccuracy:ovr,heading:ovr,
  passing:ovr,crossing:ovr,gkDiving:ovr,gkSkill:ovr,...extra};
}

test('verified specialization max level follows Gold, Star and Superstar boundaries and fails closed',async()=>{
 const {assets,ABILITIES,STATS}=await apis();
 for(const [ovr,tier,max] of [[69,'Common',0],[70,'Silver',0],[79,'Silver',0],[80,'Gold',2],[90,'Gold',2],[91,'Star',3],[95,'Star',3],[96,'Superstar',5],[100,'Superstar',5]]){
  const player=verifiedPlayer('MF',ovr);
  assert.equal(STATS.verifiedRatingTierForPlayer(player),tier);
  assert.equal(ABILITIES.verifiedSpecializationMaxLevel(player),max,`OVR ${ovr}`);
 }
 const unverified=verifiedPlayer('MF',100,{statsVerified:false});
 assert.equal(ABILITIES.verifiedSpecializationMaxLevel(unverified),0);
 assert.equal(ABILITIES.verifiedSpecializationMaxLevel({...verifiedPlayer('MF',100),passing:undefined}),0);
 let count=0;
 for(const team of assets.GAME_ASSETS.teams)for(const canonical of assets.GAME_ASSETS.rosters[team.id]){
  count++;
  assert.equal(ABILITIES.verifiedSpecializationMaxLevel(canonical),0,`${team.id}/${canonical.id} is unverified`);
  assert.equal(ABILITIES.verifiedLegacySpecializationReport(canonical).verified,false);
 }
 assert.equal(count,2676,'the full canonical roster fails closed without source-verified stats');
});

test('verified field-special eligibility enforces category roles and each tier cap',async()=>{
 const {ABILITIES}=await apis();
 for(const [ovr,max] of [[79,0],[80,2],[91,3],[96,5]]){
  const fw=verifiedPlayer('FW',ovr),mf=verifiedPlayer('MF',ovr),df=verifiedPlayer('DF',ovr),gk=verifiedPlayer('GK',ovr);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(fw,{kind:'shot',level:1}),max>0);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(mf,{kind:'shot',level:max}),max>0);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(df,{kind:'defence',level:max}),max>0);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(fw,{kind:'defence',level:1}),false);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(df,{kind:'shot',level:1}),false);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(gk,{kind:'defence',level:1}),false);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(df,{kind:'defence',level:max+1}),false);
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial({...df,gkSuperAbility:{type:'defence',id:'megaPalm'}},{kind:'defence',level:1}),false,
   'a keeper specialization occupies the same one-specialty entitlement even though it uses a separate field');
  assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(fw,{kind:'shot',level:0}),false);
 }
 assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(verifiedPlayer('MF',100,{statsVerified:false}),{kind:'shot',level:1}),false);
 assert.equal(ABILITIES.canEquipVerifiedFieldSpecial(verifiedPlayer('GK',100),{kind:'keeper',level:5}),false);
});

test('studio field-special writers enforce verified tier caps but preserve keep/remove paths',async()=>{
 const {assets,ABILITIES}=await apis();
 const shots=assets.GAME_ASSETS.mechanics.shotTypes,shotId=Object.keys(shots)[0];
 const goldMF=verifiedPlayer('MF',80),goldDF=verifiedPlayer('DF',80);
 assert.equal(ABILITIES.withStudioShot(goldMF,shotId,2,shots).superAbility.level,2);
 assert.throws(()=>ABILITIES.withStudioShot(goldMF,shotId,3,shots),/verified tier cap/);
 assert.throws(()=>ABILITIES.withStudioShot(verifiedPlayer('MF',100,{statsVerified:false}),shotId,1,shots),/verified Gold tier/);
 assert.equal(ABILITIES.withStudioShot(verifiedPlayer('MF',100,{superAbility:{type:'shoot',id:shotId,level:5},shot:shotId}), 'keep',5,shots).superAbility.level,5,
  'grandfathered keep remains available for an unverified player');
 assert.equal(ABILITIES.withStudioShot(verifiedPlayer('MF',100,{statsVerified:false,superAbility:{type:'shoot',id:shotId},shot:shotId}), 'none',1,shots).superAbility,undefined,
  'removal remains available for an unverified player');

 assert.equal(ABILITIES.withStudioDefence(goldDF,'drill',2).superAbility.level,2);
 assert.throws(()=>ABILITIES.withStudioDefence(goldDF,'drill',3),/verified tier cap/);
 assert.throws(()=>ABILITIES.withStudioDefence(verifiedPlayer('DF',100,{statsVerified:false}),'drill',1),/verified Gold tier/);
 assert.equal(ABILITIES.withStudioDefence(verifiedPlayer('DF',100,{statsVerified:false,superAbility:{type:'defence',id:'spinBumper',level:4}}),'keep',1).superAbility.level,1,
  'grandfathered keep remains available after tier/level downgrades');
 assert.equal(ABILITIES.withStudioDefence(verifiedPlayer('DF',100,{statsVerified:false,superAbility:{type:'defence',id:'spinBumper',level:4}}),'none',1).superAbility,undefined,
  'removal remains available for an unverified player');
});

test('keeper specialty uses verified Gold/Star/Superstar caps and one shared specialty slot',async()=>{
 const {ABILITIES}=await apis();
 const gold=verifiedPlayer('GK',80),star=verifiedPlayer('GK',91),superstar=verifiedPlayer('GK',96);
 assert.equal(ABILITIES.STUDIO_KEEPER_POLICY.verifiedCanonicalStatsRequired,true);
 assert.deepEqual({...ABILITIES.STUDIO_KEEPER_POLICY.verifiedTierMaxLevel},{Gold:2,Star:3,Superstar:5});
 for(const [player,max] of [[gold,2],[star,3],[superstar,5]]){
  for(let level=1;level<=5;level++)assert.equal(ABILITIES.canEquipVerifiedKeeperSpecial(player,{level}),level<=max);
  assert.equal(ABILITIES.withStudioKeeper(player,'megaPalm',max).gkSuperAbility.level,max);
  if(max<5)assert.throws(()=>ABILITIES.withStudioKeeper(player,'megaPalm',max+1),/verified tier cap/);
 }
 const unverified=verifiedPlayer('GK',100,{statsVerified:false});
 assert.equal(ABILITIES.canEquipVerifiedKeeperSpecial(unverified,{level:1}),false);
 assert.throws(()=>ABILITIES.withStudioKeeper(unverified,'megaPalm',1),/verified Gold tier/);
 const conflict=verifiedPlayer('GK',80,{superAbility:{type:'shoot',id:'nuts'},gkSuperAbility:{type:'defence',id:'megaPalm'}});
 assert.equal(ABILITIES.canEquipVerifiedKeeperSpecial(conflict,{level:1}),false);
 assert.throws(()=>ABILITIES.withStudioKeeper(conflict,'tornadoPunch',1),/Only one special ability category/);
 assert.equal(ABILITIES.withStudioKeeper(conflict,'keep',5).gkSuperAbility.level,5,'grandfathered KEEP remains available');
 assert.equal(ABILITIES.withStudioKeeper(conflict,'none',5).gkSuperAbility,undefined,'grandfathered REMOVE remains available');
});

test('legacy specialization report is read-only and skips every unverified player',async()=>{
 const {ABILITIES}=await apis();
 const unverified=verifiedPlayer('GK',100,{statsVerified:false,superAbility:{type:'shoot',id:'missing',level:9},superShotAbility:{id:'x'},superDefenceAbility:{id:'y'}});
 const before=structuredClone(unverified);
 assert.deepEqual(ABILITIES.verifiedLegacySpecializationReport(unverified),{verified:false,tier:null,maxLevel:0,issues:[]});
 assert.deepEqual(unverified,before);
});

test('legacy report identifies verified unknown IDs, role conflicts, caps and dual field slots',async()=>{
 const {ABILITIES}=await apis();
 const player=verifiedPlayer('DF',85,{
  superAbility:{type:'shoot',id:'not-a-shot',level:4},
  superShotAbility:{id:'legacy-shot'},superDefenceAbility:{id:'legacy-defence'},
 });
 const before=structuredClone(player);
 const report=ABILITIES.verifiedLegacySpecializationReport(player);
 assert.equal(report.verified,true);
 assert.equal(report.tier,'Gold');
 assert.equal(report.maxLevel,2);
 assert.deepEqual(report.issues.map(issue=>issue.code).sort(),[
  'above-tier-cap','invalid-role-type','simultaneous-field-specializations','unknown-ability-id',
 ]);
 assert.deepEqual(player,before,'report never edits player input');

 const unknownKeeper=verifiedPlayer('GK',91,{gkSuperAbility:{type:'defence',id:'not-a-keeper-move'}});
 const gkReport=ABILITIES.verifiedLegacySpecializationReport(unknownKeeper);
 assert.ok(gkReport.issues.some(issue=>issue.code==='unknown-ability-id'&&issue.field==='gkSuperAbility.id'));
});

test('legacy field-special report flags malformed and out-of-range levels without mutating input',async()=>{
 const {ABILITIES}=await apis();
 for(const [level,expected] of [[0,['invalid-ability-level']],[-1,['invalid-ability-level']],[1.5,['invalid-ability-level']],[6,['above-tier-cap','invalid-ability-level']],['invalid',['invalid-ability-level']]]){
  const player=verifiedPlayer('MF',85,{superAbility:{type:'shoot',id:'nuts',level}});
  const before=structuredClone(player),report=ABILITIES.verifiedLegacySpecializationReport(player);
  for(const code of expected)assert.ok(report.issues.some(issue=>issue.code===code&&issue.field==='superAbility.level'),`${String(level)} reports ${code}`);
  assert.deepEqual(player,before,'the read-only audit never normalizes or rewrites the legacy level');
 }
});

test('keeper legacy audit validates type, ID, role, level cap and concurrent field slot without writes',async()=>{
 const {ABILITIES}=await apis();
 const simultaneous=verifiedPlayer('GK',80,{superAbility:{type:'shoot',id:'nuts'},gkSuperAbility:{type:'defence',id:'megaPalm',level:3},gkSuperLevel:3});
 const before=structuredClone(simultaneous),report=ABILITIES.verifiedLegacySpecializationReport(simultaneous);
 assert.ok(report.issues.some(issue=>issue.code==='simultaneous-field-keeper-specializations'));
 assert.ok(report.issues.some(issue=>issue.code==='above-tier-cap'&&issue.field==='gkSuperLevel'&&issue.value.maxLevel===2));
 assert.ok(report.issues.some(issue=>issue.code==='invalid-role-type'&&issue.field==='superAbility.type'));
 assert.deepEqual(simultaneous,before,'legacy report never mutates keeper or field specialties');

 const malformed=verifiedPlayer('DF',80,{gkSuperAbility:{type:'shoot',id:'missing'},gkSuperLevel:8});
 const issues=ABILITIES.verifiedLegacySpecializationReport(malformed).issues;
 for(const [code,field] of [['invalid-ability-type','gkSuperAbility.type'],['unknown-ability-id','gkSuperAbility.id'],['invalid-role-type','gkSuperAbility.type'],['invalid-ability-level','gkSuperLevel'],['above-tier-cap','gkSuperLevel']])
  assert.ok(issues.some(issue=>issue.code===code&&issue.field===field),`${code} ${field}`);
});
