'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../src/modules/lan_peer_connection.js');
const session = 'lan_session_12345';
const hostHello = {protocol:1,type:'hello',session,sequence:0,role:'host',build:'0.9.39.0'};
const guestHello = {...hostHello,role:'guest'};
class FakeChannel extends EventTarget {
  constructor(label) {super(); this.label=label; this.readyState='connecting'; this.sent=[];}
  send(packet) {if(this.readyState!=='open')throw Error('closed');this.sent.push(packet);}
  close() {this.readyState='closed';this.dispatchEvent(new Event('close'));}
  open() {this.readyState='open';this.dispatchEvent(new Event('open'));}
}
class FakePeer extends EventTarget {
  constructor(config) {super();this.config=config;this.iceGatheringState='new';this.connectionState='new';}
  createDataChannel(label) {this.channel=new FakeChannel(label);return this.channel;}
  async createOffer() {return {type:'offer',sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'};}
  async createAnswer() {return {type:'answer',sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'};}
  async setLocalDescription(value) {this.localDescription=value;this.iceGatheringState='complete';this.dispatchEvent(new Event('icegatheringstatechange'));}
  async setRemoteDescription(value) {this.remoteDescription=value;}
  close() {this.connectionState='closed';this.dispatchEvent(new Event('connectionstatechange'));}
  emitChannel(channel) {const event=new Event('datachannel');event.channel=channel;this.dispatchEvent(event);}
}
test('LAN-014 host and guest exchange gathered SDP with matching session/build',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  assert.deepEqual(host.peer.config,{iceServers:[]});
  const offer=await host.createOffer();
  assert.equal(JSON.parse(offer).kind,'offer');
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  assert.equal(host.phase,'connected-signaling');
  assert.equal(guest.phase,'connected-signaling');
  assert.equal(host.peer.remoteDescription.type,'answer');
  assert.equal(guest.peer.remoteDescription.type,'offer');
  assert.equal(host.ready,false); // SDP exchange is not a completed protocol handshake.
  const channel=new FakeChannel('smf-lan');guest.peer.emitChannel(channel);
  channel.open();host.peer.channel.open();
  assert.ok(guest.binding);assert.ok(host.binding);
  assert.equal(host.peer.channel.sent.length,1);
  assert.equal(channel.sent.length,1);
  guest.dispose();host.dispose();
  assert.equal(guest.disposed,true);assert.equal(host.disposed,true);
});
test('LAN-014 rejects wrong role, replayed signals and mismatched session/build',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  await assert.rejects(guest.createOffer(),/role or phase/);
  await assert.rejects(host.acceptOffer('{}'),/role or phase/);
  const offer=await host.createOffer();
  await assert.rejects(guest.acceptOffer(JSON.stringify({...JSON.parse(offer),build:'0.9.38.0'})),/mismatch/);
  await assert.rejects(guest.acceptOffer(JSON.stringify({...JSON.parse(offer),session:'wrong_session_123'})),/mismatch/);
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  await assert.rejects(host.acceptAnswer(answer),/role or phase/);
  await assert.rejects(guest.acceptOffer(offer),/role or phase/);
  host.dispose();guest.dispose();
});
test('LAN-014 bounds untrusted signals and prevents extra/unexpected channels',async()=>{
  const {createLanPeerConnection,parseLanSignal}=await load();
  assert.throws(()=>parseLanSignal('x'.repeat(200001),'offer',hostHello),/size/);
  assert.throws(()=>parseLanSignal('{','offer',hostHello),/JSON/);
  assert.throws(()=>parseLanSignal(JSON.stringify({protocol:1,kind:'offer',session,build:'0.9.39.0',sdp:'bad'}),'offer',hostHello),/mismatch/);
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  const rogue=new FakeChannel('unexpected');guest.peer.emitChannel(rogue);
  assert.equal(rogue.readyState,'closed');assert.equal(guest.binding,null);
  const legit=new FakeChannel('smf-lan');guest.peer.emitChannel(legit);
  const duplicate=new FakeChannel('smf-lan');guest.peer.emitChannel(duplicate);
  assert.equal(duplicate.readyState,'closed');assert.ok(guest.binding);
  guest.dispose();
});
test('LAN-014 ICE gathering timeout rejects instead of emitting partial SDP',async()=>{
  const {createLanPeerConnection}=await load();
  class NoIcePeer extends FakePeer {async setLocalDescription(value){this.localDescription=value;}}
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:NoIcePeer,iceTimeoutMs:5});
  await assert.rejects(host.createOffer(),/timed out/);
  assert.notEqual(host.phase,'awaiting-answer');
  host.dispose();
});
