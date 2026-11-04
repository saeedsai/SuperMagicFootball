'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const api=async()=> (await import('../src/modules/career_slots.js')).CAREER_SLOTS;
const memory=()=>{const data=new Map();return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};};
const makeCareer=(club,teamIds=[club,1])=>({club,season:3,week:2,members:teamIds,fixtures:[[[teamIds[0],teamIds[1]]]],history:[],
 roster:Array.from({length:12},(_,i)=>({id:`p-${club}-${i}`})),table:Object.fromEntries(teamIds.map(id=>[id,{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}])),
 facilities:{training:1},cup:{stage:0},cash:100});
function extract(start,end){const a=source.indexOf(start);assert(a>=0,'missing '+start);const b=source.indexOf(end,a+start.length);assert(b>a,'missing '+end);return source.slice(a,b);}
const importBlock=extract('function careerBackupTeamReferencesValid(', 'function showCareerSlots(){');
function harness({careerSlots,teams=[{id:'a'},{id:'b'},{id:'c'}],approve=false}={}){
 const preview={classList:{classes:new Set(['hidden']),remove(name){this.classes.delete(name);},contains(name){return this.classes.has(name);}},innerHTML:''};
 const fileInput={value:'selected.json'};const writes=[],alerts=[];let confirmCalls=0,activeCareer=null;
 const code=`(()=>{let career=null;const TEAMS=${JSON.stringify(teams)};const $=id=>id==='careerBackupPreview'?preview:id==='careerBackupImportFile'?fileInput:null;
  const escapeHTML=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const ensureCareerTeamPlan=c=>c;
  ${importBlock}
  return {careerBackupTeamReferencesValid,renderCareerBackupPreview,importCareerBackup,getCareer:()=>career};})()`;
 const ctx=vm.runInNewContext(code,{preview,fileInput,careerSlots,store:{put:(k,v)=>writes.push([k,v])},
  confirm:()=>{confirmCalls++;return approve;},alert:m=>alerts.push(m),requestAnimationFrame:cb=>cb()});
 return {ctx,preview,fileInput,writes,alerts,confirmCount:()=>confirmCalls};
}

test('SAVE-103 UI validates all Career team references against the loaded team list',()=>{
 const slot=makeCareer(0),{ctx}=harness();
 assert.equal(ctx.careerBackupTeamReferencesValid(slot),true);
 assert.equal(ctx.careerBackupTeamReferencesValid({...slot,club:99}),false);
 assert.equal(ctx.careerBackupTeamReferencesValid({...slot,members:[0,99]}),false);
 assert.equal(ctx.careerBackupTeamReferencesValid({...slot,fixtures:[[[0,99]]]}),false);
 assert.equal(ctx.careerBackupTeamReferencesValid({...slot,history:[{against:99}]}),false);
 assert.equal(ctx.careerBackupTeamReferencesValid({...slot,table:{0:{},99:{}}}),false);
});

test('SAVE-103 UI previews, confirms, and imports a Career vault while mirroring its active legacy Career',async()=>{
 const Slots=await api(),localDb=memory(),local=Slots.create(localDb);local.save(1,makeCareer(0),'Local save');
 const foreign=Slots.create(memory());foreign.save(3,makeCareer(2,[2,1]),'Restored career');foreign.load(3);
 const backup=foreign.exportBackup(),before=local.exportBackup();
 const {ctx,preview,writes,fileInput,confirmCount}=harness({careerSlots:local,approve:false});
 await ctx.importCareerBackup({size:backup.length,text:async()=>backup});
 assert.equal(confirmCount(),1);assert.equal(preview.classList.contains('hidden'),false);
 assert.match(preview.innerHTML,/Restored career/);assert.match(preview.innerHTML,/active slot 3/i);
 assert.match(preview.innerHTML,/Import cancelled/);assert.equal(local.exportBackup(),before);
 assert.equal(writes.length,0);assert.equal(fileInput.value,'');

 const approved=harness({careerSlots:local,approve:true});
 await approved.ctx.importCareerBackup({size:backup.length,text:async()=>backup});
 assert.equal(approved.confirmCount(),1);assert.equal(local.active,3);
 assert.equal(local.list()[2].name,'Restored career');assert.equal(local.list()[0].occupied,false);
 assert.equal(approved.ctx.getCareer().club,2);
 assert.deepEqual(approved.writes.map(([key])=>key),['managerCareer']);
 assert.match(approved.preview.innerHTML,/Imported 1 Career saves/);
});

test('SAVE-103 invalid team references fail before preview or overwrite prompt',async()=>{
 const Slots=await api(),db=memory(),local=Slots.create(db);local.save(1,makeCareer(0),'Keep local');
 const foreign=Slots.create(memory());foreign.save(2,makeCareer(2,[2,1]),'Bad reference');
 const envelope=JSON.parse(foreign.exportBackup()),payload=JSON.parse(envelope.payload);
 payload.slots[1].career.members=[2,99];envelope.payload=JSON.stringify(payload);
 let hash=2166136261;for(let i=0;i<envelope.payload.length;i++){hash^=envelope.payload.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}
 envelope.checksum=hash.toString(16).padStart(8,'0');
 const backup=JSON.stringify(envelope),before=local.exportBackup(),h=harness({careerSlots:local,approve:true});
 await h.ctx.importCareerBackup({size:backup.length,text:async()=>backup});
 assert.equal(h.confirmCount(),0);assert.equal(local.exportBackup(),before);assert.equal(h.writes.length,0);
 assert.match(h.alerts[0],/unavailable teams/);assert.equal(h.preview.classList.contains('hidden'),true);
});

test('SAVE-103 Save Management exposes Career backup controls and routes to the validated API',()=>{
 const menu=source.slice(source.indexOf('function showSaveMenu('),source.indexOf('// The installed bundle supplies'));
 assert.match(menu,/careerBackupExport/);assert.match(menu,/careerBackupImport/);
 assert.match(menu,/careerBackupImportFile/);assert.match(menu,/careerBackupPreview/);
 assert.match(source,/careerSlots\.exportBackup\(\)/);
 assert.match(source,/careerSlots\.inspectBackup\(bytes,validator\)/);
 assert.match(source,/careerSlots\.importBackup\(bytes,\{overwrite:hasData,validator\}\)/);
 assert.match(source,/careerSlots\.hasRecoverySnapshot\?' The export action will download the last verified save snapshot\.'/);
 assert.match(source,/link\.download='Supermagic_Career_'\+\(recovery\?/);
 assert.match(source,/if\(!confirm\(`Import \$\{preview\.occupied\} Career saves\?/);
 assert.match(source,/if\(e\.target\.id==='careerBackupImportFile'\)\{importCareerBackup\(e\.target\.files\?\.\[0\]\);\}/);
});
