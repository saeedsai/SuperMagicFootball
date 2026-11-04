'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const start=ui.indexOf('function restoreHomeMenuFocus(){');
const end=ui.indexOf('\nconst navItem=',start);
assert.ok(start>=0&&end>start,'home return focus helper exists');

test('UX26 Home restores focus to the Settings opener after returning from Settings and About',()=>{
 const focused=[];
 const settings={focus:options=>focused.push(['settings',options])};
 const fallback={focus:options=>focused.push(['fallback',options])};
 const context={navFocusMap:{home:'navSettings'},menu:{querySelector(selector){assert.equal(selector,'[data-action="navSettings"]');return settings;}}};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.restore=restoreHomeMenuFocus;',context);
 context.restore();
 assert.equal(focused.length,1);
 assert.equal(focused[0][0],'settings','About now returns to Settings, so Home restores focus to Settings');
 assert.equal(focused[0][1].preventScroll,true);

 const defaultContext={navFocusMap:{},menu:{querySelector(selector){return selector==='.navChoice'?fallback:null;}}};
 vm.runInNewContext(ui.slice(start,end)+'\nthis.restore=restoreHomeMenuFocus;',defaultContext);
 defaultContext.restore();
 assert.equal(focused[1][0],'fallback','first visit keeps the existing Quick Match default focus');
});

test('UX26 Home route delegates return focus to the saved opener instead of navChoice-only lookup',()=>{
 const home=ui.slice(ui.indexOf('function showHome(){'),ui.indexOf('\nfunction showClubs(){'));
 assert.match(home,/drawPoster\(\);restoreHomeMenuFocus\(\);/);
 assert.doesNotMatch(home,/\.navChoice\[data-action=/);
});
