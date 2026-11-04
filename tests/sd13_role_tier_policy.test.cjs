'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const moduleSource=fs.readFileSync('src/modules/abilities.js','utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'');
const ABILITIES=vm.runInNewContext(moduleSource+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},STATS:{verifiedRatingTierForPlayer:p=>p?.verifiedTier??null},
 SPECIALS:{abilityLevel:()=>1,levelModifiers:()=>({fatigue:1})}
});
const plain=value=>JSON.parse(JSON.stringify(value));

test('SD13 policy catalog matches the authored DF and GK ability catalogs',()=>{
 const A=ABILITIES;
 assert.deepEqual([...A.STUDIO_DEFENCE_POLICY.roles],['DF']);
 assert.deepEqual([...A.STUDIO_KEEPER_POLICY.roles],['GK']);
 assert.deepEqual([...A.STUDIO_DEFENCE_IDS].sort(),Object.keys(A.DEFENCE_MOVES).sort());
 assert.deepEqual([...A.STUDIO_KEEPER_IDS].sort(),Object.keys(A.KEEPER_MOVES).sort());
 assert.deepEqual(plain(A.STUDIO_KEEPER_POLICY.verifiedTierMaxLevel),{Gold:2,Star:3,Superstar:5});
 assert.equal(A.STUDIO_KEEPER_POLICY.exclusiveField,'superAbility');
 assert.equal(A.STUDIO_KEEPER_POLICY.abilityField,'gkSuperAbility');
 assert.equal(A.STUDIO_KEEPER_POLICY.levelField,'gkSuperLevel');
 for(const policy of [A.STUDIO_DEFENCE_POLICY,A.STUDIO_KEEPER_POLICY]){
  assert.equal(policy.minLevel,1);assert.equal(policy.maxLevel,5);
 }
 for(const id of A.STUDIO_DEFENCE_IDS){
  const expected={spinBumper:3,fireWall:2,iceWall:3,demonWall:4}[id]??1;
  assert.equal(A.STUDIO_DEFENCE_MIN_LEVEL?.[id]??A.STUDIO_DEFENCE_POLICY.minLevelByMove[id],expected);
  assert.ok(Number.isFinite(A.DEFENCE_MOVES[id].cooldown)&&A.DEFENCE_MOVES[id].cooldown>0);
  assert.ok(Number.isFinite(A.DEFENCE_MOVES[id].cost)&&A.DEFENCE_MOVES[id].cost>=0&&A.DEFENCE_MOVES[id].cost<=.13);
 }
 for(const id of A.STUDIO_KEEPER_IDS){
  assert.equal(A.STUDIO_KEEPER_POLICY.minLevelByMove[id],1);
  assert.ok(Number.isFinite(A.KEEPER_MOVES[id].cooldown)&&A.KEEPER_MOVES[id].cooldown>0);
  assert.ok(Number.isFinite(A.KEEPER_MOVES[id].cost)&&A.KEEPER_MOVES[id].cost>=0&&A.KEEPER_MOVES[id].cost<=.13);
 }
});

test('DF equipment respects role/tier gates, mutual exclusion, and grandfathered choices without mutating input',()=>{
 const A=ABILITIES;
 const catalog=Object.fromEntries(Object.keys(A.DEFENCE_MOVES).map(id=>[id,{name:A.DEFENCE_MOVES[id].name}]));
 const source={id:'defender-1',role:'DF',verifiedTier:'Gold',superAbility:{type:'shoot',id:'target'},shot:'target',
  custom:{keep:true}};
 const before=structuredClone(source);
 assert.equal(A.studioDefenceEligibility(source).canManage,true);
 assert.deepEqual(Array.from(A.studioDefenceChoices({role:'GK'},1)),[]);
 assert.deepEqual(Array.from(A.studioDefenceChoices({role:'FW'},1)),[]);
 assert.throws(()=>A.withStudioDefence({role:'MF'},'drill',1),/Only defenders/);
 assert.throws(()=>A.withStudioDefence(source,'spinBumper',2),/tier 3/);
 const choices=Array.from(A.studioDefenceChoices(source,1));
 assert.deepEqual(choices.map(x=>x.id).sort(),Array.from(A.STUDIO_DEFENCE_IDS)
  .filter(id=>(A.STUDIO_DEFENCE_POLICY.minLevelByMove[id]||1)<=1).sort());
 assert.equal(choices.find(x=>x.id==='drill').minLevel,1);
 assert.ok(A.studioDefenceChoices(source,3).some(x=>x.id==='spinBumper'));
 const equipped=A.withStudioDefence(source,'maceSweep',2);
 assert.deepEqual(plain(equipped.superAbility),{type:'defence',id:'maceSweep',name:A.DEFENCE_MOVES.maceSweep.name,level:2});
 assert.equal(equipped.shot,'target');
 assert.deepEqual(equipped.custom,source.custom);assert.deepEqual(source,before);
 const changedRole={...equipped,role:'MF'};
 assert.equal(A.studioDefenceEligibility(changedRole).grandfathered,true);
 assert.equal(A.withStudioDefence(changedRole,'keep',3).superAbility.id,'maceSweep');
 assert.equal(A.withStudioDefence(changedRole,'none',3).superAbility,undefined);
 assert.throws(()=>A.withStudioDefence(changedRole,'drill',3),/Only defenders/);
 const unknownLegacy={...changedRole,superAbility:{type:'defence',id:'archivedMove',opaque:5}};
 assert.deepEqual(plain(A.withStudioDefence(unknownLegacy,'keep',4).superAbility),{...unknownLegacy.superAbility,level:4});
 assert.equal(A.withStudioDefence(unknownLegacy,'none',4).superAbility,undefined);
 assert.throws(()=>A.withStudioDefence(source,'unlisted',1),/Unknown defensive ability/);
 assert.ok(A.studioDefenceChoices({role:'DF',rating:74},1).length>0,'catalogue inspection remains read-only; it does not equip a roster entry');
 assert.equal(source.superAbility.type,'shoot','shot/defence share the one superAbility slot');
 assert.equal(catalog.drill.name,A.DEFENCE_MOVES.drill.name);
});

test('GK policy preserves the separate goalkeeper slot and safely manages legacy selections',()=>{
 const A=ABILITIES;
 const source={id:'keeper-1',role:'GK',verifiedTier:'Star',
  gkSuperAbility:{type:'defence',id:'megaPalm',name:'Old Label',legacyTag:'preserve'},gkSuperLevel:2,other:17};
 const before=structuredClone(source);
 assert.deepEqual(plain(A.studioKeeperEligibility(source)),{roleEligible:true,grandfathered:true,canManage:true});
 for(let level=1;level<=5;level++){
  const choices=Array.from(A.studioKeeperChoices(source,level));
  const expected=level<=3?A.STUDIO_KEEPER_IDS:[];
  assert.deepEqual(choices.map(x=>x.id).sort(),Array.from(expected).sort());
 }
 assert.deepEqual(Array.from(A.studioKeeperChoices({role:'DF'},3)),[]);
 assert.deepEqual(Array.from(A.studioKeeperChoices({role:'FW'},3)),[]);
 assert.throws(()=>A.withStudioKeeper({role:'DF'},'megaPalm',1),/Only goalkeepers/);
 assert.throws(()=>A.withStudioKeeper(source,'badId',1),/Unknown goalkeeper/);
 assert.throws(()=>A.withStudioKeeper(source,'megaPalm',0),/whole number from 1 to 5/);
 const retiered=A.withStudioKeeper(source,'keep',4);
 assert.equal(retiered.gkSuperAbility.level,4);assert.equal(retiered.gkSuperAbility.name,'Old Label');
 assert.equal(retiered.gkSuperAbility.legacyTag,'preserve');assert.equal(retiered.superAbility,undefined);
 const replaced=A.withStudioKeeper(source,'tornadoPunch',3);
 assert.equal(replaced.gkSuperAbility.id,'tornadoPunch');assert.equal(replaced.gkSuperAbility.level,3);
 assert.equal(replaced.superAbility,undefined);assert.equal(replaced.other,17);
 const changedRole={...source,role:'DF'};
 assert.equal(A.studioKeeperEligibility(changedRole).grandfathered,true);
 assert.equal(A.withStudioKeeper(changedRole,'keep',3).gkSuperAbility.id,'megaPalm');
 assert.equal(A.withStudioKeeper(changedRole,'none',3).gkSuperAbility,undefined);
 const unknownLegacy={...changedRole,gkSuperAbility:{type:'defence',id:'oldKeeperPower',opaque:{a:1}}};
 assert.deepEqual(plain(A.withStudioKeeper(unknownLegacy,'keep',4).gkSuperAbility),{...unknownLegacy.gkSuperAbility,level:4});
 assert.equal(A.withStudioKeeper(unknownLegacy,'none',4).gkSuperAbility,undefined);
 assert.deepEqual(source,before,'equipment helpers return a copy and never mutate roster records');
});

test('GK special shares verified tier cap and one-specialization entitlement with field abilities',()=>{
 const A=ABILITIES;
 for(const [tier,max] of [['Gold',2],['Star',3],['Superstar',5]]){
  const gk={id:'gk-'+tier,role:'GK',verifiedTier:tier};
  for(let level=1;level<=5;level++)assert.equal(A.canEquipVerifiedKeeperSpecial(gk,{level}),level<=max,`${tier} level ${level}`);
  assert.equal(A.withStudioKeeper(gk,'megaPalm',max).gkSuperAbility.level,max);
  if(max<5)assert.throws(()=>A.withStudioKeeper(gk,'megaPalm',max+1),/verified tier cap/);
  assert.equal(A.studioKeeperChoices(gk,max).length,A.STUDIO_KEEPER_IDS.length);
 }
 const unverified={role:'GK',verifiedTier:null};
 assert.equal(A.canEquipVerifiedKeeperSpecial(unverified,{level:1}),false);
 assert.throws(()=>A.withStudioKeeper(unverified,'megaPalm',1),/verified Gold tier/);
 const fieldEquipped={role:'GK',verifiedTier:'Gold',superAbility:{type:'shoot',id:'nuts'},gkSuperAbility:{type:'defence',id:'megaPalm'}};
 assert.equal(A.canEquipVerifiedKeeperSpecial(fieldEquipped,{level:1}),false);
 assert.deepEqual(Array.from(A.studioKeeperChoices(fieldEquipped,1)),[]);
 assert.throws(()=>A.withStudioKeeper(fieldEquipped,'tornadoPunch',1),/Only one special ability category/);
 const kept=A.withStudioKeeper(fieldEquipped,'keep',5);
 assert.deepEqual(plain(kept.superAbility),fieldEquipped.superAbility,'legacy KEEP remains available even when tier eligibility fails');
 const removed=A.withStudioKeeper(fieldEquipped,'none',5);
 assert.equal(removed.gkSuperAbility,undefined,'legacy removal remains available');
 assert.equal(A.canEquipVerifiedFieldSpecial({...unverified,role:'DF',verifiedTier:'Gold',gkSuperAbility:{type:'defence',id:'megaPalm'}},{kind:'defence',level:1}),false);
 assert.throws(()=>A.withStudioDefence({role:'DF',verifiedTier:'Gold',gkSuperAbility:{type:'defence',id:'megaPalm'}},'drill',1),/Only one special ability category/);
});

test('DF/GK move readiness enforces cooldown/fatigue and goalkeeper reach mirrors by team',()=>{
 const A=ABILITIES;
 for(const [moves,keeper] of [[A.DEFENCE_MOVES,false],[A.KEEPER_MOVES,true]])for(const move of Object.values(moves)){
  const p={keeper,stun:0,abilityCd:0,fatigue:0,src:{superAbility:{type:'defence',id:move.id},gkSuperAbility:{type:'defence',id:move.id},superDefenceLevel:1,gkSuperLevel:1}};
  assert.equal(A.abilityReady(p,move),true,`${move.id} ready when rested`);
  p.abilityCd=move.cooldown;assert.equal(A.abilityReady(p,move),false,`${move.id} cooling down`);
  p.abilityCd=0;p.fatigue=.99;assert.equal(A.abilityReady(p,move),false,`${move.id} blocked at fatigue cap`);
  p.fatigue=0;p.stun=.1;assert.equal(A.abilityReady(p,move),false,`${move.id} blocked while stunned`);
 }
 const move={reachX:220,reachY:130};
 const cases=[
  [{t:0,x:200,y:700},{attacker:1,x:320,y:750,z:50}],
  [{t:1,x:3300,y:700},{attacker:0,x:3180,y:750,z:50}],
 ];
 for(const [keeper,ball] of cases){
  assert.equal(A.keeperInReach(keeper,{...ball,owner:null},move),true);
  assert.equal(A.keeperInReach(keeper,{...ball,owner:null,x:keeper.t===0?430:3050},move),false);
  assert.equal(A.keeperInReach(keeper,{...ball,owner:{id:'held'}},move),false);
  assert.equal(A.keeperInReach(keeper,{...ball,owner:null,attacker:keeper.t},move),false);
 }
});
