'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const start=ui.indexOf('function saveStudioShot(){'),end=ui.indexOf('const STUDIO_MAGIC_TRICKS=',start);
assert.ok(start>=0&&end>start,'real Super Shot Studio handler exists');
const handler=ui.slice(start,end),SHOTS={fire:{name:'Fire Strike'},banana:{name:'Banana Shot'}};
const fire={type:'shoot',id:'fire',name:'Fire Strike',level:3};
function run({choice='keep',tier=3,shot='fire',shotName='Fire Strike',ability=fire,omitTier=false,omitShot=false,omitName=false,careerMode=false,role='MF'}={}){
 const player={id:'stable-shot',role,rating:92};
 if(!omitTier)player.superShotLevel=3;
 if(!omitShot)player.shot=shot;
 if(!omitName)player.shotName=shotName;
 if(ability)player.superAbility={...ability};
 const stats={writes:0,careerWrites:0,refreshes:0};
 const context={
  studioCareerContext:careerMode,career:careerMode?{club:0,roster:[player]}:null,
  home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],roster:()=>[player],
  $:id=>id==='studioShotAbility'?{value:choice}:id==='studioShotTier'?{value:String(tier)}:null,
  SHOTS,studioEliteEligible:()=>true,
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
 const {save,stats,context}=run({choice:'keep',omitTier:true});
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
 for(const options of [{choice:'not-a-shot'},{tier:0},{role:'GK'}]){
  const {save,stats}=run(options);
  assert.throws(save,/Cannot save Super Shot/);
  assert.equal(stats.writes,0);assert.equal(stats.refreshes,0);
 }
});
test('STUDIO-SHOT-NOOP-01: legacy absent fields persist on explicit REMOVE',()=>{
 const {save,stats,context}=run({choice:'none',omitShot:true,omitName:true,ability:null});
 save();assert.equal(stats.writes,1);
 assert.equal(context.edits.team[0].shot,null);
 assert.equal(context.edits.team[0].shotName,'');
});
