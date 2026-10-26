'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('const studioEliteEligible=');
const end=ui.indexOf(';',start);
assert.ok(start>=0&&end>start,'Player Studio must define a shared elite predicate');
const predicate=vm.runInNewContext(ui.slice(start,end+1)+'\nstudioEliteEligible;',{
 playerOVR:p=>p.positionOVR
});
test('legacy rating and current position OVR are independent qualifying paths',()=>{
 assert.equal(predicate({rating:91,positionOVR:70}),true,'legacy elite qualifies');
 assert.equal(predicate({rating:78,positionOVR:94}),true,'edited high-OVR player qualifies despite legacy rating');
 assert.equal(predicate({rating:89,positionOVR:89}),false,'neither path qualifies');
 assert.equal(predicate({positionOVR:90}),true,'missing rating uses positional OVR');
 assert.equal(predicate({rating:90,positionOVR:40}),true,'threshold inclusive');
 assert.equal(predicate({rating:89,positionOVR:90}),true,'position threshold inclusive');
 assert.equal(predicate({rating:0,positionOVR:89}),false,'low overall remains locked');
});
test('all three outfield elite equipment selectors use the same gate',()=>{
 assert.match(ui,/studioEliteEligible\(player\)\|\|player\.magicTrick/);
 assert.match(ui,/studioEliteEligible\(player\)\|\|player\.superAbility\?\.type==='shoot'/);
 assert.match(ui,/studioEliteEligible\(player\)\|\|player\.superAbility\?\.type==='defence'/);
 assert.match(ui,/if\(studioEliteEligible\(player\)\)return 'Eligible for Magic Tricks \(legacy rating or position OVR 90\+\)/);
 assert.match(ui,/if\(!player\|\|player\.role==='GK'\)throw Error/);
});
