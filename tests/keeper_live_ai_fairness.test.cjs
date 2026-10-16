/** The browser acceptance must sample REAL keeper AI, not ball-only or stubbed AI. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const file=fs.readFileSync(path.join(__dirname,'keeper_shot_calibration_browser_qa.py'),'utf8');
test('live keeper balance fixture runs real AI and ball flight at 30/60/120 FPS',()=>{
 const s=file.slice(file.indexOf('def live_ai_script():'),file.indexOf('with sync_playwright() as pw:'));
 assert(s.includes('def live_ai_script():'),'live-AI section must be present');
 assert.match(s,/g\.updatePlayers\(1\/fps\);\s*g\.updateBall\(1\/fps\)/,
   'advance real AI before each ball flight tick');
 assert.match(s,/return driveAI\.call\(this,p,dt\)/,'count AI invocation by delegating, never stubbing it');
 assert.match(s,/finally\{g\.driveAI=driveAI;\}/,'restore AI for other fixtures');
 for(const signal of ["'zigzagSuper'","behavior:'zigzag'","[30,60,120]","[0,1]","[0,.75]","[85,132]"])
   assert(s.includes(signal),`missing seeded balance axis: ${signal}`);
 assert.match(file,/mirroredOutcomeMismatches/,'always report side imbalances rather than hiding them');
 assert.match(file,/KEEPER_LIVE_AI_FAIRNESS_PASS/,'emit final acceptance evidence');
});
test('original ball-only contact-geometry cohort remains intact',()=>{
 const original=file.slice(file.indexOf('def seed_script():'),file.indexOf('def live_ai_script():'));
 assert.match(original,/g\.updateBall\(1\/fps\)/);
 assert.doesNotMatch(original,/g\.updatePlayers\(1\/fps\)/);
 assert.match(file,/len\(rows\) == 144/);
 assert.match(file,/rawSaveEvents.*<= 1/);
});
