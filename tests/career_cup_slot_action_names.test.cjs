'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/ui.js','utf8');
function section(startToken,endToken){
 const start=source.indexOf(startToken),end=source.indexOf(endToken,start);
 assert.ok(start>=0&&end>start,`source section exists: ${startToken}`);
 return source.slice(start,end);
}
const buttonHelpers=section('const button=', '\nfunction page(');
const careerRenderer=section('function showCareerSlots(){','\nfunction showCupSlots(){');
const cupRenderer=section('function showCupSlots(){','\nfunction showSlotNameDialog(');

function renderSlotCards(kind){
 const rows=Array.from({length:10},(_,index)=>{
  const number=index+1,occupied=number===1||number===4;
  return {number,active:number===1,occupied,name:`${kind} ${number}`,club:0,season:2,week:3,
   leaguePosition:null,leagueSize:null,leaguePoints:null,compId:'UEFA',phase:'league',roundIdx:0,
   savedAt:'2026-11-03T10:00:00.000Z'};
 });
 const state={html:''};
 const context={
  escapeHTML:value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])),
  careerSlots:{list:()=>rows,error:null,firstEmpty:()=>2},cupSlots:{list:()=>rows,error:null},
  career:{club:0},continentalRun:{club:0},TEAMS:[{name:'Test Club'}],
  page:(_title,_description,markup)=>{state.html=markup;},
 };
 vm.runInNewContext(`${buttonHelpers}\n${kind==='Career'?careerRenderer:cupRenderer}\nthis.render=${kind==='Career'?'showCareerSlots':'showCupSlots'};`,context);
 context.render();
 return state.html;
}

function buttons(markup){
 return [...markup.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(match=>{
  const action=match[1].match(/data-action="([^"]+)"/)?.[1];
  const name=match[1].match(/aria-label="([^"]+)"/)?.[1];
  return {action,name,text:match[2].replace(/<[^>]*>/g,'').trim()};
 });
}

for(const kind of ['Career','Cup']){
 test(`${kind} slot card actions expose unique accessible names containing action and slot`,()=>{
  const markup=renderSlotCards(kind),rendered=buttons(markup).filter(button=>button.action?.startsWith(`${kind.toLowerCase()}Slot`)),names=rendered.map(button=>button.name);
  assert.ok(rendered.length>=16,'two occupied slot cards and empty-slot save actions render');
  assert.ok(names.every(Boolean),'every slot action has an explicit accessible name');
  assert.equal(new Set(names).size,names.length,'slot action names are unique across all ten cards');
  for(const number of [1,4]){
   const actions=[['OVERWRITE','Overwrite','Save'],['LOAD','Load','Load'],['COPY','Copy','Copy'],['DELETE','Delete','Delete']];
   if(kind==='Career')actions.splice(3,0,['RENAME','Rename','Rename']);
   for(const [visible,verb,actionPrefix] of actions){
    const name=`${verb} ${kind} slot ${number}`;
    assert.deepEqual(rendered.filter(item=>item.name===name).map(({action,text})=>({action,text})),[
     {action:`${kind.toLowerCase()}Slot${actionPrefix==='Save'?'Save':actionPrefix}_${number}`,text:visible},
    ],`${name} keeps its original action and visible label`);
   }
  }
  assert.ok(rendered.some(item=>item.name===`Save to ${kind} slot 2`&&item.text==='SAVE HERE'),
   'an empty slot save action names its destination');
  assert.ok(!names.includes('LOAD')&&!names.includes('DELETE')&&!names.includes('SAVE HERE'),
   'repeated visual labels are not exposed as ambiguous accessible names');
 });
}
