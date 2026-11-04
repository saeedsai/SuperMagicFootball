import {canonicalPersonId} from './player_identity_registry.js';
import {isBPWTierExemptTeam} from './bpw_world_cups.js';

const POPULATION_CEILINGS=Object.freeze({Star:70,Superstar:30});

function verifiedIdentityKey(player){
 const source=player?.src||player;
 if(!source||source.rosterVerification!=='verified_club_role'||
    (player.statsVerified!==true&&source.statsVerified!==true))return null;
 const derived=canonicalPersonId(source);
 return derived&&source.canonicalId===derived?derived:null;
}

/**
 * Pure guard for a proposed ordinary Star/Superstar assignment.
 * `existingAssignments` is an explicit census of {player, tier, teamId}; rows
 * with other tiers are ignored, BPW World Cup teams are excluded by exact ID,
 * and repeated canonical IDs count once. Conflicting or unverifiable assigned
 * rows fail closed so incomplete identity data cannot hide a ceiling breach.
 */
export function canAssignPopulationCappedTier(player,proposedTier,teamId,existingAssignments){
 const ceiling=POPULATION_CEILINGS[proposedTier];
 if(!ceiling||!Array.isArray(existingAssignments)||typeof teamId!=='string'||!teamId||isBPWTierExemptTeam(teamId))return false;
 const candidateId=verifiedIdentityKey(player);
 if(!candidateId)return false;
 const identities=new Map();
 for(const row of existingAssignments){
  if(row?.tier!=='Star'&&row?.tier!=='Superstar')continue;
  if(typeof row.teamId!=='string'||!row.teamId)return false;
  if(isBPWTierExemptTeam(row.teamId))continue;
  const identityId=verifiedIdentityKey(row.player);
  if(!identityId)return false;
  const previous=identities.get(identityId);
  if(previous&&previous!==row.tier)return false;
  identities.set(identityId,row.tier);
 }
 const current=identities.get(candidateId);
 if(current&&current!==proposedTier)return false;
 identities.set(candidateId,proposedTier);
 let total=0;
 for(const tier of identities.values())if(tier===proposedTier)total++;
 return total<ceiling;
}

export {POPULATION_CEILINGS};
