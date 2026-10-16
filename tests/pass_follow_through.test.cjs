const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/artpose.js'),'utf8');
const from=source.indexOf('const ARTPOSE='),to=source.indexOf('\nexport {ARTPOSE}');
assert(from>=0&&to>from,'load actual modular ARTPOSE implementation');
const pose=vm.runInNewContext(source.slice(from,to)+'\nARTPOSE;',{Math,Number});
const renderer=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');

test('normal pass follow-through has finite swing, returns to neutral and has bounded amplitude',()=>{
 const before=pose.passFollowThrough('pass',.30),middle=pose.passFollowThrough('pass',.15),after=pose.passFollowThrough('pass',0);
 for(const key of ['stride','lift','lean']){
  assert.ok(Math.abs(before[key])<1e-8,'neutral release '+key);
  assert.ok(Math.abs(after[key])<1e-8,'neutral completion '+key);
  assert.ok(middle[key]>0,'kick mid-swing '+key);
  assert.ok(Number.isFinite(middle[key]),key);
 }
 assert.equal(middle.stride,13);assert.equal(middle.lift,9);assert.equal(middle.lean,.095);
});
test('pass pose clamps invalid or out-of-range timers; all other actions remain unchanged',()=>{
 for(const value of [-10,0,.15,.3,.5,Infinity,-Infinity,NaN,undefined,null]){
  const p=pose.passFollowThrough('pass',value);
  assert.ok(p.stride>=0&&p.stride<=13+1e-8);
  assert.ok(p.lift>=0&&p.lift<=9+1e-8);
  assert.ok(p.lean>=0&&p.lean<=.095+1e-8);
  assert.ok(Object.values(p).every(Number.isFinite));
 }
 for(const action of ['idle','receive','kick','super','keeperThrow','keeperPunt','keeperDive']){
  assert.equal(JSON.stringify(pose.passFollowThrough(action,.15)),'{"stride":0,"lift":0,"lean":0}',action);
 }
});
test('real premium character renderer uses follow-through only on near boot and owns no ball physics',()=>{
 assert.match(renderer,/const passing=ARTPOSE\.passFollowThrough\(action,p\.actionTimer\)/);
 assert.match(renderer,/gait\.stride\+\(sign===1\?passing\.stride:0\)/);
 assert.match(renderer,/gait\.lift\+\(sign===1\?passing\.lift:0\)/);
 assert.match(renderer,/gaitMoving=moving&&p\.action!=='receive'&&p\.action!=='pass'/);
 assert.match(renderer,/if\(p\.action==='pass'\)[\s\S]*?ctx\.rotate\(ARTPOSE\.passFollowThrough\(p\.action,p\.actionTimer\)\.lean\)/);
 assert.doesNotMatch(renderer,/\.ball\.vx\s*=|\.ball\.owner\s*=|\.fatigue\s*=/);
});
