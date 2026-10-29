const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/directional_animation.js','utf8').replace(/^export \{[^\n]+\};?\s*$/m,'');
const context=vm.createContext({});
vm.runInContext(source+'\nthis.api={HEADINGS,ACTIONS,animationFrame,actionFrame,normalizeHeading};',context);
const {HEADINGS,ACTIONS,animationFrame,actionFrame,normalizeHeading}=context.api;
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

test('one-shot kick holds last frame and reports completion',()=>{
 const start=actionFrame({action:'kick',heading:'NW',elapsed:0,frames:4,fps:8});
 assert.equal(start.key,'kick/NW/0');
 assert.equal(start.finished,false);
 const end=actionFrame({action:'kick',heading:'NW',elapsed:10,frames:4,fps:8});
 assert.equal(end.key,'kick/NW/3');
 assert.equal(end.finished,true);
 assert.equal(animationFrame({action:'kick',heading:'NW',elapsed:10,frames:4,fps:8}).frame,0);
});
test('one-shot action handles bad timing and idle without NaN',()=>{
 const fallback=actionFrame({action:'slide',elapsed:NaN,frames:0,fps:-5});
 assert.equal(fallback.frame,0);
 assert.equal(fallback.finished,false);
 assert.equal(actionFrame({action:'idle',elapsed:100}).finished,true);
});
