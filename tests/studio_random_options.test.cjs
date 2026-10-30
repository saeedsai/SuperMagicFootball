'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ui=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
const start=ui.indexOf('function studioRandomizeUnsavedAppearance('),end=ui.indexOf('function studioAppearanceSaveState(',start);
assert.ok(start>0&&end>start,'real Player Studio randomizer is present');
const method=ui.slice(start,end);
const keys=['style','face','skin','hair'];
function fixture({screen='PLAYER CUSTOMIZATION',careerMode=false,missing=false}={}){
 const player=missing?null:{id:'p',appearance:{face:3},rating:90,magicTrick:'bat'};
 const fields={face_style:{value:'1',options:[{value:'1'},{value:'7'},{value:'11'}]},
  face_face:{value:'3',options:[{value:'3'},{value:'8'},{value:'21',disabled:true}]},
  face_skin:{value:'#abc',options:[{value:'#abc'},{value:'#def'}]},
  face_hair:{value:'#123',options:[{value:'#123'},{value:'#456'}]}};
 const stats={redraw:0,writes:0},hint={textContent:''};
 const context={screen,studioCareerContext:careerMode,career:careerMode?{club:0,roster:missing?[]:[player]}:null,
  home:0,avatarIndex:0,roster:()=>missing?[]:[player],
  getAppearance:()=>Object.fromEntries(keys.map(k=>[k,fields['face_'+k].value])),
  $:k=>k==='studioAppearanceSaveState'?hint:fields[k],studioGallerySignature:'cached',
  drawCustomizer(){stats.redraw++;hint.textContent='Appearance changes are ready to save.'},
  localStorage:{setItem(){stats.writes++;}}};
 vm.runInNewContext(method+';this.randomize=studioRandomizeUnsavedAppearance;',context);
 return {context,fields,stats,hint,player};
}
test('random look chooses actual enabled option values even with sparse numeric IDs',()=>{
 const f=fixture();assert.equal(f.context.randomize(()=>.99),true);
 assert.deepEqual(Object.values(f.fields).map(x=>x.value),['11','8','#def','#456']);
 assert.equal(f.stats.redraw,1);assert.equal(f.context.studioGallerySignature,'');
 assert.match(f.hint.textContent,/Nothing saved yet/);assert.equal(f.stats.writes,0);
 assert.equal(f.player.appearance.face,3);assert.equal(f.player.rating,90);assert.equal(f.player.magicTrick,'bat');
});
test('Career Studio randomization does not mutate its roster or write saves',()=>{
 const f=fixture({careerMode:true});assert.equal(f.context.randomize(()=>.3),true);
 assert.equal(f.context.career.roster[0].appearance.face,3);assert.equal(f.stats.writes,0);
});
test('outside Studio or without selected player randomization is a no-op',()=>{
 for(const opts of [{screen:'HOME'},{missing:true}]){
  const f=fixture(opts);assert.equal(f.context.randomize(),false);assert.equal(f.stats.redraw,0);
 }
});
test('single-option and disabled options cannot produce invalid or false edits',()=>{
 const f=fixture();for(const field of Object.values(f.fields))field.options=[{value:field.value}];
 assert.equal(f.context.randomize(),false);assert.equal(f.stats.redraw,0);
});
test('non-finite random values fall back to a valid enabled alternative',()=>{
 const f=fixture();assert.equal(f.context.randomize(()=>Number.NaN),true);
 assert.deepEqual(Object.values(f.fields).map(x=>x.value),['7','8','#def','#456']);
});
test('real menu dispatch uses the unsaved randomizer and retains exactly four action controls',()=>{
 assert.match(ui,/else if\(a==='randomizeFace'\)studioRandomizeUnsavedAppearance\(\)/);
 assert.match(ui,/button\('RANDOMIZE FACE','randomizeFace'\)/);
 assert.doesNotMatch(method,/store\.put|localStorage\.setItem|saveAppearance\(/);
});
