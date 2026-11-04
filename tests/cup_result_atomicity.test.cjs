'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('function applyCupMatchResult(score,penaltyWinner=null){');
const end=ui.indexOf('\nfunction showTournament(){',start);
assert.ok(start>=0&&end>start,'Cup result commit helper exists');
const helper=ui.slice(start,end);
function fixture(save){
 const current={phase:'league',roundIdx:0,history:[],table:{team:{points:0}}};
 const events=[];const context={continentalRun:current,TEAMS:[],cupSlots:{active:3},
  tournamentAdvance(next,teams,score,winner){assert.notEqual(next,current);next.roundIdx++;next.history.push({score:score.slice(),winner});return {ok:true};},
  writeCupSlot(slot,next){events.push(['save',slot,next.roundIdx]);save?.(slot,next);},
  store:{put(key,value){events.push(['mirror',key,value.roundIdx]);}},};
 vm.runInNewContext(helper+';this.apply=applyCupMatchResult;',context);
 return {context,current,events};
}

test('Cup result is not applied to the live campaign when slot persistence fails',()=>{
 const f=fixture(()=>{throw Error('QuotaExceededError')});
 const before=JSON.stringify(f.current);
 assert.throws(()=>f.context.apply([2,1],null),/QuotaExceededError/);
 assert.equal(f.context.continentalRun,f.current,'keep the current campaign object available for retry');
 assert.equal(JSON.stringify(f.current),before,'failed result application leaves campaign state untouched');
 assert.deepEqual(f.events,[['save',3,1]],'do not update the legacy mirror after slot failure');
});

test('Cup result publishes the detached campaign only after slot persistence succeeds',()=>{
 const f=fixture();
 const result=f.context.apply([2,1],null);
 assert.equal(result.ok,true);
 assert.equal(f.current.roundIdx,0,'the pre-result campaign object is immutable');
 assert.equal(f.context.continentalRun.roundIdx,1);
 assert.deepEqual(f.events,[['save',3,1],['mirror','continentalRun',1]],'persist slot before writing the legacy mirror');
});

test('full-time Cup flow routes its result through the atomic commit helper',()=>{
 const begin=ui.indexOf('function fulltime(ev){'),end=ui.indexOf('\nfunction toast(',begin);
 assert.ok(begin>=0&&end>begin,'full-time handler exists');
 const fulltime=ui.slice(begin,end);
 assert.match(fulltime,/applyCupMatchResult\(ev\.score,ev\.penalties\?ev\.winner:null\)/);
 assert.doesNotMatch(fulltime,/tournamentAdvance\(continentalRun/);
});
