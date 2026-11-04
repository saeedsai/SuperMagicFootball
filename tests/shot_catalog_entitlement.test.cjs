'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const mechanics=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const moduleSource=fs.readFileSync(path.join(root,'src/modules/abilities.js'),'utf8');
const body=moduleSource.slice(moduleSource.indexOf('const ABILITIES=(()=>')).replace(/\nexport \{ABILITIES\};?\s*$/,'');
const ABILITIES=vm.runInNewContext(body+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},STATS:{verifiedRatingTierForPlayer:p=>p?.verifiedTier??null},
 SPECIALS:{abilityLevel:()=>1,levelModifiers:()=>({fatigue:1})}
});
const shots=mechanics.shotTypes;

test('SH08 catalog provenance and equipment policy are explicit and match runtime rules',()=>{
 assert.equal(Object.keys(shots).length,32);
 assert.match(mechanics.shotCatalogPolicy.provenance,/Original Supermagic Football/);
 assert.equal(mechanics.shotCatalogPolicy.officialSourceClaimed,false);
 assert.equal(mechanics.shotCatalogPolicy.appliesTo,'Every entry in shotTypes');
 const tierPolicy=mechanics.ratingTierPolicy;
 const policy=mechanics.shotEquipmentPolicy.superShot;
 assert.deepEqual(policy.eligibleRoles,['MF','FW']);
 assert.deepEqual(policy.levelRange,[1,5]);
 assert.equal(policy.automaticGrant,false);
 assert.equal(policy.grandfatherExisting,true);
 assert.equal(tierPolicy.verifiedCanonicalStatsRequired,true);
 assert.deepEqual(tierPolicy.specializationMaxLevel,{Gold:2,Star:3,Superstar:5});
 assert.deepEqual(policy.verifiedTierMaxLevel,tierPolicy.specializationMaxLevel);
 assert.match(policy.exclusiveWith,/shared superAbility field/);
 assert.deepEqual([...ABILITIES.STUDIO_SHOT_POLICY.roles],policy.eligibleRoles);
 assert.equal(ABILITIES.STUDIO_SHOT_POLICY.minLevel,policy.levelRange[0]);
 assert.equal(ABILITIES.STUDIO_SHOT_POLICY.maxLevel,policy.levelRange[1]);
 assert.deepEqual({...ABILITIES.STUDIO_SHOT_POLICY.verifiedTierMaxLevel},policy.verifiedTierMaxLevel);
 assert.equal(ABILITIES.STUDIO_SHOT_POLICY.verifiedCanonicalStatsRequired,true);
});

test('SH08 all 2,676 canonical roster records retain stable IDs and valid explicit shot equipment',()=>{
 const files=fs.readdirSync(path.join(root,'data/players')).filter(file=>file.endsWith('.json')).sort();
 let count=0;
 for(const file of files){
  const groups=JSON.parse(fs.readFileSync(path.join(root,'data/players',file),'utf8'));
  for(const [team,players] of Object.entries(groups))for(const player of players){
   count++;
   assert.ok(typeof player.id==='string'&&player.id.length>0,`${file}/${team}/${player.name} keeps an ID`);
   if(player.shot!=null)assert.ok(Object.hasOwn(shots,player.shot),`${file}/${team}/${player.id} shot ID`);
   if(player.superShotLevel!=null)assert.ok(Number.isInteger(player.superShotLevel)&&player.superShotLevel>=1&&player.superShotLevel<=5,`${file}/${team}/${player.id} shot level`);
   if(player.superAbility?.type==='shoot'){
    assert.ok(['MF','FW'].includes(player.role),`${file}/${team}/${player.id} shot role`);
    assert.ok(Object.hasOwn(shots,player.superAbility.id),`${file}/${team}/${player.id} equipped shot ID`);
    assert.ok(Number.isInteger(player.superAbility.level)&&player.superAbility.level>=1&&player.superAbility.level<=5,`${file}/${team}/${player.id} equipped shot level`);
   }
  }
 }
 assert.equal(count,2676);
});

test('SH08 entitlement is role and verified-tier gated; grandfathered legacy equipment stays manageable',()=>{
 const fresh={role:'MF'};
 assert.equal(ABILITIES.studioShotEligibility(fresh,false).canEquip,false);
 assert.equal(ABILITIES.studioShotEligibility({...fresh,verifiedTier:'Gold'},true).canEquip,true);
 assert.equal(ABILITIES.studioShotEligibility({role:'DF'},true).canEquip,false);
 const legacy={role:'GK',shot:'obsolete-shot',superAbility:{type:'shoot',id:'obsolete-shot',level:9}};
 const eligible=ABILITIES.studioShotEligibility(legacy,false);
 assert.equal(eligible.grandfathered,true);assert.equal(eligible.canManage,true);assert.equal(eligible.canEquip,false);
 const lowRatedOutfielder=ABILITIES.studioShotEligibility({role:'MF',superAbility:{type:'shoot',id:'target'}},false);
 assert.equal(lowRatedOutfielder.canManage,true);assert.equal(lowRatedOutfielder.canEquip,false);
 const keep=ABILITIES.withStudioShot({...legacy,id:'legacy-keeper',rating:51,appearance:{hair:'blue'},customNote:'retain'},'keep',3,shots,false);
 assert.equal(keep.id,'legacy-keeper');assert.equal(keep.shot,'obsolete-shot');
 assert.deepEqual(keep.appearance,{hair:'blue'});assert.equal(keep.customNote,'retain');
 assert.equal(keep.superShotLevel,3);assert.equal(keep.superAbility.level,3);
 const removed=ABILITIES.withStudioShot(legacy,'none',1,shots,false);
 assert.equal(removed.shot,null);assert.equal(removed.shotName,'');assert.equal(removed.superAbility,undefined);
});

test('SH08 each selectable level 1–5 saves without changing identity or unrelated legacy fields',()=>{
 for(let level=1;level<=5;level++){
  const verifiedTier=level<=2?'Gold':level===3?'Star':'Superstar';
  const original={id:'stable-id',role:'MF',rating:95,verifiedTier,shot:'target',shotName:'Stale legacy label',superShotLevel:9,
   superAbility:{type:'defence',id:'drill',level:2},appearance:{skin:'#d7ad8d'},customPlugin:{keep:true}};
  const saved=ABILITIES.withStudioShot(original,'banana',level,shots,true);
  assert.notEqual(saved,original);assert.equal(original.superAbility.type,'defence');
  assert.equal(saved.id,'stable-id');assert.equal(saved.shot,'banana');assert.equal(saved.shotName,shots.banana.name);
  assert.equal(saved.superShotLevel,level);assert.equal(saved.superAbility.type,'shoot');
  assert.equal(saved.superAbility.id,'banana');assert.equal(saved.superAbility.name,shots.banana.name);
  assert.equal(saved.superAbility.level,level);
  assert.deepEqual(saved.appearance,{skin:'#d7ad8d'});assert.deepEqual(saved.customPlugin,{keep:true});
  assert.equal(saved.superAbility.type==='shoot'&&saved.superAbility.type==='defence',false);
 }
});

test('SH08 malformed or stale legacy records remain readable and new choices fail closed',()=>{
 const legacy={id:'legacy-01',role:'FW',shot:'retired-shot',shotName:'Old label',superShotLevel:0,
  superAbility:{type:'shoot',id:'retired-shot',name:'Old label',level:99},careerData:{games:14}};
 const readBack=ABILITIES.withStudioShot(legacy,'keep',2,shots,false);
 assert.equal(readBack.id,legacy.id);assert.equal(readBack.shot,legacy.shot);assert.equal(readBack.shotName,legacy.shotName);
 assert.equal(readBack.superAbility.id,'retired-shot');assert.equal(readBack.superAbility.level,2);
 assert.deepEqual(readBack.careerData,{games:14});
 assert.throws(()=>ABILITIES.withStudioShot({role:'MF',rating:100},'banana',1,shots,true),/verified Gold tier/);
 assert.throws(()=>ABILITIES.withStudioShot({role:'MF',rating:100,superAbility:{type:'shoot',id:'target'}},'banana',1,shots,true),/verified Gold tier/);
 assert.throws(()=>ABILITIES.withStudioShot({role:'DF'},'banana',3,shots,true),/Only midfielders/);
 assert.throws(()=>ABILITIES.withStudioShot({role:'MF'},'missing',3,shots,true),/Unknown Super Shot/);
 for(const bad of [0,6,1.5,'NaN'])assert.throws(()=>ABILITIES.withStudioShot({role:'MF'},'banana',bad,shots,true),/level must be 1–5/);
});

test('SH08 shared rare-ability slot enforces shot/defence exclusivity in either edit order',()=>{
 const shot=ABILITIES.withStudioShot({id:'p1',role:'MF',rating:95,verifiedTier:'Superstar',superAbility:{type:'defence',id:'drill'}},'target',4,shots,true);
 assert.equal(shot.superAbility.type,'shoot');
 const defence=ABILITIES.withStudioDefence({...shot,role:'DF'},'drill',3);
 assert.equal(defence.superAbility.type,'defence');
 assert.equal(Object.hasOwn(defence,'shot'),true); // shot identity remains, but only one move is equipped.
 assert.equal(defence.superAbility.type==='shoot'&&defence.superAbility.type==='defence',false);
});

test('SH08 Player Studio delegates equipment edits to the canonical compatibility helper',()=>{
 const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
 assert.match(ui,/ABILITIES\.studioShotEligibility\(player,studioEliteEligible\(player\)\)\.canManage/);
 assert.match(ui,/ABILITIES\.canEquipVerifiedFieldSpecial\(player,\{kind:'shot',level:tier\}\)/);
 assert.match(ui,/ABILITIES\.withStudioShot\(player,id,nextTier,SHOTS,studioEliteEligible\(player\)\)/);
 assert.match(ui,/studioEliteEligible=p=>\['Gold','Star','Superstar'\]\.includes\(verifiedRatingTierForPlayer\(p\)\)/);
});
