/** Source-backed curated squad contracts, October 14 2026.
 * Identity, role, shirt, DOB, save-stable IDs, formations and match startup.
 * Stats/appearance remain provisional, NOT verified.
 */
import assert from 'node:assert/strict';
import {TEAMS,SHOTS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {validatePlan,safePlan} from '../src/tactics.js';
import {GameEngine} from '../src/engine.js';
import {overallForPosition} from '../src/stats.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const expected={
 'Manchester City':[
 ['club26_2_0','Gianluigi Donnarumma','GK','1999-02-25',1],
 ['club26_2_audit_12','Marc Guéhi','DF','2000-07-13',6],
 ['club26_2_audit_13','Rayan Aït-Nouri','DF','2001-06-06',21],
 ['club26_2_2','Elliot Anderson','MF','2002-11-06',5],
 ['club26_2_audit_15','Rayan Cherki','MF','2003-08-17',10],
 ['club26_2_7','Erling Haaland','FW','2000-07-21',9],
 ['club26_2_1','Rúben Dias','DF','1997-05-14',3],
 ['club26_2_audit_16','Phil Foden','MF','2000-05-28',47],
 ['club26_2_5','Enzo Fernández','MF','2001-01-17',17],
 ['club26_2_audit_14','Antoine Semenyo','FW','2000-01-07',42],
 ['club26_2_8','Jérémy Doku','FW','2002-05-27',11],
 ['club26_2_gk_17','Gerónimo Rulli','GK','1992-05-20',28]],
 'Liverpool':[
 ['club26_9_0','Alisson Becker','GK','1992-10-02',1],
 ['club26_9_1','Virgil van Dijk','DF','1991-07-08',4],
 ['club26_9_audit_12','Conor Bradley','DF','2003-07-09',12],
 ['club26_9_5','Florian Wirtz','MF','2003-05-03',7],
 ['club26_9_audit_18','Dominik Szoboszlai','MF','2000-10-25',8],
 ['club26_9_7','Hugo Ekitiké','FW','2002-06-20',22],
 ['club26_9_audit_13','Jeremie Frimpong','DF','2000-12-10',30],
 ['club26_9_6','Alexis Mac Allister','MF','1998-12-24',10],
 ['club26_9_4','Ryan Gravenberch','MF','2002-05-16',38],
 ['club26_9_9','Alexander Isak','FW','1999-09-21',9],
 ['club26_9_audit_15','Federico Chiesa','FW','1997-10-25',14],
 ['club26_9_audit_17','Giorgi Mamardashvili','GK','2000-09-29',25]]
};
let verified=0;const teamIndices=[];
for(const [club, records] of Object.entries(expected)){
 const team=TEAMS.find(t=>t.name===club&&t.id.startsWith('club26_'));
 assert.ok(team,`Missing 2026 club ${club}`);teamIndices.push(team.index);
 const squad=rosterFor(team.index);
 assert.equal(squad.length,12);assert.equal(new Set(squad.map(p=>p.id)).size,12);
 assert.equal(new Set(squad.map(p=>p.num)).size,12);
 const count={GK:0,DF:0,MF:0,FW:0};
 for(const [id,name,role,dob,shirt] of records){
  const p=squad.find(p=>p.id===id);assert.ok(p,`save-stable ${id}`);
  assert.equal(p.name,name,id);assert.equal(p.role,role,id);
  assert.equal(p.num,shirt,id);assert.equal(p.birthDate,dob,id);
  const [year,month,day]=dob.split('-').map(Number);
  const age=2026-year-(month>10 || (month===10&&day>14)?1:0);
  assert.equal(p.age,age,id);assert.equal(p.fictional,false,id);
  assert.equal(p.rosterVerification,'verified_club_role',id);
  assert.equal(p.verifiedAsOf,'2026-10-14');
  assert.equal(p.shirtVerified,true);assert.equal(p.ageVerified,true);
  assert.equal(p.statsVerified,false);assert.equal(p.appearanceVerified,false);
  assert(Number.isFinite(overallForPosition(p,role)),id);
  count[role]++;verified++;
 }
 assert.deepEqual(count,{GK:2,DF:3,MF:4,FW:3},club);
 const plan=safePlan(null,squad,team.index);
 assert.deepEqual(validatePlan(plan,squad,team.index),plan,club+' formation compatibility');
}
const inputs={state:[{},{}],poll(){},just(){return false}};
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},inputs);
game.init({home:teamIndices[0],away:teamIndices[1],options:{...DEFAULT_OPTIONS,weather:'Clear'}});
assert(game.rosters[0].some(p=>p.name==='Erling Haaland'));
assert(game.rosters[1].some(p=>p.name==='Alexander Isak'));
assert.equal(verified,24);
console.log('v0.8.20.5 source-verified Liverpool and Man City: 24 players, roles, shirts, DOB, stable IDs, formation & match startup PASS');
