'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/magictricks.js')).href);
const carrier={id:'a',team:0,role:'MF',magicTrick:'scream',x:100,y:100,fatigue:0};
const rival={id:'b',team:1,role:'DF',x:145,y:100,face:-1,vx:-1,vy:0,defence:80,agility:80};
test('Scream only activates for equipped, eligible ball carriers near an opponent',async()=>{
 const {evaluateScream}=await load();
 for(const c of [{...carrier,magicTrick:'banana'},{...carrier,role:'GK'},{...carrier,cooldown:1},{...carrier,fatigue:.9}]){
  assert.equal(evaluateScream({carrier:c,opponents:[rival]}).activated,false);
 }
 assert.equal(evaluateScream({carrier,opponents:[{...rival,x:400}]}).reason,'no-target');
 assert.equal(evaluateScream({carrier,opponents:[{...rival,team:0}]}).activated,false);
});
test('Scream chooses nearest active opponent and has bounded nonlethal effects',async()=>{
 const {evaluateScream,SCREAM_RULES}=await load();
 const out=evaluateScream({carrier,opponents:[{...rival,id:'far',x:190},rival],roll:0});
 assert.equal(out.targetId,'b');assert.equal(out.success,true);
 assert.equal(out.stunSeconds,.52);assert.equal(out.cooldown,11);
 assert.equal(out.staminaCost,.045);assert.ok(out.chance>=.2&&out.chance<=.82);
 assert.equal(SCREAM_RULES.range,110);
});
test('Facing-aware moving defenders resist more; failed trick never stuns',async()=>{
 const {evaluateScream}=await load();
 const aware=evaluateScream({carrier,opponents:[{...rival,face:-1}],roll:.99});
 const unaware=evaluateScream({carrier,opponents:[{...rival,face:1}],roll:.99});
 assert.ok(aware.chance<unaware.chance);
 assert.equal(aware.countered,true);assert.equal(aware.stunSeconds,0);
});
test('Scream helper and equipped Magic Trick keep four-button controls and save compatibility',async()=>{
 const fs=require('node:fs');
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 const engine=fs.readFileSync('src/modules/engine.js','utf8');
 assert.doesNotMatch(engine,/import \{evaluateScream\}/);
 assert.match(ui,/Hold DRIBBLE for 1 second/);
 assert.match(engine,/p\.dribbleHold>=1&&p\.breath>=\.8&&!p\.magicHoldLatched/);
 assert.match(engine,/const id=p\?\.src\?\.magicTrick/);
 assert.doesNotMatch(ui,/id="studioMagicTier"/);
});

test('Scream refuses nonfinite carrier positions without targeting or spending resources',async()=>{
 const {evaluateScream}=await load();
 for(const bad of [NaN,Infinity,-Infinity,undefined]){
  for(const axis of ['x','y']){
   const out=evaluateScream({carrier:{...carrier,[axis]:bad},opponents:[rival],roll:0});
   assert.deepEqual(out,{activated:false,reason:'unavailable'});
  }
 }
 assert.equal(evaluateScream({carrier,opponents:[rival],roll:0}).activated,true);
});

test('Scream stays deterministic with nonfinite defender attributes',async()=>{
 const {evaluateScream}=await load();
 const baseline=evaluateScream({carrier,opponents:[{...rival,defence:0,agility:0}],roll:0});
 for(const bad of [NaN,Infinity,-Infinity]){
  const out=evaluateScream({carrier,opponents:[{...rival,defence:bad,agility:bad}],roll:0});
  assert.equal(out.activated,true);
  assert.equal(out.success,true);
  assert.equal(out.chance,baseline.chance);
  assert.equal(out.targetId,rival.id);
  assert.ok(Number.isFinite(out.chance));
 }
 const mixed=evaluateScream({carrier,opponents:[{...rival,defence:Infinity,agility:80}],roll:0});
 const expected=evaluateScream({carrier,opponents:[{...rival,defence:0,agility:80}],roll:0});
 assert.equal(mixed.chance,expected.chance);
});
