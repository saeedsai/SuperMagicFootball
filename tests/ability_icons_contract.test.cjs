'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const src=fs.readFileSync('src/modules/ability-icons.js','utf8').replace(/export \{ABILITY_ICONS\};?/,'');
const ICONS=vm.runInNewContext(src+'\nABILITY_ICONS;',{});
const gameplay=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const trickIds=['banana','ice','bat','fireball','freeze','scream','hideBall','teleport'];
test('Every existing shot has its own ball icon, and every ability catalogue id has one',()=>{
 for(const [type,ids] of Object.entries({shot:Object.keys(gameplay.shotTypes),defence:Object.keys(gameplay.defensiveAbilities),trick:trickIds,dribble:gameplay.dribbleStyles.map(s=>s.id)})){
  const markup=new Set();for(const id of ids){const html=ICONS.icon(type,id);assert.match(html,/role="img"/);assert.match(html,/<svg/);assert.match(html,/aria-label=/);assert.ok(!html.includes('Not equipped'),type+': '+id);markup.add(html);if(type==='shot')assert.match(html,/<path d="M29 22/);}
  assert.equal(markup.size,ids.length,'icons must be unique per '+type);
 }
});
test('Unknown or none does not fabricate equipment; title injection escaped',()=>{
 assert.match(ICONS.icon('trick',null),/Not equipped/);
 assert.match(ICONS.icon('shot','missing'),/Not equipped/);
 assert.doesNotMatch(ICONS.icon('shot','cannon','<img onerror="alert(1)">'),/<img/);
});
test('Team ability summary represents all four distinct categories and unequipped magic',()=>{
 const dribbles=gameplay.dribbleStyles,tricks=trickIds.map(id=>({id,name:id}));
 const p={role:'FW',shot:'cannon',superAbility:{type:'shoot',id:'cannon'},magicTrick:'ice',dribbleType:'rainbow'};
 const html=ICONS.summary(p,gameplay.shotTypes,gameplay.defensiveAbilities,dribbles,tricks);
 for(const label of ['SUPER SHOT','SUPER DEFENCE','TRICK','DRIBBLE STYLE'])assert.ok(html.includes(label));
 for(const phrase of [gameplay.shotTypes.cannon.name,'ice','Rainbow'])assert.match(html,new RegExp(phrase,'i'));
 const ordinary=ICONS.summary({role:'DF'},gameplay.shotTypes,gameplay.defensiveAbilities,dribbles,tricks);
 assert.match(ordinary,/None \(planned\)/);
 assert.doesNotMatch(ordinary,/Cannon Shot/);
});
test('Studio previews and both team stat menus use shared visual catalogues',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 for(const id of ['studioShotIcon','studioDefIcon','studioMagicIcon','studioDribbleIcon'])assert.ok(ui.includes('id="'+id+'"'));
 assert.match(ui,/select\.addEventListener\('change',update\)/);
 assert.match(ui,/const playerAbilityIcons=p=>ABILITY_ICONS\.summary/);
 assert.ok((ui.match(/\$\{playerAbilityIcons\(p\)\}/g)||[]).length>=2);
 assert.match(ui,/import \{ABILITY_ICONS\} from "\.\/ability-icons\.js"/);
});
