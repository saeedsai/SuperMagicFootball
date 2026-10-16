const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('illustrated concept renderer articulates two legs while running',()=>{
 const s=read('src/modules/concepthero.js');
 assert.match(s,/function layer\(full,sx,sw,part\)/);
 assert.match(s,/ctx\.rotate\(stride\*\.29\)/);
 assert.match(s,/parts\.body/);
 assert.match(s,/Math\.abs\(gait\)>\.07/);
});
test('matte cleaning uses precise interleg seed points and preserves the white kit',()=>{
 const s=read('scripts/clean_concept_hero_atlas.py');
 assert.match(s,/GAP_SEEDS=/);
 assert.match(s,/quarterFront/);
 assert.match(s,/quarterBack/);
 assert.match(s,/lossless=True/);
 assert.doesNotMatch(s,/remove_all_white|white_to_transparent/);
});
