'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtimeImport=import('../src/career.js');
const moduleImport=import('../src/modules/career.js');
function fixture({price=10000000,saleValue=2000000,cash=10000000}={}){
 const roster=Array.from({length:12},(_,i)=>({id:`out_${i}`,name:`Outgoing ${i}`,num:i+1,value:i===0?saleValue:1000000}));
 const incoming={id:'incoming',name:'Incoming',num:99,value:price,role:'MF'};
 const career={club:0,cash,roster};
 const teams=[{customRoster:[]},{customRoster:[incoming]}];
 return {career,teams,incoming};
}
const apis=async()=>[(await runtimeImport).careerTransferQuote,(await moduleImport).CAREER.careerTransferQuote];
const purchases=async()=>[(await runtimeImport).purchase,(await moduleImport).CAREER.purchase];
test('transfer quote exactly previews the current fee, floor credit, and post-swap budget without writes',async()=>{
 for(const quoteTransfer of await apis()){
  const {career,teams}=fixture({price:7000000,saleValue:2000003,cash:10000000});
  const before=structuredClone({career,teams});
  assert.deepEqual(quoteTransfer(career,teams,1,0,0),{valid:true,price:7000000,saleValue:2000003,credit:700001,projectedCash:3700001,affordable:true,shortfall:0});
  assert.deepEqual({career,teams},before,'preview must not mutate the career or market');
 }
});
test('quote affordability uses the existing upfront fee rule even when sale credit would cover it',async()=>{
 for(const quoteTransfer of await apis()){
  const {career,teams}=fixture({price:12000000,saleValue:5000000,cash:10000000});
  const quote=quoteTransfer(career,teams,1,0,0);
  assert.equal(quote.valid,true);
  assert.equal(quote.credit,1750000);
  assert.equal(quote.projectedCash,-250000);
  assert.equal(quote.affordable,false);
  assert.equal(quote.shortfall,2000000);
 }
});
test('quote uses legacy missing and zero value defaults and fails closed on malformed rows',async()=>{
 for(const quoteTransfer of await apis()){
  const {career,teams}=fixture({price:0,saleValue:0,cash:6000000});
  delete teams[1].customRoster[0].value;delete career.roster[0].value;
  assert.deepEqual(quoteTransfer(career,teams,1,0,0),{valid:true,price:5000000,saleValue:2000000,credit:700000,projectedCash:1700000,affordable:true,shortfall:0});
  for(const value of [NaN,Infinity,-1,'bad']){
   teams[1].customRoster[0].value=value;
   assert.equal(quoteTransfer(career,teams,1,0,0).valid,false);
  }
  assert.equal(quoteTransfer(career,teams,1,0,12).valid,false);
 }
});
test('transfer quote rejects a market player already in the Career squad',async()=>{
 for(const quoteTransfer of await apis()){
  const {career,teams,incoming}=fixture();
  career.roster[3].id=incoming.id;
  const before=structuredClone({career,teams});
  assert.deepEqual(quoteTransfer(career,teams,1,0,3),{valid:false,affordable:false});
  assert.deepEqual({career,teams},before,'duplicate preview must not mutate either roster');
 }
});
test('successful purchase cash result equals its pre-purchase quote',async()=>{
 const quotes=await apis(),buy=await purchases();
 for(let i=0;i<quotes.length;i++){
  const {career,teams}=fixture({price:7000000,saleValue:2000003,cash:10000000});
  const quote=quotes[i](career,teams,1,0,0);
  buy[i](career,teams,1,0,0);
  assert.equal(career.cash,quote.projectedCash);
 }
});
test('transfer market wires live selection changes to an accessible quote status',()=>{
 const fs=require('node:fs');const src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
 assert(src.includes('id="careerTransferQuote" role="status" aria-live="polite"'));
 assert(src.includes('id="careerTransferConfirmStatus" role="status" aria-live="polite" aria-atomic="true"'));
 assert(src.includes("e.target.id==='releasePlayer'||e.target.name==='target'"));
 assert(src.includes("CAREER.careerTransferQuote(career,TEAMS,selectedMarketTeam"));
 assert(src.includes('projected budget after swap'));
 assert(src.includes("a==='careerBuyConfirm'"));
 assert(src.includes("a==='careerBuyCancel'"));
});
test('Career buy opens a named review screen without applying or saving the transfer',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
 const match=src.match(/function careerBuy\(\)\{[^\n]*\}/);
 assert.ok(match,'Career buy action exists as a bounded handler');
 const career={cash:9000000,roster:[{id:'out',name:'Outgoing'}]},calls={review:0,quote:0};
 const context={career,menu:{querySelector:()=>({value:'0'})},$:()=>({value:'0'}),TEAMS:[{}, {customRoster:[{id:'in',name:'Incoming'}]}],selectedMarketTeam:1,
  CAREER:{careerTransferQuote:()=>{calls.quote++;return {valid:true,affordable:true,price:5000000,credit:700000,projectedCash:4700000}}},
  showCareerPurchaseReview(){calls.review++},refreshCareerTransferQuote(){}};
 const careerBuy=vm.runInNewContext(match[0]+';careerBuy',context);
 careerBuy();
 assert.equal(calls.quote,1);
 assert.equal(calls.review,1,'valid affordable quote opens the explicit review page');
 assert.deepEqual(career,{cash:9000000,roster:[{id:'out',name:'Outgoing'}]},'review does not mutate the active Career');
});
test('Career transfer confirmation saves the Career slot before updating the mirror',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
 const match=src.match(/function confirmCareerBuy\(\)[\s\S]*?\n\}/);assert.ok(match,'transfer confirmation handler exists');
 const career={cash:9000000,roster:[{id:'out',name:'Outgoing'}]},calls=[];
 const context={career,TEAMS:[{}, {customRoster:[{id:'in',name:'Incoming'}]}],selectedMarketTeam:1,selectedMarketTarget:0,selectedMarketOutgoing:0,
  CAREER:{careerTransferQuote:()=>({valid:true,affordable:true,projectedCash:4700000})},
  purchase(next){next.cash=4700000;next.roster=[{id:'in',name:'Incoming'}];return next.roster[0]},
  careerSlots:{active:2,save(slot,value){calls.push(['slot',slot,value])}},store:{put(key,value){calls.push(['mirror',key,value])}},
  $:()=>({textContent:''}),showCareerSquad(){calls.push(['route'])},JSON,escapeHTML:String};
 const confirm=vm.runInNewContext(match[0]+';confirmCareerBuy',context);confirm();
 assert.equal(career.cash,9000000,'live Career stays untouched until the slot succeeds');
 assert.equal(context.career.cash,4700000);
 assert.deepEqual(calls.map(call=>call[0]),['slot','mirror','route']);
 assert.equal(calls[0][1],2);
 assert.equal(calls[1][1],'managerCareer');
});
test('Career transfer slot-write failure leaves live Career and mirror unchanged',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
 const match=src.match(/function confirmCareerBuy\(\)[\s\S]*?\n\}/),career={cash:9000000,roster:[{id:'out',name:'Outgoing'}]},status={textContent:''},calls=[];
 const context={career,TEAMS:[{}, {customRoster:[{id:'in',name:'Incoming'}]}],selectedMarketTeam:1,selectedMarketTarget:0,selectedMarketOutgoing:0,
  CAREER:{careerTransferQuote:()=>({valid:true,affordable:true})},purchase(next){next.cash=4700000;next.roster=[{id:'in'}]},careerSlots:{active:1,save(){throw Error('storage full')}},
  store:{put(){calls.push('mirror')}},$:()=>status,showCareerSquad(){calls.push('route')},JSON};
 vm.runInNewContext(match[0]+';confirmCareerBuy',context)();
 assert.equal(context.career.cash,9000000);
 assert.deepEqual(context.career.roster,[{id:'out',name:'Outgoing'}]);
 assert.deepEqual(calls,[]);
 assert.match(status.textContent,/Transfer not saved\. storage full/);
});
test('legacy mirror failure is reported accurately after the authoritative slot is saved',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),src=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
 const match=src.match(/function confirmCareerBuy\(\)[\s\S]*?\n\}/),career={cash:9000000,roster:[{id:'out',name:'Outgoing'}]},status={textContent:''},calls=[];
 const context={career,TEAMS:[{}, {customRoster:[{id:'in',name:'Incoming'}]}],selectedMarketTeam:1,selectedMarketTarget:0,selectedMarketOutgoing:0,
  CAREER:{careerTransferQuote:()=>({valid:true,affordable:true})},purchase(next){next.cash=4700000;next.roster=[{id:'in'}]},careerSlots:{active:1,save(){calls.push('slot')}},
  store:{put(){calls.push('mirror');throw Error('mirror write denied')}},$:()=>status,showCareerSquad(){calls.push('route')},JSON};
 vm.runInNewContext(match[0]+';confirmCareerBuy',context)();
 assert.deepEqual(calls,['slot','mirror']);
 assert.equal(context.career.cash,4700000,'the authoritative slot commit is reflected in memory');
 assert.match(status.textContent,/Transfer saved to the active Career slot, but the legacy compatibility mirror could not be refreshed/);
});
