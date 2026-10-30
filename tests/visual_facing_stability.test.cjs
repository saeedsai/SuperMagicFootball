'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const visual=fs.readFileSync(path.join(__dirname,'../src/modules/visualfeel.js'),'utf8');
const render=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
const source=visual.replace(/^import .*;\s*/,'').replace(/export \{VISUALFEEL\};/,'');
const sandbox={GAME_ASSETS:{mechanics:{ballModels:[]}}};
vm.runInNewContext(source+';this.V=VISUALFEEL;',sandbox);
const V=sandbox.V;
const asPlain=value=>JSON.parse(JSON.stringify(value));
test('eight-view stability keeps side projection until steering clears the exit threshold',()=>{
 assert.deepEqual(asPlain(V.stableFacingView(1,.34,1,{kind:'side',side:1})),{kind:'side',side:1});
 assert.equal(V.stableFacingView(1,.40,1,{kind:'side',side:1}).kind,'quarterFront');
 assert.equal(V.stableFacingView(1,.32,1,{kind:'quarterFront',side:1}).kind,'quarterFront');
 assert.equal(V.stableFacingView(1,.20,1,{kind:'quarterFront',side:1}).kind,'side');
});
test('front/back and diagonal art use symmetric enter/exit hysteresis',()=>{
 const n=(y)=>Math.sqrt(1-y*y);
 assert.equal(V.stableFacingView(n(.85),.85,1,{kind:'front',side:1}).kind,'front');
 assert.equal(V.stableFacingView(n(.75),.75,1,{kind:'front',side:1}).kind,'quarterFront');
 assert.equal(V.stableFacingView(n(.90),.90,1,{kind:'quarterFront',side:1}).kind,'quarterFront');
 assert.equal(V.stableFacingView(n(.95),.95,1,{kind:'quarterFront',side:1}).kind,'front');
 assert.equal(V.stableFacingView(n(.85),-.85,1,{kind:'back',side:1}).kind,'back');
 assert.equal(V.stableFacingView(n(.75),-.75,1,{kind:'back',side:1}).kind,'quarterBack');
 assert.equal(V.stableFacingView(1,-.34,1,{kind:'side',side:1}).kind,'side');
 assert.equal(V.stableFacingView(1,-.40,1,{kind:'side',side:1}).kind,'quarterBack');
});
test('near-vertical analog noise preserves side while deliberate direction changes work',()=>{
 assert.equal(V.stableFacingView(-.05,1,1,{kind:'front',side:1}).side,1);
 assert.equal(V.stableFacingView(-.20,1,1,{kind:'front',side:1}).side,-1);
 assert.equal(V.stableFacingView(-1,0,1,{kind:'side',side:1}).side,-1);
 assert.deepEqual(asPlain(V.stableFacingView(1,0,1)),{kind:'side',side:1});
 assert.deepEqual(asPlain(V.stableFacingView(0,0,-1,{kind:'front',side:1})),{kind:'side',side:-1});
});
test('renderer applies stability only to live non-sliding characters',()=>{
 assert.match(render,/this\.inMatchDraw&&!p\.preview&&p\.action!=='slide'\?VISUALFEEL\.stableFacingView\(faceDX,faceDY,p\.face\|\|1,p\.visualFacing\)/);
 assert.match(render,/VISUALFEEL\.facingView\(faceDX,faceDY,p\.face\|\|1\)/);
 assert.match(render,/if\(moving\)p\.visualFacing=view/);
});
