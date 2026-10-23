'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=()=>import(pathToFileURL(path.resolve('src/modules/lan-manual-signaling.js')).href);
const fake=()=>({
 localDescription:null,remoteDescription:null,
 async createOffer(){return {type:'offer',sdp:'v=0 offer'}},
 async createAnswer(){return {type:'answer',sdp:'v=0 answer'}},
 async setLocalDescription(d){this.localDescription=d},
 async setRemoteDescription(d){this.remoteDescription=d}
});
test('manual LAN signaling completes host offer and guest answer',async()=>{
 const {createLanOffer,acceptLanOffer,acceptLanAnswer,parseLanSignal}=await load();
 const host=fake(),guest=fake();
 const offer=await createLanOffer(host);
 assert.equal(parseLanSignal(offer).type,'offer');
 const answer=await acceptLanOffer(guest,offer);
 assert.equal(parseLanSignal(answer).type,'answer');
 await acceptLanAnswer(host,answer);
 assert.deepEqual(host.remoteDescription,{type:'answer',sdp:'v=0 answer'});
 assert.deepEqual(guest.remoteDescription,{type:'offer',sdp:'v=0 offer'});
});
test('manual LAN signaling rejects malformed, oversized, or wrong-phase packets',async()=>{
 const {MAX_SIGNAL_BYTES,parseLanSignal,encodeLanSignal,acceptLanOffer,acceptLanAnswer}=await load();
 for(const wire of ['{','null','[]','{}',' '.repeat(MAX_SIGNAL_BYTES+1),JSON.stringify({version:1,type:'offer',description:{type:'answer',sdp:'x'}}),JSON.stringify({version:1,type:'offer',description:{type:'offer',sdp:'x'},extra:true})])
  assert.throws(()=>parseLanSignal(wire),TypeError);
 assert.throws(()=>encodeLanSignal({type:'offer',sdp:''}),TypeError);
 await assert.rejects(()=>acceptLanOffer(fake(),encodeLanSignal({type:'answer',sdp:'x'})),TypeError);
 await assert.rejects(()=>acceptLanAnswer(fake(),encodeLanSignal({type:'offer',sdp:'x'})),TypeError);
});
test('manual LAN signaling surfaces peer connection failures',async()=>{
 const {createLanOffer,acceptLanOffer,encodeLanSignal}=await load();
 const host=fake();host.setLocalDescription=async()=>{throw new Error('connection-failed')};
 await assert.rejects(()=>createLanOffer(host),/connection-failed/);
 const guest=fake();guest.setRemoteDescription=async()=>{throw new Error('bad-sdp')};
 await assert.rejects(()=>acceptLanOffer(guest,encodeLanSignal({type:'offer',sdp:'x'})),/bad-sdp/);
});
