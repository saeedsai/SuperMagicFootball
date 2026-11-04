'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const load=()=>import('../src/modules/lan_protocol.js');
const loadChannel=()=>import('../src/modules/lan-protocol-channel.js');
const loadMatch=()=>import('../src/modules/lan-live-match.js');
const field={x:100,y:50,w:800,h:400};
function game(input){
 return {matchState:'play',clock:0,half:1,controlled:[3,3],score:[0,0],
  players:[{t:0,i:0,x:300,y:100,face:1,anim:0},{t:1,i:0,x:700,y:350,face:-1,anim:0}],
  ball:{x:500,y:250,z:0,owner:null},
  update(dt){input.poll(true);this.clock+=dt;}};
}
function input(){return {state:[{x:0,y:0,pass:0,shoot:0,dribble:0,jump:0},{},{},{}],
 pressed:[{},{},{},{}],releases:[{},{},{},{}],prev:[{},{},{},{}],tapDurations:[{},{},{},{}],
 poll(){},held(){return false;},just(){return false;}};}
function fakeTimers(){
 const timers=[];
 return {timers,setTimer(fn,delay){const timer={fn,delay,cleared:false};timers.push(timer);return timer;},
  clearTimer(timer){if(timer)timer.cleared=true;},run(timer=timers[0]){assert.ok(timer);if(!timer.cleared){timer.cleared=true;timer.fn();}}};
}

class FakeChannel{
 constructor(){this.readyState='connecting';this.listeners=new Map();this.peer=null;this.bufferedAmount=0;}
 addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
 removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}
 emit(type,event={}){for(const fn of [...(this.listeners.get(type)||[])])fn(event);}
 send(data){if(this.readyState!=='open')throw Error('closed');this.peer.emit('message',{data});}
 open(){this.readyState='open';this.emit('open');}
}
function channelPair(){const host=new FakeChannel(),guest=new FakeChannel();host.peer=guest;guest.peer=host;return {host,guest};}

class FakeRtcChannel extends EventTarget{
 constructor(label='smf-lan'){super();this.label=label;this.readyState='connecting';this.sent=[];}
 send(packet){if(this.readyState!=='open')throw Error('closed');this.sent.push(packet);}
 open(){this.readyState='open';this.dispatchEvent(new Event('open'));}
 close(){this.readyState='closed';this.dispatchEvent(new Event('close'));}
}
class FakeRtcPeer extends EventTarget{
 constructor(){super();this.iceGatheringState='new';this.connectionState='new';}
 createDataChannel(label){this.channel=new FakeRtcChannel(label);return this.channel;}
 async createOffer(){return {type:'offer',sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'};}
 async createAnswer(){return {type:'answer',sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'};}
 async setLocalDescription(value){this.localDescription=value;this.iceGatheringState='complete';this.dispatchEvent(new Event('icegatheringstatechange'));}
 async setRemoteDescription(value){this.remoteDescription=value;}
 close(){this.connectionState='closed';this.dispatchEvent(new Event('connectionstatechange'));}
 emitChannel(channel){const event=new Event('datachannel');event.channel=channel;this.dispatchEvent(event);}
}

test('LAN-098 strict result ACK packet is separate, duplicate-safe, and cannot advance the control sequence',async()=>{
 const {normalizeLanPacket,buildLanResultAck,receiveLanPeerPacket}=await load();
 const {bindLanProtocolChannel}=await loadChannel();
 const hostHello={protocol:1,type:'hello',session:'room_1234567890',sequence:0,role:'host',build:'0.12.80.0'};
 const guestHello={...hostHello,role:'guest'};
 const receiptId='lan:room001:host001:0123456789abcdef0123456789abcdef';
 const packet=buildLanResultAck(hostHello.session,receiptId);
 assert.deepEqual(packet,{protocol:1,type:'result-ack',session:hostHello.session,sequence:0,receiptId});
 for(const bad of [
  {...packet,receiptId:'lan:room001:host001:bad'},
  {...packet,receiptId,extra:true},
  {...packet,sequence:1},
  {...packet,session:'bad'}
 ])assert.throws(()=>normalizeLanPacket(bad));

 const {host,guest}=channelPair();
 const H=bindLanProtocolChannel(hostHello,host),G=bindLanProtocolChannel(guestHello,guest);
 host.open();guest.open();assert.equal(H.ready,true);assert.equal(G.ready,true);
 const acks=[];H.subscribeResultAck(ack=>acks.push(ack));
 guest.bufferedAmount=16*1024;
 assert.throws(()=>G.sendResultAck(receiptId),/backpressure/,'ACK traffic obeys the bounded guest channel queue');
 guest.bufferedAmount=0;
 G.sendResultAck(receiptId);G.sendResultAck(receiptId);
 assert.equal(acks.length,2,'duplicates remain observable for match-level idempotency');
 assert.equal(H.state.peer.lastSequence,0,'ACK sequence never advances the ordered input cursor');
 assert.equal(G.sendInput(4,['jump']).sequence,1);
 assert.deepEqual(H.advance(4).input.buttons,['jump']);
 assert.equal(H.state.peer.lastSequence,1,'normal controls remain contiguous after ACK traffic');
 H.dispose();G.dispose();
});

test('LAN-098 peer connection API carries only validated ACKs over the established channel',async()=>{
 const {createLanPeerConnection}=await import('../src/modules/lan_peer_connection.js');
 const hostHello={protocol:1,type:'hello',session:'room_1234567890',sequence:0,role:'host',build:'0.12.80.0'};
 const guestHello={...hostHello,role:'guest'},receiptId='lan:room001:host001:0123456789abcdef0123456789abcdef';
 const host=createLanPeerConnection(hostHello,{RTCPeerConnection:FakeRtcPeer});
 const guest=createLanPeerConnection(guestHello,{RTCPeerConnection:FakeRtcPeer});
 const deliver=(channel,packet)=>{const event=new Event('message');event.data=packet;channel.dispatchEvent(event);};
 const offer=await host.createOffer(),answer=await guest.acceptOffer(offer);await host.acceptAnswer(answer);
 const guestChannel=new FakeRtcChannel();guest.peer.emitChannel(guestChannel);
 host.peer.channel.open();guestChannel.open();
 deliver(host.peer.channel,JSON.stringify(guestHello));deliver(guestChannel,JSON.stringify(hostHello));
 const received=[];host.subscribeHostResultAck(packet=>received.push(packet));
 assert.equal(guest.sendGuestResultAck(receiptId).receiptId,receiptId);
 deliver(host.peer.channel,guestChannel.sent.at(-1));
 assert.equal(received.length,1);assert.equal(received[0].receiptId,receiptId);
 deliver(host.peer.channel,JSON.stringify({protocol:1,type:'result-ack',session:'wrong_session_123',sequence:0,receiptId}));
 deliver(host.peer.channel,JSON.stringify({protocol:1,type:'result-ack',session:hostHello.session,sequence:0,receiptId:'bad'}));
 assert.equal(received.length,1,'foreign/malformed ACKs are discarded by the protocol boundary');
 assert.equal(guest.sendGuestInput(3,['jump']).sequence,1);
 deliver(host.peer.channel,guestChannel.sent.at(-1));
 assert.equal(host.advanceHostFrame(3).input.buttons[0],'jump','ACK does not consume control sequence');
 host.dispose();guest.dispose();
});

test('LAN-098 exact durable guest receipt ACK confirms host payout once; duplicate terminal snapshots are idempotent',async()=>{
 const {createLanLiveMatch}=await loadMatch();
 const {ECONOMY}=await import('../src/modules/economy.js');
 const identity={roomId:'room001',hostId:'host001'},timers=fakeTimers();
 let hostAck=null,guestReceive=null,tick=1,clock=0;
 const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};};
 const hostWallet=ECONOMY.create(memory()),guestWallet=ECONOMY.create(memory());
 const hostAwards=[],guestAwards=[],hostInput=input(),guestInput=input();
 const host=game(hostInput),guest=game(guestInput);host.onEvent=()=>{};
 const guestPeer={ready:true,snapshotIdentity:identity,
  subscribeGuestMatchState(fn){guestReceive=fn;return {dispose(){}};},sendGuestInput(){return false;},
  sendGuestResultAck(receiptId){hostAck?.({type:'result-ack',receiptId});return true;}};
 const hostPeer={ready:true,snapshotIdentity:identity,
  subscribeHostResultAck(fn){hostAck=fn;return ()=>{hostAck=null;};},
  stepHostMatchFrame(frame,simulate){
   const state=simulate({buttons:[],dx:0,dy:0},{received:true});
   guestReceive(state);return {snapshotSent:true};
  }};
 const hostRun=createLanLiveMatch({peer:hostPeer,role:'host',game:host,input:hostInput,field,now:()=>clock,
  setTimer:timers.setTimer,clearTimer:timers.clearTimer,
  awardResult:r=>{hostAwards.push(r);return hostWallet.awardCompletedMatch(r);}});
 const guestRun=createLanLiveMatch({peer:guestPeer,role:'guest',game:guest,input:guestInput,field,
  now:()=>tick,awardResult:r=>{guestAwards.push(r);return guestWallet.awardCompletedMatch(r);}});
 host.update=function(){this.score=[2,1];this.matchState='finished';this.onEvent({type:'finished',score:[2,1]});};
 assert.equal(hostRun.step(.02),true);
 assert.equal(hostRun.resultAckStatus,'confirmed');
 assert.equal(hostAwards.length,1);assert.equal(guestAwards.length,1);
 assert.equal(hostWallet.wallet().tokens,30);assert.equal(guestWallet.wallet().tokens,20);
 const receiptId=hostAwards[0].receiptId;
 assert.equal(receiptId,guestAwards[0].receiptId);
 hostAck({type:'result-ack',receiptId});hostAck({type:'result-ack',receiptId});
 assert.equal(hostAwards.length,1,'duplicate ACKs cannot trigger another wallet award');
 clock=1500;tick=1700;assert.equal(hostRun.step(.02),true,'frozen result refresh remains available');
 assert.equal(guestAwards.length,2,'replayed terminal result recognizes the existing local receipt');
 assert.equal(guestWallet.wallet().tokens,20);
 assert.ok(timers.timers[0].cleared,'matching ACK cancels the timeout fallback');
 hostRun.dispose();guestRun.dispose();
});

test('LAN-098 stale or cross-match ACK is ignored; bounded timeout pays once as unconfirmed',async()=>{
 const {createLanLiveMatch}=await loadMatch();
 const {ECONOMY}=await import('../src/modules/economy.js');
 const identity={roomId:'room001',hostId:'host001'},timers=fakeTimers();
 let hostAck=null;
 const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
 const wallet=ECONOMY.create(storage),awards=[],matchInput=input(),match=game(matchInput);match.onEvent=()=>{};
 const peer={ready:true,snapshotIdentity:identity,
  subscribeHostResultAck(fn){hostAck=fn;return ()=>{hostAck=null;};},
  stepHostMatchFrame(frame,simulate){const state=simulate({buttons:[],dx:0,dy:0},{received:true});return {snapshotSent:true,state};}};
 const run=createLanLiveMatch({peer,role:'host',game:match,input:matchInput,field,
  setTimer:timers.setTimer,clearTimer:timers.clearTimer,
  awardResult:r=>{awards.push(r);return wallet.awardCompletedMatch(r);}});
 match.update=function(){this.score=[0,0];this.matchState='finished';this.onEvent({type:'finished',score:[0,0]});};
 assert.equal(run.step(.02),true);assert.equal(run.resultAckStatus,'pending');assert.equal(awards.length,0);
 const expected=timers.timers[0];
 hostAck({type:'result-ack',receiptId:'lan:room001:host001:ffffffffffffffffffffffffffffffff'});
 hostAck({type:'input',receiptId:expected.receiptId});
 hostAck({type:'result-ack',receiptId:'lan:room002:host001:ffffffffffffffffffffffffffffffff'});
 assert.equal(run.resultAckStatus,'pending');assert.equal(awards.length,0);
 assert.equal(expected.delay,3000,'timeout is bounded to three seconds');
 timers.run(expected);
 assert.equal(run.resultAckStatus,'unconfirmed');assert.equal(awards.length,1);
 assert.equal(wallet.wallet().tokens,25);
 timers.run(expected);assert.equal(awards.length,1,'timeout and later duplicate execution cannot double-award');
 run.dispose();
});

test('LAN-098 older peers without ACK support use the same bounded unconfirmed fallback',async()=>{
 const {createLanLiveMatch}=await loadMatch();
 const {ECONOMY}=await import('../src/modules/economy.js');
 const identity={roomId:'room001',hostId:'host001'},timers=fakeTimers();
 const values=new Map(),wallet=ECONOMY.create({getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)});
 const awards=[],matchInput=input(),match=game(matchInput);match.onEvent=()=>{};
 const peer={ready:true,snapshotIdentity:identity,
  stepHostMatchFrame(frame,simulate){simulate({buttons:[],dx:0,dy:0},{received:true});return {snapshotSent:true};}};
 const run=createLanLiveMatch({peer,role:'host',game:match,input:matchInput,field,
  setTimer:timers.setTimer,clearTimer:timers.clearTimer,
  awardResult:r=>{awards.push(r);return wallet.awardCompletedMatch(r);}});
 match.update=function(){this.score=[1,0];this.matchState='finished';this.onEvent({type:'finished',score:[1,0]});};
 assert.equal(run.step(.02),true);assert.equal(run.resultAckStatus,'pending');assert.equal(awards.length,0);
 timers.run();
 assert.equal(run.resultAckStatus,'unconfirmed');assert.equal(awards.length,1);
 assert.equal(wallet.wallet().tokens,30);
 run.dispose();
});

test('LAN-098 immediate host disposal cancels the pending ACK fallback without a delayed award',async()=>{
 const {createLanLiveMatch}=await loadMatch();
 const identity={roomId:'room001',hostId:'host001'},timers=fakeTimers();
 let hostAck=null;const awards=[],matchInput=input(),match=game(matchInput);match.onEvent=()=>{};
 const peer={ready:true,snapshotIdentity:identity,
  subscribeHostResultAck(fn){hostAck=fn;return ()=>{hostAck=null;};},
  stepHostMatchFrame(frame,simulate){simulate({buttons:[],dx:0,dy:0},{received:true});return {snapshotSent:true};}};
 const run=createLanLiveMatch({peer,role:'host',game:match,input:matchInput,field,
  setTimer:timers.setTimer,clearTimer:timers.clearTimer,
  awardResult:result=>{awards.push(result);return true;}});
 match.update=function(){this.score=[1,0];this.matchState='finished';this.onEvent({type:'finished',score:[1,0]});};
 assert.equal(run.step(.02),true);assert.equal(run.resultAckStatus,'pending');assert.equal(awards.length,0);
 const fallback=timers.timers[0];assert.equal(fallback.delay,3000);
 run.dispose();assert.equal(run.disposed,true);assert.equal(fallback.cleared,true);
 timers.run(fallback);
 assert.equal(hostAck,null,'immediate leave removes the host ACK subscription');
 assert.equal(awards.length,0,'a delayed fallback cannot award after explicit disposal');
});
