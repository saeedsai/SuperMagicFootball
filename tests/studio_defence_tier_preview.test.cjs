'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const start=ui.indexOf('function studioDefenceTierGuide(tier,choices){');
const end=ui.indexOf('\nfunction showPlayerStudio(',start);
assert.ok(start>=0&&end>start,'Player Studio must export its tier guide inside the runtime');
const guide=vm.runInNewContext('('+ui.slice(start,end)+')');
test('Super Defence preview explains locked and unlocked moves without saving',()=>{
 const lower=guide(1,[{id:'drill'},{id:'burst'}]);
 assert.match(lower,/Tier 1: 2 available moves/);
 assert.match(lower,/Spin Bumper unlocks at tier 3/);
 assert.match(lower,/Preview only/);
 const higher=guide(3,[{id:'drill'},{id:'burst'},{id:'spinBumper'}]);
 assert.match(higher,/Tier 3: 3 available moves/);
 assert.match(higher,/Spin Bumper unlocked/);
 assert.doesNotMatch(higher,/unlocks at tier 3/);
});
test('Ineligible defenders receive a truthful empty-catalogue message',()=>{
 assert.match(guide(5,[]),/No Super Defence moves available/);
 assert.match(guide(1,null),/No Super Defence moves available/);
});
test('Studio starts with choices computed for the actual displayed tier',()=>{
 const studio=ui.slice(ui.indexOf('function showPlayerStudio('),ui.indexOf('function getAppearance(){'));
 assert.match(studio,/studioDefenceChoices\(player,defenceTier\)/);
 assert.match(studio,/n===defenceTier\?'selected'/);
 assert.match(studio,/id="studioDefTierGuide" role="status" aria-live="polite"/);
 assert.match(studio,/studioDefenceTierGuide\(defenceTier,defenceChoices\)/);
});
test('Changing tier removes stale locked selections and updates icon and spoken guide',()=>{
 const studio=ui.slice(ui.indexOf('function showPlayerStudio('),ui.indexOf('function getAppearance(){'));
 assert.match(studio,/if\(\[\.\.\.abilitySelect\.options\]\.some\(o=>o\.value===previous\)\)abilitySelect\.value=previous/);
 assert.match(studio,/else abilitySelect\.value='keep'/);
 assert.match(studio,/previewUpdates\.studioDefAbility\?\.\(\)/);
 assert.match(studio,/guide\.textContent=studioDefenceTierGuide\(Number\(tierSelect\.value\),available\)/);
 assert.match(studio,/tierSelect\.onchange\(\)/);
});

test('actual tier-change callback retains unlocked moves and clears newly locked ones',()=>{
 const begin=ui.indexOf('if(tierSelect&&abilitySelect)tierSelect.onchange=()=>{');
 const finish=ui.indexOf('\n if(tierSelect&&abilitySelect)tierSelect.onchange();',begin);
 assert.ok(begin>=0&&finish>begin,'runtime tier-change callback must be present');
 const tierSelect={value:'3'},live={textContent:''};
 let redraws=0;
 const abilitySelect={
  value:'spinBumper',options:[],
  set innerHTML(html){
   this.options=[...html.matchAll(/<option value="([^"]+)"/g)].map(m=>({value:m[1]}));
   this.value=this.options[0].value;
  }
 };
 const context={
  tierSelect,abilitySelect,player:{role:'DF'},
  studioEliteEligible:()=>true,
  ABILITIES:{studioDefenceChoices:(_player,tier)=>[
   {id:'drill',name:'Drill'},{id:'burst',name:'Burst'},
   ...(tier>=3?[{id:'spinBumper',name:'Spin Bumper'}]:[])
  ]},
  escapeHTML:String,
  previewUpdates:{studioDefAbility:()=>{redraws++;}},
  $:id=>id==='studioDefTierGuide'?live:null,
  studioDefenceTierGuide:guide
 };
 vm.runInNewContext(ui.slice(begin,finish),context);
 tierSelect.onchange();
 assert.equal(abilitySelect.value,'spinBumper');
 assert.match(live.textContent,/Spin Bumper unlocked/);
 tierSelect.value='2';tierSelect.onchange();
 assert.equal(abilitySelect.value,'keep','tier downgrade must not leave a locked move selected');
 assert.equal(abilitySelect.options.some(o=>o.value==='spinBumper'),false);
 assert.match(live.textContent,/unlocks at tier 3/);
 assert.equal(redraws,2,'both changes must refresh the visible ability icon');
});
