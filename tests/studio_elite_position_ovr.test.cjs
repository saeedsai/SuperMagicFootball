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
test('Magic Trick threshold is 91+ for Star/Superstar, unlike other elite equipment',()=>{
 const start=ui.indexOf('const studioMagicEligible='),end=ui.indexOf(';',start);
 assert.ok(start>=0&&end>start);
 const magic=vm.runInNewContext(ui.slice(start,end+1)+'\nstudioMagicEligible;',{
  playerOVR:p=>p.positionOVR
 });
 for(const p of [{role:'MF',rating:90,positionOVR:90},{role:'DF',rating:90,positionOVR:40},
   {role:'FW',rating:80,positionOVR:90},{role:'GK',rating:99,positionOVR:99}])
  assert.equal(magic(p),false,'Gold 90 and goalkeepers cannot equip new Tricks');
 for(const p of [{role:'FW',rating:91,positionOVR:50},{role:'MF',rating:75,positionOVR:91},
   {role:'DF',rating:96,positionOVR:20}])
  assert.equal(magic(p),true,'Star/Superstar can equip by either overall path');
 assert.equal(magic(null),false);
 assert.match(ui,/STUDIO_MAGIC_TRICKS\.map\(a=>/);
 assert.match(ui,/const locked=!studioMagicEligible\(player\)&&select\.value!=='keep'&&select\.value!=='none'/);
 assert.match(ui,/save\.disabled=locked/);
 assert.match(ui,/if\(id!=='keep'&&id!=='none'&&!studioMagicEligible\(player\)\)throw Error/);
 assert.match(ui,/studioEliteEligible\(player\)\|\|player\.superAbility\?\.type==='shoot'/);
 assert.match(ui,/studioEliteEligible\(player\)\|\|player\.superAbility\?\.type==='defence'/);
 assert.match(ui,/if\(studioMagicEligible\(player\)\)return 'Eligible for Magic Tricks/);
 assert.match(ui,/if\(!player\|\|player\.role==='GK'\)throw Error/);
});
