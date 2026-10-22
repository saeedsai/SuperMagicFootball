const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('src/modules/abilities.js','utf8');
test('Studio defence catalogue remains bounded and read-only',()=>{
 assert.match(source,/function studioDefenceChoices\(player\)/);
 assert.match(source,/role!=='DF'/);
 assert.match(source,/abilityLevel\(player,'defence'\)/);
 assert.match(source,/level<3/);
 assert.match(source,/player\?\.src\|\|player/);
 assert.match(source,/id==='spinBumper'/);
 assert.match(source,/return \{DEFENCE_MOVES,KEEPER_MOVES,studioDefenceChoices/);
 assert.doesNotMatch(source.slice(source.indexOf('function studioDefenceChoices'),source.indexOf('function fieldAbility')),/localStorage|\.push\(|\.superAbility\s*=/);
});
