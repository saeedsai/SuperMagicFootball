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
test('LAN hold expiry is a one-tick event and a fresh sequence starts a new hold window',async()=>{
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame}=await load();
 let state=applyValidatedLanInput(createLanInputTimeline(1),accepted(0));
 const timeoutEvents=[];
 for(let i=0;i<4;i++){
  const tick=advanceLanInputFrame(state);
  timeoutEvents.push(tick.timedOut);
  assert.equal(tick.controls.buttons.shoot,i<1);
  state=tick.state;
 }
 assert.deepEqual(timeoutEvents,[false,true,false,false]);
 state=applyValidatedLanInput(state,accepted(1,{pass:true,shoot:false,dribble:false,jump:false},{x:0,y:1}));
 const freshWindow=advanceLanInputFrame(state);
 assert.equal(freshWindow.controls.buttons.pass,true);
 assert.equal(freshWindow.timedOut,false);
 state=freshWindow.state;
 assert.equal(advanceLanInputFrame(state).timedOut,true);
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

test('LAN host tick rejects malformed timestamps instead of retaining guest controls',async()=>{
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame}=await load();
 const acceptedState=applyValidatedLanInput(createLanInputTimeline(),accepted(0));
 for(const lastAcceptedFrame of [NaN,Infinity,-2,1.5,1]){
  const corrupted={...acceptedState,lastAcceptedFrame};
  assert.throws(()=>advanceLanInputFrame(corrupted),/Invalid LAN input timeline state/);
 }
 for(const lastSequence of [NaN,Infinity,-2,1.5]){
  const corrupted={...acceptedState,lastSequence};
  assert.throws(()=>applyValidatedLanInput(corrupted,accepted(1)),/Invalid LAN input timeline state/);
 }
});

test('LAN timeline rejects malformed held controls and non-neutral uninitialized state',async()=>{
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame}=await load();
 const acceptedState=applyValidatedLanInput(createLanInputTimeline(),accepted(0));
 const badControls=[
  {...acceptedState.controls,buttons:{...acceptedState.controls.buttons,shoot:1}},
  {...acceptedState.controls,buttons:{...acceptedState.controls.buttons,magic:true}},
  {...acceptedState.controls,axis:{x:NaN,y:0}},
  {...acceptedState.controls,axis:{x:1.01,y:0}},
  {...acceptedState.controls,axis:{x:0,y:0,z:0}}
 ];
 for(const controls of badControls){
  assert.throws(()=>advanceLanInputFrame({...acceptedState,controls}),/Invalid LAN input timeline state/);
 }
 const uninitialized=createLanInputTimeline();
 assert.throws(()=>advanceLanInputFrame({...uninitialized,controls:acceptedState.controls}),/Invalid LAN input timeline state/);
});
