'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ui=read('src/modules/ui.js'),css=read('style.css'),render=read('src/modules/render.js'),art=read('src/modules/characterart.js'),html=read('index.html');
const home=ui.slice(ui.indexOf('function showHome(){'),ui.indexOf('function drawPoster(){'));
test('arena overhaul retains exactly Pass Shoot Dribble Jump and the same input binding',()=>{
 const buttons=html.match(/<div id="touchButtons"[^>]*>(.*?)<\/div>/s);assert.ok(buttons);
 assert.deepEqual([...buttons[1].matchAll(/data-act="([^"]+)"/g)].map(m=>m[1]).sort(),['dribble','jump','pass','shoot']);
 assert.match(read('src/modules/input.js'),/REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/);
});
test('new home hub offers valid existing routes and retains About-only release',()=>{
 for(const route of ['navQuick','navOnline','navCareer','navCups','navSettings','navCustomization','navCareerSlots','navAbout'])assert.ok(home.includes(route),'missing route '+route);
 for(const token of ['arcadeHeroStrip','arcadeLaunch','arenaShortcutRow','posterCanvas'])assert.ok(home.includes(token),token);
 assert.match(ui,/function menuChoices\(/);
 assert.match(ui,/arenaDirectoryLabel/);
 assert.doesNotMatch(home,/DEV VERSION|LATEST DEV VERSION|\+dev\./);
});
test('original arcade presentation covers menu, HUD, responsive touch and reduced motion',()=>{
 for(const token of ['ARENA-OVERHAUL-01','arcadeHeroStrip','navMainList','navScreen .navList','scoregroup','hudright','joyStick','touchButtons','studioEightViewGallery'])assert.ok(css.includes(token),'missing '+token);
 for(const token of ['safe-area-inset-top','safe-area-inset-right','safe-area-inset-bottom','prefers-reduced-motion:reduce',':focus-visible'])assert.ok(css.includes(token),'missing '+token);
});
test('renderer draws cached stadium and pitch graphics with visual-only player cue',()=>{
 assert.match(render,/paintArenaAccents\(ctx\)\{/);
 assert.match(render,/terrain==='Classic'\?\['#33844a','#3e9955'\]/);
 assert.match(render,/this\.fieldCache/);
 assert.match(render,/if\(p\.controlled\)\{ctx\.save\(\);const bob=/);
 assert.match(art,/Direction-aware gold seam highlight/);
 assert.equal((render.match(/paintArenaAccents\(ctx\)\{/g)||[]).length,1);
});
test('About version README offline cache and package agree for the new candidate',()=>{
 const pkg=JSON.parse(read('package.json')),release=read('src/modules/release.js'),readme=read('README.md'),sw=read('sw.js'),policy=read('docs/VERSIONING_POLICY.md');
 assert.equal(pkg.version,'0.12.0.0');
 assert.ok(release.includes("version:'"+pkg.version+"'"));
 assert.ok(readme.startsWith('> **'+pkg.version+' release candidate'));
 assert.ok(readme.includes('# Supermagic Football · v'+pkg.version));
 assert.ok(sw.includes('// '+pkg.version+' modular offline shell'));
 assert.ok(policy.includes('About-only '+pkg.version));
});
