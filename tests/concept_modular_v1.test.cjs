const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('C01 front face and both existing hair layers remain genuinely editable',()=>{
 const m=JSON.parse(read('assets/characters/concept_modular_v1/manifests/rig.json'));
 assert.equal(m.schema,'smf-concept-modular/1');
 assert.deepEqual(m.authoredViews,['front','back']);
 const layers=[m.runtimeLayer,...m.additionalLayers];
 assert.deepEqual(layers.map(l=>l.id),['hair_front_001','face_front_001','hair_back_001']);
 for(const layer of layers){
  const name=layer.asset.split('/').pop(),svg=read('assets/characters/concept_modular_v1/source/'+name);
  assert.match(svg,/viewBox="0 0 (112|115) 265"/);
  assert.ok((svg.match(/<path /g)||[]).length>=12);
  assert.doesNotMatch(svg,/<image |<rect /);
  assert.equal(layer.noMirroring,true);
 }
 const face=layers[1];
 assert.equal(face.z,10);assert.equal(m.runtimeLayer.z,20);
 assert.deepEqual(face.pivot,[56,99]);assert.deepEqual(face.headCenter,[56,78]);
 const svg=read('assets/characters/concept_modular_v1/source/face_front_front.svg');
 for(const id of ['ears','head-skin','eyebrows','eye-whites','irises','nose','mouth'])
  assert.ok(svg.includes('id="'+id+'"'),'Missing editable group '+id);
});
test('opt-in single prototype maintains default demo model and saved player data',()=>{
 const ui=read('src/modules/ui.js');
 assert.match(ui,/conceptModularPreview/);
 assert.match(ui,/CONCEPT_DEMO_ROSTER\[9\]\.renderModel='concept_modular_v1'/);
 assert.match(ui,/renderModel:'concept_hero'/);
});
test('new face paints below hair only after safe image loading, six-view fallback preserved',()=>{
 const mod=read('src/modules/conceptmodular.js');
 assert.match(mod,/front:\{width:112/);
 assert.match(mod,/back:\{width:115/);
 assert.match(mod,/CONCEPT_MODULAR_FACE_INLINE/);
 assert.match(mod,/if\(!art\)return false/);
 assert.match(mod,/kind==='front'&&!states\.frontFace\?\.ready/);
 assert.match(mod,/if\(!CONCEPT_HERO\.draw\(ctx,p,view,\{run\}\)\)return false/);
 const face=mod.indexOf('ctx.drawImage(states.frontFace.image');
 const hair=mod.indexOf('ctx.drawImage(state.image');
 assert.ok(face>0&&face<hair,'face must be painted below hair');
 assert.match(mod,/ctx\.rotate\(sway\)/);
 assert.match(read('src/modules/render.js'),/CONCEPT_MODULAR\.draw\(ctx,p,view/);
 assert.match(read('src/modules/render.js'),/CONCEPT_HERO\.draw\(ctx,p,view/);
 assert.match(read('sw.js'),/face_front_front\.svg/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_FACE_INLINE/);
});
