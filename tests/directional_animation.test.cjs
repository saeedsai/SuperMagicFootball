const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/directional_animation.js','utf8').replace(/^export \{[^\n]+\};?\s*$/m,'');
const context=vm.createContext({});
vm.runInContext(source+'\nthis.api={HEADINGS,ACTIONS,animationFrame,normalizeHeading};',context);
const {HEADINGS,ACTIONS,animationFrame,normalizeHeading}=context.api;
test('all eight directions resolve unique action frame keys',()=>{
 assert.equal(HEADINGS.length,8);
 assert.equal(new Set(HEADINGS.map(heading=>animationFrame({heading,action:'run'}).key)).size,8);
});
test('seven actions remain independently addressable',()=>{
 assert.equal(ACTIONS.length,7);
 assert.equal(new Set(ACTIONS.map(action=>animationFrame({action,heading:'NE',elapsed:.25}).key)).size,7);
});
test('frame progression is deterministic and bounded',()=>{
 assert.equal(animationFrame({action:'run',elapsed:0}).frame,0);
 assert.equal(animationFrame({action:'run',elapsed:.25}).frame,2);
 assert.equal(animationFrame({action:'run',elapsed:.5}).frame,0);
 assert.equal(animationFrame({action:'idle',elapsed:100}).frame,0);
});
test('malformed inputs fall back without changing action controls',()=>{
 assert.equal(normalizeHeading('invalid'),'S');
 const frame=animationFrame({heading:'invalid',action:'unknown',elapsed:-5,fps:Infinity,frames:-1});
 assert.equal(frame.key,'idle/S/0');
 assert.equal(Object.isFrozen(frame),true);
});
