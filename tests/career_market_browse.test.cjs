'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');

function marketView(){
 const match=source.match(/function careerMarketView\([\s\S]*?\n\}/);
 assert.ok(match,'pure Career market view helper exists');
 const price=source.match(/function careerMarketPrice\([\s\S]*?\n\}/);
 assert.ok(price,'Career market price fallback helper exists');
 return vm.runInNewContext(`${price[0]}\n${match[0]};careerMarketView`,{playerOVR:player=>player.ovr});
}

test('Career market search is case and accent insensitive and can filter by role',()=>{
 const view=marketView();
 const players=[
  {name:'João Silva',role:'FW',ovr:80,value:9000000},
  {name:'Joan Smith',role:'MF',ovr:91,value:7000000},
  {name:'Ari Vale',role:'FW',ovr:75,value:5000000}
 ];
 assert.deepEqual(view(players,'JOAO','ALL').map(row=>row.index),[0]);
 assert.deepEqual(view(players,'','FW').map(row=>row.index),[0,2]);
 assert.deepEqual(view(players,'jo','FW').map(row=>row.index),[0]);
 assert.deepEqual(view(players,'missing').map(row=>row.index),[]);
});

test('Career market sorting is deterministic by OVR and price, with stable source-order ties',()=>{
 const view=marketView();
 const players=[
  {name:'First',role:'FW',ovr:80,value:9000000},
  {name:'Second',role:'MF',ovr:91,value:7000000},
  {name:'Third',role:'FW',ovr:80,value:7000000},
  {name:'Fourth',role:'GK',ovr:80,value:7000000},
  {name:'Legacy',role:'MF',ovr:60,value:0}
 ];
 assert.deepEqual(view(players).map(row=>row.index),[1,0,2,3,4]);
 assert.deepEqual(view(players,'','ALL','price-asc').map(row=>row.index),[4,1,2,3,0]);
 assert.deepEqual(view(players,'','ALL','price-desc').map(row=>row.index),[0,1,2,3,4]);
});

test('Career market browsing never mutates source player data',()=>{
 const view=marketView();
 const players=Object.freeze([
  Object.freeze({id:'one',name:'One',role:'MF',ovr:70,value:4000000}),
  Object.freeze({id:'two',name:'Two',role:'FW',ovr:90,value:3000000})
 ]);
 const before=JSON.stringify(players);
 for(let i=0;i<10;i++){
  view(players,i%2?'o':'','ALL',i%3===0?'price-asc':i%3===1?'price-desc':'ovr-desc');
 }
 assert.equal(JSON.stringify(players),before);
});

test('Career market exposes accessible search, role, sort, and live result count controls',()=>{
 assert.match(source,/id="careerMarketSearch" type="search" aria-label="Search market players"/);
 assert.match(source,/id="careerMarketRole" aria-label="Filter market players by role"/);
 assert.match(source,/id="careerMarketSort" aria-label="Sort market players"/);
 assert.match(source,/id="careerMarketResultCount"[^>]*role="status" aria-live="polite" aria-atomic="true"/);
 assert(source.includes("e.target.id==='careerMarketSearch'){careerMarketSearch=e.target.value;refreshCareerMarketListing();refreshCareerTransferQuote();"));
 assert(source.includes("e.target.id==='careerMarketRole'){careerMarketRole=e.target.value;refreshCareerMarketListing();refreshCareerTransferQuote();"));
 assert(source.includes("e.target.id==='careerMarketSort'){careerMarketSort=e.target.value;refreshCareerMarketListing();refreshCareerTransferQuote();"));
});
