'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('function commitSaveImport(');
const end=ui.indexOf('function exportSave(',start);
assert.ok(start>=0&&end>start,'generic save commit helper exists');
const context={};
vm.runInNewContext(ui.slice(start,end)+';this.commit=commitSaveImport;',context);
const commit=context.commit;

function storage(seed={},hooks={}){
 const values=new Map(Object.entries(seed));
 return {
  values,
  getItem(key){return values.has(key)?values.get(key):null},
  setItem(key,value){hooks.setItem?.(values,key,String(value));if(!hooks.setItem)values.set(key,String(value))},
  removeItem(key){hooks.removeItem?.(values,key);if(!hooks.removeItem)values.delete(key)},
 };
}
function snapshot(target){return [...target.values.entries()].sort(([a],[b])=>a.localeCompare(b))}
const changes=[['options','{"ballModel":"meteor"}'],['edits','{"japan":[]}']];

test('UX27 generic save import restores written and previously absent keys after a later write fails',()=>{
 let failed=false;
 const target=storage({'legend_options':'old-options'}, {setItem(values,key,value){
  if(key==='legend_edits'&&!failed){failed=true;throw Error('quota exceeded')}
  values.set(key,value);
 }});
 const before=snapshot(target);
 assert.throws(()=>commit(changes,target),/Save could not be stored \(changes rolled back\)/);
 assert.deepEqual(snapshot(target),before);
 assert.equal(target.getItem('legend_edits'),null,'rollback removes a section that did not exist before import');
});

test('UX27 generic save import rolls back a failing write that mutates storage before throwing',()=>{
 let failed=false;
 const target=storage({'legend_options':'old-options','legend_edits':'old-edits'}, {setItem(values,key,value){
  values.set(key,value);
  if(key==='legend_edits'&&!failed){failed=true;throw Error('adapter failed after write')}
 }});
 const before=snapshot(target);
 assert.throws(()=>commit(changes,target),/Save could not be stored \(changes rolled back\)/);
 assert.deepEqual(snapshot(target),before);
});

test('UX27 generic save import catches silently discarded writes through readback and restores all bytes',()=>{
 let dropped=false;
 const target=storage({'legend_options':'old-options','legend_edits':'old-edits'}, {setItem(values,key,value){
  if(key==='legend_edits'&&!dropped){dropped=true;return}
  values.set(key,value);
 }});
 const before=snapshot(target);
 assert.throws(()=>commit(changes,target),/Save could not be stored \(changes rolled back\)/);
 assert.deepEqual(snapshot(target),before);
});

test('UX27 generic save import recognizes a rollback write that restored bytes before throwing',()=>{
 let failedImport=false,failedRollback=false;
 const target=storage({'legend_options':'old-options','legend_edits':'old-edits'}, {setItem(values,key,value){
  if(key==='legend_edits'&&!failedImport){failedImport=true;throw Error('import write failed')}
  values.set(key,value);
  if(key==='legend_options'&&value==='old-options'&&!failedRollback){failedRollback=true;throw Error('post-restore adapter error')}
 }});
 const before=snapshot(target);
 assert.throws(()=>commit(changes,target),/Save could not be stored \(changes rolled back\)/);
 assert.deepEqual(snapshot(target),before);
});

test('UX27 generic save import reports incomplete rollback only when original bytes are not restored',()=>{
 let failedImport=false,failedRollback=false;
 const target=storage({'legend_options':'old-options','legend_edits':'old-edits'}, {setItem(values,key,value){
  if(key==='legend_edits'&&!failedImport){failedImport=true;throw Error('import write failed')}
  if(key==='legend_options'&&value==='old-options'&&!failedRollback){failedRollback=true;throw Error('rollback failed before write')}
  values.set(key,value);
 }});
 assert.throws(()=>commit(changes,target),/Save could not be stored and automatic rollback was incomplete/);
 assert.equal(target.getItem('legend_options'),changes[0][1],'the test fault leaves the first changed section visible');
});
