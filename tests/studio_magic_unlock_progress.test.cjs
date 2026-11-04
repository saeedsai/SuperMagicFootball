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
 return vm.runInNewContext(helper+';studioMagicUnlockProgress',{playerOVR:()=>ovr,verifiedRatingTierForPlayer:p=>p?.verifiedTier??null})(player);
}
test('Trick unlock progress uses verified tier rather than rating or OVR',()=>{
 assert.match(guide({role:'MF',rating:99},90),/No verified canonical Gold tier/);
 assert.match(guide({role:'FW',rating:99,verifiedTier:'Gold'},70),/Gold.*available/);
 assert.match(guide({role:'DF',rating:99,verifiedTier:'Star'},91),/Star.*available/);
 assert.match(guide({role:'MF',rating:99,verifiedTier:'Silver'},89),/No verified canonical Gold tier/);
 assert.match(guide({role:'GK',rating:99},99),/unavailable to goalkeepers/);
 assert.match(guide({role:'MF'},NaN),/No verified canonical Gold tier/);
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
