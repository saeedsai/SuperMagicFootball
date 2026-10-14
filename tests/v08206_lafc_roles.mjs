/** 2026 LAFC proof: Son is a forward, two genuine GK, 12-player quota. */
import assert from 'node:assert/strict';
import {TEAMS,SHOTS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {safePlan,validatePlan} from '../src/tactics.js';
import {GameEngine} from '../src/engine.js';
import {overallForPosition} from '../src/stats.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const lafc=TEAMS.find(t=>t.name==='Los Angeles FC');assert(lafc);
const players=rosterFor(lafc.index);
assert.equal(players.length,12);
assert.equal(new Set(players.map(p=>p.id)).size,12);
assert.equal(new Set(players.map(p=>p.num)).size,12);
const counts={GK:0,DF:0,MF:0,FW:0};for(const p of players)counts[p.role]++;
assert.deepEqual(counts,{GK:2,DF:3,MF:4,FW:3});
const expected=[
 ['cont_concacaf_22_0','Son Heung-min','FW',7,'1992-07-08',34],
 ['cont_concacaf_22_8','Thomas Hasal','GK',12,'1999-07-09',27],
 ['cont_concacaf_22_2','Hugo Lloris','GK',1,'1986-12-26',39]];
for(const [id,name,role,num,dob,age] of expected){
 const p=players.find(p=>p.id===id);assert(p,id);assert.equal(p.name,name);
 assert.equal(p.role,role);assert.equal(p.num,num);assert.equal(p.birthDate,dob);assert.equal(p.age,age);
 assert.equal(p.canonicalId,`person:${name.toLowerCase().replace(/ /g,'-')}:${dob}`);
 assert.equal(p.rosterVerification,'verified_club_role');assert.equal(p.ageVerified,true);assert.equal(p.shirtVerified,true);
 assert.equal(p.statsVerified,false);assert.equal(p.appearanceVerified,false);
 assert(Number.isFinite(overallForPosition(p,p.role)));
}
assert.equal(players.find(p=>p.id==='cont_concacaf_22_11').num,66);
const plan=safePlan(null,players,lafc.index);
assert.equal(players[plan.lineup[0]].role,'GK');
assert(plan.lineup.includes(players.findIndex(p=>p.name==='Son Heung-min')));assert.deepEqual(validatePlan(plan,players,lafc.index),plan);
const inputs={state:[{},{}],poll(){},just(){return false}};
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},inputs);
game.init({home:lafc.index,away:0,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
assert(game.rosters[0].some(p=>p.name==='Son Heung-min'&&p.role==='FW'));
assert(game.rosters[0].some(p=>p.name==='Thomas Hasal'&&p.role==='GK'));
console.log('PASS LAFC 2026: Son out of goal and back to FW, real second GK, 3 verified DOB/shirt/roles, save IDs preserved');
