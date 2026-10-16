const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
// Execute the actual UI helper without the browser shell; this exercises
// selection/eligibility while the browser suite covers its live screen wiring.
const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function substitutionAdviceForPause(');
const end=source.indexOf('function showSquad(',start);
assert(start>=0&&end>start,'live UI helper must remain available');
const escapeHTML=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const hint=vm.runInNewContext('(()=>{'+source.slice(start,end)+';return substitutionAdviceForPause;})()', {escapeHTML});
function make(){
 const players=[
  {id:'g1',role:'GK',num:1,name:'Goalkeeper'},
  {id:'g2',role:'GK',num:12,name:'Reserve keeper'},
  {id:'d1',role:'DF',num:2,name:'Tired <defender>'},
  {id:'d2',role:'DF',num:3,name:'Second defender'},
  {id:'m1',role:'MF',num:4,name:'Midfielder'},
  {id:'f1',role:'FW',num:9,name:'Forward'},
  {id:'f2',role:'FW',num:10,name:'Striker'},
  {id:'d3',role:'DF',num:14,name:'Fresh <reserve>'}
 ];
 const plan={lineup:[0,2,3,4,5,6]};
 const game={maxSubstitutions:3,substitutionsUsed:[0,0],
   fatigueLedger:[{g1:0,g2:0,d1:.85,d2:.15,m1:.1,f1:.1,f2:.1,d3:.05},{}],
   subbedOut:[new Set(),new Set()]};
 return {players,plan,game};
}
test('suggests best same-role fresh player, escapes player data and never mutates state',()=>{
 const {players,plan,game}=make();
 const before=JSON.stringify({players,plan,ledger:game.fatigueLedger});
 const html=hint(game,0,plan,players);
 assert.match(html,/id="substitutionAdvice"/);
 assert.match(html,/slot 2 \(DF\)/);
 assert.match(html,/Tired &lt;defender&gt;/);
 assert.match(html,/Fresh &lt;reserve&gt;/);
 assert.match(html,/FIT 15%/);
 assert.match(html,/FIT 95%/);
 assert.match(html,/SAVE TACTICS/);
 assert.equal(JSON.stringify({players,plan,ledger:game.fatigueLedger}),before);
});
test('substitution limit never recommends a forbidden fourth change',()=>{
 const {players,plan,game}=make();
 game.substitutionsUsed[0]=3;
 assert.match(hint(game,0,plan,players),/All substitutions have been used/);
 assert.doesNotMatch(hint(game,0,plan,players),/Suggested swap/);
});
test('injured or previously substituted-off reserves cannot be recommended',()=>{
 const {players,plan,game}=make();
 players[7].injuryWeeks=2;
 assert.doesNotMatch(hint(game,0,plan,players),/Suggested swap/);
 players[7].injuryWeeks=0;
 game.subbedOut[0].add('d3');
 assert.doesNotMatch(hint(game,0,plan,players),/Suggested swap/);
});
test('no premature recommendation when starters are fit or replacement advantage is small',()=>{
 const {players,plan,game}=make();
 game.fatigueLedger[0].d1=.30;
 assert.doesNotMatch(hint(game,0,plan,players),/Suggested swap/);
 game.fatigueLedger[0].d1=.60;
 game.fatigueLedger[0].d3=.43;
 assert.doesNotMatch(hint(game,0,plan,players),/Suggested swap/);
});
test('pregame/paused wiring is confined to existing Team Command Center',()=>{
 assert.match(source,/origin==='pause'\?substitutionAdviceForPause\(game,side,plan,players\):''/);
 assert.match(source,/if\(squadContext==='pause'\)game\.applyPlan\(squadSide,plan\)/);
});
