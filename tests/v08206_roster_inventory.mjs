// Source-provenance audit, separate from the historical v0.8.20 audit snapshot.
// A real-looking name alone never means a player is verified.
import fs from 'node:fs';
import {TEAMS,SHOTS,rosterFor} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const out=new URL('../docs/',import.meta.url);
const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const rows=[['team_id','team','group','player_id','player','role','shirt','age','birth_date','explicit_fictional','club_role_verified','shirt_verified','age_verified','stats_verified','appearance_verified','verified_as_of','source']];
const s={auditedAt:'2026-10-15',version:'0.8.25.32',teamCount:0,playerSlots:0,explicitFictional:0,clubRoleVerified:0,shirtVerified:0,ageVerified:0,statsVerified:0,appearanceVerified:0,roleConflicts:0,sourceVerifiedTeams:[],notes:['Only club and role membership verified for 99 player slots (eight fully verified clubs plus three LAFC players); stats, transfer values, appearances remain provisional.','The 12-player format is a gameplay choice, not the complete official club registration list.','Repeated identities across national teams must be canonicalized before player-tier population limits can be enforced.']};
const seen=new Map();
for(const t of TEAMS){
 const players=rosterFor(t.index);s.teamCount++;
 if(players.length!==12)throw Error(`${t.name} roster has ${players.length}, expected 12`);
 let verified=0;
 for(const p of players){
  s.playerSlots++;
  if(p.fictional===true)s.explicitFictional++;
  if(p.rosterVerification==='verified_club_role'){s.clubRoleVerified++;verified++;}
  if(p.shirtVerified===true)s.shirtVerified++;
  if(p.ageVerified===true)s.ageVerified++;
  if(p.statsVerified===true)s.statsVerified++;
  if(p.appearanceVerified===true)s.appearanceVerified++;
  const normalized=p.name.normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  if(!seen.has(normalized))seen.set(normalized,new Set());seen.get(normalized).add(p.role);
  rows.push([t.id,t.name,t.group||'classic',p.id,p.name,p.role,p.num,p.age,p.birthDate,p.fictional===true,p.rosterVerification==='verified_club_role',p.shirtVerified===true,p.ageVerified===true,p.statsVerified===true,p.appearanceVerified===true,p.verifiedAsOf,p.source]);
 }
 if(verified===12)s.sourceVerifiedTeams.push(t.name);
}
s.unverifiedClubRole=s.playerSlots-s.clubRoleVerified;
if(s.teamCount!==216||s.playerSlots!==2592||s.clubRoleVerified<0||s.explicitFictional<0)throw Error('Unexpected roster provenance snapshot: '+JSON.stringify(s));
s.roleConflicts=[...seen.values()].filter(v=>v.size>1).length;
for(const t of TEAMS.filter(t=>t.group==='club26'))if(rosterFor(t.index).some(p=>p.fictional))throw Error(t.name+' still contains academy players');
fs.writeFileSync(new URL('ROSTER_PROVENANCE_AUDIT_v08206.csv',out),rows.map(r=>r.map(csv).join(',')).join('\n')+'\n');
fs.writeFileSync(new URL('ROSTER_AUDIT_SUMMARY_v08206.json',out),JSON.stringify(s,null,2)+'\n');
console.log('ROSTER AUDIT v0.8.20.6',JSON.stringify(s));
