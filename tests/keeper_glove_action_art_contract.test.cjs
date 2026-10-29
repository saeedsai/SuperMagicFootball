'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const art=read('src/modules/characterart.js');
const arm=art.slice(art.indexOf('function arm('),art.indexOf('function jersey('));
test('goalkeeper catch and dive poses have distinct padded palms',()=>{
 assert.match(arm,/GK-GLOVE-ART-01/);
 assert.match(arm,/if\(p\.keeper\)/);
 for(const action of ['keeperDive','keeperDiveCatch','keeperCatch','keeperSuper'])assert.ok(arm.includes("'"+action+"'"),action);
 assert.match(arm,/if\(catchingGlove\)/);
 assert.match(arm,/oval\(c,hand\[0\],hand\[1\],5\.1,5\.6/);
});
test('visual-only glove change retains eight-view painter and four controls',()=>{
 assert.match(art,/const k=views\[view\?\.kind\]/);
 assert.match(art,/return \{draw,headSpecs:/);
 const ui=read('src/modules/ui.js');
 assert.match(ui,/const actions=\['pass','shoot','dribble','jump'\]/);
});
test('player-facing candidate rotates package, About notes, README and cache',()=>{
 const version=JSON.parse(read('package.json')).version;
 assert.equal(JSON.parse(read('package.json')).version,version);
 assert.ok(read('src/modules/release.js').includes("version:'"+version+"'"));
 assert.ok(read('README.md').startsWith('> **'+version+' release candidate'));
 assert.ok(read('README.md').includes('# Supermagic Football · v'+version+' ·'));
 assert.ok(read('sw.js').includes('-'+version.replace(/\./g,'')+"';"));
 assert.match(read('src/modules/release.js'),/GK-GLOVE-ART-01/);
});
