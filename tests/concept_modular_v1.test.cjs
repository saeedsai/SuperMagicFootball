const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('two editable painted hair layers and correct per-view source canvases',()=>{
 const m=JSON.parse(read('assets/characters/concept_modular_v1/manifests/rig.json'));
 assert.equal(m.schema,'smf-concept-modular/1');
 assert.deepEqual(m.authoredViews,['front','back']);assert.equal(m.fallbackModel,'concept_hero');
 const layers=[m.runtimeLayer,...m.additionalLayers];
 assert.deepEqual(layers.map(l=>l.id),['hair_front_001','hair_back_001']);
 for(const l of layers){
  const art=read('assets/characters/concept_modular_v1/source/'+(l.view==='front'?'hair_front_front.svg':'hair_back_back.svg'));
  assert.match(art,/viewBox="0 0 (112|115) 265"/);
  assert.ok((art.match(/<path /g)||[]).length>=12);
  assert.doesNotMatch(art,/<image |<rect /);assert.equal(l.noMirroring,true);
 }
});
test('one opt-in demo player and no original team data edits',()=>{
 const ui=read('src/modules/ui.js');
 assert.match(ui,/conceptModularPreview/);
 assert.match(ui,/CONCEPT_DEMO_ROSTER\[9\]\.renderModel='concept_modular_v1'/);
 assert.match(ui,/renderModel:'concept_hero'/);
});
test('front/rear illustration plus bounded hair motion preserves six-view original fallback',()=>{
 const mod=read('src/modules/conceptmodular.js');
 assert.match(mod,/front:\{width:112/);assert.match(mod,/back:\{width:115/);
 assert.match(mod,/if\(!art\)return false/);
 assert.match(mod,/if\(!state\?\.ready\)\{preload\(\);return false;\}/);
 assert.match(mod,/if\(!CONCEPT_HERO\.draw\(ctx,p,view,\{run\}\)\)return false/);
 assert.match(mod,/ctx\.rotate\(sway\)/);
 assert.match(read('src/modules/render.js'),/CONCEPT_MODULAR\.draw\(ctx,p,view/);
 assert.match(read('src/modules/render.js'),/CONCEPT_HERO\.draw\(ctx,p,view/);
 assert.match(read('sw.js'),/hair_back_back\.svg/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_BACK_INLINE/);
});
