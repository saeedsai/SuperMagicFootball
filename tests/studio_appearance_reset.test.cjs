'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const start=ui.indexOf('// STUDIO-APPEARANCE-RESET-01:'),end=ui.indexOf('function studioAppearanceSaveState(',start);
assert.ok(start>=0&&end>start,'real unsaved-appearance reset implementation exists');
const code=ui.slice(start,end);
const defaults={skin:'#aabbcc',hair:'#112233',style:1,face:2,eyes:3};
function fixture({careerMode=false,screen='PLAYER CUSTOMIZATION',missing=false,legacy=false}={}){
 const player=missing?null:{id:'immutable-id',role:'MF',rating:94,magicTrick:'bat',appearance:legacy?{face:3}:{face:4}};
 const fields=Object.fromEntries(Object.entries(defaults).map(([key,value])=>['face_'+key,{value:String(value),options:[{value:String(value)},{value:key==='face'?'4':'99'},{value:key==='face'?'3':'98'}]}]));
 fields.face_face.value='3';
 const hint={textContent:''},stats={redraw:0,writes:0};
 const context={screen,studioCareerContext:careerMode,career:careerMode?{club:0,roster:missing?[]:[player]}:null,
  home:0,avatarIndex:0,roster:()=>missing?[]:[player],avatarFor:()=>defaults,
  getAppearance:()=>Object.fromEntries(Object.keys(defaults).map(key=>[key==='skin'||key==='hair'?key:key, key==='skin'||key==='hair'?fields['face_'+key].value:Number(fields['face_'+key].value)])),
  $:key=>key==='studioAppearanceSaveState'?hint:fields[key],studioGallerySignature:'cached',
  drawCustomizer:()=>{stats.redraw++;},localStorage:{setItem(){stats.writes++;}}};
 vm.runInNewContext(code+';this.reset=studioResetUnsavedAppearance;this.saved=studioSavedAppearance;',context);
 return {context,fields,player,hint,stats};
}
test('reset restores persisted appearance and preserves identity, equipment, and save data',()=>{
 const f=fixture();assert.equal(f.context.reset(),true);
 assert.equal(f.fields.face_face.value,'4');assert.equal(f.fields.face_skin.value,defaults.skin);
 assert.equal(f.player.id,'immutable-id');assert.equal(f.player.magicTrick,'bat');
 assert.equal(f.player.appearance.face,4);assert.equal(f.stats.writes,0);assert.equal(f.stats.redraw,1);
 assert.equal(f.context.studioGallerySignature,'');assert.match(f.hint.textContent,/nothing was saved/);
});
test('Career reset uses current Career roster, not the club roster',()=>{
 const f=fixture({careerMode:true});assert.equal(f.context.reset(),true);assert.equal(f.fields.face_face.value,'4');
 assert.equal(f.context.career.roster[0].appearance.face,4);assert.equal(f.stats.writes,0);
});
test('reset uses avatar defaults for missing legacy appearance fields',()=>{
 const f=fixture({legacy:true});f.fields.face_face.value='4';f.fields.face_eyes.value='99';
 assert.equal(f.context.reset(),true);assert.equal(f.fields.face_face.value,'3');assert.equal(f.fields.face_eyes.value,'3');
 assert.equal(f.player.appearance.eyes,undefined);
});
test('reset is a no-op outside Studio, without a player, or when already unchanged',()=>{
 for(const opts of [{screen:'HOME'},{missing:true}]){
  const f=fixture(opts);assert.equal(f.context.reset(),false);assert.equal(f.stats.redraw,0);
 }
 const f=fixture();f.fields.face_face.value='4';assert.equal(f.context.reset(),false);assert.equal(f.stats.redraw,0);
});
test('reset ignores unavailable legacy options without corrupting a selection',()=>{
 const f=fixture();f.fields.face_face.options=[{value:'3'}];
 assert.equal(f.context.reset(),false);assert.equal(f.fields.face_face.value,'3');assert.equal(f.stats.redraw,0);
});
test('reset button and disabled state are wired to Studio only',()=>{
 assert.match(ui,/button\('↶ RESET UNSAVED','studioResetAppearance'\)/);
 assert.match(ui,/else if\(a==='studioResetAppearance'\)studioResetUnsavedAppearance\(\)/);
 assert.match(ui,/resetButton\.disabled=!dirty/);
});
