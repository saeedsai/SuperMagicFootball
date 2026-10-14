/** Deterministic identity provenance / cross-roster collisions. No web claims. */
import fs from 'node:fs';
import {TEAMS,SHOTS,rosterFor} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {buildIdentityRegistry} from '../src/player_identity_registry.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const result=buildIdentityRegistry(TEAMS.map(t=>({teamId:t.id,teamName:t.name,players:rosterFor(t.index)})));
if(result.errors.length||result.summary.rejectedInvalidVerifiedDOB)throw Error(JSON.stringify(result.errors));
const doc=new URL('../docs/',import.meta.url);
const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const rows=[['category','disposition','normalized_name','roles','slot_count','teams','slot_ids','verified_person_ids','requires_review']];
for(const [category,items] of [['real_name_collision',result.candidates],['fictional_placeholder_collision',result.placeholderCollisions]]) {
 for(const c of items)rows.push([category,c.disposition,c.name,c.roles.join('|'),c.slots,c.teams.join('|'),c.playerIds.join('|'),c.verifiedIds.join('|'),c.roleConflict]);
}
fs.writeFileSync(new URL('IDENTITY_COLLISION_AUDIT_v08206.csv',doc),rows.map(row=>row.map(q).join(',')).join('\n')+'\n');
fs.writeFileSync(new URL('IDENTITY_AUDIT_SUMMARY_v08206.json',doc),JSON.stringify({
 version:'0.8.20.6',observedDate:'2026-10-14',...result.summary,
 distinctClubRoleVerifiedPersonIds:result.persons.length,
 notes:[
 'IDs are assigned only to source-checked club/role records with valid DOB. Save slot IDs are preserved.',
 'A same-name match without matching dated verification is a review candidate, NOT a confirmed shared human identity.',
 'The 26 non-placeholder same-name role mismatches are not adjudicated football position errors.',
 'Three additional role mismatches are repeated fictional Academy Prospect labels, not real shared players.',
 'Career tier population caps must await source-backed canonical identity reconciliation across nations and clubs.'
 ]},null,2)+'\n');
console.log('IDENTITY AUDIT',JSON.stringify(result.summary));
