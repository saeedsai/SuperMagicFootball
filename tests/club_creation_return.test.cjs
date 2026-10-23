'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/ui.js','utf8');
const start=source.indexOf('function saveNewClub()');
const end=source.indexOf('function deleteClub(',start);
assert.ok(start>0&&end>start,'live club creation function must exist');
test('new club is selected and builder stays open for immediate edits',()=>{
 const TEAMS=Array.from({length:223},(_,i)=>({id:'team_'+i,name:'Team '+i}));
 const fields={clubName:'QA Club',clubCode:'QAC',clubRank:'80',clubShot:'banana',clubPrimary:'#112233',clubSecondary:'#445566',clubThird:'#778899'};
 const stored=[],routes=[];
 const ctx={TEAMS,home:0,away:0,SHOTS:{banana:{name:'Banana'}},$:id=>({value:fields[id]}),
  store:{put:(key,value)=>stored.push({key,value})},showClubs:()=>routes.push('builder'),
  showSetup:()=>routes.push('setup'),alert:msg=>{throw Error('Unexpected alert '+msg)}};
 vm.runInNewContext(source.slice(start,end)+';saveNewClub()',ctx);
 assert.deepEqual(routes,['builder']);
 assert.equal(ctx.home,223);
 assert.equal(ctx.away,0);
 assert.equal(TEAMS.length,224);
 assert.equal(TEAMS[223].customRoster.length,12);
 assert.equal(stored[0].key,'customClubs');
 assert.equal(stored[0].value[0].id,TEAMS[223].id);
});
