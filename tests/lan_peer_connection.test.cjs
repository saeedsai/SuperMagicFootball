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
  const rogueHost=new FakeChannel('unexpected');host.peer.emitChannel(rogueHost);
  assert.equal(rogueHost.readyState,'closed');
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

test('LAN-014 failed ICE gathering disposes the half-open peer',async()=>{
  const {createLanPeerConnection}=await load();
  class NoIcePeer extends FakePeer {async setLocalDescription(value){this.localDescription=value;}}
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:NoIcePeer,iceTimeoutMs:5});
  await assert.rejects(host.createOffer(),/timed out/);
  assert.equal(host.disposed,true);
  assert.equal(host.peer.connectionState,'closed');
  assert.equal(host.peer.channel.readyState,'closed');
});
test('LAN-014 failed remote answer disposes the host connection',async()=>{
  const {createLanPeerConnection}=await load();
  class BrokenAnswerPeer extends FakePeer {
    async setRemoteDescription(value){throw new Error('remote SDP rejected');}
  }
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:BrokenAnswerPeer});
  await host.createOffer();
  const signal=JSON.stringify({protocol:1,kind:'answer',session,build:hostHello.build,
    sdp:'v=0\\r\\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\\r\\n'});
  await assert.rejects(host.acceptAnswer(signal),/remote SDP rejected/);
  assert.equal(host.disposed,true);
  assert.equal(host.peer.connectionState,'closed');
});

test('LAN-014 rejected signals leave a healthy session reusable',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  await assert.rejects(guest.createOffer(),/role or phase/);
  assert.equal(guest.disposed,false);
  await assert.rejects(guest.acceptOffer('invalid JSON'),/JSON/);
  assert.equal(guest.phase,'new');
  const offer=await host.createOffer();
  const wrongBuild=JSON.stringify({...JSON.parse(offer),build:'not-this-build'});
  await assert.rejects(guest.acceptOffer(wrongBuild),/mismatch/);
  assert.equal(guest.disposed,false);
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  await assert.rejects(host.acceptAnswer(answer),/role or phase/);
  assert.equal(host.disposed,false);
  assert.equal(host.phase,'connected-signaling');
  host.dispose();
  guest.dispose();
});

test('LAN-015 awaitReady waits for protocol hello, not only SDP',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  const offer=await host.createOffer();
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  const pending=host.awaitReady(500);
  const guestChannel=new FakeChannel('smf-lan');
  guest.peer.emitChannel(guestChannel);
  host.peer.channel.open();
  guestChannel.open();
  assert.equal(host.ready,false);
  const hello=new Event('message');
  hello.data=JSON.stringify(guestHello);
  host.peer.channel.dispatchEvent(hello);
  const binding=await pending;
  assert.equal(binding,host.binding);
  assert.equal(host.ready,true);
  host.dispose();guest.dispose();
});
test('LAN-015 awaitReady bounds timeout and rejects disposed/failed peers',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  await assert.rejects(host.awaitReady(0),/readiness timeout/);
  await assert.rejects(host.awaitReady(5),/handshake timed out/);
  host.peer.connectionState='failed';
  await assert.rejects(host.awaitReady(50),/closed before handshake/);
  host.dispose();
  await assert.rejects(host.awaitReady(50),/disposed/);
});

test('LAN-016 peer input bridge enforces handshake, roles, frames and four buttons',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  const deliver=(channel,packet)=>{
    const event=new Event('message');
    event.data=packet;
    channel.dispatchEvent(event);
  };
  assert.throws(()=>guest.sendGuestInput(0,['pass']),/ready guest/);
  assert.throws(()=>host.advanceHostFrame(0),/ready host/);
  const offer=await host.createOffer();
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  const guestChannel=new FakeChannel('smf-lan');
  guest.peer.emitChannel(guestChannel);
  host.peer.channel.open();
  guestChannel.open();
  assert.throws(()=>guest.sendGuestInput(0,['pass']),/ready guest/);
  deliver(host.peer.channel,JSON.stringify(guestHello));
  deliver(guestChannel,JSON.stringify(hostHello));
  assert.equal(host.ready,true);
  assert.equal(guest.ready,true);
  assert.throws(()=>host.sendGuestInput(0,['pass']),/ready guest/);
  assert.throws(()=>guest.advanceHostFrame(0),/ready host/);
  assert.throws(()=>guest.sendGuestInput(3,['invalid']),/Invalid LAN buttons/);
  const packet=guest.sendGuestInput(3,['pass','jump'],1,-1);
  assert.equal(packet.frame,3);
  assert.deepEqual(packet.buttons,['pass','jump']);
  deliver(host.peer.channel,guestChannel.sent.at(-1));
  const frame=host.advanceHostFrame(3);
  assert.equal(frame.received,true);
  assert.deepEqual(frame.input.buttons,['pass','jump']);
  assert.equal(frame.input.dx,1);
  assert.equal(frame.input.dy,-1);
  assert.throws(()=>host.advanceHostFrame(3),/must advance/);
  assert.throws(()=>guest.sendGuestInput(3,['pass']),/sender or frame/);
  const next=host.advanceHostFrame(4);
  assert.equal(next.received,false);
  assert.deepEqual(next.input.buttons,[]);
  guest.dispose();host.dispose();
  assert.throws(()=>guest.sendGuestInput(5,['pass']),/ready guest/);
  assert.throws(()=>host.advanceHostFrame(5),/ready host/);
});

test('LAN-017 transport diagnostics track channel and peer lifecycle without mutating RTC',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  assert.equal(host.transportState,'new');
  assert.equal(host.channelState,'connecting');
  host.peer.channel.open();
  assert.equal(host.channelState,'open');
  host.peer.connectionState='connected';
  assert.equal(host.transportState,'connected');
  host.dispose();
  assert.equal(host.transportState,'closed');
  assert.equal(host.channelState,'closed');
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  assert.equal(guest.channelState,'unavailable');
  guest.dispose();
});

test('LAN-018 connection lifecycle gates readiness and four-button frame exchange',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  const offer=await host.createOffer();
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  const guestChannel=new FakeChannel('smf-lan');
  guest.peer.emitChannel(guestChannel);
  host.peer.channel.open();
  guestChannel.open();
  const deliver=(channel,packet)=>{
    const event=new Event('message');event.data=JSON.stringify(packet);
    channel.dispatchEvent(event);
  };
  deliver(host.peer.channel,guestHello);
  deliver(guestChannel,hostHello);
  assert.equal(host.ready,true);
  assert.equal(guest.ready,true);

  host.peer.connectionState='disconnected';
  assert.equal(host.ready,false);
  assert.throws(()=>host.advanceHostFrame(0),/ready host/);
  host.peer.connectionState='connected';
  assert.equal(host.ready,true);
  assert.equal(host.advanceHostFrame(0).received,false);

  guest.peer.connectionState='failed';
  assert.equal(guest.ready,false);
  assert.throws(()=>guest.sendGuestInput(1,['pass']),/ready guest/);
  guest.peer.connectionState='connected';
  assert.equal(guest.ready,true);
  assert.deepEqual(guest.sendGuestInput(1,['pass']).buttons,['pass']);
  guestChannel.close();
  assert.equal(guest.ready,false);
  assert.throws(()=>guest.sendGuestInput(2,['pass']),/ready guest/);
  host.dispose();guest.dispose();
});

test('LAN-018 awaitReady waits through a temporary disconnected RTC state',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  const offer=await host.createOffer();
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  const guestChannel=new FakeChannel('smf-lan');
  guest.peer.emitChannel(guestChannel);
  host.peer.channel.open();guestChannel.open();
  const message=new Event('message');message.data=JSON.stringify(guestHello);
  host.peer.channel.dispatchEvent(message);
  host.peer.connectionState='disconnected';
  let resolved=false;
  const pending=host.awaitReady(1000).then(binding=>{resolved=true;return binding;});
  await new Promise(resolve=>setTimeout(resolve,75));
  assert.equal(resolved,false,'must not certify a disconnected RTC peer');
  host.peer.connectionState='connected';
  assert.equal(await pending,host.binding);
  assert.equal(host.ready,true);
  host.dispose();guest.dispose();
});

test('LAN-019 status subscriptions report SDP, handshake, RTC changes and disposal',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  const statuses=[];
  const unsubscribe=host.subscribeStatus(status=>statuses.push(status));
  assert.equal(statuses.length,1);
  assert.deepEqual(host.status,{phase:'new',transport:'new',channel:'connecting',ready:false});
  assert.equal(Object.isFrozen(statuses[0]),true);
  assert.equal(guest.status.channel,'unavailable');
  const offer=await host.createOffer();
  assert.equal(statuses.at(-1).phase,'awaiting-answer');
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  assert.equal(statuses.at(-1).phase,'connected-signaling');
  assert.equal(statuses.at(-1).ready,false);
  host.peer.channel.open();
  assert.equal(statuses.at(-1).channel,'open');
  const hello=new Event('message');
  hello.data=JSON.stringify(guestHello);
  host.peer.channel.dispatchEvent(hello);
  assert.equal(statuses.at(-1).ready,true);
  const count=statuses.length;
  host.peer.channel.dispatchEvent(hello); // replay must not duplicate status
  assert.equal(statuses.length,count);
  host.peer.connectionState='disconnected';
  host.peer.dispatchEvent(new Event('connectionstatechange'));
  assert.equal(statuses.at(-1).ready,false);
  host.peer.connectionState='connected';
  host.peer.dispatchEvent(new Event('connectionstatechange'));
  assert.equal(statuses.at(-1).ready,true);
  host.dispose();
  assert.deepEqual(statuses.at(-1),{phase:'closed',transport:'closed',channel:'closed',ready:false});
  const finalCount=statuses.length;
  host.peer.dispatchEvent(new Event('connectionstatechange'));
  assert.equal(statuses.length,finalCount);
  unsubscribe();
  guest.dispose();
});
test('LAN-019 status observers are isolated and unsubscribe prevents further events',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  assert.throws(()=>host.subscribeStatus(null),/listener/);
  host.subscribeStatus(()=>{throw Error('UI listener failed');});
  const events=[];
  const unsubscribe=host.subscribeStatus(status=>events.push(status));
  assert.equal(events.length,1);
  host.peer.channel.open();
  assert.equal(events.length,2);
  unsubscribe();
  host.peer.connectionState='disconnected';
  host.peer.dispatchEvent(new Event('connectionstatechange'));
  assert.equal(events.length,2);
  host.dispose();
  assert.equal(events.length,2);
  const after=[];
  host.subscribeStatus(status=>after.push(status));
  assert.equal(after.length,1);
  assert.equal(after[0].phase,'closed');
});

test('LAN-020 cancelled lobby wait rejects promptly without closing reusable peer',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const controller=new AbortController();
  const pending=host.awaitReady(5000,controller.signal);
  controller.abort();
  await assert.rejects(pending,/cancelled/);
  assert.equal(host.disposed,false);
  assert.equal(host.phase,'new');
  const offer=await host.createOffer();
  assert.equal(JSON.parse(offer).kind,'offer');
  host.dispose();
});
test('LAN-020 pre-aborted readiness signal is rejected immediately',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const controller=new AbortController();
  controller.abort();
  await assert.rejects(host.awaitReady(5000,controller.signal),/cancelled/);
  host.dispose();
});

test('LAN-021 malformed cancellation tokens reject safely and preserve reusable host',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  for(const invalid of [{aborted:false},{aborted:false,addEventListener(){}},{aborted:'no',addEventListener(){},removeEventListener(){}}]){
    await assert.rejects(host.awaitReady(5000,invalid),/AbortSignal/);
  }
  assert.equal(host.disposed,false);
  assert.equal(host.phase,'new');
  assert.equal(JSON.parse(await host.createOffer()).kind,'offer');
  host.dispose();
});

test('LAN-022 abortable status subscription cleans up without affecting peer',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const controller=new AbortController();
  const states=[];
  const unsubscribe=host.subscribeStatus(status=>states.push(status),controller.signal);
  assert.equal(states.length,1);
  host.peer.channel.open();
  assert.equal(states.length,2);
  controller.abort();
  host.peer.connectionState='connected';
  host.peer.dispatchEvent(new Event('connectionstatechange'));
  assert.equal(states.length,2);
  unsubscribe();
  assert.equal(host.disposed,false);
  const aborted=new AbortController();aborted.abort();
  let called=0;
  host.subscribeStatus(()=>called++,aborted.signal);
  assert.equal(called,0);
  assert.throws(()=>host.subscribeStatus(()=>{},{}),/AbortSignal/);
  host.dispose();
});

test('LAN-023 late status subscriber receives terminal snapshot without being retained',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  host.dispose();
  const controller=new AbortController();
  const states=[];
  const unsubscribe=host.subscribeStatus(state=>states.push(state),controller.signal);
  assert.deepEqual(states,[{phase:'closed',transport:'closed',channel:'closed',ready:false}]);
  controller.abort();
  host.peer.dispatchEvent(new Event('connectionstatechange'));
  assert.equal(states.length,1);
  unsubscribe();
  const preAborted=new AbortController();
  preAborted.abort();
  let called=0;
  host.subscribeStatus(()=>called++,preAborted.signal);
  assert.equal(called,0);
});

test('LAN-025 host observes only validated guest inputs, preserving authoritative frame queue',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakePeer});
  const controller=new AbortController();
  const accepted=[];
  assert.throws(()=>host.subscribeHostInput(null),/listener/);
  assert.throws(()=>host.subscribeHostInput(()=>{},{}),/AbortSignal/);
  assert.throws(()=>guest.subscribeHostInput(()=>{}),/active host/);
  host.subscribeHostInput(()=>{throw Error('observer error');});
  const unsubscribe=host.subscribeHostInput(packet=>accepted.push(packet),controller.signal);
  const deliver=(channel,packet)=>{
    const message=new Event('message');
    message.data=typeof packet==='string'?packet:JSON.stringify(packet);
    channel.dispatchEvent(message);
  };
  const offer=await host.createOffer();
  const answer=await guest.acceptOffer(offer);
  await host.acceptAnswer(answer);
  const guestChannel=new FakeChannel('smf-lan');
  guest.peer.emitChannel(guestChannel);
  host.peer.channel.open();guestChannel.open();
  deliver(host.peer.channel,guestHello);
  deliver(guestChannel,hostHello);
  assert.equal(host.ready,true);
  assert.equal(guest.ready,true);
  const first=guest.sendGuestInput(3,['pass','jump'],1,-1);
  deliver(host.peer.channel,first);
  assert.equal(accepted.length,1);
  assert.equal(accepted[0].frame,3);
  assert.deepEqual(accepted[0].buttons,['pass','jump']);
  assert.equal(Object.isFrozen(accepted[0]),true);
  deliver(host.peer.channel,first); // replay rejected
  deliver(host.peer.channel,{...first,session:'other_1234567890',sequence:2});
  deliver(host.peer.channel,'not JSON');
  assert.equal(accepted.length,1);
  const next=guest.sendGuestInput(4,['shoot'],0,1);
  controller.abort();
  deliver(host.peer.channel,next);
  assert.equal(accepted.length,1,'aborted observer must not be notified');
  assert.equal(host.advanceHostFrame(3).received,true);
  const frame4=host.advanceHostFrame(4);
  assert.equal(frame4.received,true);
  assert.deepEqual(frame4.input.buttons,['shoot']);
  unsubscribe();
  host.dispose();guest.dispose();
  assert.throws(()=>host.subscribeHostInput(()=>{}),/active host/);
});

test('LAN-025 pre-aborted host input subscriptions do not receive events',async()=>{
  const {createLanPeerConnection}=await load();
  const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakePeer});
  const aborted=new AbortController();aborted.abort();
  let count=0;
  const stop=host.subscribeHostInput(()=>count++,aborted.signal);
  host.peer.channel.open();
  const hello=new Event('message');hello.data=JSON.stringify(guestHello);
  host.peer.channel.dispatchEvent(hello);
  const packet=new Event('message');
  packet.data=JSON.stringify({protocol:1,type:'input',session,sequence:1,frame:0,buttons:['dribble'],dx:0,dy:0});
  host.peer.channel.dispatchEvent(packet);
  assert.equal(count,0);
  assert.equal(host.binding.state.queue.pending.length,1);
  stop();host.dispose();
});
