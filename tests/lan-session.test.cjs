'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/lan-session.js')).href);
const hello={type:'hello',version:1,roomId:'room001',peerId:'guest01'};
const input=(sequence,overrides={})=>({type:'input',version:1,roomId:'room001',peerId:'guest01',sequence,buttons:{pass:false,shoot:true,dribble:false,jump:false},axis:{x:0,y:1},...overrides});
test('LAN host accepts exactly one guest, with idempotent rejoin',async()=>{
 const {createLanHostState,acceptLanPacket}=await load();
 const initial=createLanHostState('room001','host001');
 const first=acceptLanPacket(initial,hello);
 assert.equal(first.reason,'joined');assert.equal(first.state.peerId,'guest01');assert.equal(initial.peerId,null);
 assert.equal(acceptLanPacket(first.state,hello).reason,'already-joined');
 assert.equal(acceptLanPacket(first.state,{...hello,peerId:'guest02'}).reason,'room-full');
});
test('LAN host rejects mismatched room/version, host spoofing and unjoined input',async()=>{
 const {createLanHostState,acceptLanPacket}=await load();
 const state=createLanHostState('room001','host001');
 for(const [packet,reason] of [
  [{...hello,roomId:'other001'},'wrong-room'],
  [{...hello,version:2},'protocol-mismatch'],
  [{...hello,peerId:'host001'},'invalid-peer'],
  [input(0),'not-joined']]){
  const out=acceptLanPacket(state,packet);assert.equal(out.reason,reason);assert.equal(out.state,state);
 }
});
test('LAN host accepts ordered four-button controls without trusting client tick',async()=>{
 const {createLanHostState,acceptLanPacket}=await load();
 const joined=acceptLanPacket(createLanHostState('room001','host001'),hello).state;
 const first=acceptLanPacket(joined,input(0,{tick:999999}));
 assert.equal(first.accepted,true);assert.equal(first.input.sequence,0);
 assert.equal('tick' in first.input,false);
 assert.equal(acceptLanPacket(first.state,input(0)).reason,'stale-sequence');
 assert.equal(acceptLanPacket(first.state,input(1)).accepted,true);
});
test('LAN input validation rejects malformed axes and extra action buttons',async()=>{
 const {createLanHostState,acceptLanPacket}=await load();
 const state=acceptLanPacket(createLanHostState('room001','host001'),hello).state;
 for(const packet of [input(1,{axis:{x:NaN,y:0}}),input(1,{axis:{x:2,y:0}}),
   input(1,{buttons:{pass:false,shoot:false,dribble:false,jump:false,magic:true}}),
   input(1,{buttons:{pass:1,shoot:false,dribble:false,jump:false}}),input(-1),input(1.5)]){
  const out=acceptLanPacket(state,packet);assert.equal(out.accepted,false);assert.equal(out.state,state);
 }
});
