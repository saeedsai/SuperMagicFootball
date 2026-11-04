'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {canonicalPersonId}=require('../src/player_identity_registry.js');
const {canAssignPopulationCappedTier,POPULATION_CEILINGS}=require('../src/rating_tier_population.js');

function verifiedPlayer(n,extra={}){
 const player={id:`slot_${n}`,name:`Verified Player ${n}`,birthDate:'2000-01-01',role:'FW',
  rosterVerification:'verified_club_role',statsVerified:true};
 player.canonicalId=canonicalPersonId(player);
 return {...player,...extra};
}
function assignments(tier,count,start=0){return Array.from({length:count},(_,i)=>({
 player:verifiedPlayer(start+i),tier,teamId:`club_${i%4}`,
}));}

test('RATING-TIER-04 uses strict population ceilings for new distinct verified identities',()=>{
 assert.deepEqual({...POPULATION_CEILINGS},{Star:70,Superstar:30});
 const candidate=verifiedPlayer(999);
 assert.equal(canAssignPopulationCappedTier(candidate,'Star','club_new',assignments('Star',68)),true,'69 stays below the 70 Star ceiling');
 assert.equal(canAssignPopulationCappedTier(candidate,'Star','club_new',assignments('Star',69)),false,'70 is not strictly below 70');
 assert.equal(canAssignPopulationCappedTier(candidate,'Superstar','club_new',assignments('Superstar',28)),true,'29 stays below the 30 Superstar ceiling');
 assert.equal(canAssignPopulationCappedTier(candidate,'Superstar','club_new',assignments('Superstar',29)),false,'30 is not strictly below 30');
 assert.equal(canAssignPopulationCappedTier(candidate,'Gold','club_new',[]),false,'only proposed Star/Superstar tiers are covered');
 assert.equal(canAssignPopulationCappedTier(candidate,'Star','club_new',undefined),false,'missing census fails closed');
});

test('RATING-TIER-04 deduplicates the same verified canonical identity across teams',()=>{
 const existing=assignments('Star',68);
 existing.push({player:structuredClone(existing[0].player),tier:'Star',teamId:'national_team'});
 assert.equal(canAssignPopulationCappedTier(verifiedPlayer(999),'Star','club_new',existing),true,
  'duplicate club/national slots count as one person, so the proposed total is 69');
 const sameIdentity=existing[0].player;
 assert.equal(canAssignPopulationCappedTier(sameIdentity,'Star','club_again',existing),true,
  'repeating an already-counted identity does not consume another place');
 const conflict=[{player:existing[0].player,tier:'Superstar',teamId:'club_1'}];
 assert.equal(canAssignPopulationCappedTier(sameIdentity,'Star','club_again',conflict),false,
  'a person with conflicting existing tier assignments fails closed');
});

test('RATING-TIER-04 excludes only exact BPW World Cup teams from the census',()=>{
 const bpwRows=[1998,2002,2006,2010,2014,2018].map(year=>({tier:'Star',teamId:`bpw_wc_${year}`,player:null}));
 assert.equal(canAssignPopulationCappedTier(verifiedPlayer(1000),'Star','club_new',bpwRows),true,
  'exact BPW World Cup selections do not count toward the ordinary Star ceiling');
 assert.equal(canAssignPopulationCappedTier(verifiedPlayer(1000),'Star','bpw_wc_1998',[]),false,
  'a candidate from an excluded BPW World Cup team cannot qualify');
 assert.equal(canAssignPopulationCappedTier(verifiedPlayer(1000),'Star','bpw_wc_2022',[]),true,
  'an unlisted World Cup ID is not silently exempt');
 assert.equal(canAssignPopulationCappedTier(verifiedPlayer(1001),'Star','club_new',[
  {player:verifiedPlayer(1002),tier:'Star',teamId:'bpw_alltime'},...assignments('Star',69),
 ]),false,'BPW All-Time is not one of the exact exempt teams');
});

test('RATING-TIER-04 rejects missing or unverified candidate identity and incomplete assigned census',()=>{
 const complete=verifiedPlayer(2000);
 const invalid=[
  {...complete,canonicalId:undefined},
  {...complete,canonicalId:'person:forged:2000-01-01'},
  {...complete,statsVerified:false},
  {...complete,rosterVerification:'unverified'},
  {...complete,birthDate:'2000-02-30'},
  {...complete,fictional:true},
 ];
 for(const player of invalid)assert.equal(canAssignPopulationCappedTier(player,'Star','club_new',[]),false);
 assert.equal(canAssignPopulationCappedTier(complete,'Star','club_new',[
  {player:{id:'unknown',statsVerified:true},tier:'Star',teamId:'club_1'},
 ]),false,'an existing unverified Star assignment cannot be omitted from the cap census');
});

test('RATING-TIER-04 is read-only',()=>{
 const candidate=verifiedPlayer(3000),rows=assignments('Star',68),before=structuredClone({candidate,rows});
 canAssignPopulationCappedTier(candidate,'Star','club_new',rows);
 assert.deepEqual({candidate,rows},before);
});
