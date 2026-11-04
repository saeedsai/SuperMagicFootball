'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
function eligible(name,player){
 const start=ui.indexOf(`const ${name}=`),end=ui.indexOf(';',start);
 assert.ok(start>=0&&end>start,`${name} exists`);
 const fn=vm.runInNewContext(ui.slice(start,end+1)+`\n${name};`,{verifiedRatingTierForPlayer:p=>p?.verifiedTier||null});
 return fn(player);
}
test('new field specialization uses only explicitly verified Gold, Star or Superstar tier',()=>{
 for(const tier of ['Gold','Star','Superstar'])assert.equal(eligible('studioEliteEligible',{role:'MF',verifiedTier:tier}),true);
 for(const player of [null,{role:'MF',rating:100},{role:'MF',positionOVR:100},{role:'MF',rating:100,verifiedTier:null}])
  assert.equal(eligible('studioEliteEligible',player),false,'legacy or inferred numbers do not qualify');
});
test('older Magic Tricks require verified Star/Superstar and exclude goalkeepers',()=>{
 assert.equal(eligible('studioMagicEligible',{role:'FW',verifiedTier:'Gold'}),false);
 for(const tier of ['Star','Superstar'])assert.equal(eligible('studioMagicEligible',{role:'DF',verifiedTier:tier}),true);
 assert.equal(eligible('studioMagicEligible',{role:'GK',verifiedTier:'Superstar'}),false);
 assert.equal(eligible('studioMagicEligible',{role:'FW',rating:100}),false);
});
test('Player Studio save paths enforce verified caps and keep legacy selection safe',()=>{
 assert.match(ui,/ABILITIES\.canEquipVerifiedFieldSpecial\(player,\{kind:'shot',level\}\)/);
 assert.match(ui,/ABILITIES\.canEquipVerifiedFieldSpecial\(player,\{kind:'defence',level\}\)/);
 assert.match(ui,/choice==='keep'\|\|choice==='none'/);
 assert.match(ui,/studioMagicEligible\(player\)/);
 assert.match(ui,/studioVerifiedDribbleEligible\(player\)/);
});
