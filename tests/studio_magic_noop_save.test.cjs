'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
const start=source.indexOf('function saveStudioMagic(){');
const end=source.indexOf('function saveStudioTrick(){',start);
assert.ok(start>=0&&end>start,'real Player Studio Magic Trick save handler exists');
const handler=source.slice(start,end);
function run({choice,magicTrick,careerMode=false}){
 const player={role:'MF',rating:92,name:'Test'};
 if(magicTrick!==undefined)player.magicTrick=magicTrick;
 const stats={writes:0,careerWrites:0,refreshes:0};
 const context={
  studioCareerContext:careerMode,
  career:careerMode?{club:0,roster:[player]}:null,
  home:0,avatarIndex:0,edits:{},TEAMS:[{id:'team'}],
  roster:()=>[player],$:(id)=>id==='studioMagic'?{value:choice}:null,
  STUDIO_MAGIC_TRICKS:[{id:'banana'},{id:'ice'}],
  studioMagicEligible:()=>true,
  storeCharacterChanges:()=>{stats.writes++;return true;},
  saveCareer:()=>{stats.careerWrites++;},
  showPlayerStudio:()=>{stats.refreshes++;},
  alert:(message)=>{throw Error(message);}
 };
 const save=vm.runInNewContext(handler+';saveStudioMagic',context);
 save();
 return {stats,context,player};
}
test('STUDIO-MAGIC-NOOP-01: removing absent Trick does not rewrite club or Career save',()=>{
 for(const careerMode of [false,true]){
  const {stats,context,player}=run({choice:'none',careerMode});
  assert.equal(stats.writes,0);
  assert.equal(stats.careerWrites,0);
  assert.equal(stats.refreshes,1);
  assert.equal(context.career?.roster?.[0]??player,player);
 }
});
test('STUDIO-MAGIC-NOOP-01: reselecting equipped Trick is read-only in either save context',()=>{
 for(const careerMode of [false,true]){
  const {stats}=run({choice:'banana',magicTrick:'banana',careerMode});
  assert.equal(stats.writes,0);
  assert.equal(stats.careerWrites,0);
  assert.equal(stats.refreshes,1);
 }
});
test('STUDIO-MAGIC-NOOP-01: real removal still writes exactly once',()=>{
 for(const careerMode of [false,true]){
  const {stats,context}=run({choice:'none',magicTrick:'banana',careerMode});
  assert.equal(stats.writes,1);
  assert.equal(stats.careerWrites,careerMode?1:0);
  assert.equal(stats.refreshes,1);
  const saved=careerMode?context.career.roster[0]:context.edits.team[0];
  assert.equal(Object.hasOwn(saved,'magicTrick'),false);
 }
});
