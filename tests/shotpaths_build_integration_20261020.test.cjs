'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
test('single-file Chromium fixture embeds SHOTPATHS once before the playable engine',()=>{
 const build=source('scripts/build.py'),sw=source('sw.js');
 for(const s of [build,sw])assert.match(s,/'physicsbalance','shotpaths','magic-hazards','engine'/);
 const fixture=source('tests/.generated/game.js');
 const helper=fixture.indexOf('const SHOTPATHS=Object.freeze(');
 const engine=fixture.indexOf('const ENGINE=(()=>{');
 assert.ok(helper>=0,'generated test fixture must declare SHOTPATHS');
 assert.ok(engine>helper,'SHOTPATHS must be loaded before engine, not after');
 assert.equal((fixture.match(/const SHOTPATHS=Object\.freeze\(/g)||[]).length,1,'no duplicate helper');
 assert.equal((fixture.match(/SHOTPATHS\.zigzagStep\(/g)||[]).length,2);
 assert.doesNotMatch(fixture,/import \{SHOTPATHS\} from/,'fixture must remain standalone');
 assert.match(sw,/src\/modules\/.*\+m\+'\.js'/);
});
test('real module import, offline precache and stale-cache eviction stay intact',()=>{
 const engine=source('src/modules/engine.js'),sw=source('sw.js');
 assert.match(engine,/import \{SHOTPATHS\} from "\.\/shotpaths\.js"/);
 assert.match(engine,/SHOTPATHS\.zigzagStep\(/);
 assert.match(sw,/const CACHE='[^']+-sh01-live-v1(?:-[^']+)?'/,'shotpaths cache version must survive future cache rotations');
 assert.match(sw,/const MODULES=\[/);
 assert.match(sw,/caches\.delete/);
});
