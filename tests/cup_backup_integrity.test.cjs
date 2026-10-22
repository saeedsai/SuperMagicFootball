const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/cup_slots.js','utf8').replace(/export\s*\{CUP_SLOTS\};?/,'');
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

test('SAVE-103 validator rejects unknown team references before committing',()=>{
 const storage=memory(),target=api.create(storage),source=api.create(memory());
 source.save(1,valid(),'external');
 const before=storage.getItem('legend_cupSlots');
 assert.throws(()=>target.importBackup(source.exportBackup(),{validator:()=>false}),/unavailable teams/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(target.list().filter(slot=>slot.occupied).length,0);
 assert.equal(target.importBackup(source.exportBackup(),{validator:cup=>cup.club===1}),1);
});
test('SAVE-103 UI contains player-facing export/import and confirmation',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/button\('EXPORT CUP BACKUP','cupBackupExport'\)/);
 assert.match(ui,/button\('IMPORT CUP BACKUP','cupBackupImport'\)/);
 assert.match(ui,/cupSlots\.exportBackup\(\)/);
 assert.match(ui,/cupSlots\.inspectBackup\(bytes,validator\)/);
 assert.match(ui,/cupSlots\.importBackup\(bytes,\{overwrite:hasData,validator\}\)/);
 assert.match(ui,/confirm\('Import '\+preview\.occupied/);
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

test('SAVE-103 refuses oversized nested backup payload and preserves existing Cup slots',()=>{
 const storage=memory(),cup=api.create(storage);
 cup.save(1,valid(),'existing');
 const before=storage.getItem('legend_cupSlots');
 const huge=JSON.parse(cup.exportBackup());
 huge.payload='x'.repeat(2000001);
 assert.throws(()=>cup.inspectBackup(JSON.stringify(huge)),/Unsupported Cup backup format/);
 assert.throws(()=>cup.importBackup(JSON.stringify(huge),{overwrite:true}),/Unsupported Cup backup format/);
 assert.equal(storage.getItem('legend_cupSlots'),before);
 assert.equal(cup.list()[0].name,'existing');
});
