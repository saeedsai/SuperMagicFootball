'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function showSettingsSection(');
const end=ui.indexOf('\nfunction controlHelpBindingsFor(',start);
assert.ok(start>=0&&end>start,'settings route renderer exists');
const settings=ui.slice(start,end);

test('UX26 Settings child routes focus a programmatically reachable screen heading',()=>{
 assert.match(settings,/show\([\s\S]*?cfg\.id\);const heading=menu\.querySelector\('\.heading'\);if\(heading\)\{heading\.tabIndex=-1;heading\.focus\(\{preventScroll:true\}\);\}/);
});
