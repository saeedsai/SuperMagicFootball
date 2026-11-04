'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const poseSource=fs.readFileSync('src/modules/artpose.js','utf8').replace(/export \{ARTPOSE\};?\s*$/,'');
const ARTPOSE=vm.runInNewContext(poseSource+'\nARTPOSE',{});
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const render=fs.readFileSync('src/modules/render.js','utf8');

test('keeper roll release starts neutral and reaches a complete follow-through on its actual timer',()=>{
 const duration=.42;
 const start=ARTPOSE.keeperRelease('keeperThrow',duration,duration);
 const middle=ARTPOSE.keeperRelease('keeperThrow',duration/2,duration);
 const end=ARTPOSE.keeperRelease('keeperThrow',0,duration);
 assert.deepEqual({...start},{throwing:true,punting:false,windup:0,follow:0});
 assert.ok(middle.windup>.99&&middle.follow===.5,'mid-release reaches its eased follow-through');
 assert.deepEqual({...end},{throwing:true,punting:false,windup:0,follow:1});
 assert.match(engine,/p\.keeperHold=0;p\.action='keeperThrow';p\.actionTimer=\.42;p\.keeperReleasePoseDuration=p\.actionTimer;/,
  'the real keeper roll carries its actual .42s action duration to the renderer');
});

test('keeper release follow-through is smooth, monotone and bounded; ordinary throw/punt timing stays compatible',()=>{
 let previous=0,maxStep=0;
 for(let i=0;i<=40;i++){
  const remaining=.42*(1-i/40),pose=ARTPOSE.keeperRelease('keeperThrow',remaining,.42);
  assert.ok(pose.follow>=previous&&pose.follow>=0&&pose.follow<=1);
  assert.ok(pose.windup>=0&&pose.windup<=1);
  maxStep=Math.max(maxStep,pose.follow-previous);previous=pose.follow;
 }
 assert.ok(maxStep<.04,`follow-through has a visible phase jump (${maxStep})`);
 assert.equal(ARTPOSE.keeperRelease('keeperThrow',.48).follow,0);
 assert.equal(ARTPOSE.keeperRelease('keeperPunt',.64).follow,0);
 assert.match(render,/ARTPOSE\.keeperRelease\(action,p\.actionTimer,p\.keeperReleasePoseDuration\)/);
 assert.match(render,/8\+8\*release\.follow/,'wrist reach interpolates instead of snapping at the halfway phase');
});
