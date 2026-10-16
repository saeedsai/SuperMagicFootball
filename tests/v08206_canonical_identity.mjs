import assert from 'node:assert/strict';
import {TEAMS,SHOTS,rosterFor} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {normalizePersonName,validBirthDate,canonicalPersonId,buildIdentityRegistry} from '../src/player_identity_registry.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
assert.equal(normalizePersonName('  Vinícius   Júnior  '),'vinicius junior');
assert(validBirthDate('2000-02-29'));assert(!validBirthDate('2001-02-29'));assert(!validBirthDate('2026-13-14'));
const same=(dob,verified=true)=>({id:'slot',name:'Dani Olmo',role:'MF',birthDate:dob,
 rosterVerification:verified?'verified_club_role':'editorial',fictional:false});
assert.equal(canonicalPersonId(same('1998-05-07')),'person:dani-olmo:1998-05-07');
assert.equal(canonicalPersonId(same('1998-05-07',false)),null);
assert.equal(canonicalPersonId(same('not-a-date')),null);
assert.equal(canonicalPersonId({...same('1998-05-07'),fictional:true}),null);
const probe=buildIdentityRegistry([
 {teamId:'a',teamName:'A',players:[same('1998-05-07'),{...same('1998-05-07',false),id:'unverified'}]},
 {teamId:'b',teamName:'B',players:[{...same('1998-05-07'),id:'other',role:'FW'},
   {id:'placeholder',name:'Academy Prospect 11',role:'MF',fictional:true}]},
 {teamId:'c',teamName:'C',players:[{id:'placeholder',name:'Academy Prospect 11',role:'DF',fictional:true}]}]);
assert.equal(probe.summary.distinctVerifiedPeople,1);
assert.equal(probe.summary.verifiedIdentitySlots,2);
assert.equal(probe.summary.placeholderRoleConflicts,1);
assert.equal(probe.summary.realNameRoleConflicts,1);
assert.equal(probe.candidates[0].disposition,'unverified_same_name_candidate');
assert(!probe.slots.find(s=>s.playerId==='unverified').canonicalId);
const separated=buildIdentityRegistry([{teamId:'one',players:[same('1998-05-07')]},
 {teamId:'two',players:[same('1999-05-07')]}]);
assert.equal(separated.summary.distinctVerifiedPeople,2);
assert.equal(separated.candidates[0].disposition,'verified_name_birthdate_conflict_review');
const all=buildIdentityRegistry(TEAMS.map(t=>({teamId:t.id,teamName:t.name,players:rosterFor(t.index)})));
assert.equal(all.summary.totalSlots,2592);
assert(all.summary.verifiedIdentitySlots>=0);
assert(all.summary.distinctVerifiedPeople<=all.summary.verifiedIdentitySlots);
assert(all.summary.nameCollisionGroups>=0,'nonnegative identity collision groups');
assert(all.summary.realNameRoleConflicts>=0,'nonnegative role conflict count');
assert(all.summary.placeholderRoleConflicts>=0,'placeholder collision counts');
assert.equal(all.summary.integrityErrors,0);
assert.equal(all.summary.rejectedInvalidVerifiedDOB,0);
assert.equal(all.slots.filter(s=>s.canonicalId).length,all.summary.verifiedIdentitySlots);
if(all.slots.some(s=>s.name==='Son Heung-min'&&s.teamName==='Los Angeles FC'&&s.canonicalId))assert.equal(all.slots.find(s=>s.name==='Son Heung-min'&&s.teamName==='Los Angeles FC'&&s.canonicalId).canonicalId,'person:son-heung-min:1992-07-08');
assert(all.candidates.some(c=>c.name==='son heung min'&&!c.roleConflict));
// No change to the persisted roster IDs, stats or positions; identity audit is non-mutating.
for (const t of TEAMS){const original=rosterFor(t.index),before=JSON.stringify(original);buildIdentityRegistry([{teamId:t.id,teamName:t.name,players:original}]);assert.equal(JSON.stringify(original),before);}
console.log('PASS identity: canonical birthdate matching, 99 safe identities, integrity and non-mutation; current collision counts',JSON.stringify(all.summary));
