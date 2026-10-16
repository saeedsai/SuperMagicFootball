const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const text=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
test('prototype is explicitly isolated from the original 223 teams',()=>{
 const ui=text('src/modules/ui.js');
 assert.match(ui,/const CONCEPT_DEMO_ID='demo_concept_royals'/);
 assert.match(ui,/group:'concept_demo'/);
 assert.match(ui,/TEAMS\.push\(\{id:CONCEPT_DEMO_ID/);
 assert.match(ui,/CONCEPT_DEMO_ROLES=\['GK','GK','DF','DF','DF','MF','MF','MF','MF','FW','FW','FW'\]/);
 assert.match(ui,/a==='conceptDemo'/);
 assert.match(ui,/navItem\('★ PLAY CONCEPT ROYALS FC','conceptDemo'/);
});
test('exact reference sprites exist as valid WebP and are not rendered for existing teams',()=>{
 const file=fs.readFileSync(path.join(ROOT,'assets/concept_hero/hero_atlas.webp'));
 assert.ok(file.length>40000);
 assert.equal(file.toString('ascii',0,4),'RIFF');
 assert.equal(file.toString('ascii',8,12),'WEBP');
 const art=text('src/modules/concepthero.js');
 assert.match(art,/p\?\.src\?\.renderModel===ID/);
 assert.match(art,/ctx\.drawImage\(atlas\.image/);
 assert.match(text('src/modules/render.js'),/if\(!CONCEPT_HERO\.draw\(ctx,p,view,/);
});
test('offline, modular imports and inline fixture contain the actual raster assets',()=>{
 const sw=text('sw.js'),build=text('scripts/build.py');
 assert.match(sw,/smf-082537-keeper-lateral-lunge-v1/);
 assert.match(sw,/assets\/concept_hero/);
 assert.match(build,/CONCEPT_HERO_INLINE/);
 assert.match(build,/'concepthero','render'/);
 const fixture=text('tests/.generated/game.js');
 assert.match(fixture,/data:image\/webp;base64/);
});
