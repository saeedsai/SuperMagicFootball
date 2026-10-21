/** Regression: all UI-imported runtime modules must exist in inline browser fixture and offline cache. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('Career slots is assembled into the inline Chromium fixture',()=>{
 const build=read('scripts/build.py');
 const order=build.match(/^order=(\[[^\n]+\])/m)?.[1]||'';
 assert.match(order,/['"]career_slots['"]/,'career_slots.js must be in the test fixture assembly order');
 assert.ok(order.indexOf("'career'")<order.indexOf("'career_slots'"),'Career module must load before its slot manager');
 assert.ok(order.indexOf("'career_slots'")<order.indexOf("'ui'"),'Slot manager must load before UI');
 assert.match(build,/export const CAREER_SLOTS/,'ESM export must be converted for classic-script fixtures');
});

test('Career slots remains an ES module and is precached for offline play',()=>{
 const source=read('src/modules/career_slots.js');
 const ui=read('src/modules/ui.js');
 const sw=read('sw.js');
 assert.match(source,/export const CAREER_SLOTS\s*=/);
 assert.match(ui,/import \{CAREER_SLOTS\} from ["']\.\/career_slots\.js["']/);
 assert.match(sw,/['"]career_slots['"]/,'service worker must cache the imported module');
 assert.match(sw,/const CACHE\s*=\s*['"][^'"]+career-slots-v1['"]/,'cache key must rotate after new module');
});
