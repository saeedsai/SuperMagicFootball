'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const api=async()=>(await import('../src/modules/career_slots.js')).CAREER_SLOTS;
const career=()=>({club:2,season:3,week:6,members:[1,2,3,4],fixtures:[],history:[],roster:Array.from({length:12},(_,i)=>({id:i})),table:{1:{pts:12,gf:8,ga:3},2:{pts:12,gf:9,ga:5},3:{pts:9,gf:7,ga:4},4:{pts:4,gf:3,ga:8}},facilities:{},cup:{},cash:100});
const memory=()=>{let raw=null,writes=0;return {getItem:()=>raw,setItem:(_k,v)=>{raw=String(v);writes++},get raw(){return raw},get writes(){return writes}}};
test('Career slot preview shows saved league rank and points without writing',async()=>{
 const db=memory(),slots=(await api()).create(db),c=career();slots.save(1,c,'Saved season');
 const before=db.raw,writes=db.writes,summary=slots.list()[0];
 assert.equal(summary.leaguePosition,2);assert.equal(summary.leagueSize,4);assert.equal(summary.leaguePoints,12);
 assert.equal(db.raw,before);assert.equal(db.writes,writes);assert.equal(slots.active,1);
 assert.deepEqual(JSON.parse(db.raw).slots[0].career,c);
});
test('ranking matches Career tie breakers: points, goal difference, goals scored, stable members order',async()=>{
 const db=memory(),slots=(await api()).create(db),c=career();
 c.table[1]={pts:12,gf:10,ga:6};c.table[2]={pts:12,gf:11,ga:7};
 slots.save(1,c);assert.equal(slots.list()[0].leaguePosition,1,'goals for wins equal points and goal difference');
 c.table[1]={pts:13,gf:1,ga:0};slots.save(1,c);
 assert.equal(slots.list()[0].leaguePosition,2,'points outrank goal difference and goals for');
 c.table[1]={pts:12,gf:11,ga:7};slots.save(1,c);
 assert.equal(slots.list()[0].leaguePosition,2,'member order breaks a complete tie');
});
test('incomplete legacy standings hide only the preview; save and load remain available',async()=>{
 const db=memory(),slots=(await api()).create(db),c=career();delete c.table[3];
 slots.save(1,c,'Old season');const before=db.raw,writes=db.writes;
 assert.equal(slots.list()[0].leaguePosition,null);assert.equal(slots.list()[0].leaguePoints,null);
 assert.equal(slots.load(1).club,2);assert.equal(db.writes,writes+1,'normal load remains functional');
 assert.deepEqual(JSON.parse(before).slots[0].career,c);
 assert.equal(slots.list().length,10);assert.equal(slots.list()[1].leaguePosition,null);
});
test('Career save-slot screen displays standings only when available',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 const found=ui.match(/function showCareerSlots\(\)\{[\s\S]*?\n\}(?=\nfunction showCupSlots)/);
 assert.ok(found,'Career slots screen exists');
 let html='';const slot={number:1,active:true,occupied:true,name:'Saved',club:0,season:3,week:6,savedAt:'2026-10-30T00:00:00Z',leaguePosition:2,leagueSize:4,leaguePoints:12};
 const ctx={careerSlots:{firstEmpty:()=>null,list:()=>[slot],error:null},career:null,TEAMS:[{name:'Club'}],escapeHTML:String,button:()=>'',page:(_title,_desc,markup)=>{html=markup}};
 vm.runInNewContext(found[0]+'\nshowCareerSlots()',ctx);
 assert.match(html,/League #2\/4 · 12 pts/);
 slot.leaguePosition=null;vm.runInNewContext(found[0]+'\nshowCareerSlots()',ctx);
 assert.doesNotMatch(html,/League #|null pts|undefined pts/);
});
