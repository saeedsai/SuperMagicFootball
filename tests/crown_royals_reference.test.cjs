'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Crown Royals first sprite is literal transparent PNG with 3 source views',()=>{
 const buf=fs.readFileSync(path.join(root,'assets/crown_royals/alex_three_views.png'));
 assert.equal(buf.subarray(1,4).toString(),'PNG');
 assert.equal(buf.readUInt32BE(16),132);assert.equal(buf.readUInt32BE(20),90);
 const s=read('src/modules/crownroyals.js');
 for(const direction of ['front','quarterFront','side','quarterBack','back'])assert.ok(s.includes(direction));
 assert.match(s,/paintedViews:3/);assert.match(s,/quarterViews:'nearest-view placeholders'/);
 assert.match(s,/ctx\.drawImage\(atlas\.image/);
});
test('new team does not replace old Concept Hero and preserves canonical assets',()=>{
 const ui=read('src/modules/ui.js'),render=read('src/modules/render.js');
 assert.match(ui,/id:CONCEPT_DEMO_ID,index:TEAMS\.length,name:'Concept Royals FC'/);
 assert.match(ui,/id:CROWN_ROYALS_ID,index:TEAMS\.length,name:'Crown Royals \(Art WIP\)'/);
 assert.match(ui,/crown_royals_reference_alex/);
 assert.match(render,/CROWN_ROYALS\.draw\(ctx,p,view/);
 assert.match(read('scripts/build.py'),/'conceptmodular','crownroyals','render'/);
 assert.match(read('sw.js'),/'conceptmodular','crownroyals','render'/);
 assert.match(read('sw.js'),/assets\/crown_royals\/alex_three_views\.png/);
});

test('new reference team keeps twelve unique 1–12 jerseys and 2/3/4/3 roles',()=>{
 const ui=read('src/modules/ui.js'),start=ui.indexOf("const CROWN_ROYALS_ID=");
 const end=ui.indexOf("const careerStorage=",start);
 assert.ok(start>0&&end>start,'new team roster source must exist');
 const vm=require('node:vm'),context={TEAMS:[]};
 vm.runInNewContext(ui.slice(start,end),context,{timeout:1000});
 const team=context.TEAMS[0],roster=team.customRoster;
 assert.equal(roster.length,12);
 assert.deepEqual(Array.from(roster,p=>p.num).sort((a,b)=>a-b),Array.from({length:12},(_,i)=>i+1));
 assert.deepEqual(['GK','DF','MF','FW'].map(role=>roster.filter(p=>p.role===role).length),[2,3,4,3]);
 assert.equal(roster.filter(p=>p.renderModel==='crown_royals_reference').length,1);
 assert.equal(roster.find(p=>p.name==='Alex').num,1);
});
