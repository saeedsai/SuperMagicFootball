const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function halftimeCoachAdvice(');
const end=source.indexOf('function halftimeCoachPanel(',start);
assert(start>=0&&end>start,'live halftime coaching implementation available');
const advise=vm.runInNewContext('(()=>{'+source.slice(start,end)+';return halftimeCoachAdvice;})()');
function fixture(){
 const players=[{id:'g',role:'GK'},{id:'d',role:'DF'},{id:'f',role:'FW'}];
 const away=[{id:'ag',role:'GK'},{id:'ad',role:'DF'},{id:'af',role:'FW'}];
 const g={score:[0,1],teamPlans:[{lineup:[0,1,2]},{lineup:[0,1,2]}],
 lineups:[[0,1,2],[0,1,2]],rosters:[players,away],
 fatigueLedger:[{g:.11,d:.82,f:.3},{ag:.1,ad:.62,af:.2}],
 substitutionsUsed:[1,0],maxSubstitutions:3,
 teamMorale:s=>s===0?31:72};
 return g;
}
test('trailing side receives real score, fatigue, substitution and morale advice',()=>{
 const g=fixture();const before=JSON.stringify(g);
 const note=advise(g,0);
 assert.match(note,/TRAILING/);
 assert.match(note,/Direct attack and High Press/);
 assert.match(note,/LOW FITNESS: 1 starter/);
 assert.match(note,/2 substitutions left/);
 assert.match(note,/LOW MORALE \(31%\)/);
 assert.match(note,/Advice only/);
 assert.equal(JSON.stringify(g),before,'advice cannot mutate match or save state');
});
test('same match opposite side gets leading advice with independent counts',()=>{
 const note=advise(fixture(),1);
 assert.match(note,/LEADING/);
 assert.match(note,/Possession and Deep Block/);
 assert.match(note,/LOW FITNESS: 1 starter/);
 assert.match(note,/3 substitutions left/);
 assert.doesNotMatch(note,/LOW MORALE/);
});
test('level score, exactly 40 percent starter fitness and zero slots are handled',()=>{
 const g=fixture();g.score=[2,2];g.fatigueLedger[0].d=.59999;
 assert.match(advise(g,0),/LEVEL SCORE/);
 assert.match(advise(g,0),/no starter below 40% fitness/);
 g.substitutionsUsed[0]=3;
 assert.match(advise(g,0),/NO SUBSTITUTIONS LEFT/);
 assert.doesNotMatch(advise(g,0),/LOW FITNESS/);
});
test('ledger uses current lineups, excluding a very tired bench player',()=>{
 const g=fixture();g.lineups[0]=[0,2];g.fatigueLedger[0].f=.12;
 assert.match(advise(g,0),/no starter below 40% fitness/);
});
test('halftime advice is displayed without automatic talk or save mutations',()=>{
 assert.match(source,/\$\{halftimeCoachPanel\(game,0\)\}/);
 assert.match(source,/\$\{humans>=2\?halftimeCoachPanel\(game,1\):''\}/);
 assert.match(source,/id="halftimeCoach\$\{side===0\?'Home':'Away'\}"/);
 const slice=source.slice(start,source.indexOf('function halftime(){',end));
 for(const forbidden of ['.applyPlan(','.applyTeamTalk(','store.put(','store.set(','lineups[side]='])
  assert(!slice.includes(forbidden),'coaching must remain presentation-only: '+forbidden);
});
