const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/directional_animation.js','utf8').replace(/^export \{[^\n]+\};?\s*$/m,'');
const context=vm.createContext({});
vm.runInContext(source+'\nthis.api={HEADINGS,ACTIONS,animationFrame,actionFrame,resolveActionPose,animationAssetCandidates,resolveAuthoredFrame,resolveDirectionalAsset,normalizeHeading};',context);
const {HEADINGS,ACTIONS,animationFrame,actionFrame,resolveActionPose,animationAssetCandidates,resolveAuthoredFrame,resolveDirectionalAsset,normalizeHeading}=context.api;
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

test('completed one-shot actions return to idle in same heading',()=>{
 const active=resolveActionPose({heading:'SW',action:'kick',elapsed:.125,frames:4,fps:8});
 assert.equal(active.key,'kick/SW/1');
 assert.equal(active.transitioned,false);
 const complete=resolveActionPose({heading:'SW',action:'kick',elapsed:.5,frames:4,fps:8});
 assert.equal(complete.key,'idle/SW/0');
 assert.equal(complete.previousAction,'kick');
 assert.equal(complete.transitioned,true);
});
test('running loops and does not transition to idle',()=>{
 const pose=resolveActionPose({heading:'NE',action:'run',elapsed:.625,frames:4,fps:8});
 assert.equal(pose.key,'run/NE/1');
 assert.equal(pose.transitioned,false);
});

test('authored asset candidates prioritize action frame then directional fallbacks',()=>{
 const keys=Array.from(animationAssetCandidates({action:'keeper',heading:'NW',frame:3}));
 assert.deepEqual(keys,['keeper/NW/3','keeper/NW/0','idle/NW/0','idle/S/0']);
});
test('idle default has no duplicate fallback keys',()=>{
 const keys=Array.from(animationAssetCandidates({action:'idle',heading:'S',frame:0}));
 assert.deepEqual(keys,['idle/S/0']);
 assert.equal(Object.isFrozen(animationAssetCandidates({})),true);
});
test('untrusted pose keys cannot inject asset path segments',()=>{
 const keys=Array.from(animationAssetCandidates({action:'../other',heading:'../../escape',frame:999}));
 assert.deepEqual(keys,['idle/S/0']);
});

test('sparse authored art chooses exact action frame when present',()=>{
 const pose={heading:'NW',action:'kick',frame:2};
 assert.equal(resolveAuthoredFrame(pose,new Set(['idle/S/0','kick/NW/2'])),'kick/NW/2');
});
test('sparse authored art falls back through direction before generic idle',()=>{
 const pose={heading:'NE',action:'slide',frame:3};
 assert.equal(resolveAuthoredFrame(pose,{'idle/S/0':true,'idle/NE/0':true}),'idle/NE/0');
 assert.equal(resolveAuthoredFrame(pose,{'idle/S/0':true}),'idle/S/0');
 assert.equal(resolveAuthoredFrame(pose,{}),null);
});
test('inherited catalog properties are never treated as authored frames',()=>{
 const catalog=Object.create({'kick/S/0':true});
 assert.equal(resolveAuthoredFrame({action:'kick',heading:'S',frame:0},catalog),null);
});

test('Map-backed authored art resolves present frames and skips missing entries',()=>{
 const catalog=new Map([['kick/E/2',false],['kick/E/0',{src:'kick-east'}],['idle/E/0',{src:'idle-east'}]]);
 assert.equal(resolveAuthoredFrame({heading:'E',action:'kick',frame:2},catalog),'kick/E/0');
 assert.equal(resolveAuthoredFrame({heading:'E',action:'kick',frame:0},catalog),'kick/E/0');
});
test('empty Map catalog returns null without affecting direction',()=>{
 assert.equal(resolveAuthoredFrame({heading:'W',action:'keeper',frame:1},new Map()),null);
});

test('mirrored art fallback uses opposite horizontal view only when explicitly enabled',()=>{
 const catalog=new Set(['kick/W/2']);
 const pose={action:'kick',heading:'E',frame:2};
 assert.equal(resolveDirectionalAsset(pose,catalog),null);
 const result=resolveDirectionalAsset(pose,catalog,{allowMirror:true});
 assert.equal(result.key,'kick/W/2');
 assert.equal(result.mirrorX,true);
 assert.equal(Object.isFrozen(result),true);
});
test('authored exact-heading and directional idle outrank mirrored frames',()=>{
 const pose={action:'kick',heading:'E',frame:2};
 const exact=resolveDirectionalAsset(pose,new Map([['kick/E/2',{src:'exact'}],['kick/W/2',{src:'mirrored'}]]),{allowMirror:true});
 assert.equal(exact.key,'kick/E/2');
 assert.equal(exact.mirrorX,false);
 const idle=resolveDirectionalAsset(pose,new Set(['idle/E/0','kick/W/2']),{allowMirror:true});
 assert.equal(idle.key,'idle/E/0');
 assert.equal(idle.mirrorX,false);
});
test('mirrored fallback precedes generic idle and never mirrors the generic sprite',()=>{
 const pose={action:'slide',heading:'SW',frame:1};
 const mirror=resolveDirectionalAsset(pose,new Set(['slide/SE/1','idle/S/0']),{allowMirror:true});
 assert.equal(mirror.key,'slide/SE/1');
 assert.equal(mirror.mirrorX,true);
 const generic=resolveDirectionalAsset(pose,new Set(['idle/S/0']),{allowMirror:true});
 assert.equal(generic.key,'idle/S/0');
 assert.equal(generic.mirrorX,false);
});
test('front and back views are never reflected',()=>{
 for(const heading of ['N','S']){
  const result=resolveDirectionalAsset({heading,action:'run',frame:2},new Set(['idle/S/0']),{allowMirror:true});
  assert.equal(result.key,'idle/S/0');
  assert.equal(result.mirrorX,false);
 }
});
test('malformed pose cannot inject keys and inherited catalog entries are ignored',()=>{
 const catalog=Object.create({'kick/W/0':true});
 const result=resolveDirectionalAsset({action:'../kick',heading:'../../W',frame:999},catalog,{allowMirror:true});
 assert.equal(result,null);
});
