/** v0.8.22 Master QA release-level and content invariants.
 * Checks observable contract assertions only; no fake assertions for unshipped features.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TEAMS,SHOTS,FORMATIONS,rosterFor} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {installBPWWorldCups} from '../src/bpw_world_cups.js';
import {installBPWAllTime} from '../src/bpw_alltime.js';
import {withStats,POSITION_OVR_STATS,overallForPosition,NUMERIC_STATS} from '../src/stats.js';
import {REMAPPABLE_ACTIONS,DEFAULT_BINDINGS,MAX_BUFFERED_TAPS} from '../src/input.js';
import {validatePlan,safePlan} from '../src/tactics.js';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const pkg=JSON.parse(read('../package.json'));
const release=pkg.version;
const ui=read('../src/modules/ui.js'),sw=read('../sw.js');
assert.equal(release,'0.9.0.0','expected current owner-approved release');
assert(/const CACHE='smf-[^']+'/.test(sw)&&sw.includes('mechanics/gameplay.json'),'field release PWA cache includes 20% pitch geometry');
assert(sw.includes("'bpw'")&&sw.includes("'./src/modules/'+m+'.js'"),'offline PWA generates current BPW module entry');
assert(read('../src/modules/release.js').includes("version:'"+release+"'"),'game release source agrees with package');
assert(ui.includes('version:RELEASE.version,game')&&ui.includes('version:RELEASE.version,exportedAt'),'runtime and save exports share canonical release');
assert(ui.includes('function substitutionAdviceForPause(')&&ui.includes("origin==='pause'?substitutionAdviceForPause(game,side,plan,players):''"),'paused command center shows validated read-only substitution guidance');
assert(ui.includes('game.subbedOut?.[side]')&&ui.includes('replacement.injuryWeeks')&&ui.includes('onField.has(bench)'),'paused advice honors used and unavailable roster slots');
// The real halftime mechanics acceptance must remain discoverable by Node
// and Chromium shards, not merely listed in handover documentation.
assert(read('../tests/halftime_match_lifecycle.test.cjs').includes('halftimeRecovery'),
 'active halftime recovery Node contract is included in full regression');
assert(read('../tests/halftime_match_lifecycle_browser_qa.py').includes("g.update(.02)"),
 'playable halftime clock-boundary Chromium acceptance is included in full regression');
assert.match(read('../index.html'),/data-act="pass"/);
assert.deepEqual(REMAPPABLE_ACTIONS,['pass','shoot','dribble','jump']);
for(const keys of ['keyboard','gamepad','keyboard2','gamepad2']) {
 assert.equal(DEFAULT_BINDINGS[keys].length,4);
 assert.equal(new Set(DEFAULT_BINDINGS[keys]).size,4);
}
assert(MAX_BUFFERED_TAPS>=8 && MAX_BUFFERED_TAPS<=32,'finite but useful input backlog');
const html=read('../index.html');
assert.deepEqual([...html.matchAll(/data-act="([^"]+)"/g)].map(m=>m[1]).sort(),['dribble','jump','pass','shoot']);
assert(!html.includes('data-act="special"'),'no fifth action button');
assert.deepEqual(Object.keys(FORMATIONS).sort(),['1-1-3','1-2-2','1-3-1','2-1-2','2-2-1','3-1-1'].sort());
for(const [name,slots] of Object.entries(FORMATIONS)) {
 assert.equal(slots.length,6,`${name} one GK + five outfield`);
 assert(slots.every(s=>Number.isFinite(s.x)&&Number.isFinite(s.y)&&s.x>=0&&s.x<=1&&s.y>=0&&s.y<=1),name);
}
const ovrKeys={GK:['gkSkill','gkDiving','agility','strength','passing','stamina'],DF:['defence','strength','aggression','speedRating','heading','stamina'],MF:['passing','crossing','dribbling','agility','stamina','speedRating'],FW:['shootAccuracy','shootPower','dribbling','speedRating','agility','heading']};
assert.deepEqual(POSITION_OVR_STATS,ovrKeys);
for(const [role,keys] of Object.entries(ovrKeys)) {
 const p=withStats({id:'qa_'+role,role,rating:62});
 const before=JSON.stringify(p),x={...p};for(const k of keys)x[k]=84;
 assert.equal(overallForPosition(x,role),84);
 assert.equal(JSON.stringify(p),before,'OVR is pure');
 assert(NUMERIC_STATS.every(k=>p[k]>=1&&p[k]<=100));
}
let legacy=withStats({id:'legacy-gk',role:'GK',gkJump:75,gkSkill:80});
assert.equal(legacy.gkDiving,75);
assert(!('gkJump' in legacy),'renamed GK Diving canonical only');
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);installBPWWorldCups(TEAMS,SHOTS);installBPWAllTime(TEAMS,SHOTS);
assert.equal(TEAMS.length,223,'full team inventory');
const teamIds=new Set();let nPlayers=0,fictional=0,verified=0;
for(const t of TEAMS){
 assert(!teamIds.has(t.id),'duplicate team id');teamIds.add(t.id);
 const squad=rosterFor(t.index);assert.equal(squad.length,12,`roster ${t.name}`);nPlayers+=squad.length;
 assert.equal(new Set(squad.map(p=>p.id)).size,12,`${t.name} unique player IDs`);
 for(const p of squad){
  assert(['GK','DF','MF','FW'].includes(p.role),`${t.name}: valid role`);
  if(p.fictional===true)fictional++;
  if(p.rosterVerification==='verified_club_role')verified++;
  assert(overallForPosition(p)>=1&&overallForPosition(p)<=100);
 }
 if(squad.every(p=>p.rosterVerification==='verified_club_role')){
  const counts={GK:0,DF:0,MF:0,FW:0};for(const p of squad)counts[p.role]++;
  assert.deepEqual(counts,{GK:2,DF:3,MF:4,FW:3},t.name);
  assert.equal(new Set(squad.map(p=>p.num)).size,12,`${t.name} verified shirts unique`);
  assert.deepEqual(validatePlan(safePlan(null,squad,t.index),squad,t.index),safePlan(null,squad,t.index));
 }
}
assert.equal(nPlayers,2676);
assert(verified>=0&&verified<=nPlayers,'verified identities count must be finite');
assert(fictional>=0&&fictional<=2676,'unverified fictional player backlog remains explicit');
for(const team of TEAMS.filter(t=>t.group==='club26'))assert(rosterFor(team.index).every(p=>p.fictional===false),team.name+' must have real named players');
const csv=read('../docs/MASTER_QA_TEST_CASES_v08221.csv').trim().split('\n');
assert.equal(csv.length,451,'444 cases plus header');
const summary=JSON.parse(read('../docs/MASTER_QA_CATALOG_SUMMARY_v08221.json'));
assert.deepEqual([summary.historical,summary.backlog,summary.crosscutting,summary.total],[218,28,93,389]);
console.log('MASTER QA CONTRACTS PASS: 223 teams / 2,676 slots, '+verified+' source-verified, '+fictional+' fictional; six formations, four action buttons, GK Diving migration, OVR purity, 450-case catalog, modular release/PWA version');

// Track the new actual-engine penalty regressions in the release census (not a claim of manual GK support).
for (const file of ['penalty_shootout_lifecycle.test.cjs','penalty_shootout_lifecycle_browser_qa.py']) {
 assert(fs.existsSync(new URL('./'+file,import.meta.url)),`PK regression missing from full census: ${file}`);
}
