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

test('Rainbow Flick counter grows with approach speed, not retreat',()=>{
 const style={id:'rainbow',evade:0};
 const attacker={x:100,y:0,dribbling:75,agility:75,fatigue:0};
 const defender={x:50,y:0,defence:90,aggression:65,agility:80,fatigue:0,vy:0};
 const slow=DRIBBLES.dribbleOdds(attacker,{...defender,vx:1},style);
 const fast=DRIBBLES.dribbleOdds(attacker,{...defender,vx:6},style);
 const retreat=DRIBBLES.dribbleOdds(attacker,{...defender,vx:-6},style);
 assert.ok(fast<slow,'fast approach must counter more strongly');
 assert.ok(slow<retreat,'retreating defender must not receive aerial counter');
});

test('Player Studio exposes trick selector and save handler without a fifth button',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/id="studioTrick"/);
 assert.match(ui,/DRIBBLES\.DRIBBLE_STYLES\.map/);
 assert.match(ui,/function saveStudioTrick\(\)/);
 assert.match(ui,/DRIBBLES\.withStudioDribble\(source\[avatarIndex\]/);
 assert.match(ui,/storeCharacterChanges\('edits',updated\)/);
 assert.match(ui,/storeCharacterChanges\('managerCareer',updated\)/);
 assert.match(ui,/a==='saveStudioTrick'\)saveStudioTrick\(\)/);
});

test('Player Studio Super Shot selection validates levels and persists Career and roster edits',()=>{
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/id="studioShotTier"/);
 assert.match(ui,/id="studioShotAbility"/);
 assert.match(ui,/function saveStudioShot\(\)/);
 assert.match(ui,/Object\.entries\(SHOTS\)/);
 assert.match(ui,/superShotLevel:tier/);
 assert.match(ui,/updated\.superAbility=\{type:'shoot',id,name:updated\.shotName,level:tier\}/);
 assert.match(ui,/a==='saveStudioShot'\)saveStudioShot\(\)/);
});

test('Trick levels persist and improve dribble odds only within bounded range',()=>{
 const p=player();p.dribbling=75;p.agility=75;p.fatigue=0;
 const style=DRIBBLES.DRIBBLE_STYLES[0];
 const one=DRIBBLES.withStudioDribble(p,style.id,1);
 const five=DRIBBLES.withStudioDribble(p,style.id,5);
 assert.equal(one.trickLevel,1);assert.equal(five.trickLevel,5);
 assert.equal(p.trickLevel,undefined);
 const rival={defence:75,aggression:70,fatigue:0};
 const low=DRIBBLES.dribbleOdds(one,rival,style),high=DRIBBLES.dribbleOdds(five,rival,style);
 assert.ok(high>low);assert.ok(high-low<=.031);
 for(const invalid of [0,6,1.5,'abc'])assert.throws(()=>DRIBBLES.withStudioDribble(p,style.id,invalid),/Trick level/);
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/id="studioTrickTier"/);
 assert.match(ui,/DRIBBLES\.withStudioDribble\(source\[avatarIndex\],\$\('studioTrick'\)\?\.value,Number\(\$\('studioTrickTier'\)\?\.value\)\)/);
});
