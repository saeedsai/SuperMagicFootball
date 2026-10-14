import assert from 'node:assert/strict';
import {TEAMS, SHOTS, rosterFor, DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {safePlan,validatePlan} from '../src/tactics.js';
import {GameEngine} from '../src/engine.js';
import {overallForPosition} from '../src/stats.js';

installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
const expected={
  'Real Madrid': [
    ['Thibaut Courtois','GK',1,'1992-05-11'],['Andriy Lunin','GK',13,'1999-02-11'],
    ['Dean Huijsen','DF',4,'2005-04-14'],['Trent Alexander-Arnold','DF',12,'1998-10-07'],['Antonio Rüdiger','DF',22,'1993-03-03'],
    ['Jude Bellingham','MF',5,'2003-06-29'],['Federico Valverde','MF',8,'1998-07-22'],['Eduardo Camavinga','MF',6,'2002-11-10'],['Arda Güler','MF',15,'2005-02-25'],
    ['Kylian Mbappé','FW',10,'1998-12-20'],['Vinícius Júnior','FW',7,'2000-07-12'],['Endrick','FW',9,'2006-07-21']
  ],
  'Arsenal': [
    ['David Raya','GK',1,'1995-09-15'],['Kepa Arrizabalaga','GK',13,'1994-10-03'],
    ['Ben White','DF',4,'1997-10-08'],['Jurriën Timber','DF',12,'2001-06-17'],['Riccardo Calafiori','DF',33,'2002-05-19'],
    ['Martin Ødegaard','MF',8,'1998-12-17'],['Martín Zubimendi','MF',36,'1999-02-02'],['Declan Rice','MF',41,'1999-01-14'],['Mikel Merino','MF',23,'1996-06-22'],
    ['Bukayo Saka','FW',7,'2001-09-05'],['Noni Madueke','FW',20,'2002-03-10'],['Viktor Gyökeres','FW',14,'1998-06-04']
  ]
};
let total=0;
for(const [club,players] of Object.entries(expected)) {
  const team=TEAMS.find(t=>t.name===club&&t.id.startsWith('club26_'));
  assert.ok(team,`${club} found in available teams`);
  const squad=rosterFor(team.index);
  assert.equal(squad.length,12);
  assert.equal(new Set(squad.map(p=>p.id)).size,12,'player IDs remain unique');
  assert.equal(new Set(squad.map(p=>p.num)).size,12,'shirt numbers remain unique');
  const roles={GK:0,DF:0,MF:0,FW:0};
  for(const [name,role,shirt,dob] of players) {
    const player=squad.find(p=>p.name===name);
    assert.ok(player,`${club} missing ${name}`);
    assert.equal(player.role,role,`${name} primary role`);
    assert.equal(player.num,shirt,`${name} 2026 shirt`);
    assert.equal(player.birthDate,dob,`${name} DOB`);
    const [year,month,day]=dob.split('-').map(Number);
    assert.equal(player.age,2026-year-(month>10||(month===10&&day>14)?1:0),`${name} age on 2026-10-14`);
    assert.equal(player.rosterVerification,'verified_club_role');
    assert.equal(player.verifiedAsOf,'2026-10-14');
    assert.equal(player.fictional,false);
    assert.equal(player.shirtVerified,true);
    assert.equal(player.ageVerified,true);
    assert.equal(player.statsVerified,false,'do not invent verified numerical ratings');
    assert.equal(player.appearanceVerified,false,'do not invent verified player likeness');
    const ovr=overallForPosition(player,role);
    assert.ok(Number.isFinite(ovr)&&ovr>=1&&ovr<=100,`${name} calculated OVR`);
    roles[role]++;total++;
  }
  assert.deepEqual(roles,{GK:2,DF:3,MF:4,FW:3});
  assert.deepEqual(validatePlan(safePlan(null,squad,team.index),squad,team.index),safePlan(null,squad,team.index));
}
const madrid=TEAMS.find(t=>t.name==='Real Madrid');
const arsenal=TEAMS.find(t=>t.name==='Arsenal');
const noInput={state:[{},{}],poll(){},just(){return false}};
const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},noInput);
game.init({home:madrid.index,away:arsenal.index,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
assert.equal(game.rosters[0].length,12);assert.equal(game.rosters[1].length,12);
assert.ok(game.rosters[0].some(p=>p.name==='Kylian Mbappé'));
assert.ok(game.rosters[1].some(p=>p.name==='Bukayo Saka'));
assert.equal(total,24);
console.log('v0.8.20.2 verified Real Madrid + Arsenal: 24 names, roles, DOB, age, kit number, OVR, engine, stable quota PASS');
