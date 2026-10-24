'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function studioDribblePreviewGuide(');
const end=source.indexOf('// Read-only Super Defence tier preview:',start);
assert.ok(start>=0&&end>start,'Dribble Style guide must exist in the actual Studio UI');
const helper=source.slice(start,end);
const guide=vm.runInNewContext('(()=>{'+helper+';return studioDribblePreviewGuide})()');
const styles=[
 {id:'nutmeg',name:'Nutmeg',nutmeg:true,evade:.2},
 {id:'rainbow',name:'Rainbow Flick',evade:.3},
 {id:'sideStep',name:'Side Step',evade:.1}
];

test('Dribble Style preview explains Nutmeg timing and counterplay',()=>{
 assert.match(guide('nutmeg',styles),/approaching defender at medium range/);
 assert.match(guide('nutmeg',styles),/SAVE DRIBBLE STYLE/);
});
test('Dribble Style preview explains Rainbow Flick defensive reads',()=>{
 assert.match(guide('rainbow',styles),/alert approaching defender can read its path/);
});
test('Dribble Style preview describes ordinary styles without confusing Magic Tricks',()=>{
 const result=guide('sideStep',styles);
 assert.match(result,/normal ball-control evasion bonus/);
 assert.match(result,/not a Magic Trick, and has no ability level/);
});
test('Dribble Style preview handles invalid legacy style without changing it',()=>{
 assert.match(guide('legacyMove',styles),/Unknown dribble style/);
 assert.match(guide('legacyMove',styles),/remains unchanged until SAVE/);
});
test('Dribble Style preview is read-only and exposed as accessible live status',()=>{
 assert.doesNotMatch(helper,/localStorage|saveCareer|storeCharacterChanges|edits\s*=/);
 const studio=source.slice(source.indexOf('function showPlayerStudio('),source.indexOf('function getAppearance()'));
 assert.match(studio,/id="studioDribbleGuide" role="status" aria-live="polite"/);
 assert.match(studio,/studioDribblePreviewGuide\(DRIBBLES\.assignedDribbleType\(player\),DRIBBLES\.DRIBBLE_STYLES\)/);
});
test('Changing a Dribble Style refreshes icon and guide but never saves automatically',()=>{
 const studio=source.slice(source.indexOf('function showPlayerStudio('),source.indexOf('function getAppearance()'));
 assert.match(studio,/if\(category==='dribble'\).*studioDribblePreviewGuide\(select\.value,DRIBBLES\.DRIBBLE_STYLES\)/);
 assert.match(studio,/target\.innerHTML=ABILITY_ICONS\.icon\(category,chosen\)/);
 assert.match(studio,/select\.addEventListener\('change',update\);update\(\);/);
 assert.match(source,/function saveStudioTrick\(\)/);
});
