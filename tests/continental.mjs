import assert from 'node:assert/strict';
import {TEAMS,SHOTS} from '../src/data.js';
import {installExpansion} from '../src/expanded.js';
import {CONTINENTS,installContinentalClubs,SIX_TOP_BY_CONTINENT} from '../src/continental.js';
import {createTournament,tournamentAdvance,tournamentCurrent,tournamentProgress,validateTournament} from '../src/tournaments.js';
installExpansion(TEAMS,SHOTS);
const mapping=installContinentalClubs(TEAMS,SHOTS);
assert.equal(CONTINENTS.length,6);
assert.equal(new Set(TEAMS.map(t=>t.id)).size,TEAMS.length);
assert.equal(new Set(TEAMS.filter(t=>['club26','continental'].includes(t.group)).map(t=>t.name)).size,TEAMS.filter(t=>['club26','continental'].includes(t.group)).length);
for(const t of TEAMS){assert.equal(t.customRoster?.length||12,12,t.name);assert.equal(t.index,TEAMS.indexOf(t));}
for(const c of CONTINENTS){
 assert.equal(mapping[c.id].length,{UEFA:36,AFC:32,CAF:16,CONCACAF:27,CONMEBOL:32,OFC:8}[c.id]);
 assert.equal(SIX_TOP_BY_CONTINENT[c.id].length,6);
 assert.equal(mapping[c.id].filter(i=>TEAMS[i].topSix).length,6,`${c.id} six featured clubs`);
 for(const club of mapping[c.id]){
  let run=createTournament(c.id,club,TEAMS,mapping),rounds=0;assert.ok(validateTournament(run,TEAMS));
  while(run.phase!=='finished'&&rounds++<50){const f=tournamentCurrent(run);assert.ok(f,c.id);tournamentAdvance(run,TEAMS,f.bye?null:[4,0],0);}
  assert.ok(run.phase==='finished',`${c.id}: ${TEAMS[club].name} did not finish within 50 rounds, ${tournamentProgress(run)}`);
  assert.ok(run.history.length>0);
 }
 console.log('Verified',c.id,c.season,mapping[c.id].length,'clubs, completed all',mapping[c.id].length,'solo campaigns');
}
console.log('Continental tournament full-season test: PASS; total selectable teams',TEAMS.length);
