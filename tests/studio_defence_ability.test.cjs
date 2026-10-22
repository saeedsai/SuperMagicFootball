'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const source=fs.readFileSync('src/modules/abilities.js','utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'');
const ABILITIES=vm.runInNewContext(source+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},
 SPECIALS:{abilityLevel:()=>3,levelModifiers:()=>({fatigue:1})}
});
const player=(role='DF')=>({id:'stable-1',role,appearance:{style:2},superAbility:{type:'shoot',id:'fire'},gkSuperAbility:{type:'defence',id:'megaPalm'}});
test('STUDIO-102 exposes defender moves without enabling keeper or attacker selection',()=>{
 assert.deepEqual(Array.from(ABILITIES.studioDefenceChoices({role:'GK'})),[]);
 assert.deepEqual(Array.from(ABILITIES.studioDefenceChoices({role:'FW'})),[]);
 const ids=ABILITIES.studioDefenceChoices(player()).map(x=>x.id);
 assert.ok(ids.includes('spinBumper'));
 assert.ok(ids.every(id=>mechanics.defensiveAbilities[id]));
});
test('STUDIO-102 equips SD09 without mutating source, identity, keeper or appearance',()=>{
 const before=player(),snapshot=JSON.stringify(before);
 const after=ABILITIES.withStudioDefence(before,'spinBumper','3');
 assert.equal(JSON.stringify(before),snapshot);
 assert.equal(after.id,before.id);
 assert.equal(after.appearance,before.appearance);
 assert.equal(after.gkSuperAbility,before.gkSuperAbility);
 assert.equal(after.superDefenceLevel,3);
 assert.equal(after.superAbility.type,'defence');
 assert.equal(after.superAbility.id,'spinBumper');
 assert.equal(after.superAbility.name,mechanics.defensiveAbilities.spinBumper.name);
 assert.equal(after.superAbility.level,3);
});
test('STUDIO-102 validates tier and role, preserves original shot on KEEP and NONE',()=>{
 const p=player();
 for(const invalid of [0,6,2.5,'bad',null]){
  assert.throws(()=>ABILITIES.withStudioDefence(p,'spinBumper',invalid),/tier|requires/);
 }
 assert.throws(()=>ABILITIES.withStudioDefence(p,'spinBumper',2),/requires defence tier 3/);
 assert.throws(()=>ABILITIES.withStudioDefence(p,'unlisted',3),/Unknown defensive ability/);
 assert.throws(()=>ABILITIES.withStudioDefence(player('GK'),'drill',3),/Only defenders/);
 const kept=ABILITIES.withStudioDefence(p,'keep',4);
 assert.equal(kept.superAbility.id,'fire');
 const noDef=ABILITIES.withStudioDefence(p,'none',3);
 assert.equal(noDef.superAbility.id,'fire');
 const equipped=ABILITIES.withStudioDefence(p,'drill',2);
 assert.equal(equipped.superAbility.id,'drill');
 const removed=ABILITIES.withStudioDefence(equipped,'none',2);
 assert.equal(removed.superAbility,undefined);
 assert.equal(equipped.superAbility.id,'drill');
});
test('STUDIO-102 uses existing defensive ability catalogue and four-button runtime',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 const html=fs.readFileSync('index.html','utf8');
 assert.equal((html.match(/<button data-act=/g)||[]).length,4);
 assert.ok(ui.includes('import {ABILITIES} from "./abilities.js"')||!ui.includes('saveStudioDefence'),
  'UI wiring must import the canonical module');
});

test('Studio menu wires defender equipment with safe persisted updates',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/import \{ABILITIES\} from "\.\/abilities\.js"/);
 assert.match(ui,/function saveStudioDefence\(\)/);
 assert.match(ui,/ABILITIES\.studioDefenceChoices\(source\[avatarIndex\],tier\)/);
 assert.match(ui,/ABILITIES\.withStudioDefence\(source\[avatarIndex\],ability,tier\)/);
 assert.match(ui,/storeCharacterChanges\('edits',updated\)/);
 assert.match(ui,/storeCharacterChanges\('managerCareer',updated\)/);
 assert.match(ui,/a==='saveStudioDefence'\)saveStudioDefence\(\)/);
});

test('Studio ability catalogue refreshes when selected tier changes',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/tierSelect\.onchange=/);
 assert.match(ui,/studioDefenceChoices\(player,Number\(tierSelect\.value\)\)/);
 assert.match(ui,/studioDefenceChoices\(source\[avatarIndex\],tier\)/);
 const low=ABILITIES.studioDefenceChoices({role:'DF',rating:80},2).map(a=>a.id);
 const high=ABILITIES.studioDefenceChoices({role:'DF',rating:80},3).map(a=>a.id);
 assert.ok(!low.includes('spinBumper'));
 assert.ok(high.includes('spinBumper'));
});
