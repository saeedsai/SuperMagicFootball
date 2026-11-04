const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/modules/abilities.js','utf8');
test('Studio defence catalogue remains bounded and read-only',()=>{
 assert.match(source,/function studioDefenceChoices\(player,selectedTier\)/);
 assert.match(source,/role!=='DF'/);
 assert.match(source,/abilityLevel\(player,'defence'\)/);
 assert.match(source,/id==='spinBumper'\?3:id==='fireWall'\?2:id==='iceWall'\?3:id==='demonWall'\?4/);
 assert.match(source,/Number\(source\?\.rating\)>=86\?3/);
 assert.match(source,/superDefenceLevel/);
 assert.match(source,/player\?\.src\|\|player/);
 assert.match(source,/Object\.keys\(DEFENCE_MOVES\)/,'Studio picker derives choices only from explicit mechanics catalogue entries');
 assert.match(source,/return \{DEFENCE_MOVES,KEEPER_MOVES,STUDIO_SHOT_POLICY,STUDIO_DEFENCE_IDS,STUDIO_DEFENCE_POLICY/);
 assert.doesNotMatch(source.slice(source.indexOf('function studioDefenceChoices'),source.indexOf('// Integrated from work/studio-defence-ability-20261022')),/localStorage|\.push\(|\.superAbility\s*=/);
});
