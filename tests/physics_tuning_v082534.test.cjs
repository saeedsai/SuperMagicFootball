// v0.8.25.34: independently adjustable and safely bounded gameplay coefficients.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
const tuning=JSON.parse(source('data/mechanics/gameplay.json')).physicsTuning;
const helperPath=pathToFileURL(path.join(root,'src/modules/physicsbalance.js')).href;
const load=async()=> (await import(helperPath)).PHYSICSBALANCE;
test('mechanics tuning defaults reproduce existing pass speeds for short, long and cross',async()=>{
 const {validatePhysicsTuning,passLaunchSpeed}=await load();
 const cfg=validatePhysicsTuning(tuning);
 for(const quality of [1,15,55,87,100])for(const longScale of [0.65,1,1.2,1.65]){
  const baseline=Math.min(1250,(445+quality*2.6)*longScale);
  assert.equal(passLaunchSpeed(quality,longScale,cfg),baseline);
 }
});
test('keeper cooldown defaults exactly reproduce previous strength, diving and fatigue response',async()=>{
 const {validatePhysicsTuning,keeperDiveCooldown}=await load();
 const cfg=validatePhysicsTuning(tuning);
 for(const skill of [1,45,80,100])for(const diving of [1,66,100])for(const fatigue of [0,.22,.64,1]){
  const expected=Math.min(2.85,Math.max(1.45,2.05+(55-skill)*.003+(55-diving)*.004+fatigue*.62));
  assert.ok(Math.abs(keeperDiveCooldown(skill,diving,fatigue,cfg)-expected)<1e-12);
 }
});
test('editing pass coefficients changes effective gameplay launch speeds',async()=>{
 const {validatePhysicsTuning,passLaunchSpeed}=await load();
 const original=validatePhysicsTuning(tuning);
 const edited=validatePhysicsTuning({...tuning,passSpeed:{...tuning.passSpeed,qualityMultiplier:0}});
 const originalSpeed=passLaunchSpeed(77,1.1,original),editedSpeed=passLaunchSpeed(77,1.1,edited);
 assert.ok(originalSpeed>editedSpeed+180,{originalSpeed,editedSpeed});
 assert.equal(tuning.passSpeed.qualityMultiplier,2.6,'source defaults must not mutate');
});
test('editing goalkeeper fatigue coefficient changes real recovery without changing zero-fatigue recovery',async()=>{
 const {validatePhysicsTuning,keeperDiveCooldown}=await load();
 const baseline=validatePhysicsTuning(tuning);
 const tuned=validatePhysicsTuning({...tuning,keeperDiveRecovery:{...tuning.keeperDiveRecovery,fatigueCoefficient:1.2}});
 assert.equal(keeperDiveCooldown(67,82,0,baseline),keeperDiveCooldown(67,82,0,tuned));
 assert.ok(keeperDiveCooldown(67,82,.75,tuned)>keeperDiveCooldown(67,82,.75,baseline)+.4);
});
test('malformed, unsafe, NaN and internally inconsistent JSON are rejected before gameplay',async()=>{
 const {validatePhysicsTuning}=await load();
 assert.throws(()=>validatePhysicsTuning(null),/object required/);
 for(const [group,key,value] of [
  ['passSpeed','max',Infinity],['passSpeed','qualityMultiplier',NaN],
  ['passSpeed','base',-200],['passSpeed','base','445'],
  ['keeperDiveRecovery','skillCoefficient',-.1],
  ['keeperDiveRecovery','maxSeconds',1.2],
  ['superShot','speedMultiplier',1.2],['superShot','fatigueMultiplier',.5]
 ])assert.throws(()=>validatePhysicsTuning({...tuning,[group]:{...tuning[group],[key]:value}}),/physicsTuning/);
 assert.throws(()=>validatePhysicsTuning({...tuning,keeperDiveRecovery:{...tuning.keeperDiveRecovery,minSeconds:1.7,baseSeconds:1.6}}),/min <= base <= max/);
});
test('actual playable engine and generated QA fixture load the one independent physics module',()=>{
 const engine=source('src/modules/engine.js'),build=source('scripts/build.py'),sw=source('sw.js');
 assert.match(engine,/import \{PHYSICSBALANCE\} from "\.\/physicsbalance\.js"/);
 assert.match(engine,/validatePhysicsTuning\(GAME_ASSETS\.mechanics\.physicsTuning\)/);
 assert.match(engine,/passLaunchSpeed\(quality,longScale,PHYSICS_TUNING\)/);
 assert.match(engine,/keeperDiveCooldown\(skill,diving,fatigue,PHYSICS_TUNING\)/);
 assert.match(build,/'physicsbalance','engine'/);
 assert.match(sw,/'physicsbalance','engine'/);
 assert.match(sw,/smf-082538-concept-front-hair-v1/);
 assert.equal(source('data/mechanics/gameplay.json').includes('"w": 2260.8'),true);
});

test('Super Shot speed and stamina cost are slightly adjusted and safely configurable',async()=>{
 const {validatePhysicsTuning,superShotSpeedMultiplier,superShotFatigueMultiplier}=await load();
 const cfg=validatePhysicsTuning(tuning);
 assert.equal(superShotSpeedMultiplier(cfg),.96);
 assert.equal(superShotFatigueMultiplier(cfg),1.08);
 assert.equal(superShotSpeedMultiplier(validatePhysicsTuning({...tuning,superShot:{...tuning.superShot,speedMultiplier:.99}})),.99);
 assert.throws(()=>validatePhysicsTuning({...tuning,superShot:{...tuning.superShot,fatigueMultiplier:2}}),/physicsTuning.superShot.fatigueMultiplier/);
 assert.match(source('src/modules/engine.js'),/850\*spec\.speed\*superShotSpeedMultiplier\(PHYSICS_TUNING\)/);
 assert.match(source('src/modules/engine.js'),/superShotFatigueMultiplier\(PHYSICS_TUNING\)/);
});
test('keeper catches are held at glove height until distribution',()=>{
 const engine=source('src/modules/engine.js');
 assert.match(engine,/b\.z=p\.keeper\?p\.z\+82/);
 assert.match(engine,/keeperHold>=1\.35/);
 assert.match(engine,/p\.action='keeperHold'/);
 assert.match(source('src/modules/render.js'),/HOLDING/);
});
