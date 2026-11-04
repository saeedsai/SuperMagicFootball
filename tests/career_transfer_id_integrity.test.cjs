'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');

const quoteApis=async()=>[
 (await runtimeImport).careerTransferQuote,
 (await moduleImport).CAREER.careerTransferQuote,
];
const purchaseApis=async()=>[
 (await runtimeImport).purchase,
 (await moduleImport).CAREER.purchase,
];
function fixture(){
 const career={club:0,cash:10000000,roster:[{id:12,num:1,value:2000000},...Array.from({length:11},(_,i)=>({id:`out-${i}`,num:i+2,value:2000000}))]};
 const teams=[{customRoster:[]},{customRoster:[{id:'12',name:'Same identity',value:1000000},{name:'No stable identity',value:1000000}]}];
 return {career,teams};
}

test('Career transfer treats numeric and string forms of one stable player ID as duplicates',async()=>{
 const quotes=await quoteApis(),purchases=await purchaseApis();
 for(let i=0;i<quotes.length;i++){
  const {career,teams}=fixture(),before=structuredClone({career,teams});
  assert.deepEqual(quotes[i](career,teams,1,0,0),{valid:false,affordable:false});
  assert.throws(()=>purchases[i](career,teams,1,0,0),/Already in your squad/);
  assert.deepEqual({career,teams},before,'a cross-type duplicate cannot alter roster or funds');
 }
});

test('Career transfer rejects a market player without a stable ID before mutation',async()=>{
 const quotes=await quoteApis(),purchases=await purchaseApis();
 for(let i=0;i<quotes.length;i++){
  const {career,teams}=fixture(),before=structuredClone({career,teams});
  assert.deepEqual(quotes[i](career,teams,1,1,0),{valid:false,affordable:false});
  assert.throws(()=>purchases[i](career,teams,1,1,0),/outgoing squad member/);
  assert.deepEqual({career,teams},before,'invalid identity cannot alter roster or funds');
 }
});
