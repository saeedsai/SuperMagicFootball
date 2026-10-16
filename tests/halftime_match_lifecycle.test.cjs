const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

// Exercise the exact recovery method shipped by the modular playable engine,
// without introducing a second copy of its formula or touching engine source.
const source=fs.readFileSync(path.resolve(__dirname,'../src/modules/engine.js'),'utf8');
const start=source.indexOf('  halftimeRecovery(){');
const end=source.indexOf('  autoSubstituteCpu(){',start);
assert(start>=0&&end>start,'live engine has halftimeRecovery directly before autoSubstituteCpu');
const recover=vm.runInNewContext('({'+source.slice(start,end)+'}).halftimeRecovery',
 {initialFatigue:src=>src.initial??0});
function match(){
 const home=[{id:'h0'},{id:'h1'},{id:'hBench'}],away=[{id:'a0'},{id:'a1'},{id:'aBench'}];
 const players=[
  {t:0,src:home[0],fatigue:.8,stun:.7,cd:.45},
  {t:0,src:home[1],fatigue:.1,stun:.2,cd:.12},
  {t:1,src:away[0],fatigue:.5,stun:.3,cd:.15},
  {t:1,src:away[1],fatigue:.95,stun:.4,cd:.21}
 ];
 const game={players,rosters:[home,away],fatigueLedger:[{h0:.3,h1:.2,hBench:.7},{a0:.4,a1:.1,aBench:.25}],
 score:[2,1],half:2,teamPlans:[{lineup:[0,1]},{lineup:[0,1]}],talksUsed:[{halftime:false},{halftime:false}],
 substitutionsUsed:[0,0]};
 return game;
}
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-9,`expected ${expected}, got ${actual}`);

test('halftime recovers exactly 40 percent of on-field fatigue on both sides',()=>{
 const g=match();recover.call(g);
 near(g.fatigueLedger[0].h0,.48);near(g.fatigueLedger[0].h1,.06);
 near(g.fatigueLedger[1].a0,.30);near(g.fatigueLedger[1].a1,.57);
 for(const player of g.players)near(player.fatigue,g.fatigueLedger[player.t][player.src.id]);
});
test('bench accumulations recover without incorrectly entering the active lineup',()=>{
 const g=match(),before=JSON.stringify(g.teamPlans);
 recover.call(g);
 near(g.fatigueLedger[0].hBench,.42);
 near(g.fatigueLedger[1].aBench,.15);
 assert.equal(JSON.stringify(g.teamPlans),before,'no automatic substitution from recovery');
});
test('stun resets for the second half but unrelated cooldowns remain untouched',()=>{
 const g=match(),before=g.players.map(p=>p.cd);
 recover.call(g);
 assert(g.players.every(p=>p.stun===0));
 assert.deepEqual(g.players.map(p=>p.cd),before);
});
test('recovery does not change score, talks, substitution quota or persistent IDs',()=>{
 const g=match();const snapshot=JSON.stringify({rosters:g.rosters,score:g.score,talks:g.talksUsed,subs:g.substitutionsUsed,half:g.half});
 recover.call(g);
 assert.equal(JSON.stringify({rosters:g.rosters,score:g.score,talks:g.talksUsed,subs:g.substitutionsUsed,half:g.half}),snapshot);
});
test('halftime recovery is invoked on first-half expiry before the UI is paused',()=>{
 const update=source.slice(source.indexOf('  update(dt){'),source.indexOf('  // v0.8.5 grounded player collision:'));
 assert.match(update,/if\(this\.half===1\)\{this\.half=2;this\.clock=0;/);
 assert.match(update,/this\.halftimeRecovery\(\);this\.resetKickoff\(1\);this\.matchState='paused';/);
 assert.match(update,/this\.emit\('halftime'\)/);
 assert.match(update,/else if\(this\.score\[0\]===this\.score\[1\]&&this\.mode!=='training'\)\{this\.startPK\(true\)\}else\{this\.matchState='finished'/);
});
