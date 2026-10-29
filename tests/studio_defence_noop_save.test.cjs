'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const start=ui.indexOf('function saveStudioDefence(){');
const end=ui.indexOf('function saveAppearance(){',start);
assert.ok(start>=0&&end>start,'real Super Defence Studio handler exists');
const handler=ui.slice(start,end);
const mechanics=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'src/modules/abilities.js'),'utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{ABILITIES\};?/,'');
const ABILITIES=vm.runInNewContext(source+';ABILITIES',{
 GAME_ASSETS:{mechanics},SPECIALS:{abilityLevel:()=>3,levelModifiers:()=>({fatigue:1})}
});
function run({choice='keep',tier=3,explicitTier=3,ability,careerMode=false}={}){
 const player={id:'stable-df',role:'DF',rating:92,appearance:{style:2}};
 if(explicitTier!==undefined)player.superDefenceLevel=explicitTier;
 if(ability)player.superAbility={...ability};
 const stats={writes:0,careerWrites:0,refreshes:0};
 const context={
  studioCareerContext:careerMode,career:careerMode?{club:0,roster:[player]}:null,
  home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],roster:()=>[player],
  $:id=>id==='studioDefAbility'?{value:choice}:id==='studioDefTier'?{value:String(tier)}:null,
  ABILITIES,studioEliteEligible:()=>true,
  storeCharacterChanges:()=>{stats.writes++;return true;},
  saveCareer:()=>{stats.careerWrites++;},showPlayerStudio:()=>{stats.refreshes++;},
  alert:message=>{throw Error(message);}
 };
 const save=vm.runInNewContext(handler+';saveStudioDefence',context);
 return {save,stats,context,player};
}
const drill={type:'defence',id:'drill',name:mechanics.defensiveAbilities.drill.name,level:3};
test('STUDIO-DEFENCE-NOOP-01: unchanged defence/tier is read-only in club and Career',()=>{
 for(const careerMode of [false,true])for(const choice of ['keep','drill']){
  const {save,stats,context,player}=run({choice,ability:drill,careerMode});
  save();assert.equal(stats.writes,0);assert.equal(stats.careerWrites,0);
  assert.equal(stats.refreshes,1);assert.equal(player.superAbility.id,'drill');
  assert.equal(context.career?.roster?.[0]??player,player);
 }
});
test('STUDIO-DEFENCE-NOOP-01: removing absent defence is read-only with explicit tier',()=>{
 for(const careerMode of [false,true]){
  const {save,stats,player}=run({choice:'none',careerMode,ability:{type:'shoot',id:'fire'}});
  save();assert.equal(stats.writes,0);assert.equal(stats.careerWrites,0);
  assert.equal(stats.refreshes,1);assert.equal(player.superAbility.id,'fire');
 }
});
test('STUDIO-DEFENCE-NOOP-01: first explicit tier persists even for KEEP',()=>{
 const {save,stats,context}=run({choice:'keep',explicitTier:undefined});
 save();assert.equal(stats.writes,1);assert.equal(stats.refreshes,1);
 assert.equal(context.edits.team[0].superDefenceLevel,3);
});
test('STUDIO-DEFENCE-NOOP-01: actual tier changes persist once in both contexts',()=>{
 for(const careerMode of [false,true]){
  const {save,stats,context}=run({choice:'keep',tier:4,ability:drill,careerMode});
  save();assert.equal(stats.writes,1);assert.equal(stats.careerWrites,careerMode?1:0);
  const saved=careerMode?context.career.roster[0]:context.edits.team[0];
  assert.equal(saved.superDefenceLevel,4);assert.equal(saved.superAbility.level,4);
  assert.equal(saved.id,'stable-df');
 }
});
test('STUDIO-DEFENCE-NOOP-01: real ability change persists, invalid tier rejects',()=>{
 const changed=run({choice:'burst',ability:drill});
 changed.save();assert.equal(changed.stats.writes,1);
 assert.equal(changed.context.edits.team[0].superAbility.id,'burst');
 const invalid=run({choice:'drill',tier:0,ability:drill});
 assert.throws(invalid.save,/tier must be a whole number/);
 assert.equal(invalid.stats.writes,0);assert.equal(invalid.stats.refreshes,0);
});
