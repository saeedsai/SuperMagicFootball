import assert from 'node:assert/strict';
import {TEAMS,SHOTS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion,avatarFor} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {installBPWWorldCups,BPW_YEARS,BPW_SELECTIONS,historicalPersonKey} from '../src/bpw_world_cups.js';
import {safePlan,validatePlan} from '../src/tactics.js';
import {overallForPosition} from '../src/stats.js';
import {GameEngine} from '../src/engine.js';
import {teamIdentity,countryCode} from '../src/identity.js';
assert.deepEqual(BPW_YEARS,[1998,2002,2006,2010,2014,2018]);
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const before=TEAMS.map(t=>t.id);
assert.equal(before.length,216,'base index compatibility');
const result=installBPWWorldCups(TEAMS,SHOTS,avatarFor);
assert.equal(result.length,6);
assert.equal(TEAMS.length,222);
assert.deepEqual(TEAMS.slice(0,216).map(t=>t.id),before,'all old team indexes preserved');
assert.equal(installBPWWorldCups(TEAMS,SHOTS,avatarFor).length,6,'idempotent install');
assert.equal(TEAMS.length,222);
const seen=new Set(),ids=new Set();let total=0;
for(const year of BPW_YEARS){
 const t=TEAMS.find(t=>t.id===`bpw_wc_${year}`);
 assert(t && t.group==='bpw_worldcup' && t.worldCupYear===year);
 assert.equal(countryCode(t),null,'mixed-nationality team is not a country');
 assert.match(teamIdentity(t),/crestGraphic/,'World Cup all-stars receive an original team emblem');
 const players=rosterFor(t.index);
 assert.equal(players.length,12);total+=players.length;
 const counts={GK:0,DF:0,MF:0,FW:0};const nationalities=new Set();
 const plans=[];
 for(const [i,p] of players.entries()){
  assert(!p.fictional,'no fictional players');
  assert.equal(p.id,`bpw_wc_${year}_${i}`);
  assert.equal(p.worldCupYear,year);
  assert.equal(p.historicalPersonKey,historicalPersonKey(p.name));
  assert.equal(p.variantOf,p.historicalPersonKey);
  assert(!p.canonicalId,'do not invent a DOB-verified global canonical ID');
  assert(/editorial arcade/.test(p.ratingSource));
  assert(Number.isFinite(overallForPosition(p,p.role)));
  assert(p.avatar && p.avatar.skin && p.avatar.hair);
  assert(!seen.has(p.historicalPersonKey),'a player must not repeat in another World Cup BPW squad');
  assert(!ids.has(p.id),'globally unique save slot ID');
  seen.add(p.historicalPersonKey);ids.add(p.id);
  nationalities.add(p.nationality);counts[p.role]++;
 }
 assert.deepEqual(counts,{GK:2,DF:3,MF:4,FW:3});
 assert(nationalities.size>=4,'BPW must mix nationalities');
 assert.equal(new Set(players.map(p=>p.num)).size,12);
 assert.equal(players.length,BPW_SELECTIONS[year].length);
 const plan=safePlan(null,players,t.index);
 assert.equal(players[plan.lineup[0]].role,'GK');
 assert.deepEqual(validatePlan(plan,players,t.index),plan);
 plans.push(plan);
}
assert.equal(total,72);assert.equal(seen.size,72);
const dummy={state:[{},{}],poll(){},just(){return false}};
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},dummy);
for(const year of BPW_YEARS){
 const t=TEAMS.find(t=>t.worldCupYear===year);
 game.init({home:t.index,away:0,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 assert.equal(game.rosters[0].length,12);
 assert(game.players.some(p=>p.t===0 && p.keeper && p.src.role==='GK'));
 game.init({home:0,away:t.index,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 assert.equal(game.rosters[1].length,12);
}
console.log('PASS BPW 1998–2018: 6 mixed squads, 72 unique real tournament players, role quotas, original identities, gameplay boot both ends, save IDs');
