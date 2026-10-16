const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const teams=JSON.parse(read('data/teams.json'));
const m=JSON.parse(read('data/mechanics/gameplay.json'));
const groups=['arcade','national26','club26','legends','continental','bpw_worldcup','bpw_alltime'];
const rosters=Object.assign({},...groups.map(g=>JSON.parse(read('data/players/'+g+'.json'))));
function tactics(){
 const src=read('src/modules/tactics.js')
 .replace('import {DATA} from "./data.js";','')
 .replace(/export\s+\{TACTICS\};?\s*$/,'return TACTICS;');
 return new Function('DATA',src)({FORMATIONS:m.formations,DEFAULT_LINEUP:m.defaultLineup});
}
const t=tactics();
const expected=['GK','DF','DF','MF','FW','FW'];
test('all 223 teams choose exactly one goalkeeper and correct positional default six',()=>{
 assert.equal(teams.length,223);let checked=0;
 for(const team of teams){
  const roster=rosters[team.id];assert.equal(roster?.length,12,team.id);
  const plan=t.defaultPlan(team.index,roster);
  assert.equal(plan.formation,'2-1-2');
  assert.equal(plan.lineup.length,6);
  assert.equal(new Set(plan.lineup).size,6);
  assert.deepEqual(plan.lineup.map(i=>roster[i].role),expected,team.id);
  assert.deepEqual(t.validatePlan(plan,roster,team.index),plan);
  checked++;
 }
 assert.equal(checked,223);
});
test('legacy numeric starting lineup is healed for sorted modern club squads',()=>{
 const ids=['club26_0','club26_4','cont_uefa_0'];
 for(const id of ids){
  const team=teams.find(t=>t.id===id);
  if(!team)continue;
  const roster=rosters[id];
  const old={...t.defaultPlan(team.index,roster),lineup:[0,1,2,3,5,9]};
  const healed=t.safePlan(old,roster,team.index);
  assert.deepEqual(healed.lineup.map(i=>roster[i].role),expected,id);
 }
});
test('second active goalkeeper is rejected instead of silently positioned outfield',()=>{
 const team=teams.find(x=>x.group==='club26');
 const roster=rosters[team.id],correct=t.defaultPlan(team.index,roster);
 const backup=roster.findIndex((p,i)=>p.role==='GK'&&i!==correct.lineup[0]);
 const wrong={...correct,lineup:[correct.lineup[0],backup,...correct.lineup.slice(2)]};
 assert.throws(()=>t.validatePlan(wrong,roster,team.index),/Only one goalkeeper/);
 assert.deepEqual(t.safePlan(wrong,roster,team.index).lineup.map(i=>roster[i].role),expected);
});
test('legacy and modular tactics both enforce the reserve-GK guard',()=>{
 const legacy=read('src/tactics.js'),modular=read('src/modules/tactics.js');
 for(const source of [legacy,modular])assert.match(source,/Only one goalkeeper is allowed in an active lineup/);
});
