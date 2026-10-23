'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=name=>import(pathToFileURL(path.resolve('src/modules/',name)).href);
const packet=(type,peerId='guest01')=>({type,peerId,roomId:'room001',version:1});
const input=(seq,peerId='guest01')=>({...packet('input',peerId),sequence:seq,buttons:{pass:false,shoot:true,dribble:false,jump:false},axis:{x:1,y:0}});

test('host-observed disconnect releases the current guest and permits replacement',async()=>{
 const {createLanHostState,acceptLanPacket,disconnectLanPeer}=await load('lan-session.js');
 let state=acceptLanPacket(createLanHostState('room001','host001'),packet('hello')).state;
 state=acceptLanPacket(state,input(12)).state;
 const out=disconnectLanPeer(state,'guest01');
 assert.equal(out.accepted,true);assert.equal(out.reason,'left');
 assert.equal(out.state.peerId,null);assert.equal(out.state.lastSequence,-1);
 const next=acceptLanPacket(out.state,packet('hello','guest02'));
 assert.equal(next.reason,'joined');
 assert.equal(acceptLanPacket(next.state,input(0,'guest02')).accepted,true);
});
test('late disconnect from former socket cannot evict replacement guest',async()=>{
 const {createLanHostState,acceptLanPacket,disconnectLanPeer}=await load('lan-session.js');
 const first=acceptLanPacket(createLanHostState('room001','host001'),packet('hello')).state;
 const empty=disconnectLanPeer(first,'guest01').state;
 const replacement=acceptLanPacket(empty,packet('hello','guest02')).state;
 const stale=disconnectLanPeer(replacement,'guest01');
 assert.equal(stale.accepted,false);assert.equal(stale.reason,'not-joined');assert.equal(stale.state,replacement);
 assert.equal(disconnectLanPeer(replacement,'guest02').accepted,true);
});
test('disconnect neutralizes held controls via authenticated leave result',async()=>{
 const {createLanHostState,acceptLanPacket,disconnectLanPeer}=await load('lan-session.js');
 const {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame,clearLanInputOnLeave}=await load('lan-input-timeline.js');
 let session=acceptLanPacket(createLanHostState('room001','host001'),packet('hello')).state;
 const accepted=acceptLanPacket(session,input(0));session=accepted.state;
 const timeline=applyValidatedLanInput(createLanInputTimeline(8),accepted);
 const cleared=clearLanInputOnLeave(timeline,disconnectLanPeer(session,'guest01'));
 const tick=advanceLanInputFrame(cleared);
 assert.equal(tick.controls.buttons.shoot,false);assert.equal(tick.controls.axis.x,0);
 assert.equal(cleared.lastSequence,-1);
});
