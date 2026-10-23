'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=name=>import(pathToFileURL(path.resolve('src/modules/',name)).href);
const packet=(type,peerId='guest01')=>({type,peerId,roomId:'room001',version:1});
const input=seq=>({...packet('input'),sequence:seq,buttons:{pass:false,shoot:true,dribble:false,jump:false},axis:{x:1,y:0}});

test('LAN guest can leave and a replacement can join the same room',async()=>{
 const {createLanHostState,acceptLanPacket}=await load('lan-session.js');
 let state=acceptLanPacket(createLanHostState('room001','host001'),packet('hello')).state;
 let result=acceptLanPacket(state,input(42));assert.equal(result.accepted,true);state=result.state;
 const leave=acceptLanPacket(state,packet('leave'));assert.equal(leave.reason,'left');
 assert.equal(leave.state.peerId,null);assert.equal(leave.state.lastSequence,-1);
 assert.equal(acceptLanPacket(leave.state,input(43)).reason,'not-joined');
 const replacement=acceptLanPacket(leave.state,packet('hello','guest02'));
 assert.equal(replacement.reason,'joined');assert.equal(replacement.state.peerId,'guest02');
});
test('LAN leave rejects strangers and preserves occupied room',async()=>{
 const {createLanHostState,acceptLanPacket}=await load('lan-session.js');
 const state=acceptLanPacket(createLanHostState('room001','host001'),packet('hello')).state;
 for(const other of [packet('leave','guest02'),{...packet('leave'),roomId:'other001'}, {...packet('leave'),version:2}]){
  const result=acceptLanPacket(state,other);assert.equal(result.accepted,false);assert.equal(result.state,state);
 }
 assert.equal(acceptLanPacket(state,packet('hello','guest02')).reason,'room-full');
});
test('LAN authenticated leave clears running and shooting controls immediately',async()=>{
 const {createLanHostState,acceptLanPacket}=await load('lan-session.js');
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame,clearLanInputOnLeave}=await load('lan-input-timeline.js');
 let session=acceptLanPacket(createLanHostState('room001','host001'),packet('hello')).state;
 const accepted=acceptLanPacket(session,input(0));session=accepted.state;
 let timeline=applyValidatedLanInput(createLanInputTimeline(8),accepted);
 const leave=acceptLanPacket(session,packet('leave'));
 timeline=clearLanInputOnLeave(timeline,leave);
 const tick=advanceLanInputFrame(timeline);
 assert.equal(tick.controls.buttons.shoot,false);assert.equal(tick.controls.axis.x,0);
 assert.equal(tick.timedOut,false);assert.equal(timeline.lastSequence,-1);
 assert.throws(()=>clearLanInputOnLeave(timeline,{accepted:false,reason:'left',state:leave.state}),TypeError);
});
