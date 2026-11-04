'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');

test('local setup exposes an accessible, temporary Super Shot trial selector and live preview',()=>{
 assert.match(ui,/data-action="setupArcadeShots">✨ Arcade Shot Trial/);
 assert.match(ui,/field\('SUPER SHOT','arcadeShotPick'/);
 assert.match(ui,/field\('HOME PLAYER','arcadeShotPlayerPick'/);
 assert.match(ui,/role="img" aria-label="Preview of selected Super Shot"/);
 assert.match(ui,/This temporary loadout uses the existing Jump\/Shoot combo and expires when the match ends/);
 assert.match(ui,/case 'arcadeShotPick':arcadeShotId=Object\.hasOwn\(SHOTS,e\.target\.value\)/);
 assert.match(ui,/case 'arcadeShotPlayerPick':arcadeShotPlayerId=roster\(home\)\.some/);
 assert.match(ui,/planFor\(home\)\.lineup\.includes\(index\)/,'only players starting on field should be selectable');
 assert.match(ui,/!p\.superAbility\|\|p\.superAbility\.type==='shoot'/,'do not offer a player whose exclusive specialty would be replaced');
 assert.match(ui,/\['quick','versus','training'\]\.includes\(mode\)/);
 assert.match(ui,/arcadeShotId,arcadeShotPlayerId/);
 assert.doesNotMatch(ui,/store\.put\(['"](?:arcadeShotId|arcadeShotPlayerId)['"]/);
});

test('engine rejects unknown catalog shots, non-outfield players, and non-local modes',()=>{
 assert.match(engine,/Object\.hasOwn\(SHOTS,trialShotId\)/);
 assert.match(engine,/\['quick','versus','training'\]\.includes\(this\.mode\)/);
 assert.match(engine,/\['MF','FW'\]\.includes\(trialPlayer\.role\)/);
 assert.match(engine,/this\.lineups\[0\]\?\.includes\(trialIndex\)/,'bench players cannot receive the temporary loadout');
});
