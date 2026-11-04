'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const runtimeImport=import('../src/tournaments.js');
function makeKnockout(){
 return {club:1,phase:'knockout',roundIdx:0,seed:123,earned:0,history:[],
  knockout:{matches:[[1,2]],byes:[],stage:'FINAL',remaining:2}};
}

test('knockout draw requires a penalty winner and rejects malformed values atomically',async()=>{
 const {tournamentAdvance}=await runtimeImport;
 const bad=[null,true,2,-1,'0',NaN];
 for(const value of bad){
  const tournament=makeKnockout(),before=structuredClone(tournament);
  assert.throws(()=>tournamentAdvance(tournament,[],[1,1],value),/penalty winner/,
   `invalid penalty winner ${String(value)} must be rejected`);
  assert.deepEqual(tournament,before,'rejected result must not change bracket, prize, or history');
 }
 const missing=makeKnockout(),before=structuredClone(missing);
 assert.throws(()=>tournamentAdvance(missing,[],[1,1]),/penalty winner/);
 assert.deepEqual(missing,before,'a tied player knockout cannot use the hash fallback');
});

test('valid shootout winner advances the player or eliminates them deterministically',async()=>{
 const {tournamentAdvance}=await runtimeImport;
 const won=makeKnockout(),winResult=tournamentAdvance(won,[],[1,1],0);
 assert.equal(winResult.winner,1);assert.equal(won.winner,1);assert.equal(won.phase,'finished');
 const lost=makeKnockout(),lossResult=tournamentAdvance(lost,[],[1,1],1);
 assert.equal(lossResult.winner,2);assert.equal(lost.winner,null);assert.equal(lost.phase,'finished');
});

test('standalone and modular tournament APIs enforce the same input contract',()=>{
 const guard="if(penaltyWinner!==null&&penaltyWinner!==0&&penaltyWinner!==1)throw Error('A valid penalty winner is required');if(t.phase==='knockout'&&!fx.bye&&score[0]===score[1]&&penaltyWinner===null)throw Error('A penalty winner is required for a knockout draw');";
 const runtime=fs.readFileSync(path.resolve('src/tournaments.js'),'utf8');
 const modular=fs.readFileSync(path.resolve('src/modules/tournaments.js'),'utf8');
 assert.ok(runtime.includes(guard),'standalone Tournament API validates shootout metadata');
 assert.ok(modular.includes(guard),'modular Tournament API mirrors the same validation');
});
