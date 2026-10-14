import assert from 'node:assert/strict';
import {TEAMS, SHOTS, rosterFor, DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {safePlan,validatePlan} from '../src/tactics.js';
import {GameEngine} from '../src/engine.js';
import {overallForPosition} from '../src/stats.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const expected={
 'Bayern Munich': [
 ['Manuel Neuer','GK','1986-03-27',1],['Jonas Urbig','GK','2003-08-08',40],
 ['Min-jae Kim','DF','1996-11-15',3],['Jonathan Tah','DF','1996-02-11',4],['Dayot Upamecano','DF','1998-10-27',2],
 ['Jamal Musiala','MF','2003-02-26',10],['Aleksandar Pavlović','MF','2004-05-03',45],['Joshua Kimmich','MF','1995-02-08',6],['Tom Bischof','MF','2005-06-28',8],
 ['Harry Kane','FW','1993-07-28',9],['Luis Díaz','FW','1997-01-13',14],['Michael Olise','FW','2001-12-12',17]],
 'Paris Saint-Germain': [
 ['Matvey Safonov','GK','1999-02-25',39],['Lucas Chevalier','GK','2001-11-06',30],
 ['Marquinhos','DF','1994-05-14',5],['Achraf Hakimi','DF','1998-11-04',2],['Illia Zabarnyi','DF','2002-09-01',6],
 ['Fabián Ruiz','MF','1996-04-03',8],['João Neves','MF','2004-09-27',87],['Warren Zaïre-Emery','MF','2006-03-08',33],['Vitinha','MF','2000-02-13',17],
 ['Ousmane Dembélé','FW','1997-05-15',10],['Khvicha Kvaratskhelia','FW','2001-02-12',7],['Désiré Doué','FW','2005-06-03',14]]
};
let verified=0;
for(const [name, records] of Object.entries(expected)) {
 const team=TEAMS.find(t=>t.name===name&&t.id.startsWith('club26_'));
 assert.ok(team,`${name} exists`);
 const squad=rosterFor(team.index);
 assert.equal(squad.length,12);
 assert.equal(new Set(squad.map(p=>p.id)).size,12,'stable unique IDs');
 assert.equal(new Set(squad.map(p=>p.num)).size,12,'unique shirts');
 const roles={GK:0,DF:0,MF:0,FW:0};
 for(const [playerName,role,dob,shirt] of records) {
  const p=squad.find(p=>p.name===playerName);
  assert.ok(p,`missing ${playerName} from ${name}`);
  assert.equal(p.role,role);assert.equal(p.birthDate,dob);assert.equal(p.num,shirt);
  const [year,month,day]=dob.split('-').map(Number);
  assert.equal(p.age,2026-year-(month>10||(month===10&&day>14)?1:0));
  assert.equal(p.rosterVerification,'verified_club_role');assert.equal(p.verifiedAsOf,'2026-10-14');
  assert.equal(p.fictional,false);
  assert.equal(p.shirtVerified,true);assert.equal(p.ageVerified,true);
  assert.equal(p.statsVerified,false);assert.equal(p.appearanceVerified,false);
  assert.ok(Number.isFinite(overallForPosition(p,role)));
  roles[role]++;verified++;
 }
 assert.deepEqual(roles,{GK:2,DF:3,MF:4,FW:3});
 assert.deepEqual(validatePlan(safePlan(null,squad,team.index),squad,team.index),safePlan(null,squad,team.index));
}
const noInput={state:[{},{}],poll(){},just(){return false}};
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},noInput);
game.init({home:TEAMS.find(t=>t.name==='Bayern Munich').index,away:TEAMS.find(t=>t.name==='Paris Saint-Germain').index,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
assert.ok(game.rosters[0].some(p=>p.name==='Harry Kane'));
assert.ok(game.rosters[1].some(p=>p.name==='Ousmane Dembélé'));
assert.equal(verified,24);
console.log('v0.8.20.4 verified Bayern and PSG: 24 names, roles, shirts, ages, stable IDs and match startup PASS');
