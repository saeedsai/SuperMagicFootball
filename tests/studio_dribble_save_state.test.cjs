'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const match=src.match(/function studioDribbleSaveState\(choice,player,styles\)\{[\s\S]*?\n\}/);
assert.ok(match,'real Dribble Style save-state helper exists');
const state=vm.runInNewContext(match[0]+';studioDribbleSaveState');
const styles=[{id:'rainbow'},{id:'nutmeg'}];
test('STUDIO-DRIBBLE-STATE-01: unchanged explicitly stored style disables saving',()=>{
 const result=state('rainbow',{role:'MF',dribbleType:'rainbow'},styles);
 assert.equal(result.disabled,true);assert.equal(result.unchanged,true);
 assert.match(result.message,/already saved/);
});
test('STUDIO-DRIBBLE-STATE-01: legacy deterministic default still requires first explicit save',()=>{
 for(const player of [{role:'MF'}, {role:'MF',dribbleType:null}]){
  const result=state('rainbow',player,styles);
  assert.equal(result.disabled,false);assert.match(result.message,/ready to save/);
 }
});
test('STUDIO-DRIBBLE-STATE-01: genuine changes remain savable, invalid choices fail closed',()=>{
 assert.equal(state('nutmeg',{dribbleType:'rainbow'},styles).disabled,false);
 const invalid=state('missing',{dribbleType:'missing'},styles);
 assert.equal(invalid.disabled,true);assert.equal(invalid.invalid,true);
 assert.match(invalid.message,/valid Dribble Style/);
});
test('Dribble Style preview wires accessible live state without automatic persistence',()=>{
 const studio=src.slice(src.indexOf('function showPlayerStudio('),src.indexOf('function getAppearance()'));
 assert.match(studio,/id="studioDribbleSaveState" role="status" aria-live="polite"/);
 assert.match(studio,/studioDribbleSaveState\(select\.value,player,DRIBBLES\.DRIBBLE_STYLES\)/);
 assert.match(studio,/save\.disabled=state\.disabled/);
 assert.match(studio,/save\.setAttribute\('aria-disabled',String\(state\.disabled\)\)/);
 assert.match(studio,/hint\.textContent=state\.message/);
 assert.match(studio,/select\.addEventListener\('change',update\);update\(\);/);
 assert.match(src,/if\(equipped\.dribbleType===source\[avatarIndex\]\.dribbleType\)/);
});
