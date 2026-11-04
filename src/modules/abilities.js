// Supermagic Football v0.8.25.30 | ABILITIES | independently editable module
import {SPECIALS} from "./specials.js";
import {GAME_ASSETS} from "../assets.js";
import {STATS} from "./stats.js";
const ABILITIES=(()=>{const {abilityLevel,levelModifiers}=SPECIALS;
// v0.8.0 experimental arcade ability system. These animated mechanics are original.
// Ability identifiers in this file are intentionally not claims of Famicom frame parity.
const DEFENCE_MOVES=Object.freeze(GAME_ASSETS.mechanics.defensiveAbilities);
const KEEPER_MOVES=Object.freeze(GAME_ASSETS.mechanics.keeperAbilities);
const tierPolicy=GAME_ASSETS.mechanics.ratingTierPolicy;
const keeperEquipmentPolicy=GAME_ASSETS.mechanics.keeperEquipmentPolicy;
const VERIFIED_SPECIALIZATION_MAX_LEVEL=Object.freeze({...tierPolicy.specializationMaxLevel});
const VERIFIED_FIELD_SPECIAL_ROLES=Object.freeze({shot:Object.freeze(['MF','FW']),defence:Object.freeze(['DF'])});
const VERIFIED_SHOT_IDS=Object.freeze(Object.keys(GAME_ASSETS.mechanics.shotTypes||{}));
// Tier policy is exposed as a pure gate. Unverified/inferred stats never unlock
// equipment, and goalkeeper specialization remains outside this field policy.
function verifiedSpecializationMaxLevel(player){
 return VERIFIED_SPECIALIZATION_MAX_LEVEL[STATS.verifiedRatingTierForPlayer(player)]??0;
}
function canEquipVerifiedFieldSpecial(player,{kind,level}={}){
 if(!['shot','defence'].includes(kind))return false;
 const source=player?.src||player,role=String(source?.role||source?.position||'').toUpperCase();
 if(source?.gkSuperAbility!=null)return false; // GK storage is separate, but it occupies the same one-specialization entitlement.
 if(!VERIFIED_FIELD_SPECIAL_ROLES[kind].includes(role))return false;
 const maximum=verifiedSpecializationMaxLevel(player),requested=Number(level);
 return maximum>0&&Number.isInteger(requested)&&requested>=1&&requested<=maximum;
}
function canEquipVerifiedKeeperSpecial(player,{level}={}){
 const source=player?.src||player,role=String(source?.role||source?.position||'').toUpperCase();
 if(!source||role!=='GK'||source.superAbility!=null)return false;
 const maximum=verifiedSpecializationMaxLevel(player),requested=Number(level);
 return maximum>0&&Number.isInteger(requested)&&requested>=1&&requested<=maximum;
}
// Read-only audit for legacy data after, and only after, source-verified tier
// inputs exist. Existing records remain untouched for compatibility review.
function verifiedLegacySpecializationReport(player){
 const source=player?.src||player,tier=STATS.verifiedRatingTierForPlayer(player);
 if(!source||!tier)return {verified:false,tier:null,maxLevel:0,issues:[]};
 const maxLevel=VERIFIED_SPECIALIZATION_MAX_LEVEL[tier]||0,issues=[];
 const add=(code,field,value)=>issues.push({code,field,value});
 const field=source.superAbility,role=String(source.role||source.position||'').toUpperCase();
 if(field!=null){
  if(!field||typeof field!=='object'||Array.isArray(field))add('invalid-ability-record','superAbility',field);
  else if(field.type==='shoot'||field.type==='defence'){
   const kind=field.type==='shoot'?'shot':'defence';
   const known=kind==='shot'?VERIFIED_SHOT_IDS.includes(field.id):Object.hasOwn(DEFENCE_MOVES,field.id);
   if(!known)add('unknown-ability-id','superAbility.id',field.id);
   if(!VERIFIED_FIELD_SPECIAL_ROLES[kind].includes(role))add('invalid-role-type','superAbility.type',{role,type:field.type});
   const levelField=kind==='shot'?'superShotLevel':'superDefenceLevel';
   const explicitLevel=source[levelField]!=null?Number(source[levelField]):field.level!=null?Number(field.level):abilityLevel(player,kind);
   const effectiveLevel=explicitLevel;
   if(!Number.isInteger(effectiveLevel)||effectiveLevel<1||effectiveLevel>5)
    add('invalid-ability-level',source[levelField]!=null?levelField:'superAbility.level',effectiveLevel);
   if(Number.isFinite(effectiveLevel)&&effectiveLevel>maxLevel)
    add('above-tier-cap',source[levelField]!=null?levelField:'superAbility.level',{tier,level:effectiveLevel,maxLevel});
  }else add('invalid-ability-type','superAbility.type',field.type);
 }
 const keeper=source.gkSuperAbility,hasFieldSpecial=!!field&&typeof field==='object'&&!Array.isArray(field)&&['shoot','defence'].includes(field.type);
 if(keeper!=null){
  if(!keeper||typeof keeper!=='object'||Array.isArray(keeper))add('invalid-ability-record','gkSuperAbility',keeper);
  else{
   if(keeper.type!=='defence')add('invalid-ability-type','gkSuperAbility.type',keeper.type);
   if(!Object.hasOwn(KEEPER_MOVES,keeper.id))add('unknown-ability-id','gkSuperAbility.id',keeper.id);
   if(role!=='GK')add('invalid-role-type','gkSuperAbility.type',{role,type:keeper.type});
   const levelField=source.gkSuperLevel!=null?'gkSuperLevel':'gkSuperAbility.level';
   const effectiveLevel=source.gkSuperLevel!=null?Number(source.gkSuperLevel):keeper.level!=null?Number(keeper.level):abilityLevel(player,'keeper');
   if(!Number.isInteger(effectiveLevel)||effectiveLevel<1||effectiveLevel>5)add('invalid-ability-level',levelField,effectiveLevel);
   if(Number.isInteger(effectiveLevel)&&effectiveLevel>maxLevel)add('above-tier-cap',levelField,{tier,level:effectiveLevel,maxLevel});
   if(keeper.type==='defence'&&hasFieldSpecial)add('simultaneous-field-keeper-specializations','specialization',{field,keeper});
  }
 }
 // Recognize explicit split-slot legacy shapes if encountered. The current
 // schema's `superAbility` union cannot hold both field specializations.
 const legacyShot=source.superShotAbility??source.shotAbility;
 const legacyDefence=source.superDefenceAbility??source.defenceAbility;
 if(legacyShot!=null&&legacyDefence!=null)
  add('simultaneous-field-specializations','specialization',{shot:legacyShot,defence:legacyDefence});
 return {verified:true,tier,maxLevel,issues};
}
// Shot entitlement uses the shared source-verified tier policy, not inferred legacy
// rating/OVR. Existing selections remain keep/remove-safe; new MF/FW grants use the
// single superAbility field and verified tier-specific level caps.
const shotPolicy=GAME_ASSETS.mechanics.shotEquipmentPolicy.superShot;
const STUDIO_SHOT_POLICY=Object.freeze({roles:Object.freeze([...shotPolicy.eligibleRoles]),minLevel:shotPolicy.levelRange[0],maxLevel:shotPolicy.levelRange[1],verifiedTierMaxLevel:Object.freeze({...shotPolicy.verifiedTierMaxLevel}),verifiedCanonicalStatsRequired:tierPolicy.verifiedCanonicalStatsRequired,grandfatherExisting:shotPolicy.grandfatherExisting,exclusiveField:'superAbility'});
function studioShotEligibility(player,elite=false){
 const source=player?.src||player,role=String(source?.role||source?.position||'').toUpperCase();
 const grandfathered=source?.superAbility?.type==='shoot';
 const roleEligible=STUDIO_SHOT_POLICY.roles.includes(role);
 return {roleEligible,grandfathered,canManage:roleEligible||grandfathered,canEquip:roleEligible&&!!elite};
}
function withStudioShot(player,id,level,shotCatalog,elite=false){
 const source=player?.src||player;
 if(!source||!studioShotEligibility(source,elite).canManage)throw Error('Only midfielders and forwards can equip Super Shots');
 const tier=Number(level);
 if(!Number.isInteger(tier)||tier<STUDIO_SHOT_POLICY.minLevel||tier>STUDIO_SHOT_POLICY.maxLevel)throw Error('Super Shot level must be 1–5');
 if(!['keep','none'].includes(id)&&!Object.hasOwn(shotCatalog||{},id))throw Error('Unknown Super Shot');
 if(!['keep','none'].includes(id)&&source.gkSuperAbility!=null)
  throw Error('Only one special ability category is allowed; remove goalkeeper Super Defence before equipping a Super Shot');
 if(!['keep','none'].includes(id)&&!canEquipVerifiedFieldSpecial(source,{kind:'shot',level:tier}))
  throw Error('Super Shots require verified Gold tier or higher and a level within the verified tier cap');
 const updated={...source,superShotLevel:tier};
 if(id==='none'){
  if(updated.superAbility?.type==='shoot')delete updated.superAbility;
  updated.shot=null;updated.shotName='';
 }else if(id==='keep'){
  if(updated.superAbility?.type==='shoot')updated.superAbility={...updated.superAbility,level:tier};
 }else{
  const prior=updated.superAbility?.type==='shoot'&&updated.superAbility.id===id?updated.superAbility:{};
  updated.shot=id;updated.shotName=shotCatalog[id].name||id;
  updated.superAbility={...prior,type:'shoot',id,name:updated.shotName,level:tier};
 }
 return updated;
}
// Studio catalogue is read-only until a player-facing equipment release is certified.
// Preserve default roster abilities; only the role and existing level determine eligibility.
function studioDefenceChoices(player,selectedTier){
 const source=player?.src||player;
 const role=String(source?.role||source?.position||'').toUpperCase();
 // Unassigned defenders can still qualify for a Studio preview by their rating.
 // Do not mutate or silently equip the existing roster.
 const explicit=Number(source?.superDefenceLevel??(source?.superAbility?.type==='defence'?source.superAbility.level:null));
 const rated=Number(source?.rating)>=86?3:Number(source?.rating)>=74?2:1;
 const baseline=Number.isInteger(explicit)&&explicit>=1&&explicit<=5?explicit:Math.max(abilityLevel(player,'defence'),rated);
 const requested=Number(selectedTier);
 const level=selectedTier!==undefined&&Number.isInteger(requested)&&requested>=1&&requested<=5?requested:baseline;
 if(role!=='DF')return [];
 return STUDIO_DEFENCE_IDS.filter(id=>DEFENCE_MOVES[id]&&level>=STUDIO_DEFENCE_MIN_LEVEL[id])
  .map(id=>({id,name:String(DEFENCE_MOVES[id].name||id),minLevel:STUDIO_DEFENCE_MIN_LEVEL[id],maxLevel:STUDIO_DEFENCE_POLICY.maxLevel}));
}
// Integrated from work/studio-defence-ability-20261022: pure, explicit Studio equipment.
const STUDIO_DEFENCE_IDS=Object.freeze(Object.keys(DEFENCE_MOVES));
// Defence move progression is explicit and opt-in. Wall variants unlock in
// stages; none are added to default rosters or grant a second ability slot.
const STUDIO_DEFENCE_MIN_LEVEL=Object.freeze(Object.fromEntries(STUDIO_DEFENCE_IDS.map(id=>[id,
 id==='spinBumper'?3:id==='fireWall'?2:id==='iceWall'?3:id==='demonWall'?4:1])));
const STUDIO_DEFENCE_POLICY=Object.freeze({roles:Object.freeze(['DF']),minLevel:1,maxLevel:5,
 minLevelByMove:STUDIO_DEFENCE_MIN_LEVEL,grandfatherExisting:true,exclusiveField:'superAbility'});
const STUDIO_KEEPER_IDS=Object.freeze(Object.keys(KEEPER_MOVES));
// Goalkeeper powers are separate from the one-field-rare-ability slot. The
// runtime supports levels 1–5 for both catalog moves and only activates them
// for keepers; no per-move tier threshold is defined in the current catalog.
const STUDIO_KEEPER_POLICY=Object.freeze({roles:Object.freeze([...keeperEquipmentPolicy.eligibleRoles]),minLevel:keeperEquipmentPolicy.levelRange[0],maxLevel:keeperEquipmentPolicy.levelRange[1],
 minLevelByMove:Object.freeze(Object.fromEntries(STUDIO_KEEPER_IDS.map(id=>[id,1]))),
 verifiedTierMaxLevel:Object.freeze({...keeperEquipmentPolicy.verifiedTierMaxLevel}),verifiedCanonicalStatsRequired:tierPolicy.verifiedCanonicalStatsRequired,
 grandfatherExisting:keeperEquipmentPolicy.grandfatherExisting,automaticGrant:keeperEquipmentPolicy.automaticGrant,
 abilityField:keeperEquipmentPolicy.abilityField,levelField:keeperEquipmentPolicy.levelField,exclusiveField:'superAbility',exclusiveWith:keeperEquipmentPolicy.exclusiveWith});
function studioDefenceEligibility(player){
 const source=player?.src||player,role=String(source?.role||source?.position||'').toUpperCase();
 const grandfathered=source?.superAbility?.type==='defence';
 const roleEligible=STUDIO_DEFENCE_POLICY.roles.includes(role);
 return {roleEligible,grandfathered,canManage:roleEligible||grandfathered};
}
function withStudioDefence(player,id,level){
 const source=player?.src||player;
 const eligibility=studioDefenceEligibility(source);
 if(!source||(!eligibility.roleEligible&&!(eligibility.grandfathered&&['keep','none'].includes(id))))
  throw Error('Only defenders can equip defensive abilities');
 const tier=Number(level);
 if(!Number.isInteger(tier)||tier<STUDIO_DEFENCE_POLICY.minLevel||tier>STUDIO_DEFENCE_POLICY.maxLevel)throw Error('Defence tier must be a whole number from 1 to 5');
 if(!['keep','none',...STUDIO_DEFENCE_IDS].includes(id))throw Error('Unknown defensive ability');
 if(id!=='keep'&&id!=='none'&&tier<STUDIO_DEFENCE_MIN_LEVEL[id])throw Error(`${DEFENCE_MOVES[id].name} requires defence tier ${STUDIO_DEFENCE_MIN_LEVEL[id]} or higher`);
 if(id!=='keep'&&id!=='none'&&source.gkSuperAbility!=null)
  throw Error('Only one special ability category is allowed; remove goalkeeper Super Defence before equipping field Super Defence');
 if(id!=='keep'&&id!=='none'&&!canEquipVerifiedFieldSpecial(source,{kind:'defence',level:tier}))
  throw Error('Super Defence requires verified Gold tier or higher and a level within the verified tier cap');
 // All explicit equipment choices must be available at the selected tier.
 if(id!=='keep'&&id!=='none'&&!studioDefenceChoices(source,tier).some(move=>move.id===id))
  throw Error('Defensive ability is unavailable at the selected tier');
 const updated={...source,superDefenceLevel:tier};
 if(id==='keep'&&updated.superAbility?.type==='defence'){
  // Keep remains a compatibility path even after role/tier changes.
  updated.superAbility={...updated.superAbility,level:tier};
 }
 if(id==='none'&&updated.superAbility?.type==='defence')delete updated.superAbility;
 else if(STUDIO_DEFENCE_IDS.includes(id)){
  const prior=updated.superAbility?.type==='defence'&&updated.superAbility.id===id?updated.superAbility:{};
  updated.superAbility={...prior,type:'defence',id,name:DEFENCE_MOVES[id].name,level:tier};
 }
 return updated;
}
function studioKeeperChoices(player,selectedTier){
 const source=player?.src||player;
 const role=String(source?.role||source?.position||'').toUpperCase();
 const existing=source?.gkSuperAbility?.type==='defence';
 if(!STUDIO_KEEPER_POLICY.roles.includes(role)&&!existing)return [];
 const requested=Number(selectedTier),tier=selectedTier!==undefined&&Number.isInteger(requested)&&requested>=STUDIO_KEEPER_POLICY.minLevel&&requested<=STUDIO_KEEPER_POLICY.maxLevel?requested:
  Number.isInteger(Number(source?.gkSuperLevel))&&Number(source.gkSuperLevel)>=1&&Number(source.gkSuperLevel)<=5?Number(source.gkSuperLevel):1;
 if(!canEquipVerifiedKeeperSpecial(source,{level:tier}))return [];
 return STUDIO_KEEPER_IDS.filter(id=>tier>=STUDIO_KEEPER_POLICY.minLevelByMove[id])
  .map(id=>({id,name:String(KEEPER_MOVES[id].name||id),minLevel:STUDIO_KEEPER_POLICY.minLevelByMove[id],maxLevel:STUDIO_KEEPER_POLICY.maxLevel}));
}
function studioKeeperEligibility(player){
 const source=player?.src||player,role=String(source?.role||source?.position||'').toUpperCase();
 const grandfathered=source?.gkSuperAbility?.type==='defence';
 const roleEligible=STUDIO_KEEPER_POLICY.roles.includes(role);
 return {roleEligible,grandfathered,canManage:roleEligible||grandfathered};
}
function withStudioKeeper(player,id,level){
 const source=player?.src||player,eligibility=studioKeeperEligibility(source);
 if(!source||(!eligibility.roleEligible&&!(eligibility.grandfathered&&['keep','none'].includes(id))))
  throw Error('Only goalkeepers can equip goalkeeper abilities');
 const tier=Number(level);
 if(!Number.isInteger(tier)||tier<STUDIO_KEEPER_POLICY.minLevel||tier>STUDIO_KEEPER_POLICY.maxLevel)
  throw Error('Goalkeeper tier must be a whole number from 1 to 5');
 if(!['keep','none',...STUDIO_KEEPER_IDS].includes(id))throw Error('Unknown goalkeeper ability');
 if(id!=='keep'&&id!=='none'&&tier<STUDIO_KEEPER_POLICY.minLevelByMove[id])
  throw Error(`${KEEPER_MOVES[id].name} requires goalkeeper tier ${STUDIO_KEEPER_POLICY.minLevelByMove[id]} or higher`);
 if(id!=='keep'&&id!=='none'&&source.superAbility!=null)
  throw Error('Only one special ability category is allowed; remove the field Super Shot or Super Defence before equipping goalkeeper Super Defence');
 if(id!=='keep'&&id!=='none'&&!canEquipVerifiedKeeperSpecial(source,{level:tier}))
  throw Error('Goalkeeper Super Defence requires verified Gold tier or higher and a level within the verified tier cap');
 // Removal must not materialize a level derived from legacy ratings. This is
 // a compatibility-safe delete: retain an explicitly stored level if present.
 if(id==='none'){
  if(source.gkSuperAbility?.type!=='defence')return {...source};
  const updated={...source};
  delete updated.gkSuperAbility;
  return updated;
 }
 const updated={...source,gkSuperLevel:tier};
 if(id==='keep'){
  if(updated.gkSuperAbility?.type==='defence')updated.gkSuperAbility={...updated.gkSuperAbility,level:tier};
 }else{
  const prior=updated.gkSuperAbility?.type==='defence'&&updated.gkSuperAbility.id===id?updated.gkSuperAbility:{};
  updated.gkSuperAbility={...prior,type:'defence',id,name:KEEPER_MOVES[id].name,level:tier};
 }
 return updated;
}
function fieldAbility(player){const a=player?.superAbility;return a?.type==='defence' ? DEFENCE_MOVES[a.id]??null : null;}
function keeperAbility(player){const a=player?.gkSuperAbility;return a?.type==='defence' ? KEEPER_MOVES[a.id]??null : null;}
function abilityReady(player,ability){return !!(ability&&player&&player.stun<=0&&(player.abilityCd||0)<=0&&(player.fatigue||0)+ability.cost*levelModifiers(abilityLevel(player,player.keeper?'keeper':'defence')).fatigue<=.98);}
function keeperInReach(keeper,ball,move){return !!(keeper&&ball&&!ball.owner&&!ball.shot?.underground&&move&&ball.attacker!==keeper.t&&Math.abs(ball.x-keeper.x)<=move.reachX&&Math.abs(ball.y-keeper.y)<=move.reachY&&ball.z<=210);}

return {DEFENCE_MOVES,KEEPER_MOVES,STUDIO_SHOT_POLICY,STUDIO_DEFENCE_IDS,STUDIO_DEFENCE_POLICY,STUDIO_KEEPER_IDS,STUDIO_KEEPER_POLICY,VERIFIED_SPECIALIZATION_MAX_LEVEL,verifiedSpecializationMaxLevel,canEquipVerifiedFieldSpecial,canEquipVerifiedKeeperSpecial,verifiedLegacySpecializationReport,studioShotEligibility,withStudioShot,studioDefenceEligibility,studioDefenceChoices,withStudioDefence,studioKeeperEligibility,studioKeeperChoices,withStudioKeeper,fieldAbility,keeperAbility,abilityReady,keeperInReach};})();

export {ABILITIES};
