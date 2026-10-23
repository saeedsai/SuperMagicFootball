'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/lan-guest-packets.js')).href);
const buttons=()=>({pass:false,shoot:true,dribble:false,jump:false});
test('guest packets sequence and preserve exactly four controls',async()=>{
 const {createLanGuest,nextLanGuestPacket}=await load();
 const start=createLanGuest('room001','guest01');
 const first=nextLanGuestPacket(start,buttons(),{x:1,y:0});
 assert.equal(first.packet.sequence,0);assert.equal(first.state.sequence,1);
 assert.equal(start.sequence,0);assert.equal(first.packet.version,1);
 assert.equal(nextLanGuestPacket(first.state,buttons(),{x:0,y:1}).packet.sequence,1);
});
test('guest diagonal axes normalize and copy caller controls',async()=>{
 const {createLanGuest,nextLanGuestPacket}=await load();
 const controls=buttons();const axis={x:1,y:1};
 const {packet}=nextLanGuestPacket(createLanGuest('room001','guest01'),controls,axis);
 controls.shoot=false;axis.x=0;
 assert.equal(packet.buttons.shoot,true);assert.ok(Math.abs(Math.hypot(packet.axis.x,packet.axis.y)-1)<1e-12);
 assert.equal(Object.isFrozen(packet.buttons),true);
});
test('guest invalid identifiers, buttons and axes rejected',async()=>{
 const {createLanGuest,nextLanGuestPacket}=await load();
 assert.throws(()=>createLanGuest('bad','guest01'),TypeError);
 const state=createLanGuest('room001','guest01');
 for(const [b,a] of [[{...buttons(),magic:true},{x:0,y:0}],[buttons(),{x:2,y:0}],[buttons(),{x:NaN,y:0}],[{...buttons(),pass:1},{x:0,y:0}]])assert.throws(()=>nextLanGuestPacket(state,b,a),TypeError);
});
