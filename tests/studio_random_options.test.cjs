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
 vm.runInNewContext(method+';this.randomize=studioRandomizeUnsavedAppearance;this.randomizeHair=studioRandomizeHairUnsaved;this.randomizeBody=studioRandomizeBodyUnsaved;this.randomizeAccessories=studioRandomizeAccessoriesUnsaved;this.randomizeDetails=studioRandomizeFaceDetailsUnsaved;',context);
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
 assert.match(ui,/button\('RANDOMIZE FULL LOOK','randomizeFace'\)/);
 assert.doesNotMatch(method,/store\.put|localStorage\.setItem|saveAppearance\(/);
});

// STUDIO-HAIR-RANDOM-01: selective unsaved edits must never disturb face or skin.
test('hair-only randomizer changes real enabled hairstyle and hair-color options',()=>{
 const f=fixture();
 assert.equal(f.context.randomizeHair(()=>.99),true);
 assert.deepEqual(Object.values(f.fields).map(x=>x.value),['11','3','#abc','#456']);
 assert.equal(f.stats.redraw,1);assert.equal(f.context.studioGallerySignature,'');
 assert.match(f.hint.textContent,/Selected appearance previewed.*Nothing saved yet/);
 assert.equal(f.stats.writes,0);assert.equal(f.player.appearance.face,3);
});
test('hair-only randomizer does not mutate Career roster or create saved edits',()=>{
 const f=fixture({careerMode:true});assert.equal(f.context.randomizeHair(()=>0),true);
 assert.deepEqual(Object.values(f.fields).map(x=>x.value),['7','3','#abc','#456']);
 assert.equal(f.context.career.roster[0].appearance.face,3);assert.equal(f.stats.writes,0);
});
test('hair-only randomizer is safe when no alternatives or outside Studio',()=>{
 for(const opts of [{screen:'HOME'},{missing:true}]){
  const f=fixture(opts);assert.equal(f.context.randomizeHair(),false);assert.equal(f.stats.redraw,0);
 }
 const f=fixture();for(const key of ['style','hair'])f.fields['face_'+key].options=[{value:f.fields['face_'+key].value}];
 assert.equal(f.context.randomizeHair(),false);assert.equal(f.stats.redraw,0);
});
test('hair-only menu action preserves other appearance fields and does not persist',()=>{
 assert.match(ui,/button\('RANDOMIZE HAIR','randomizeHair'\)/);
 assert.match(ui,/else if\(a==='randomizeHair'\)studioRandomizeHairUnsaved\(\)/);
 assert.match(method,/\['style','hair'\]/);
 assert.doesNotMatch(method,/store\.put|localStorage\.setItem|saveAppearance\(/);
});

// Face details leave hair, palette and stature untouched, even in Career Studio.
test('facial details randomizer changes only permitted features and never persists',()=>{
 const f=fixture({careerMode:true});
 assert.equal(f.context.randomizeDetails(()=>.99),true);
 assert.deepEqual(Object.values(f.fields).map(x=>x.value),['1','8','#abc','#123']);
 assert.equal(f.stats.redraw,1);assert.equal(f.stats.writes,0);
 assert.equal(f.context.career.roster[0].appearance.face,3);
 assert.match(f.hint.textContent,/Selected appearance previewed.*Nothing saved yet/);
 assert.match(ui,/button\('RANDOMIZE FACE DETAILS','randomizeFaceDetails'\)/);
 assert.match(ui,/else if\(a==='randomizeFaceDetails'\)studioRandomizeFaceDetailsUnsaved\(\)/);
 assert.match(method,/\['face','eyes','brows','eyeColor','nose','lips','beard','freckles','scar'\]/);
});
test('facial detail changes are disabled outside editor and with no option alternatives',()=>{
 const other=fixture({screen:'HOME'});assert.equal(other.context.randomizeDetails(),false);
 const f=fixture();f.fields.face_face.options=[{value:'3'}];
 assert.equal(f.context.randomizeDetails(),false);assert.equal(f.stats.redraw,0);
});

test('body-only randomizer changes build, stature and exaggeration without changing face, hair or skin',()=>{
 const f=fixture();
 for(const [key,a,b] of [['body','2','4'],['stature','1','3'],['exaggeration','0','2']])
  f.fields['face_'+key]={value:a,options:[{value:a},{value:b}]};
 assert.equal(f.context.randomizeBody(()=>.99),true);
 assert.deepEqual(['body','stature','exaggeration'].map(k=>f.fields['face_'+k].value),['4','3','2']);
 assert.deepEqual(Object.values(f.fields).slice(0,4).map(x=>x.value),['1','3','#abc','#123']);
 assert.equal(f.stats.writes,0);assert.equal(f.stats.redraw,1);
 assert.equal(f.player.appearance.face,3);
 assert.match(f.hint.textContent,/Nothing saved yet/);
});
test('body randomizer remains a no-op outside Studio or when physique has no alternatives',()=>{
 const f=fixture();for(const key of ['body','stature','exaggeration'])f.fields['face_'+key]={value:'1',options:[{value:'1'}]};
 assert.equal(f.context.randomizeBody(),false);assert.equal(f.stats.redraw,0);
 f.context.screen='HOME';assert.equal(f.context.randomizeBody(),false);
});
test('body randomizer is exposed through Studio without adding a game action',()=>{
 assert.match(ui,/button\('RANDOMIZE BODY','randomizeBody'\)/);
 assert.match(ui,/else if\(a==='randomizeBody'\)studioRandomizeBodyUnsaved\(\)/);
 assert.doesNotMatch(method,/localStorage\.setItem|saveAppearance\(/);
});

// Cosmetic-only unsaved randomization must not affect equipped abilities or player data.
test('accessory randomizer edits only accessory and tattoo, without writing career saves',()=>{
 const f=fixture({careerMode:true});
 f.fields.face_accessory={value:'0',options:[{value:'0'},{value:'2'}]};
 f.fields.face_tattoo={value:'1',options:[{value:'1'},{value:'5'}]};
 assert.equal(f.context.randomizeAccessories(()=>.99),true);
 assert.equal(f.fields.face_accessory.value,'2');assert.equal(f.fields.face_tattoo.value,'5');
 assert.deepEqual(['style','face','skin','hair'].map(k=>f.fields['face_'+k].value),['1','3','#abc','#123']);
 assert.equal(f.player.rating,90);assert.equal(f.player.magicTrick,'bat');
 assert.equal(f.stats.writes,0);assert.equal(f.stats.redraw,1);
 assert.equal(f.context.studioGallerySignature,'');
 assert.match(f.hint.textContent,/Nothing saved yet/);
});
test('accessory randomizer no-ops when unavailable and is bound to Studio',()=>{
 const f=fixture();f.fields.face_accessory={value:'0',options:[{value:'0'}]};
 f.fields.face_tattoo={value:'1',options:[{value:'1'}]};
 assert.equal(f.context.randomizeAccessories(),false);assert.equal(f.stats.redraw,0);
 f.context.screen='HOME';assert.equal(f.context.randomizeAccessories(),false);
 assert.match(ui,/button\('RANDOMIZE ACCESSORIES','randomizeAccessories'\)/);
 assert.match(ui,/a==='randomizeAccessories'\)studioRandomizeAccessoriesUnsaved\(\)/);
 assert.match(method,/\['accessory','tattoo'\]/);
});

// STUDIO-FULL-LOOK-LABEL-01: the original action randomizes every editable appearance field,
// not just facial features. Keep the existing action ID for saved UI/navigation compatibility.
test('full-look randomizer includes body and accessories without saving abilities or roster',()=>{
 const f=fixture({careerMode:true});
 for(const [key,values] of [['body',['1','3']],['tattoo',['0','2']],['accessory',['0','4']]]){
  f.fields['face_'+key]={value:values[0],options:values.map(value=>({value}))};
 }
 f.context.getAppearance=()=>Object.fromEntries(Object.keys(f.fields).map(id=>[id.slice(5),f.fields[id].value]));
 assert.equal(f.context.randomize(()=>.99),true);
 assert.equal(f.fields.face_body.value,'3');
 assert.equal(f.fields.face_tattoo.value,'2');
 assert.equal(f.fields.face_accessory.value,'4');
 assert.equal(f.player.appearance.face,3);
 assert.equal(f.player.rating,90);assert.equal(f.player.magicTrick,'bat');
 assert.equal(f.stats.writes,0);assert.equal(f.stats.redraw,1);
 assert.match(f.hint.textContent,/Random look previewed.*Nothing saved yet/);
 assert.match(ui,/button\('RANDOMIZE FULL LOOK','randomizeFace'\)/);
 assert.doesNotMatch(ui,/button\('RANDOMIZE FACE','randomizeFace'\)/);
});

test('studio randomizer skips disabled optgroups and blank placeholder choices',()=>{
 const f=fixture();
 f.fields.face_skin.options=[
  {value:'#abc'}, {value:'#forbidden',parentElement:{disabled:true}},
  {value:''}, {value:'#def',parentElement:{disabled:false}}
 ];
 assert.equal(f.context.randomize(()=>0),true);
 assert.equal(f.fields.face_skin.value,'#def');
 assert.equal(f.stats.writes,0);
 assert.equal(f.stats.redraw,1);
});
test('studio randomizer explains when no alternatives exist without redraw or saving',()=>{
 const f=fixture();
 for(const field of Object.values(f.fields))field.options=[{value:field.value}];
 assert.equal(f.context.randomize(),false);
 assert.equal(f.stats.redraw,0);
 assert.equal(f.stats.writes,0);
 assert.match(f.hint.textContent,/No alternate appearance options available/);
 assert.match(f.hint.textContent,/Nothing saved yet/);
 assert.equal(f.player.appearance.face,3);
});
