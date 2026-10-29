'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const src=read('src/modules/ui.js');
const match=src.match(/function studioDefenceSaveState\(choice,tier,player\)\{[\s\S]*?\n\}/);
assert.ok(match,'actual Super Defence save-state helper exists');
const mechanics=JSON.parse(read('data/mechanics/gameplay.json'));
const abilitiesCode=read('src/modules/abilities.js').replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'');
const ABILITIES=vm.runInNewContext(abilitiesCode+';ABILITIES',{
 GAME_ASSETS:{mechanics},SPECIALS:{abilityLevel:()=>3,levelModifiers:()=>({fatigue:1})}
});
const state=vm.runInNewContext(match[0]+';studioDefenceSaveState',{ABILITIES,studioEliteEligible:p=>Number(p?.rating)>=86});
const drill={type:'defence',id:'drill',name:mechanics.defensiveAbilities.drill.name,level:3};
const player={id:'stable-df',role:'DF',rating:92,superDefenceLevel:3,superAbility:drill};
test('STUDIO-DEFENCE-STATE-01: unchanged explicit equipment and tier disable saving',()=>{
 for(const choice of ['keep','drill']){const result=state(choice,3,player);
  assert.equal(result.disabled,true);assert.equal(result.unchanged,true);assert.match(result.message,/already saved/);}
});
test('STUDIO-DEFENCE-STATE-01: legacy tier and real tier changes remain savable',()=>{
 for(const p of [{...player,superDefenceLevel:undefined},{...player,superAbility:{...drill,level:2}}]){
  const result=state('keep',3,p);assert.equal(result.disabled,false);assert.match(result.message,/ready to save/);}
 assert.equal(state('keep',4,player).disabled,false);
});
test('STUDIO-DEFENCE-STATE-01: new move and removal are savable, absent removal is not',()=>{
 assert.equal(state('burst',3,player).disabled,false);
 assert.equal(state('none',3,player).disabled,false);
 assert.equal(state('none',3,{role:'DF',rating:92,superDefenceLevel:3}).disabled,true);
 assert.equal(state('none',3,{role:'DF',rating:92}).disabled,false);
});
test('STUDIO-DEFENCE-STATE-01: non-defence abilities survive untouched when unchanged',()=>{
 const existing={role:'DF',rating:92,superDefenceLevel:3,superAbility:{type:'shoot',id:'fire'}};
 assert.equal(state('keep',3,existing).disabled,true);
 assert.equal(state('none',3,existing).disabled,true);
});
test('STUDIO-DEFENCE-STATE-01: locked moves, invalid tiers, role and eligibility fail closed',()=>{
 const cases=[['spinBumper',2,player],['keep',0,player],['unknown',3,player],
  ['drill',3,{...player,role:'GK'}],['drill',3,{role:'DF',rating:70,superDefenceLevel:3}]];
 for(const [choice,tier,p] of cases){const result=state(choice,tier,p);
  assert.equal(result.disabled,true);assert.equal(result.invalid,true);assert.match(result.message,/eligible|valid/);}
});
test('STUDIO-DEFENCE-STATE-01: previously equipped defence is kept for a legacy low rating',()=>{
 const p={...player,rating:70};
 assert.equal(state('keep',3,p).disabled,true);
 assert.equal(state('burst',3,p).disabled,false);
});
test('Defence feedback is accessible and updates for both ability and tier without writing saves',()=>{
 const studio=src.slice(src.indexOf('function showPlayerStudio('),src.indexOf('function getAppearance(){'));
 assert.match(studio,/id="studioDefSaveState" role="status" aria-live="polite"/);
 assert.match(studio,/studioDefenceSaveState\(select\.value,\$\('studioDefTier'\)\?\.value,player\)/);
 assert.match(studio,/save\.disabled=state\.disabled/);
 assert.match(studio,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.match(studio,/hint\.textContent=state\.message/);
 assert.match(studio,/previewUpdates\.studioDefAbility\?\.\(\)/);
 assert.doesNotMatch(match[0],/localStorage|storeCharacterChanges|saveCareer/);
});
