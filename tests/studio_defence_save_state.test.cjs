'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const src=read('src/modules/ui.js');
const match=src.match(/function studioDefenceSaveState\(choice,tier,player\)\{[\s\S]*?\n\}/);
assert.ok(match,'actual Super Defence save-state helper exists');
const mechanics=JSON.parse(read('data/mechanics/gameplay.json'));
const caps={Gold:2,Star:3,Superstar:5},minLevel={spinBumper:3,fireWall:2,iceWall:3,demonWall:4};
const ABILITIES={
 canEquipVerifiedFieldSpecial:(p,{kind,level})=>kind==='defence'&&p?.role==='DF'&&Number.isInteger(level)&&level>=1&&level<=(caps[p?.verifiedTier]||0),
 studioDefenceChoices:(p,level)=>p?.role==='DF'&&(caps[p?.verifiedTier]||0)>=level?Object.keys(mechanics.defensiveAbilities).filter(id=>level>=(minLevel[id]||1)).map(id=>({id})):[],
 withStudioDefence:(p,id,level)=>{const copy={...p,superDefenceLevel:level};if(id==='none'){if(copy.superAbility?.type==='defence')delete copy.superAbility;}else if(id==='keep'){if(copy.superAbility?.type==='defence')copy.superAbility={...copy.superAbility,level};}else copy.superAbility={type:'defence',id,level,name:mechanics.defensiveAbilities[id].name};return copy;}
};
const state=vm.runInNewContext(match[0]+';studioDefenceSaveState',{ABILITIES,SPECIALS:{abilityLevel:p=>p?.superDefenceLevel||p?.superAbility?.level||3}});
const drill={type:'defence',id:'drill',name:mechanics.defensiveAbilities.drill.name,level:3};
const player={id:'stable-df',role:'DF',verifiedTier:'Superstar',rating:92,superDefenceLevel:3,superAbility:drill};
test('unverified legacy equipment stays keepable and cannot unlock new defence moves',()=>{
 const legacy={...player,rating:100,verifiedTier:null};
 assert.equal(state('keep',3,legacy).disabled,true,'unchanged keep is a no-op');
 assert.equal(state('burst',3,legacy).disabled,true,'new move requires a verified tier');
 assert.equal(state('keep',4,legacy).invalid,true,'retiering requires verified cap');
 assert.equal(state('none',3,legacy).disabled,false,'explicit removal is available');
});
test('verified tier state blocks levels above the cap and accepts an allowed move',()=>{
 assert.equal(state('drill',3,player).disabled,false);
 assert.equal(state('drill',6,player).invalid,true);
 assert.equal(state('spinBumper',2,player).invalid,true);
});
test('Defence feedback is accessible and updates for ability and tier without writing saves',()=>{
 const studio=src.slice(src.indexOf('function showPlayerStudio('),src.indexOf('function getAppearance(){'));
 assert.match(studio,/id="studioDefSaveState" role="status" aria-live="polite"/);
 assert.match(studio,/studioDefenceSaveState\(select\.value,\$\('studioDefTier'\)\?\.value,player\)/);
 assert.match(studio,/save\.disabled=state\.disabled/);
 assert.match(studio,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.match(studio,/hint\.textContent=state\.message/);
 assert.match(studio,/previewUpdates\.studioDefAbility\?\.\(\)/);
 assert.doesNotMatch(match[0],/localStorage|storeCharacterChanges|saveCareer/);
});
