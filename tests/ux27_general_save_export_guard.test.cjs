'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('function collectSaveExportData(');
const end=ui.indexOf('function exportSave(',start);
assert.ok(start>=0&&end>start,'save export collector exists');
const context={SAVE_KEYS:['options','audioOptions']};
vm.runInNewContext(ui.slice(start,end)+';this.collect=collectSaveExportData;',context);
const collect=context.collect;

test('UX27 save export reads all known raw keys and preserves valid JSON values',()=>{
 const raw=new Map([['legend_options','{"ballModel":"meteor"}'],['legend_audioOptions','null']]);
 const data=collect({getItem:key=>raw.has(key)?raw.get(key):null});
 assert.equal(JSON.stringify(data),'{"options":{"ballModel":"meteor"},"audioOptions":null}');
});

test('UX27 save export refuses malformed stored JSON without mutating the source bytes',()=>{
 const raw=new Map([['legend_options','{"ballModel":"meteor"}'],['legend_audioOptions','{broken']]);
 const before=[...raw];
 assert.throws(()=>collect({getItem:key=>raw.has(key)?raw.get(key):null}),/audioOptions.*invalid JSON.*No backup was downloaded/);
 assert.deepEqual([...raw],before);
});

test('UX27 save export identifies storage read failures by section',()=>{
 assert.throws(()=>collect({getItem(key){if(key==='legend_audioOptions')throw Error('denied');return null}}),/audioOptions.*could not be read: denied/);
});
