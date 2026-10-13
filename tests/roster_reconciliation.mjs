import assert from 'node:assert/strict';
import {TEAMS,SHOTS,rosterFor,DEFAULT_OPTIONS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {installContinentalClubs} from '../src/continental.js';
import {safePlan,validatePlan} from '../src/tactics.js';
import {GameEngine} from '../src/engine.js';
import {withStats,NUMERIC_STATS} from '../src/stats.js';
installExpansion(TEAMS,SHOTS);installContinentalClubs(TEAMS,SHOTS);
assert.equal(TEAMS.length,216);
const quota={GK:2,DF:3,MF:4,FW:3};
for(const team of TEAMS){
 const roster=rosterFor(team.index);const counts={GK:0,DF:0,MF:0,FW:0};
 assert.equal(roster.length,12,team.name+' length');
 assert.equal(new Set(roster.map(p=>p.id)).size,12,team.name+' id duplicates');
 assert.equal(new Set(roster.map(p=>p.name)).size,12,team.name+' name duplicates');
 for(const player of roster){
  assert.ok(player.role in counts,`${team.name} ${player.name} unknown role`);
  counts[player.role]++;const stats=withStats(player);for(const k of NUMERIC_STATS)assert.ok(stats[k]>=1&&stats[k]<=100,`${team.name} ${player.name} ${k}`);
 }
 assert.deepEqual(counts,quota,team.name+' quota');
 const plan=safePlan(null,roster,team.index);
 assert.deepEqual(validatePlan(plan,roster,team.index),plan);
 assert.equal(roster[plan.lineup[0]].role,'GK',team.name+' starting goalkeeper');
 assert.deepEqual(plan.lineup.map(i=>roster[i].role),['GK','DF','DF','MF','FW','FW'],team.name+' correct starting roles');
}
const by=(name,group)=>TEAMS.find(t=>t.name===name&&(!group||t.group===group));
const names=(name,group)=>rosterFor(by(name,group).index).map(p=>p.name);
for(const [team,group,stars] of [
 ['Real Madrid','club26',['Kylian Mbappé','Vinícius Júnior','Jude Bellingham']],
 ['Barcelona','club26',['Lamine Yamal','Raphinha','Pedri']],
 ['Manchester City','club26',['Erling Haaland','Rodri']],
 ['Arsenal','club26',['Bukayo Saka','Martin Ødegaard']],
 ['AC Milan','club26',['Mike Maignan','Fikayo Tomori','Luka Modrić']],
 ['Inter Miami','continental',['Lionel Messi','Luis Suárez']]
])for(const star of stars)assert.ok(names(team,group).includes(star),`${team} should include ${star}`);
const positions=(team,group)=>Object.fromEntries(rosterFor(by(team,group).index).map(p=>[p.name,p.role]));
assert.equal(positions('AC Milan','club26')['Mike Maignan'],'GK');
assert.equal(positions('Manchester City','club26')['Rodri'],'MF');
assert.equal(positions('Manchester City','club26')['Erling Haaland'],'FW');
assert.equal(positions('Inter Miami','continental')['Luis Suárez'],'FW');
assert.equal(positions('Inter Miami','continental')['Rodrigo De Paul'],'MF');
assert.equal(positions('Italy','national26')['Gianluigi Donnarumma'],'GK');
const ctrl={state:[{},{}],poll(){},just(){return false}};
for(const team of [by('Arsenal','club26'),by('Barcelona','club26'),by('AC Milan','club26'),by('Italy','national26'),by('Inter Miami','continental')]){
 const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},ctrl);
 game.init({home:team.index,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 assert.equal(game.player(0,0).src.role,'GK');
 assert.equal(game.rosters[0].length,12);
 game.matchState='paused';
 const p=game.teamPlans[0];
 assert.doesNotThrow(()=>game.applyPlan(0,{...p,formation:'1-2-2'}));
}
console.log('v0.8.14 ROSTER RECONCILIATION PASS: 216 clubs, 2592 players, positions, default lineups, star retention, engine start');
