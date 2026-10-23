'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/lan-manual-signaling.js')).href);
function fake(state='gathering'){
 const listeners=new Map();
 return {
  iceGatheringState:state,connectionState:'new',localDescription:null,remoteDescription:null,
  addEventListener(name,fn){listeners.set(name,fn)},
  removeEventListener(name){listeners.delete(name)},
  emit(name){listeners.get(name)?.()},
  get listenerCount(){return listeners.size},
  async createOffer(){return {type:'offer',sdp:'v=0 offer'}},
  async createAnswer(){return {type:'answer',sdp:'v=0 answer'}},
  async setLocalDescription(d){this.localDescription=d;this.iceGatheringState='complete';this.localDescription={...d,sdp:d.sdp+' candidate:1'}},
  async setRemoteDescription(d){this.remoteDescription=d}
 };
}
test('gathered offer and answer include final ICE candidate SDP',async()=>{
 const {createGatheredLanOffer,acceptGatheredLanOffer,acceptLanAnswer,parseLanSignal}=await load();
 const host=fake(),guest=fake();
 const offer=await createGatheredLanOffer(host);
 assert.match(parseLanSignal(offer).description.sdp,/candidate:1/);
 const answer=await acceptGatheredLanOffer(guest,offer);
 assert.match(parseLanSignal(answer).description.sdp,/candidate:1/);
 await acceptLanAnswer(host,answer);
 assert.match(host.remoteDescription.sdp,/candidate:1/);
});
test('ICE gathering waits for completion, rejects timeout and cleans listeners',async()=>{
 const {waitForLanIceGathering}=await load();
 const peer=fake();
 const waiting=waitForLanIceGathering(peer,100);
 assert.equal(peer.listenerCount,2);
 peer.iceGatheringState='complete';peer.emit('icegatheringstatechange');
 await waiting;assert.equal(peer.listenerCount,0);
 const stuck=fake();
 await assert.rejects(()=>waitForLanIceGathering(stuck,5),/timed out/);
 assert.equal(stuck.listenerCount,0);
});
test('ICE gathering rejects closed connection and invalid timeout',async()=>{
 const {waitForLanIceGathering}=await load();
 const peer=fake();const waiting=waitForLanIceGathering(peer,100);
 peer.connectionState='closed';peer.emit('connectionstatechange');
 await assert.rejects(waiting,/closed/);
 assert.equal(peer.listenerCount,0);
 assert.throws(()=>waitForLanIceGathering(fake(),0),TypeError);
});
