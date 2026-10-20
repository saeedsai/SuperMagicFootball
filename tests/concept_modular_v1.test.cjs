const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('C01 front face and both existing hair layers remain genuinely editable',()=>{
 const m=JSON.parse(read('assets/characters/concept_modular_v1/manifests/rig.json'));
 assert.equal(m.schema,'smf-concept-modular/1');
 assert.deepEqual(m.authoredViews,['front','back']);
 const layers=[m.runtimeLayer,...m.additionalLayers];
 assert.deepEqual(layers.map(l=>l.id),['hair_front_001','arm_far_front_001','torso_front_001','torso_collar_front_001','face_front_001','arm_near_front_001','hair_back_001','torso_back_001']);
 for(const layer of layers){
  const name=layer.asset.split('/').pop(),svg=read('assets/characters/concept_modular_v1/source/'+name);
  assert.match(svg,/viewBox="0 0 (112|115) 265"/);
  assert.ok((svg.match(/<path /g)||[]).length>=12);
  assert.doesNotMatch(svg,/<image |<rect /);
  assert.equal(layer.noMirroring,true);
 }
 const torso=layers[2];
 assert.equal(torso.id,'torso_front_001');
 assert.equal(torso.kind,'torso');
 assert.equal(torso.shirtNumber,'10');
 assert.deepEqual(torso.pivot,[56,151]);
 assert.deepEqual(torso.alphaBoundsEstimate,[24,118,89,195]);
 assert.equal(torso.legacyBodyUnderlay,true);
 assert.ok(torso.z>8&&torso.z<9);
 const torsoSvg=read('assets/characters/concept_modular_v1/source/torso_front.svg');
 for(const id of torso.partGroups)assert.ok(torsoSvg.includes('id="'+id+'"'),id);
 assert.ok((torsoSvg.match(/<path /g)||[]).length>=28);
 assert.doesNotMatch(torsoSvg,/<(?:rect|image)\s/i);
 const backTorso=layers.find(l=>l.id==='torso_back_001');
 assert.equal(backTorso.kind,'torso');
 assert.equal(backTorso.view,'back');
 assert.equal(backTorso.shirtNumber,'10');
 assert.deepEqual(backTorso.pivot,[57,152]);
 assert.equal(backTorso.noMirroring,true);
 assert.equal(backTorso.legacyBodyUnderlay,true);
 const rearSvg=read('assets/characters/concept_modular_v1/source/torso_back.svg');
 for(const group of backTorso.partGroups)assert.ok(rearSvg.includes('id="'+group+'"'),group);
 assert.doesNotMatch(rearSvg,/<(?:rect|image)\s/i);
 const collar=layers[3];
 assert.equal(collar.id,'torso_collar_front_001');
 assert.equal(collar.kind,'torso_collar');
 assert.deepEqual(collar.pivot,[56,122]);
 assert.deepEqual(collar.alphaBoundsEstimate,[23,107,89,144]);
 assert.ok(collar.z>8&&collar.z<10);
 assert.equal(collar.legacyBodyUnderlay,true);
 const collarSvg=read('assets/characters/concept_modular_v1/source/torso_collar_front.svg');
 for(const id of collar.partGroups)assert.ok(collarSvg.includes('id="'+id+'"'));
 assert.ok((collarSvg.match(/<path /g)||[]).length>=15);
 assert.ok(!/<image |<rect /i.test(collarSvg),'no opaque backing or embedded raster');
 const far=layers[1];
 assert.equal(far.id,'arm_far_front_001');
 assert.deepEqual(far.pivot,[23,126]);assert.deepEqual(far.hand,[11,189]);
 assert.equal(far.animation.rotationRadiansPerPhase,.035);
 assert.equal(far.animation.oppositeId,'arm_near_front_001');
 const arm=layers[5];
 assert.equal(arm.id,'arm_near_front_001');
 assert.deepEqual(arm.shoulder,[90,126]);assert.deepEqual(arm.pivot,[90,126]);
 assert.deepEqual(arm.elbow,[102,164]);assert.deepEqual(arm.wrist,[104,174]);assert.deepEqual(arm.hand,[104,182]);
 assert.equal(arm.animation.rotationRadiansPerPhase,-.035);
 assert.equal(arm.animation.channel,'legacy_run_phase');
 assert.ok(arm.z>10&&arm.z<20);
 const armSvg=read('assets/characters/concept_modular_v1/source/arm_near_front.svg');
 for(const part of ['near-sleeve','near-upper-arm','near-forearm','near-wristband','near-hand'])
  assert.ok(armSvg.includes('id="'+part+'"'));
 const face=layers[4];
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
 assert.match(mod,/CONCEPT_MODULAR_ARM_INLINE/);
 assert.match(mod,/CONCEPT_MODULAR_FAR_ARM_INLINE/);
 assert.match(mod,/CONCEPT_MODULAR_COLLAR_INLINE/);
 assert.match(mod,/CONCEPT_MODULAR_TORSO_INLINE/);
 assert.match(mod,/CONCEPT_MODULAR_BACK_TORSO_INLINE/);
 assert.match(mod,/states\.backTorso\.image/);
 assert.match(mod,/backTorsoLoaded:ready\('backTorso'\)/);
 assert.match(read('sw.js'),/torso_back\.svg/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_BACK_TORSO_INLINE/);
 assert.match(mod,/if\(!art\)return false/);
 assert.match(mod,/kind==='front'&&\(!states\.frontFace\?\.ready\|\|!states\.frontArm\?\.ready\|\|!states\.frontFarArm\?\.ready\|\|!states\.frontCollar\?\.ready\|\|!states\.frontTorso\?\.ready\)/);
 assert.match(mod,/if\(!CONCEPT_HERO\.draw\(ctx,p,view,\{run\}\)\)return false/);
 const far=mod.indexOf('ctx.drawImage(states.frontFarArm.image');
 const torsoDraw=mod.indexOf('ctx.drawImage(states.frontTorso.image');
 const collarDraw=mod.indexOf('ctx.drawImage(states.frontCollar.image');
 const face=mod.indexOf('ctx.drawImage(states.frontFace.image');
 const arm=mod.indexOf('ctx.drawImage(states.frontArm.image');
 const hair=mod.indexOf('ctx.drawImage(state.image');
 assert.ok(far>0&&far<torsoDraw&&torsoDraw<collarDraw&&collarDraw<face&&face<arm&&arm<hair,'paint far arm behind face/near arm and both below hair');
 assert.match(mod,/const armStride=-armPhase\*\.035/);
 assert.match(mod,/ctx\.rotate\(sway\)/);
 assert.match(read('src/modules/render.js'),/CONCEPT_MODULAR\.draw\(ctx,p,view/);
 assert.match(read('src/modules/render.js'),/CONCEPT_HERO\.draw\(ctx,p,view/);
 assert.match(read('sw.js'),/face_front_front\.svg/);
 assert.match(read('sw.js'),/arm_near_front\.svg/);
 assert.match(read('sw.js'),/arm_far_front\.svg/);
 assert.match(read('sw.js'),/torso_collar_front\.svg/);
 assert.match(read('sw.js'),/torso_front\.svg/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_FACE_INLINE/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_ARM_INLINE/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_FAR_ARM_INLINE/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_COLLAR_INLINE/);
 assert.match(read('scripts/build.py'),/CONCEPT_MODULAR_TORSO_INLINE/);
});

test('C01 near-arm gait is a small visual-only transformation, not new gameplay motion',()=>{
 const art=read('src/modules/conceptmodular.js');
 assert.match(art,/const ax=\(90-56\)\*ratio,ay=-LOGICAL_HEIGHT\+6\+126\*ratio/);
 assert.match(art,/const armStride=-armPhase\*\.035/);
 assert.match(art,/ctx\.translate\(ax,ay\);ctx\.rotate\(armStride\);ctx\.translate\(-ax,-ay\)/);
 assert.ok(!/engine\.|p\.x\s*=|p\.y\s*=|p\.dx\s*=/.test(art),'Graphics must not mutate gameplay motion');
 assert.match(read('sw.js'),/smf-082538-concept-front-hair-v1-rear-v2-face-v3-arm-v4-far-v5/);
});

test('front far painted arm is source-authored, transparent and rotates opposite to near arm without engine mutation',()=>{
 const svg=read('assets/characters/concept_modular_v1/source/arm_far_front.svg');
 for(const group of ['far-shoulder-and-sleeve','far-upper-arm','far-elbow-crease','far-forearm','far-wrist-tape','far-fist'])
  assert.ok(svg.includes('id="'+group+'"'),group);
 const m=JSON.parse(read('assets/characters/concept_modular_v1/manifests/rig.json'));
 const layers=[m.runtimeLayer,...m.additionalLayers];
 const far=layers.find(l=>l.id==='arm_far_front_001'),near=layers.find(l=>l.id==='arm_near_front_001');
 assert.equal(far.animation.rotationRadiansPerPhase,-near.animation.rotationRadiansPerPhase);
 assert.equal(far.animation.rootOwner,'Renderer');
 const mod=read('src/modules/conceptmodular.js');
 assert.match(mod,/const farArmStride=armPhase\*\.035/);
 assert.match(mod,/ctx\.translate\(fx,fy\);ctx\.rotate\(farArmStride\);ctx\.translate\(-fx,-fy\)/);
 assert.match(mod,/farArmLoaded:ready\('frontFarArm'\),frontArmStrideEnabled:true,reciprocalArmsEnabled:true,collarLoaded:ready\('frontCollar'\)/);
});

test('C01 front arm strokes ease through idle without a phase threshold snap or gameplay mutation',()=>{
 const vm=require('node:vm');
 const mod=read('src/modules/conceptmodular.js');
 assert.match(mod,/const armBlend=Math\.min\(1,Math\.abs\(phase\)\/\.18\)/);
 assert.match(mod,/const armPhase=phase\*armBlend\*armBlend\*\(3-2\*armBlend\)/);
 const testSource=mod.replace(/^import[^\n]*\n/m,'')
  .replaceAll('import.meta.url',"'https://example.test/src/modules/conceptmodular.js'")
  .replace(/^export .*$/m,'')+'\nglobalThis.__model=CONCEPT_MODULAR;';
 class LoadedImage{
  set src(uri){
   this.naturalWidth=(uri.includes('hair_back_back.svg')||uri.includes('torso_back.svg'))?115:112;
   this.naturalHeight=265;
   if(this.onload)this.onload();
  }
 }
 const sandbox={Image:LoadedImage,URL,CONCEPT_HERO:{draw:()=>true}};
 vm.runInNewContext(testSource,sandbox,{timeout:1500});
 const model=sandbox.__model;
 assert.equal(model.status().loaded,true,'all eight authored prototype layers loaded');
 function turns(phase,kind='front'){
  const rotations=[];
  const ctx={save(){},restore(){},translate(){},drawImage(){},rotate(v){rotations.push(v);}};
  const drawn=model.draw(ctx,{src:{renderModel:'concept_modular_v1'}},{kind},{run:phase});
  return {drawn,rotations};
 }
 assert.equal(turns(0).drawn,true);
 assert.deepEqual(turns(0).rotations,[0,-0,0]);
 for(const p of [-1,-.75,-.1,-.070001,-.07,-.069999,0,.069999,.07,.070001,.1,.75,1]){
  const a=turns(p).rotations;
  assert.equal(a.length,3,'far arm, near arm, hair');
  assert.ok(Math.abs(a[0]+a[1])<1e-12,'arms counter-swing symmetrically');
  assert.ok(Math.abs(a[0])<=.035+1e-12,'no extra shoulder amplitude');
 }
 const before=turns(.069999).rotations[0];
 const after=turns(.070001).rotations[0];
 assert.ok(Math.abs(after-before)<.000005,'no visible discontinuity at old cutoff');
 assert.ok(Math.abs(turns(.07).rotations[0])<.001,'near-idle swing fades smoothly');
 assert.ok(Math.abs(turns(.1).rotations[0])<Math.abs(turns(.2).rotations[0]),'swing ramps');
 assert.equal(turns(.75).rotations[0],.75*.035,'full gait strength unchanged');
 assert.equal(turns(-.75).rotations[0],-.75*.035);
 assert.equal(turns(.6,'right').drawn,false,'unauthored side retains fallback');
 assert.equal(turns(.6,'back').drawn,true,'authored back still renders');
 assert.equal(turns(.6,'back').rotations.length,1,'no front arm drawn from behind');
});

test('C01 optional demo collar requires a valid image and does not change legacy fallback',()=>{
 const vm=require('node:vm');
 const moduleText=read('src/modules/conceptmodular.js')
  .replace(/^import[^\n]*\n/m,'')
  .replaceAll('import.meta.url',"'https://example.test/src/modules/conceptmodular.js'")
  .replace(/^export .*$/m,'')+'\nglobalThis.__mod=CONCEPT_MODULAR;';
 class ImageMissingCollar{
  set src(uri){
   this.naturalWidth=(uri.includes('hair_back_back.svg')||uri.includes('torso_back.svg'))?115:112;
   this.naturalHeight=uri.includes('torso_collar_front.svg')?264:265;
   if(this.onload)this.onload();
  }
 }
 const scope={Image:ImageMissingCollar,URL,CONCEPT_HERO:{draw:()=>true}};
 vm.runInNewContext(moduleText,scope,{timeout:1500});
 assert.equal(scope.__mod.status().collarLoaded,false);
 assert.equal(scope.__mod.draw({save(){},restore(){}},{src:{renderModel:'concept_modular_v1'}},{kind:'front'}),false);
 assert.equal(scope.__mod.supports({src:{renderModel:'concept_hero'}}),false);
});

test('C01 painted jersey falls back without partial graphics if its source dimensions are wrong',()=>{
 const vm=require('node:vm'),src=read('src/modules/conceptmodular.js')
  .replace(/^import[^\n]*\n/m,'')
  .replaceAll('import.meta.url',"'https://example.test/src/modules/conceptmodular.js'")
  .replace(/^export .*$/m,'')+'\nglobalThis.__art=CONCEPT_MODULAR;';
 let legacyCalls=0;
 class CorruptTorso{
  set src(uri){
   this.naturalWidth=(uri.includes('hair_back_back.svg')||uri.includes('torso_back.svg'))?115:112;
   this.naturalHeight=uri.includes('torso_front.svg')?264:265;
   if(this.onload)this.onload();
  }
 }
 const sandbox={Image:CorruptTorso,URL,CONCEPT_HERO:{draw:()=>{legacyCalls++;return true;}}};
 vm.runInNewContext(src,sandbox,{timeout:1500});
 assert.equal(sandbox.__art.status().torsoLoaded,false);
 assert.equal(sandbox.__art.status().loaded,false);
 assert.equal(sandbox.__art.draw({},{src:{renderModel:'concept_modular_v1'}},{kind:'front'}),false);
 assert.equal(legacyCalls,0,'must not paint a partial front head/body');
 assert.equal(sandbox.__art.draw({},{src:{renderModel:'concept_modular_v1'}},{kind:'right'}),false);
});
