'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function studioMagicUnlockProgress(player){');
const end=source.indexOf('function studioGoalkeeperMagicGuide(',start);
assert.ok(start>=0&&end>start,'progress helper is present in actual Player Studio source');
const helper=source.slice(start,end);
function guide(player,ovr){
 return vm.runInNewContext(helper+';studioMagicUnlockProgress',{playerOVR:()=>ovr})(player);
}
test('Trick unlock progress explains both rating paths and the exact 91 threshold',()=>{
 assert.match(guide({role:'MF',rating:89},90),/1 more overall point needed/);
 assert.match(guide({role:'FW',rating:91},70),/equipment unlocked/);
 assert.match(guide({role:'DF',rating:70},91),/equipment unlocked/);
 assert.match(guide({role:'MF',rating:90.5},89),/1 more overall point needed/);
 assert.match(guide({role:'MF',rating:90},87),/Rating 90 · position OVR 87/);
 assert.match(guide({role:'GK',rating:99},99),/unavailable to goalkeepers/);
 assert.match(guide({role:'MF'},NaN),/cannot be determined/);
});
test('Player Studio displays progress only for outfield Trick equipment, never saves through preview',()=>{
 const start=source.indexOf('const magicSelector='),end=source.indexOf(" studioGallerySignature='';",start);
 assert.ok(start>0&&end>start);
 const html=source.slice(start,end);
 assert.match(html,/id="studioMagicUnlockProgress"/);
 assert.match(html,/escapeHTML\(studioMagicUnlockProgress\(player\)\)/);
 assert.match(html,/id="studioGKMagicPreview"/);
 assert.doesNotMatch(html,/id="studioGKMagicSaveRow"/);
});
