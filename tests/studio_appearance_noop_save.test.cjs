'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const start=ui.indexOf('function saveAppearance(){'),end=ui.indexOf('function paintAvatars(){',start);
assert.ok(start>=0&&end>start,'real Player Studio appearance save handler exists');
const handler=ui.slice(start,end);
const complete={skin:'#f1c8a5',hair:'#332211',style:1,face:2,eyes:3,brows:0,eyeColor:1,nose:2,lips:1,body:2,stature:0,exaggeration:1,beard:0,accessory:1,freckles:0,scar:0,tattoo:0};
function run({careerMode=false,previous=complete,selected=complete,storageOk=true,missingPlayer=false}={}){
 const player={id:'appearance-player',role:'MF',rating:92};
 if(previous!==undefined)player.appearance={...previous};
 const stats={writes:0,careerWrites:0,studioViews:0,careerViews:0};
 const context={
  studioCareerContext:careerMode,career:careerMode?{club:0,roster:missingPlayer?[]:[player]}:null,
  home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],roster:()=>missingPlayer?[]:[player],
  getAppearance:()=>({...selected}),
  storeCharacterChanges:()=>{stats.writes++;return storageOk;},
  saveCareer:()=>{stats.careerWrites++;},showPlayerStudio:()=>{stats.studioViews++;},
  showCareerSquad:()=>{stats.careerViews++;}
 };
 const save=vm.runInNewContext(handler+';saveAppearance',context);
 return {save,stats,context,player};
}
test('STUDIO-APPEARANCE-NOOP-01: fully explicit unchanged appearance does not rewrite club or Career',()=>{
 for(const careerMode of [false,true]){
  const {save,stats,context,player}=run({careerMode});save();
  assert.equal(stats.writes,0);assert.equal(stats.careerWrites,0);
  assert.equal(stats.studioViews,careerMode?0:1);assert.equal(stats.careerViews,careerMode?1:0);
  assert.equal((context.career?.roster?.[0]??player).id,'appearance-player');
 }
});
test('STUDIO-APPEARANCE-NOOP-01: actual appearance change persists once in both contexts',()=>{
 for(const careerMode of [false,true]){
  const selected={...complete,face:4};
  const {save,stats,context}=run({careerMode,selected});save();
  assert.equal(stats.writes,1);assert.equal(stats.careerWrites,careerMode?1:0);
  const saved=careerMode?context.career.roster[0]:context.edits.team[0];
  assert.equal(saved.appearance.face,4);assert.equal(saved.id,'appearance-player');
 }
});
test('STUDIO-APPEARANCE-NOOP-01: first-time partial legacy appearance is normalized',()=>{
 const previous={skin:complete.skin,hair:complete.hair};
 const {save,stats,context}=run({previous});save();
 assert.equal(stats.writes,1);assert.equal(Object.keys(context.edits.team[0].appearance).length,Object.keys(complete).length);
});
test('STUDIO-APPEARANCE-NOOP-01: obsolete extra appearance fields are normalized',()=>{
 const {save,stats,context}=run({previous:{...complete,obsoleteField:'old'}});save();
 assert.equal(stats.writes,1);assert.equal(Object.hasOwn(context.edits.team[0].appearance,'obsoleteField'),false);
});
test('STUDIO-APPEARANCE-NOOP-01: missing appearance is saved on first selection',()=>{
 const {save,stats,context}=run({previous:undefined});save();
 assert.equal(stats.writes,1);assert.equal(context.edits.team[0].appearance.face,complete.face);
});
test('STUDIO-APPEARANCE-NOOP-01: failed storage never reports save or updates Career',()=>{
 const {save,stats,context}=run({careerMode:true,selected:{...complete,face:4},storageOk:false});save();
 assert.equal(stats.writes,1);assert.equal(stats.careerWrites,0);
 assert.equal(stats.careerViews,0);assert.equal(context.career.roster[0].appearance.face,complete.face);
});
test('STUDIO-APPEARANCE-NOOP-01: missing player does not write or navigate',()=>{
 const {save,stats}=run({missingPlayer:true});save();
 assert.deepEqual(stats,{writes:0,careerWrites:0,studioViews:0,careerViews:0});
});
