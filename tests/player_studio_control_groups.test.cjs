'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const ui=fs.readFileSync('src/modules/ui.js','utf8'),css=fs.readFileSync('style.css','utf8');
test('Player Studio groups appearance selectors while preserving all existing field IDs and catalog options',()=>{
 assert.match(ui,/class="studioControlGroup"><legend>SKIN & HAIR COLOR/);
 for(const group of ['FACE & HAIR','BODY','PERSONAL DETAILS'])assert.ok(ui.includes("['"+group+"',"),group);
 for(const id of ['style','face','eyes','brows','eyeColor','nose','lips','beard','body','stature','exaggeration','accessory','freckles','scar','tattoo']){
  assert.ok(ui.includes("['"+id+"',"),'missing existing appearance control '+id);
 }
 assert.match(ui,/id="face_\$\{id\}"/,'existing face_* control IDs remain derived from catalog IDs');
 assert.match(ui,/studioNumberOptions\(id,av\[id\]\?\?0\)/,'the existing selected value/catalog remains the data source');
 assert.match(ui,/studioColorField\('face_skin','SKIN TONE'/);assert.match(ui,/studioColorField\('face_hair','HAIR COLOR'/);
});
test('customization groups use native accessible fieldsets and responsive two-column control rows',()=>{
 assert.match(ui,/fieldset class="studioControlGroup"><legend>\$\{title\}<\/legend><div class="studioOptionGrid">/);
 assert.match(css,/\.studioControlGroup\{[^}]*border-radius:12px/);
 assert.match(css,/\.studioOptionGrid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/\.studioOptionGrid>label\{[^}]*display:grid/);
 assert.match(css,/@media\(max-width:650px\)\{\.studioControlGroup/);
});
