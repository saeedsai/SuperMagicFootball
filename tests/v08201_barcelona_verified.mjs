import assert from 'node:assert/strict';
import {TEAMS,SHOTS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {safePlan,validatePlan} from '../src/tactics.js';
import {GameEngine} from '../src/engine.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const team=TEAMS.find(t=>t.name==='Barcelona'&&t.id==='club26_4');
assert.ok(team,'2026 Barcelona selectable');
const squad=rosterFor(team.index);
assert.equal(squad.length,12);
assert.equal(new Set(squad.map(p=>p.id)).size,12);
assert.equal(new Set(squad.map(p=>p.num)).size,12);
const expected=[
 ['Joan García','GK',1,'2001-05-04'],['Wojciech Szczesny','GK',13,'1990-04-18'],
 ['Jules Koundé','DF',23,'1998-11-12'],['Pau Cubarsí','DF',5,'2007-01-22'],['Alejandro Balde','DF',3,'2003-10-18'],
 ['Pedri','MF',8,'2002-11-25'],['Gavi','MF',6,'2004-08-05'],['Dani Olmo','MF',20,'1998-05-07'],['Frenkie de Jong','MF',21,'1997-05-12'],
 ['Lamine Yamal','FW',10,'2007-07-13'],['Raphinha','FW',11,'1996-12-14'],['Gabriel Jesus','FW',9,'1997-04-03']
];
const roles={GK:0,DF:0,MF:0,FW:0};
for(const [name,role,num,dob] of expected){
 const p=squad.find(p=>p.name===name);assert.ok(p,`${name} in roster`);
 assert.equal(p.role,role);assert.equal(p.num,num);assert.equal(p.birthDate,dob);
 const [y,m,d]=dob.split('-').map(Number);
 assert.equal(p.age,2026-y-(10<m||(10===m&&14<d)?1:0),`${name} age consistent`);
 assert.equal(p.rosterVerification,'verified_club_role');assert.equal(p.fictional,false);
 assert.equal(p.statsVerified,false);assert.equal(p.appearanceVerified,false);
 roles[p.role]++;
}
assert.deepEqual(roles,{GK:2,DF:3,MF:4,FW:3});
const plan=safePlan(null,squad,team.index);
assert.deepEqual(validatePlan(plan,squad,team.index),plan);
const input={state:[{},{}],poll(){},just(){return false}};
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
game.init({home:team.index,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
assert.equal(game.rosters[0].length,12);
assert.ok(game.rosters[0].some(p=>p.name==='Lamine Yamal'));
console.log('v0.8.20.1 Barcelona curated 2026 squad and engine compatibility PASS');
