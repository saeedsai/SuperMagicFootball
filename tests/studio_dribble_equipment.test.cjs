'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const source=fs.readFileSync('src/modules/dribbles.js','utf8')
 .replace(/^import .*;\s*$/gm,'').replace(/export \{DRIBBLES\};?/,'');
const DRIBBLES=vm.runInNewContext(source+'\nDRIBBLES;', {GAME_ASSETS:{mechanics}});
const player=(role='MF')=>({id:'fixed-123',name:'Studio Example',role,appearance:{face:2},stamina:88,superAbility:{id:'shoot'}});

test('Player Studio exposes exactly ten existing trick styles',()=>{
 assert.equal(DRIBBLES.DRIBBLE_STYLES.length,10);
 assert.equal(new Set(DRIBBLES.DRIBBLE_STYLES.map(s=>s.id)).size,10);
 for(const s of DRIBBLES.DRIBBLE_STYLES)assert.equal(DRIBBLES.dribbleStyle(s.id).id,s.id);
});
test('outfield style equipment preserves identity, attributes and original record',()=>{
 const before=player(),snapshot=JSON.stringify(before);
 for(const style of DRIBBLES.DRIBBLE_STYLES){
  const equipped=DRIBBLES.withStudioDribble(before,style.id);
  assert.equal(equipped.dribbleType,style.id);
  assert.equal(equipped.id,before.id);
  assert.equal(equipped.appearance,before.appearance);
  assert.equal(equipped.superAbility,before.superAbility);
  assert.equal(equipped.stamina,before.stamina);
 }
 assert.equal(JSON.stringify(before),snapshot);
});
test('goalkeepers, unknown styles and invalid roles cannot equip tricks',()=>{
 const valid=DRIBBLES.DRIBBLE_STYLES[0].id;
 for(const role of ['GK','', 'X'])assert.throws(()=>DRIBBLES.withStudioDribble(player(role),valid),/Only outfield/);
 for(const bad of ['',null,'nonexistent',0])assert.throws(()=>DRIBBLES.withStudioDribble(player(),bad),/Unknown dribble style/);
});
test('style assignment remains deterministic and explicit selection takes priority',()=>{
 const a=player(),b={...a,id:'other-id'};
 assert.equal(DRIBBLES.assignedDribbleType(a),DRIBBLES.assignedDribbleType(b));
 const equipped=DRIBBLES.withStudioDribble(a,DRIBBLES.DRIBBLE_STYLES[9].id);
 assert.equal(DRIBBLES.assignedDribbleType(equipped),DRIBBLES.DRIBBLE_STYLES[9].id);
});
