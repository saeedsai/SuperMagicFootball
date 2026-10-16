const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('real editable illustrated source and one-view manifest',()=>{
 const m=JSON.parse(read('assets/characters/concept_modular_v1/manifests/rig.json'));
 assert.equal(m.schema,'smf-concept-modular/1');
 assert.deepEqual(m.authoredViews,['front']);assert.equal(m.fallbackModel,'concept_hero');
 const art=read('assets/characters/concept_modular_v1/source/hair_front_front.svg');
 assert.match(art,/viewBox="0 0 112 265"/);assert.ok((art.match(/<path /g)||[]).length>=12);assert.doesNotMatch(art,/<image |<rect /);
});
test('one opt-in demo player, no normal roster/default changes',()=>{
 const ui=read('src/modules/ui.js');
 assert.match(ui,/conceptModularPreview/);
 assert.match(ui,/CONCEPT_DEMO_ROSTER\[9\]\.renderModel='concept_modular_v1'/);
 assert.match(ui,/renderModel:'concept_hero'/);
});
test('ready/front-only paint and original-painted/procedural fallback',()=>{
 assert.match(read('src/modules/conceptmodular.js'),/if\(!ready\|\|view\?\.kind!=='front'\)return false/);
 assert.match(read('src/modules/render.js'),/CONCEPT_MODULAR\.draw\(ctx,p,view/);
 assert.match(read('src/modules/render.js'),/CONCEPT_HERO\.draw\(ctx,p,view/);
 assert.match(read('sw.js'),/conceptmodular/);
});
