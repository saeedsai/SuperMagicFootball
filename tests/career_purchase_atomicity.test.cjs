'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

function fixture({roster,playerValue=10000000,releaseValue=2000000,cash=100000000}={}){
 const outgoing=roster||Array.from({length:12},(_,i)=>({id:`out_${i}`,name:`Outgoing ${i}`,num:i+1,value:releaseValue}));
 const career={club:0,cash,roster:outgoing};
 const incoming={id:'incoming',name:'Incoming',num:99,value:playerValue,role:'MF'};
 const teams=[{id:'home',customRoster:[]},{id:'market',customRoster:[incoming]}];
 return {career,teams,incoming};
}
const apis=async()=>[(await runtimeImport).purchase,(await moduleImport).CAREER.purchase];
const academyApis=async()=>[(await runtimeImport).signAcademy,(await moduleImport).CAREER.signAcademy];

test('Career transfer validates and commits the existing fee and release-value rules atomically in both APIs',async()=>{
 for(const purchase of await apis()){
  const {career,teams,incoming}=fixture();
  const result=purchase(career,teams,1,0,0);
  assert.equal(result.name,'Incoming');
  assert.equal(career.roster.length,12);
  assert.equal(career.roster[0].id,'incoming');
  assert.equal(career.roster[0].num,1,'incoming player inherits the replaced shirt number');
  assert.equal(career.cash,90700000,'fee is paid and 35% of the outgoing player value is returned');
  assert.equal(incoming.num,99,'canonical market roster stays unchanged');
 }
});

test('Career transfer preserves a valid incoming shirt number when the outgoing number is malformed',async()=>{
 for(const purchase of await apis())for(const badNumber of [undefined,NaN,Infinity,0,-1,1.5,'7',100]){
  const {career,teams,incoming}=fixture();
  if(badNumber===undefined)delete career.roster[0].num;else career.roster[0].num=badNumber;
  const originalIncoming=structuredClone(incoming);
  const joined=purchase(career,teams,1,0,0);
  assert.equal(joined.num,99,`incoming valid number survives outgoing ${String(badNumber)}`);
  assert.equal(career.roster[0].num,99);
  assert.deepEqual(incoming,originalIncoming,'market source remains unchanged');
  assert.equal(JSON.parse(JSON.stringify(career.roster[0])).num,99,'saved roster retains a usable number');
 }
});

test('Career transfer assigns an unused safe shirt number when both numbers are malformed',async()=>{
 for(const purchase of await apis()){
  const {career,teams}=fixture();
  delete career.roster[0].num;
  teams[1].customRoster[0].num=NaN;
  const joined=purchase(career,teams,1,0,0);
  assert.equal(joined.num,1,'fallback selects the lowest number not used by remaining players');
  assert.ok(Number.isSafeInteger(joined.num)&&joined.num>=1&&joined.num<=99);
  assert.equal(new Set(career.roster.map(player=>player.num)).size,12,'fallback does not duplicate the remaining squad numbers');
  assert.equal(JSON.parse(JSON.stringify(career)).roster[0].num,1,'fallback survives save serialization');
 }
});

test('Career transfer rejects invalid release indices without changing cash or roster',async()=>{
 for(const purchase of await apis())for(const releaseIndex of [1.5,-1,12,NaN,'1']){
  const {career,teams}=fixture({roster:[{id:'out',num:7,value:2000000}]});
  const before=structuredClone({career,teams});
  assert.throws(()=>purchase(career,teams,1,0,releaseIndex),/outgoing squad member/);
  assert.deepEqual({career,teams},before,`release index ${String(releaseIndex)} must not partially commit`);
 }
});

test('Career transfer fails closed on malformed fee or sale value before any mutation',async()=>{
 for(const purchase of await apis()){
  for(const playerValue of [-1,NaN,Infinity,'not-money']){
   const {career,teams}=fixture({playerValue});
   const before=structuredClone({career,teams});
   assert.throws(()=>purchase(career,teams,1,0,0),/Invalid transfer value/);
   assert.deepEqual({career,teams},before,`purchase value ${String(playerValue)} must not mutate state`);
  }
  for(const releaseValue of [-1,NaN,Infinity,'not-money']){
   const {career,teams}=fixture({releaseValue});
   const before=structuredClone({career,teams});
   assert.throws(()=>purchase(career,teams,1,0,0),/Invalid transfer value/);
   assert.deepEqual({career,teams},before,`sale value ${String(releaseValue)} must not mutate state`);
  }
 }
});

test('Career transfer retains legacy missing-value defaults and rejects duplicate or unaffordable signings atomically',async()=>{
 for(const purchase of await apis()){
  const legacy=fixture();delete legacy.teams[1].customRoster[0].value;delete legacy.career.roster[0].value;
  purchase(legacy.career,legacy.teams,1,0,0);
  assert.equal(legacy.career.cash,95700000,'legacy defaults remain 5m purchase and 2m outgoing value');

  const duplicate=fixture();duplicate.career.roster[2].id='incoming';
  const duplicateBefore=structuredClone({career:duplicate.career,teams:duplicate.teams});
  assert.throws(()=>purchase(duplicate.career,duplicate.teams,1,0,2),/Already in your squad/);
  assert.deepEqual({career:duplicate.career,teams:duplicate.teams},duplicateBefore);

  const poor=fixture({cash:1});
  const poorBefore=structuredClone({career:poor.career,teams:poor.teams});
  assert.throws(()=>purchase(poor.career,poor.teams,1,0,0),/Not enough transfer funds/);
  assert.deepEqual({career:poor.career,teams:poor.teams},poorBefore);
 }
});

test('Career academy signing validates and commits its squad replacement atomically in both APIs',async()=>{
 for(const signAcademy of await academyApis()){
  const roster=Array.from({length:12},(_,i)=>({id:`club_${i}`,num:i+1,value:1000000}));
  const academyPlayer={id:'youth_1',name:'Youth One',num:13,value:4000000,role:'MF'};
  const career={cash:10000000,roster,scouted:[academyPlayer]};
  const signed=signAcademy(career,0,4);
  assert.equal(signed.id,'youth_1');
  assert.equal(signed.num,5,'signed player inherits the replaced shirt number');
  assert.equal(career.cash,7800000,'academy signing preserves the existing 55% fee');
  assert.equal(career.roster[4].id,'youth_1');
  assert.deepEqual(career.scouted,[]);
  assert.equal(academyPlayer.num,13,'scout candidate is not mutated during commit');

  for(const scenario of [
   {roster:roster.slice(0,1),scouted:[academyPlayer],cash:10000000,index:11},
   {roster:roster.map((p,i)=>i===2?{id:p.id}:p),scouted:[academyPlayer],cash:10000000,index:2},
   {roster,scouted:[{...academyPlayer,value:NaN}],cash:10000000,index:1},
   {roster,scouted:[academyPlayer],cash:NaN,index:1}
  ]){
   const target={roster:scenario.roster,scouted:scenario.scouted,cash:scenario.cash};
   const before=structuredClone(target);
   assert.throws(()=>signAcademy(target,0,scenario.index));
   assert.deepEqual(target,before,'invalid academy sign must not partially charge or replace the roster');
  }
 }
});
