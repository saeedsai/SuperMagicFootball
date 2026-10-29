'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
const start=ui.indexOf('function saveStudioTrick(){');
const end=ui.indexOf('function saveStudioDefence(){',start);
assert.ok(start>=0&&end>start,'real Player Studio dribble save handler exists');
const handler=ui.slice(start,end);
const mechanics=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const moduleSource=fs.readFileSync(path.join(root,'src/modules/dribbles.js'),'utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{DRIBBLES\};?/,'');
const DRIBBLES=vm.runInNewContext(moduleSource+';DRIBBLES',{GAME_ASSETS:{mechanics}});
const first=DRIBBLES.DRIBBLE_STYLES[0].id,second=DRIBBLES.DRIBBLE_STYLES[1].id;
function run({choice=first,equipped,careerMode=false}={}){
 const player={id:'stable-id',name:'Studio Player',role:'MF',rating:92};
 if(equipped!==undefined)player.dribbleType=equipped;
 const stats={writes:0,careerWrites:0,refreshes:0};
 const context={
  studioCareerContext:careerMode,career:careerMode?{club:0,roster:[player]}:null,
  home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],roster:()=>[player],
  $:id=>id==='studioDribble'?{value:choice}:null,DRIBBLES,
  storeCharacterChanges:()=>{stats.writes++;return true;},
  saveCareer:()=>{stats.careerWrites++;},showPlayerStudio:()=>{stats.refreshes++;},
  alert:message=>{throw Error(message);}
 };
 const save=vm.runInNewContext(handler+';saveStudioTrick',context);
 return {save,stats,context,player};
}
test('STUDIO-DRIBBLE-NOOP-01: unchanged explicit style does not rewrite club or Career saves',()=>{
 for(const careerMode of [false,true]){
  const {save,stats,player,context}=run({choice:first,equipped:first,careerMode});
  save();assert.equal(stats.writes,0);assert.equal(stats.careerWrites,0);
  assert.equal(stats.refreshes,1);assert.equal(player.dribbleType,first);
  assert.equal(context.career?.roster?.[0]??player,player);
 }
});
test('STUDIO-DRIBBLE-NOOP-01: real style changes persist exactly once in both contexts',()=>{
 for(const careerMode of [false,true]){
  const {save,stats,context}=run({choice:second,equipped:first,careerMode});
  save();assert.equal(stats.writes,1);assert.equal(stats.careerWrites,careerMode?1:0);
  assert.equal(stats.refreshes,1);
  const saved=careerMode?context.career.roster[0]:context.edits.team[0];
  assert.equal(saved.dribbleType,second);assert.equal(saved.id,'stable-id');
 }
});
test('first-time explicit selection persists even when deterministic default matches',()=>{
 const {save,stats,context}=run({choice:first});
 save();assert.equal(stats.writes,1);
 assert.equal(context.edits.team[0].dribbleType,first);
});
test('invalid style is rejected before any no-op shortcut or persistence',()=>{
 const {save,stats}=run({choice:'not-a-style',equipped:'not-a-style'});
 assert.throws(save,/Unknown dribble style/);
 assert.equal(stats.writes,0);assert.equal(stats.refreshes,0);
});
