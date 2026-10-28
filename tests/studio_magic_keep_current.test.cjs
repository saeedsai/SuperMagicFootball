'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('function saveStudioMagic(){');
const end=ui.indexOf('function saveStudioTrick(){',start);
assert.ok(start>=0&&end>start,'Studio Magic handler must exist');
const handler=ui.slice(start,end);
function run(selection,player,{careerMode=false,allowSave=true}={}){
 const calls=[],errors=[],redraw=[];
 const original={...player};
 const state={
  career:careerMode?{club:1,roster:[{...player}]}:null,
  home:1,avatarIndex:0,edits:{},TEAMS:{1:{id:'team-1'}},
  roster:()=>[{...player}],$:()=>({value:selection}),
  STUDIO_MAGIC_TRICKS:[{id:'banana'},{id:'ice'}],
  studioMagicEligible:p=>p.role!=='GK'&&Number(p.rating)>=91,
  storeCharacterChanges:(key,value)=>{calls.push({key,value});return allowSave;},
  saveCareer:()=>{},showPlayerStudio:i=>redraw.push(i),alert:e=>errors.push(e)
 };
 vm.runInNewContext(handler+'\nsaveStudioMagic();',state);
 assert.deepEqual(player,original,'source player must not mutate');
 return {state,calls,errors,redraw};
}
test('Studio defaults to explicit KEEP CURRENT rather than accidental removal',()=>{
 const selector=ui.slice(ui.indexOf('const magicSelector='),ui.indexOf('studioGallerySignature=',ui.indexOf('const magicSelector=')));
 assert.match(selector,/<option value="keep" selected>KEEP CURRENT<\/option>/);
 assert.match(selector,/<option value="none">REMOVE MAGIC TRICK<\/option>/);
 assert.doesNotMatch(selector,/player\.magicTrick===a\.id\?'selected'/);
 assert.match(ui,/select\.value==='keep'\?current/);
});
test('KEEP CURRENT preserves legacy ability without writing either save store',()=>{
 for(const careerMode of [false,true]){
  const {calls,errors,redraw}=run('keep',{id:'p',role:'MF',rating:60,magicTrick:'banana'},{careerMode});
  assert.equal(calls.length,0);assert.equal(errors.length,0);assert.equal(redraw.length,1);
 }
});
test('explicit REMOVE and new selections persist without changing other player fields',()=>{
 const player={id:'stable',role:'MF',rating:95,magicTrick:'banana',appearance:{face:2}};
 for(const careerMode of [false,true]){
  const removed=run('none',player,{careerMode});
  assert.equal(removed.errors.length,0);assert.equal(removed.calls.length,1);
  const record=careerMode?removed.calls[0].value.roster[0]:removed.calls[0].value['team-1'][0];
  assert.equal(Object.hasOwn(record,'magicTrick'),false);
  assert.equal(record.id,player.id);assert.deepEqual(record.appearance,player.appearance);
  const changed=run('ice',player,{careerMode});
  const next=careerMode?changed.calls[0].value.roster[0]:changed.calls[0].value['team-1'][0];
  assert.equal(next.magicTrick,'ice');assert.equal(next.id,player.id);
 }
});
test('invalid, missing, ineligible and keeper choices cannot mutate storage',()=>{
 for(const [selection,player] of [
  ['unknown',{role:'MF',rating:95}], [undefined,{role:'MF',rating:95}],
  ['ice',{role:'MF',rating:70}], ['ice',{role:'MF',rating:90}],
  ['ice',{role:'MF',rating:90,magicTrick:'banana'}], ['ice',{role:'GK',rating:99}]
 ]){
  const result=run(selection,player);
  assert.equal(result.calls.length,0);assert.equal(result.errors.length,1);
 }
});
test('storage refusal does not alter Career roster or global edits',()=>{
 const player={id:'stable',role:'MF',rating:95,magicTrick:'banana'};
 for(const careerMode of [false,true]){
  const result=run('none',player,{careerMode,allowSave:false});
  assert.equal(result.calls.length,1);
  if(careerMode)assert.equal(result.state.career.roster[0].magicTrick,'banana');
  else assert.equal(Object.keys(result.state.edits).length,0);
 }
});
test('Studio Magic preserves existing four-action controller and has no tier selector',()=>{
 const html=fs.readFileSync('index.html','utf8');
 assert.equal((html.match(/<button data-act=/g)||[]).length,4);
 assert.doesNotMatch(ui,/id="studioMagicTier"/);
});
