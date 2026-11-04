'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const mechanics=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const abilitySource=fs.readFileSync(path.join(root,'src/modules/abilities.js'),'utf8');
const abilityBody=abilitySource.slice(abilitySource.indexOf('const ABILITIES=(()=>')).replace(/\nexport \{ABILITIES\};?\s*$/,'');
const ABILITIES=vm.runInNewContext(abilityBody+'\nABILITIES;',{
 GAME_ASSETS:{mechanics},STATS:{verifiedRatingTierForPlayer:p=>p?.verifiedTier??null},
 SPECIALS:{abilityLevel:()=>1,levelModifiers:()=>({fatigue:1})}
});
const start=ui.indexOf('function saveStudioShot(){'),end=ui.indexOf('const STUDIO_MAGIC_TRICKS=',start);
assert.ok(start>=0&&end>start,'real Super Shot Studio handler exists');
const handler=ui.slice(start,end),SHOTS={fire:{name:'Fire Strike'},banana:{name:'Banana Shot'}};
const stateMatch=ui.match(/function studioShotSaveState\(choice,tier,player\)\{[\s\S]*?\n\}/);
assert.ok(stateMatch,'real Super Shot save-state helper exists');
const SPECIALS={abilityLevel:p=>p.superShotLevel??p.superAbility?.level??1};
const studioShotSaveState=vm.runInNewContext(stateMatch[0]+';studioShotSaveState',{SHOTS,SPECIALS,ABILITIES});
const fire={type:'shoot',id:'fire',name:'Fire Strike',level:3};
function run({choice='keep',tier=3,shot='fire',shotName='Fire Strike',ability=fire,omitTier=false,omitShot=false,omitName=false,careerMode=false,role='MF'}={}){
 const player={id:'stable-shot',role,rating:92,statsVerified:true,verifiedTier:'Superstar'};
 if(!omitTier)player.superShotLevel=3;
 if(!omitShot)player.shot=shot;
 if(!omitName)player.shotName=shotName;
 if(ability)player.superAbility={...ability};
 const stats={writes:0,careerWrites:0,refreshes:0};
 const context={
  studioCareerContext:careerMode,career:careerMode?{club:0,roster:[player]}:null,
  home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],roster:()=>[player],
  $:id=>id==='studioShotAbility'?{value:choice}:id==='studioShotTier'?{value:String(tier)}:null,
  SPECIALS,studioShotSaveState,
  SHOTS,ABILITIES,studioEliteEligible:()=>true,tokenWallet:{owns:(category,id)=>category==='superShot'&&id==='banana'},
  storeCharacterChanges:()=>{stats.writes++;return true;},
  saveCareer:()=>{stats.careerWrites++;},showPlayerStudio:()=>{stats.refreshes++;},
  alert:message=>{throw Error(message);}
 };
 const save=vm.runInNewContext(handler+';saveStudioShot',context);
 return {save,stats,context,player};
}
test('STUDIO-SHOT-NOOP-01: unchanged explicit Shot is read-only in club and Career',()=>{
 for(const careerMode of [false,true])for(const choice of ['keep','fire']){
  const {save,stats,context,player}=run({choice,careerMode});
  save();assert.equal(stats.writes,0);assert.equal(stats.careerWrites,0);
  assert.equal(stats.refreshes,1);assert.equal(player.superAbility.id,'fire');
  assert.equal(context.career?.roster?.[0]??player,player);
 }
});
test('STUDIO-SHOT-NOOP-01: removing an already-removed explicit Shot is read-only',()=>{
 for(const careerMode of [false,true]){
  const {save,stats,player}=run({choice:'none',shot:null,shotName:'',ability:{type:'defence',id:'drill',level:3},careerMode});
  save();assert.equal(stats.writes,0);assert.equal(stats.careerWrites,0);
  assert.equal(stats.refreshes,1);assert.equal(player.superAbility.type,'defence');
 }
});
test('STUDIO-SHOT-NOOP-01: first explicit level persists even with KEEP',()=>{
 const {save,stats,context}=run({choice:'keep',omitTier:true,ability:{type:'shoot',id:'fire',name:'Fire Strike'}});
 save();assert.equal(stats.writes,1);assert.equal(stats.refreshes,1);
 assert.equal(context.edits.team[0].superShotLevel,3);
});
test('STUDIO-SHOT-NOOP-01: actual tier changes persist once in both contexts',()=>{
 for(const careerMode of [false,true]){
  const {save,stats,context}=run({choice:'keep',tier:4,careerMode});
  save();assert.equal(stats.writes,1);assert.equal(stats.careerWrites,careerMode?1:0);
  const saved=careerMode?context.career.roster[0]:context.edits.team[0];
  assert.equal(saved.superShotLevel,4);assert.equal(saved.superAbility.level,4);
  assert.equal(saved.id,'stable-shot');
 }
});
test('STUDIO-SHOT-NOOP-01: different Shot and stale name are genuine edits',()=>{
 const changed=run({choice:'banana'});changed.save();
 assert.equal(changed.stats.writes,1);
 assert.equal(changed.context.edits.team[0].shot,'banana');
 assert.equal(changed.context.edits.team[0].shotName,'Banana Shot');
 const stale=run({choice:'fire',shotName:'Old name'});stale.save();
 assert.equal(stale.stats.writes,1);
 assert.equal(stale.context.edits.team[0].shotName,'Fire Strike');
});
test('STUDIO-SHOT-NOOP-01: invalid selection and tier reject before no-op',()=>{
 for(const options of [{choice:'not-a-shot'},{tier:0},{role:'GK',ability:null}]){
  const {save,stats}=run(options);
  assert.throws(save,/Cannot save Super Shot/);
  assert.equal(stats.writes,0);assert.equal(stats.refreshes,0);
 }
});
test('STUDIO-SHOT-OWNERSHIP-01: an unowned shot cannot be equipped through a forged selector value',()=>{
 const options=run({choice:'banana'});options.context.tokenWallet.owns=()=>false;
 assert.throws(options.save,/Unlock this Super Shot in Store & Tokens/);
 assert.equal(options.stats.writes,0);
});
test('STUDIO-SHOT-NOOP-01: goalkeeper legacy equipment can be kept but tier changes fail closed',()=>{
 const same=run({choice:'keep',tier:3,role:'GK'});same.save();
 assert.equal(same.stats.writes,0);assert.equal(same.stats.refreshes,1);
 const change=run({choice:'keep',tier:4,role:'GK'});
 assert.throws(change.save,/verified tier/);assert.equal(change.stats.writes,0);
});
test('STUDIO-SHOT-NOOP-01: removing absent legacy fields is read-only',()=>{
 const {save,stats,context}=run({choice:'none',omitShot:true,omitName:true,ability:null});
 save();assert.equal(stats.writes,0);assert.equal(stats.refreshes,1);
 assert.equal(context.edits.team,undefined);
});
