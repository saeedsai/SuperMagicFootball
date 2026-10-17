/** Read-only in-game shootout scorecard: completed kicks, next player and real winner. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=ui.indexOf('function penaltyRoundScorecard(');
const end=ui.indexOf('function returnFromPauseTactics(){',start);
assert(start>0&&end>start,'penalty scorecard helper must exist in live UI');
const source=ui.slice(start,end);
const panel=vm.runInNewContext('(()=>{'+source+';return penaltyRoundScorecard;})()');
const game=(a=[],b=[],extra={})=>({pk:{kicks:[a,b],turn:a.length+b.length,shotTimer:0,...extra},score:[2,2]});

test('actual home and away kick outcomes render an accessible read-only scorecard',()=>{
 const g=game([true,false,true],[false,true]),before=JSON.stringify(g);
 const html=panel(g);
 assert.match(html,/id="penaltyRoundScorecard" aria-label="Penalty shootout scorecard"/);
 assert.match(html,/PENALTY SHOOTOUT · 2–1/);
 assert.match(html,/HOME: 2 \/ 3/);
 assert.match(html,/AWAY: 1 \/ 2/);
 assert.equal((html.match(/aria-label="Goal"/g)||[]).length,3);
 assert.equal((html.match(/aria-label="Saved or missed"/g)||[]).length,2);
 assert.match(html,/NEXT KICK: AWAY/);
 assert.equal(JSON.stringify(g),before,'scoreboard must not mutate kickoff, team or score');
});

test('fresh shootout reports home next while no one has kicked',()=>{
 const html=panel(game());
 assert.match(html,/PENALTY SHOOTOUT · 0–0/);
 assert.match(html,/No kicks yet/);
 assert.match(html,/NEXT KICK: HOME/);
 assert.doesNotMatch(html,/WINNER:/);
});

test('in-flight attempt says current shooter, not next kick or an invented save',()=>{
 const html=panel(game([true],[true],{shotTimer:.42,stage:'shooting'}));
 assert.match(html,/CURRENT KICK: HOME/);
 assert.doesNotMatch(html,/NEXT KICK:/);
 assert.equal((html.match(/aria-label="Goal"/g)||[]).length,2);
});

test('final sudden death shows authoritative winner and preserves tied match score',()=>{
 const g=game([true,true,true,true,true,true],[true,true,true,true,true,false]);
 const before=JSON.stringify(g),html=panel(g,{finished:true,winner:0});
 assert.match(html,/PENALTY SHOOTOUT · 6–5/);
 assert.match(html,/WINNER: HOME/);
 assert.doesNotMatch(html,/NEXT KICK|CURRENT KICK/);
 assert.deepEqual(g.score,[2,2]);
 assert.equal(JSON.stringify(g),before);
});

test('away shootout winner is distinct from regular draw and never guessed from score',()=>{
 const g=game([true,true,false,true,true],[true,true,true,true,true]);
 const html=panel(g,{finished:true,winner:1});
 assert.match(html,/WINNER: AWAY/);
 assert.doesNotMatch(html,/WINNER: HOME/);
 assert.deepEqual(g.score,[2,2]);
 const unknown=panel(g,{finished:true,winner:'1'});
 assert.doesNotMatch(unknown,/WINNER:/);
});

test('bad/stale penalty snapshots and ordinary matches cannot forge scorecards',()=>{
 for(const g of [null,{}, {pk:{}},{pk:{kicks:[[]]}},{pk:{kicks:[[true],[null]]}},
   {pk:{kicks:[[1],[false]]}},{pk:{kicks:[[true],[],'extra']}}]){
  assert.equal(panel(g),'');
 }
});

test('very long sudden death remains bounded but totals use all completed attempts',()=>{
 const a=Array.from({length:27},(_,i)=>i%2===0),b=Array.from({length:27},(_,i)=>i%2!==0);
 const html=panel(game(a,b),{finished:true,winner:0});
 assert.match(html,/PENALTY SHOOTOUT · 14–13/);
 assert.match(html,/\+15 earlier/);
 assert.equal((html.match(/aria-label="Goal"/g)||[]).length,12,
  'only the most recent twelve kicks from each side are shown');
 assert.match(html,/WINNER: HOME/);
});

test('pause and ordinary fulltime use read-only helper; final penalty winner uses engine event',()=>{
 const pause=ui.slice(ui.indexOf('function pause(){'),ui.indexOf('// Read-only halftime guidance.'));
 const final=ui.slice(ui.indexOf('function fulltime(ev){'),ui.indexOf('function toast(',ui.indexOf('function fulltime(ev){')));
 assert.match(pause,/\$\{penaltyRoundScorecard\(game\)\}/);
 assert.match(final,/ev\.penalties\?penaltyRoundScorecard\(game,\{finished:true,winner:ev\.winner\}\):''/);
 assert.match(final,/ev\.penalties&&\(ev\.winner===0\|\|ev\.winner===1\)/);
 for(const banned of ['store.put(','.applyPlan(','this.take(','.emit(','.kicks[','=game.score','localStorage']){
  assert(!source.includes(banned),'scorecard must not change any engine/save state: '+banned);
 }
 assert.match(ui,/game\.onEvent=e=>\{audio\.cue\(e\)/,'actual match events still flow to HUD');
});
