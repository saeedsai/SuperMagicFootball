'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/lan-input-timeline.js')).href);
const accepted=(sequence, buttons={pass:false,shoot:true,dribble:false,jump:false},axis={x:1,y:0})=>({accepted:true,input:{sequence,buttons,axis}});

test('LAN host tick retains validated guest controls briefly, then neutralizes them',async()=>{
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame}=await load();
 let state=applyValidatedLanInput(createLanInputTimeline(2),accepted(0));
 let tick=advanceLanInputFrame(state);assert.equal(tick.controls.buttons.shoot,true);assert.equal(tick.timedOut,false);
 tick=advanceLanInputFrame(tick.state);assert.equal(tick.controls.axis.x,1);
 tick=advanceLanInputFrame(tick.state);assert.equal(tick.controls.buttons.shoot,false);assert.equal(tick.controls.axis.x,0);assert.equal(tick.timedOut,true);
});
test('LAN host tick resets timeout on newer sequence and ignores stale accepted input',async()=>{
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame}=await load();
 let state=applyValidatedLanInput(createLanInputTimeline(2),accepted(2));
 state=advanceLanInputFrame(state).state;
 assert.equal(applyValidatedLanInput(state,accepted(2)),state);
 assert.equal(applyValidatedLanInput(state,accepted(1)),state);
 state=applyValidatedLanInput(state,accepted(3,{pass:true,shoot:false,dribble:false,jump:false}));
 const tick=advanceLanInputFrame(state);
 assert.equal(tick.controls.buttons.pass,true);assert.equal(tick.timedOut,false);
});
test('LAN host tick starts neutral, bounds hold time, and rejects malformed controls',async()=>{
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame}=await load();
 assert.equal(advanceLanInputFrame(createLanInputTimeline()).controls.buttons.jump,false);
 for(const frames of [0,-1,1.5,121,NaN]) assert.throws(()=>createLanInputTimeline(frames),RangeError);
 let state=createLanInputTimeline();
 for(const bad of [{accepted:false},accepted(0,{pass:false,shoot:false,dribble:false,jump:false,magic:true}),accepted(0,undefined,{x:Infinity,y:0}),accepted(0,undefined,{x:0,y:2})]){
  assert.throws(()=>applyValidatedLanInput(state,bad),TypeError);
 }
});
test('LAN host tick copies input, so caller mutations cannot alter held controls',async()=>{
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame}=await load();
 const input=accepted(0);
 const state=applyValidatedLanInput(createLanInputTimeline(),input);
 input.input.buttons.shoot=false;input.input.axis.x=-1;
 const tick=advanceLanInputFrame(state);
 assert.equal(tick.controls.buttons.shoot,true);assert.equal(tick.controls.axis.x,1);
 assert.equal(Object.isFrozen(tick.controls.buttons),true);
});
