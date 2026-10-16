const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function halftimeFatigueSpotlight(');
const end=source.indexOf('function halftimeCoachPanel(',start);
assert(start>=0&&end>start,'live UI fitness spotlight must be available');
const escapeHTML=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const advice=vm.runInNewContext('(()=>{'+source.slice(start,end)+';return halftimeFatigueSpotlight;})()', {escapeHTML});
function fixture(){
 const squad=[{id:'g',name:'GK',role:'GK',num:1},{id:'d',name:'Defender',role:'DF',num:2},
   {id:'m',name:'Midfielder',role:'MF',num:6},{id:'f',name:'Striker',role:'FW',num:9},
   {id:'bench',name:'Very tired bench',role:'DF',num:14}];
 const away=[{id:'ag',name:'Away keeper',role:'GK',num:1},{id:'ad',name:'Away defender',role:'DF',num:2}];
 return {rosters:[squad,away],lineups:[[0,1,2,3],[0,1]],teamPlans:[{lineup:[0,1,2,3]},{lineup:[0,1]}],
  fatigueLedger:[{g:.1,d:.9,m:.7,f:.61,bench:.99},{ag:.91,ad:.59}]};
}
test('top two most exhausted starters shown in descending order with true fitness',()=>{
 const game=fixture(),before=JSON.stringify(game),html=advice(game,0);
 assert.match(html,/halftimeFitnessHome/);
 assert.match(html,/FITNESS WATCH/);
 assert.match(html,/#2 Defender \(DF, FIT 10%\)/);
 assert.match(html,/#6 Midfielder \(MF, FIT 30%\)/);
 assert(html.indexOf('Defender')<html.indexOf('Midfielder'));
 assert.match(html,/\+1 more/);
 assert.doesNotMatch(html,/Very tired bench/);
 assert.equal(JSON.stringify(game),before,'read-only spotlight cannot change match state');
});
test('away side remains separate and 40 percent threshold is inclusive',()=>{
 const game=fixture(),html=advice(game,1);
 assert.match(html,/halftimeFitnessAway/);
 assert.match(html,/Away keeper \(GK, FIT 9%\)/);
 assert.doesNotMatch(html,/Away defender/);
 game.fatigueLedger[1].ad=.6;
 assert.match(advice(game,1),/Away defender \(DF, FIT 40%\)/);
});
test('editable names, shirt numbers and roles are escaped against markup injection',()=>{
 const game=fixture();
 game.rosters[0][1].name='<img src=x onerror=alert(1)>';
 game.rosters[0][1].num='<b>2</b>';
 game.rosters[0][1].role='DF"><script>';
 const html=advice(game,0);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
 assert.match(html,/#&lt;b&gt;2&lt;\/b&gt;/);
 assert.doesNotMatch(html,/<img|<script|<b>2<\/b>/);
});
test('no fatigue watch for a fully fit lineup, missing entries or unknown ledger',()=>{
 const game=fixture();game.fatigueLedger[0]={bench:.99};
 assert.equal(advice(game,0),'');
 game.fatigueLedger[0].d=Number.NaN;
 game.fatigueLedger[0].m=-.5;
 assert.equal(advice(game,0),'');
});
test('spotlight is only rendered in halftime coaching panel, never applies substitutions',()=>{
 const section=source.slice(start,source.indexOf('function halftime(){',end));
 assert.match(section,/\$\{halftimeFatigueSpotlight\(game,side\)\}/);
 for(const bad of ['game.applyPlan(', 'game.applyTeamTalk(', 'store.put(', 'localStorage.setItem(', 'lineups[side]='])
  assert(!section.includes(bad),'pure fitness UI must not mutate state: '+bad);
});
