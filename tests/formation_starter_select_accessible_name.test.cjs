'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8');

test('formation starter selectors can expose a supplied accessible name',()=>{
 const match=ui.match(/const choice=\(id,values,selected,ariaLabel=''\)=>`<select[\s\S]*?`;/);
 assert.ok(match,'shared choice helper exists with optional accessible name');
 const context={escapeHTML:String};
 vm.runInNewContext(match[0]+';this.renderChoice=choice;',context);
 const selector=context.renderChoice('pos2',[[7,'Player Seven']],7,'Starter 3, defender');
 assert.match(selector,/aria-label="Starter 3, defender"/);
 assert.match(selector,/id="pos2"/);
 assert.doesNotMatch(context.renderChoice('other',[],''),/aria-label=/,'other selectors keep their existing naming contract');
});

test('each formation starter control receives an ordinal role name',()=>{
 assert.match(ui,/choice\('pos'\+i,[\s\S]*?,'Starter '\+\(i\+1\)\+'\, '\+\(\{GK:'goalkeeper',DF:'defender',MF:'midfielder',FW:'forward'\}\[order\[i\]\]\)\)/);
});
