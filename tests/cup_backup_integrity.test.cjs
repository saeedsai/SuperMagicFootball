const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/cup_slots.js','utf8').replace(/export\s*\{CUP_SLOTS\};?/,'');
const uiSource=fs.readFileSync('src/modules/ui.js','utf8');
const api=vm.runInNewContext(source+'\nCUP_SLOTS;', {Date,JSON,Set,Number,Error,Math,String,Array});
const valid=()=>({compId:'UEFA',id:'cup_UEFA',club:1,participants:[1,2,3,4],phase:'league',
 roundIdx:0,history:[],rounds:[],groups:[],table:{1:{},2:{},3:{},4:{}},
 earned:0,winner:null,knockout:null});
function memory(fail=false){
 const map=new Map();
 return {map,getItem:k=>map.has(k)?map.get(k):null,
 setItem(k,v){map.set(k,v);if(fail)throw Error('simulated partial write')},
 removeItem:k=>map.delete(k)};
}
function rewriteCupBackup(backup,mutate){
 const envelope=JSON.parse(backup),payload=JSON.parse(envelope.payload);
 mutate(payload);
 envelope.payload=JSON.stringify(payload);
 let checksum=2166136261;
 for(let i=0;i<envelope.payload.length;i++){checksum^=envelope.payload.charCodeAt(i);checksum=Math.imul(checksum,16777619)>>>0;}
 envelope.checksum=checksum.toString(16).padStart(8,'0');
 return JSON.stringify(envelope);
}
test('SAVE-103 backup roundtrips all slots and active selection',()=>{
 const from=api.create(memory());from.save(3,valid(),'original');
 from.save(5,valid(),'second');
 from.load(3);
 const backup=from.exportBackup(),target=api.create(memory());
 assert.equal(target.importBackup(backup),2);
 assert.equal(target.active,3);
 assert.equal(target.list()[2].name,'original');
 assert.equal(target.list()[4].name,'second');
 assert.deepEqual(JSON.parse(target.exportBackup()),JSON.parse(backup));
});
test('SAVE-103 rejects tampered checksum and malformed input without changing storage',()=>{
 const storage=memory(),cup=api.create(storage);
 cup.save(1,valid(),'live');
 const before=storage.getItem('legend_cupSlots'),backup=JSON.parse(cup.exportBackup());
 backup.payload=backup.payload.replace('live','lost');
 assert.throws(()=>cup.importBackup(JSON.stringify(backup),{overwrite:true}),/integrity/);
 assert.throws(()=>cup.importBackup('not json',{overwrite:true}),/JSON/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
});
test('SAVE-103 refuses destructive import without explicit overwrite',()=>{
 const occupied=api.create(memory());occupied.save(1,valid(),'local');
 const source=api.create(memory());source.save(2,valid(),'backup');
 assert.throws(()=>occupied.importBackup(source.exportBackup()),/confirm overwrite/);
 assert.equal(occupied.list()[0].name,'local');
 assert.equal(occupied.importBackup(source.exportBackup(),{overwrite:true}),1);
 assert.equal(occupied.list()[1].name,'backup');
});
test('SAVE-103 requires a boolean Cup overwrite confirmation before writes',()=>{
 const occupied=api.create(memory());occupied.save(1,valid(),'local');
 const source=api.create(memory());source.save(2,valid(),'backup');
 const before=occupied.exportBackup();
 for(const overwrite of [1,'true','false',{},[]]){
  assert.throws(()=>occupied.importBackup(source.exportBackup(),{overwrite}),/overwrite confirmation must be boolean/);
  assert.equal(occupied.exportBackup(),before,'invalid confirmation cannot replace occupied Cup slots');
 }
 assert.throws(()=>occupied.importBackup(source.exportBackup(),null),/options must be an object/);
 assert.equal(occupied.exportBackup(),before);
});
test('SAVE-103 import rolls back partial storage write and preserves active in-memory state',()=>{
 const storage=memory(),cup=api.create(storage),source=api.create(memory());
 source.save(2,valid(),'backup');
 const backup=source.exportBackup(),before=storage.getItem('legend_cupSlots');
 const original=storage.setItem;
 let once=true;
 storage.setItem=(k,v)=>{original(k,v);if(once){once=false;throw Error('disk failed')}};
 assert.throws(()=>cup.importBackup(backup),/disk failed/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(cup.list().filter(x=>x.occupied).length,0);
});
test('SAVE-103 verified rollback readback keeps trusted Cup slots usable when adapter throws',()=>{
 const storage=memory(),cup=api.create(storage),source=api.create(memory());
 cup.save(1,valid(),'trusted');source.save(4,valid(),'incoming');
 const trusted=cup.exportBackup(),previous=storage.getItem('legend_cupSlots'),original=storage.setItem;let writes=0;
 storage.setItem=(key,value)=>{writes++;original.call(storage,key,value);throw Error(writes===1?'primary write failed':'rollback write failed')};
 assert.throws(()=>cup.importBackup(source.exportBackup(),{overwrite:true}),/primary write failed/);
 assert.equal(storage.getItem('legend_cupSlots'),previous);
 assert.equal(cup.error,null,'readback confirms the trusted bytes despite the adapter exception');
 assert.equal(cup.hasRecoverySnapshot,false);
 assert.equal(cup.exportBackup(),trusted,'export uses the immutable pre-failure Cup state');
 assert.equal(cup.list()[3].occupied,false);
 const restored=api.create(memory());assert.equal(restored.importBackup(cup.exportBackup()),1);
 assert.equal(restored.list()[0].name,'trusted');
});
test('SAVE-103 does not present an empty placeholder as a recovery export for corrupt Cup storage',()=>{
 const storage=memory();storage.setItem('legend_cupSlots','not-json');
 const cup=api.create(storage);assert.equal(cup.hasRecoverySnapshot,false);
 assert.throws(()=>cup.exportBackup(),/cannot be modified/);
});

test('SAVE-103 validator rejects unknown team references before committing',()=>{
 const storage=memory(),target=api.create(storage),source=api.create(memory());
 source.save(1,valid(),'external');
 const before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.importBackup(source.exportBackup(),{validator:()=>false}),/unavailable teams/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(target.list().filter(slot=>slot.occupied).length,0);
 assert.equal(target.importBackup(source.exportBackup(),{validator:cup=>cup.club===1}),1);
});

test('SAVE-103 backup rejects partial nonempty Cup standings rows and keeps empty rows compatible',()=>{
 const storage=memory(),target=api.create(storage),source=api.create(memory());
 source.save(1,valid(),'partial standings');
 const backup=source.exportBackup();
 assert.equal(target.inspectBackup(backup).occupied,1,'empty legacy/placeholder standings rows remain valid');
 for(const partial of [{p:1},{p:1,pts:900}]){
  const malformed=rewriteCupBackup(backup,payload=>{payload.slots[0].tournament.table[1]=partial;});
  const before=storage.getItem('legend_cupSlots');
  assert.throws(()=>target.inspectBackup(malformed),/Invalid Cup backup slots or tournament data/);
  assert.throws(()=>target.importBackup(malformed,{overwrite:true}),/Invalid Cup backup slots or tournament data/);
  assert.equal(storage.getItem('legend_cupSlots'),before,'rejected standings never reach persistent storage');
 }
});
test('SAVE-103 backup rejects a checksum-valid active league round missing a non-player fixture',()=>{
 const storage=memory(),target=api.create(storage),source=api.create(memory());
 const complete=valid();complete.rounds=[[[1,2],[3,4]]];
 source.save(1,complete,'complete matchday');
 const backup=source.exportBackup();
 const missing=rewriteCupBackup(backup,payload=>{payload.slots[0].tournament.rounds[0].pop();});
 const before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.inspectBackup(missing),/Invalid Cup backup slots or tournament data/);
 assert.throws(()=>target.importBackup(missing,{overwrite:true}),/Invalid Cup backup slots or tournament data/);
 assert.equal(storage.getItem('legend_cupSlots'),before,'a rejected fixture omission never reaches persistent storage');
 assert.equal(target.list().filter(slot=>slot.occupied).length,0,'no partial Cup slot was imported');
});
test('SAVE-103 UI contains player-facing export/import and confirmation',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/button\('EXPORT CUP BACKUP','cupBackupExport'\)/);
 assert.match(ui,/button\('IMPORT CUP BACKUP','cupBackupImport'\)/);
 assert.match(ui,/cupSlots\.exportBackup\(\)/);
 assert.match(ui,/cupSlots\.inspectBackup\(bytes,validator\)/);
 assert.match(ui,/cupSlots\.importBackup\(bytes,\{overwrite:hasData,validator\}\)/);
 assert.match(ui,/confirm\('Import '\+preview\.occupied/);
 assert.match(ui,/cupSlots\.hasRecoverySnapshot\?' The export action will download the last verified save snapshot\.'/);
 assert.match(ui,/link\.download='Supermagic_Cup_'\+\(recovery\?/);
});

test('SAVE-103 preview is validated and read-only',()=>{
 const storage=memory(),src=api.create(memory()),dst=api.create(storage);
 src.save(3,valid(),'preview');src.load(3);
 const backup=src.exportBackup(),before=storage.getItem('legend_cupSlots');
 const summary=dst.inspectBackup(backup,t=>t.club===1);
 assert.equal(summary.active,3);
 assert.equal(summary.occupied,1);
 assert.equal(summary.slots[0].name,'preview');
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.throws(()=>dst.inspectBackup(backup,()=>false),/unavailable teams/);
 const tampered=JSON.parse(backup);tampered.payload=tampered.payload.replace('preview','tampered');
 assert.throws(()=>dst.inspectBackup(JSON.stringify(tampered)),/integrity/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
});

test('SAVE-103 importing a Cup vault with an empty active slot preserves the legacy recovery mirror',()=>{
 const start=uiSource.indexOf('function applyImportedCupBackupState(){');
 const end=uiSource.indexOf('\n',start);
 assert.ok(start>=0&&end>start,'Cup backup activation helper is present');
 const writes=[],mirror='{"label":"recoverable legacy Cup"}',storage={legacyMirror:mirror};
 let active=null;
 const context={cupSlots:{activeTournament:()=>active},continentalRun:{label:'previous in-memory campaign'},
  store:{put:(key,value)=>{writes.push([key,value]);if(key==='continentalRun')storage.legacyMirror=JSON.stringify(value);}},showCupSlots(){}};
 const activate=uiSource.slice(start,end);
 const result=vm.runInNewContext(activate+';applyImportedCupBackupState();continentalRun',context);
 assert.equal(result,null,'an empty imported active slot leaves no campaign active');
 assert.deepEqual(writes,[],'the old legacy mirror bytes remain untouched for recovery');
 assert.equal(storage.legacyMirror,mirror);

 active={id:'cup_UEFA',club:4};
 const restored=vm.runInNewContext(activate+';applyImportedCupBackupState();continentalRun',context);
 assert.deepEqual(restored,{id:'cup_UEFA',club:4});
 assert.deepEqual(writes,[['continentalRun',{id:'cup_UEFA',club:4}]],'an occupied active slot updates the legacy mirror');
 assert.equal(storage.legacyMirror,JSON.stringify(active));
 const importHandler=uiSource.slice(uiSource.indexOf("else if(a==='cupBackupImport')"),uiSource.indexOf("else if(a.startsWith('cupSlotSave_')"));
 assert.match(importHandler,/cupSlots\.importBackup\(bytes,\{overwrite:hasData,validator\}\);\s*applyImportedCupBackupState\(\);/,
  'successful imports activate through the recovery-preserving path');
});

test('SAVE-103 refuses oversized nested backup payload and preserves existing Cup slots',()=>{
 const storage=memory(),cup=api.create(storage);
 cup.save(1,valid(),'existing');
 const before=storage.getItem('legend_cupSlots');
 const huge=JSON.parse(cup.exportBackup());
 huge.payload='x'.repeat(2000001);
 assert.throws(()=>cup.inspectBackup(JSON.stringify(huge)),/2 MB|Unsupported Cup backup format/);
 assert.throws(()=>cup.importBackup(JSON.stringify(huge),{overwrite:true}),/2 MB|Unsupported Cup backup format/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(cup.list()[0].name,'existing');
});
