'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const mechanics=JSON.parse(fs.readFileSync(path.join(root,'data/mechanics/gameplay.json'),'utf8'));
const venues=mechanics.stadiums;
test('STADIUM-01 catalog has 20 named, distinct, sourced venues and original-art notes',()=>{
 assert.equal(venues.length,20);
 assert.equal(new Set(venues.map(v=>v.id)).size,20);
 assert.equal(new Set(venues.map(v=>v.name)).size,20);
 assert.equal(new Set(venues.map(v=>v.palette.join('|'))).size,20);
 assert.deepEqual(venues.map(v=>v.profile).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i));
 assert.deepEqual(venues.map(v=>v.surfacePattern).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i));
 assert.deepEqual(venues.map(v=>v.profile).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i));
 assert.deepEqual(venues.map(v=>v.surfacePattern).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i));
 for(const v of venues){assert.ok(v.name&&v.city&&v.sourceNote.includes('original'),v.id);assert.match(v.source,/^https:\/\//);assert.equal(v.palette.length,4);assert.ok(v.palette.every(c=>/^#[0-9a-f]{6}$/i.test(c)));assert.ok([0,1,2,3,4].includes(v.bowl));assert.ok([0,1,2,3,4].includes(v.roof));assert.ok([0,1,2,3,4].includes(v.ambience));}
 assert.equal(mechanics.defaultOptions.stadium,venues[0].id);
});
test('legacy options inherit the safe default; UI validates picker values and persists selection',()=>{
 const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8'),render=fs.readFileSync(path.join(root,'src/modules/render.js'),'utf8');
 const defaults={...mechanics.defaultOptions,weather:'Clear',...{}};
 const oldSave={difficulty:2,terrain:'Classic'};
 const migrated={...defaults,...oldSave};
 assert.equal(migrated.stadium,'classic-bowl');
 assert.match(ui,/if\(!STADIUMS\.some\(v=>v\.id===opt\.stadium\)\)opt\.stadium=DEFAULT_OPTIONS\.stadium/);
 assert.match(ui,/STADIUMS\.map\(v=>\[v\.id,v\.name\+' · '\+v\.city\]\)/);
 assert.match(ui,/store\.put\('options',opt\);break;case 'halfSeconds'/);
 assert.match(ui,/\['settingsStadium','stadium',v=>STADIUMS\.some\(s=>s\.id===v\)\?v:DEFAULT_OPTIONS\.stadium\]/);
 assert.match(render,/this\.stadiumCacheKey!==key/);
 assert.match(render,/this\.activeVenueId=game\.options\?\.stadium/);
 assert.match(render,/drawVenueSurface\(ctx,game\)/);
 assert.match(render,/drawVenueMarkings\(ctx,game\)/);
 assert.match(render,/surfacePattern/);
});
