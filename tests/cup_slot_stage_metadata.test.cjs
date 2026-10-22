'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function render(slots){
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 const match=ui.match(/function showCupSlots\(\)\{[\s\S]*?\n\}(?=\nfunction showSaveMenu)/);
 assert.ok(match,'Cup save slot renderer should remain present');
 let html='';
 const ctx={
  cupSlots:{list:()=>slots,error:null},continentalRun:null,
  TEAMS:[{name:'Home'},{name:'Away'}],
  escapeHTML:value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'),
  button:(label,action)=>'<button data-action="'+action+'">'+label+'</button>',
  page:(_title,_intro,body)=>{html=body;}
 };
 vm.runInNewContext(match[0]+'\nshowCupSlots();',ctx);
 return html;
}
const base={number:1,active:true,occupied:true,name:'Continental Cup',compId:'UEFA',club:1,phase:'league',roundIdx:2,savedAt:'2026-10-22T04:00:00.000Z'};
test('SAVE-102 occupied slots show competition, team, stage, round and save timestamp',()=>{
 const html=render([base]);
 for(const value of ['UEFA','Away','league','Round 3','Saved','Continental Cup'])assert.ok(html.includes(value),value);
 assert.ok(html.includes('cupSlotLoad_1'));
});
test('SAVE-102 finished Cup displays Complete rather than future round',()=>{
 const html=render([{...base,phase:'finished',roundIdx:10}]);
 assert.ok(html.includes('Complete'));
 assert.ok(!html.includes('Round 11'));
});
test('SAVE-102 Cup slot names and competition fields remain escaped',()=>{
 const html=render([{...base,name:'<img src=x onerror=alert(1)>',compId:'<danger>'}]);
 assert.ok(!html.includes('<img'));
 assert.ok(!html.includes('<danger>'));
 assert.ok(html.includes('&lt;img'));
 assert.ok(html.includes('&lt;danger&gt;'));
});
test('SAVE-102 empty slot stays readable without fabricated round',()=>{
 const html=render([{number:1,occupied:false,active:false}]);
 assert.ok(html.includes('Empty slot'));
 assert.ok(!html.includes('Round NaN'));
});
