'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

const SESSION='lan_recovery_session_001';
const BUILD='0.12.23.0';
const field={x:0,y:0,w:1000,h:500};

class LocalChannel extends EventTarget{
 constructor(label){super();this.label=label;this.readyState='connecting';this.remote=null;this.holdNext=false;this.held=[];}
 send(data){
  if(this.readyState!=='open')throw Error('local peer channel closed');
  // Model delivery delay on a reliable ordered RTCDataChannel: a held frame
  // stays ahead of later input and is eventually delivered without loss.
  if(this.holdNext){this.holdNext=false;this.held.push(data);return;}
  if(!this.remote||this.remote.readyState!=='open')return;
  const event=new Event('message');Object.defineProperty(event,'data',{value:data});this.remote.dispatchEvent(event);
 }
 flushHeld(){
  for(const data of this.held.splice(0)){
   if(!this.remote||this.remote.readyState!=='open')return;
   const event=new Event('message');Object.defineProperty(event,'data',{value:data});this.remote.dispatchEvent(event);
  }
 }
 open(){this.readyState='open';this.dispatchEvent(new Event('open'));}
 close(){this.readyState='closed';this.dispatchEvent(new Event('close'));}
}

let offerIndex=0;
const localOffers=new Map();
class LocalPeerConnection extends EventTarget{
 constructor(){super();this.iceGatheringState='new';this.connectionState='new';this.iceConnectionState='new';this.channel=null;this.offerId=null;}
 createDataChannel(label){this.channel=new LocalChannel(label);return this.channel;}
 async createOffer(){this.offerId='local_'+(++offerIndex);localOffers.set(this.offerId,this);return {type:'offer',sdp:`v=0\r\ns=${this.offerId}\r\nt=0 0\r\n`};}
 async createAnswer(){return {type:'answer',sdp:`v=0\r\ns=${this.offerId}\r\nt=0 0\r\n`};}
 async setLocalDescription(description){this.localDescription=description;this.iceGatheringState='complete';this.dispatchEvent(new Event('icegatheringstatechange'));}
 async setRemoteDescription(description){
  this.remoteDescription=description;
  const id=/^s=(local_\d+)$/m.exec(description.sdp)?.[1];
  if(!id)throw Error('bad local SDP');this.offerId=id;
  if(description.type==='offer'){
   this.remoteHost=localOffers.get(id);if(!this.remoteHost)throw Error('unknown offer');
   this.remoteHost.remoteGuest=this;
  }else if(description.type==='answer'){
   const host=localOffers.get(id),guest=host?.remoteGuest;
   if(host!==this||!guest)throw Error('answer has no paired local guest');
   const hostChannel=host.channel,guestChannel=new LocalChannel('smf-lan');
   hostChannel.remote=guestChannel;guestChannel.remote=hostChannel;
   guest.channel=guestChannel;
   const event=new Event('datachannel');Object.defineProperty(event,'channel',{value:guestChannel});
   guest.dispatchEvent(event);
   for(const peer of [host,guest]){peer.connectionState='connected';peer.iceConnectionState='connected';
    peer.dispatchEvent(new Event('connectionstatechange'));peer.dispatchEvent(new Event('iceconnectionstatechange'));}
   // Open the remote first; the host hello then crosses a genuinely separate
   // peer channel and completes the production protocol handshake.
   guestChannel.open();hostChannel.open();
  }
 }
 close(){this.connectionState='closed';this.iceConnectionState='closed';this.channel?.close();this.dispatchEvent(new Event('connectionstatechange'));}
 setIce(state){this.iceConnectionState=state;this.dispatchEvent(new Event('iceconnectionstatechange'));}
}

function controls(){return {
 state:[{x:1,y:0,pass:0,shoot:0,dribble:0,jump:1},{}],
 pressed:[{jump:true},{}],releases:[{},{}],prev:[{},{}],tapDurations:[{},{}],
 poll(){this.state[0]={x:1,y:0,pass:0,shoot:0,dribble:0,jump:1};this.pressed[0]={jump:true};},
 held(slot,action){return !!this.state[slot]?.[action];},just(slot,action){return !!this.pressed[slot]?.[action];}
};}
function game(input){return {matchState:'play',clock:0,half:1,controlled:[3,3],score:[0,0],players:[
 {t:0,i:0,x:240,y:100,face:1,anim:0,action:'idle',actionTimer:0,z:0,stun:0,slideTimer:0,diveElapsed:0,diveDy:0},
 {t:1,i:0,x:760,y:400,face:-1,anim:0,action:'idle',actionTimer:0,z:0,stun:0,slideTimer:0,diveElapsed:0,diveDy:0}],
 ball:{x:500,y:250,z:0,vx:0,vy:0,age:0,owner:null},updates:[],
 update(dt){input.poll(true);this.clock+=dt;this.updates.push({remoteX:input.state[1].x,jump:!!input.state[1].jump,pressed:!!input.pressed[1].jump});
  this.players[1].x+=(input.state[1].x||0)*80*dt;}
};}
function message(channel,data){const event=new Event('message');Object.defineProperty(event,'data',{value:data});channel.dispatchEvent(event);}

test('LAN recovery: two real protocol peers reject stale state, isolate guest ownership, and resume after transport loss',{timeout:5000},async()=>{
 const [{createLanPeerConnection},{createLanLiveMatch,captureLanGameState},{encodeLanSnapshot}]=await Promise.all([
  import('../src/modules/lan_peer_connection.js'),import('../src/modules/lan-live-match.js'),import('../src/modules/lan-state-snapshot.js')]);
 const hostHello={protocol:1,type:'hello',session:SESSION,sequence:0,role:'host',build:BUILD};
 const guestHello={...hostHello,role:'guest'};
 const hostPeer=createLanPeerConnection(hostHello,{RTCPeerConnection:LocalPeerConnection});
 const guestPeer=createLanPeerConnection(guestHello,{RTCPeerConnection:LocalPeerConnection});
 const hostInput=controls(),guestInput=controls(),hostGame=game(hostInput),guestGame=game(guestInput),accepted=[];
 let hostRun,guestRun;
 try{
  const offer=await hostPeer.createOffer(),answer=await guestPeer.acceptOffer(offer);
  await hostPeer.acceptAnswer(answer);
  await Promise.all([hostPeer.awaitReady(200),guestPeer.awaitReady(200)]);
  assert.equal(hostPeer.ready,true);assert.equal(guestPeer.ready,true,'two separate peer bindings complete the production hello');
  hostPeer.subscribeHostInput(packet=>accepted.push(packet));
  hostRun=createLanLiveMatch({peer:hostPeer,role:'host',game:hostGame,input:hostInput,field});
  guestRun=createLanLiveMatch({peer:guestPeer,role:'guest',game:guestGame,input:guestInput,field});

  assert.equal(hostRun.step(1/60),true,'host publishes the initial authority snapshot');
  assert.equal(guestRun.latestTick,0);
  assert.equal(guestRun.step(1/60),true,'guest submits a bounded four-control frame');
  assert.equal(guestPeer.binding.state.sender.lastSequence,1);
  for(let tick=1;tick<=4;tick++)assert.equal(hostRun.step(1/60),true);
  assert.equal(hostGame.updates.at(-1).jump,true,'host alone applies the guest action at its assigned future frame');
  assert.equal(hostGame.updates.at(-1).pressed,true);
  assert.equal(guestGame.updates.length,0,'guest never runs authoritative simulation');
  assert.equal(guestGame.players[1].x,hostGame.players[1].x,'guest renders the host-owned position');

  // Delay one reliable ordered input until its assigned host frame is already
  // simulated. The stale controls are discarded, but the sequence is consumed
  // so the next current guest input still recovers on this same peer session.
  guestPeer.peer.channel.holdNext=true;
  assert.equal(guestRun.step(1/60),true,'transport accepted and queued the frame locally');
  for(let tick=5;tick<=8;tick++)assert.equal(hostRun.step(1/60),true);
  guestPeer.peer.channel.flushHeld();
  assert.equal(guestRun.step(1/60),true,'a later guest frame follows the stale delayed one');
  assert.equal(guestPeer.binding.state.sender.lastSequence,3);
  for(let tick=9;tick<=13;tick++)assert.equal(hostRun.step(1/60),true);
  assert.equal(hostGame.updates.at(-1).jump,true,'a later valid packet resumes input after one simulated loss');

  const controlSnapshot={clock:guestGame.clock,score:[...guestGame.score],phase:guestGame.matchState,tick:guestRun.latestTick};
  const hostState=captureLanGameState(hostGame,field,hostRun.latestTick);
  const identity=hostPeer.snapshotIdentity;
  for(const tick of [hostRun.latestTick,hostRun.latestTick-1]){
   const stale=encodeLanSnapshot({type:'snapshot',version:1,...identity,
    ...hostState,tick,scores:{home:999,away:999},meta:{...hostState.meta,phase:'finished'}});
   message(guestPeer.peer.channel,stale);
  }
  assert.deepEqual([guestGame.clock,guestGame.score,guestGame.matchState,guestRun.latestTick],
   [controlSnapshot.clock,controlSnapshot.score,controlSnapshot.phase,controlSnapshot.tick],
   'duplicate and out-of-order host snapshots cannot rewind or forge guest state');

  const ownerBefore=hostGame.ball.owner;
  const invalid=JSON.stringify({protocol:1,type:'input',session:SESSION,sequence:3,
   frame:hostRun.latestTick+4,buttons:['pause'],dx:0,dy:0,ballOwnerSlot:11,controlled:{away:0}});
  message(guestPeer.peer.channel,invalid);
  assert.equal(accepted.length,2,'invalid control label never enters the host input queue');
  const forgedFrame=hostRun.latestTick+4;
  const forged=JSON.stringify({protocol:1,type:'input',session:SESSION,sequence:4,
   frame:forgedFrame,buttons:[],dx:0,dy:0,
   ballOwnerSlot:11,controlled:{away:0},score:{home:999,away:0},host:true});
  guestPeer.peer.channel.send(forged);
  assert.equal(accepted.length,3);
  assert.deepEqual(Object.keys(accepted.at(-1)).sort(),
   ['buttons','dx','dy','frame','protocol','sequence','session','type'].sort(),
   'ownership/score fields are stripped at the wire trust boundary');
  assert.deepEqual(accepted.at(-1).buttons,[],'the forged packet contains no privileged action');
  assert.deepEqual(hostGame.controlled,[3,3]);assert.equal(hostGame.ball.owner,ownerBefore);
  for(let tick=14;tick<=forgedFrame;tick++)assert.equal(hostRun.step(1/60),true);
  assert.deepEqual(hostGame.controlled,[3,3]);assert.equal(hostGame.ball.owner,ownerBefore);

  // A transient ICE loss freezes both simulations and invalidates guest input
  // until the same two local peer connections report ready again.
  const hostClock=hostGame.clock,guestClock=guestGame.clock;
  hostPeer.peer.setIce('disconnected');guestPeer.peer.setIce('disconnected');
  assert.equal(hostPeer.ready,false);assert.equal(guestPeer.ready,false);
  assert.equal(hostRun.step(1/60),false);assert.equal(guestRun.step(1/60),false);
  assert.equal(hostGame.clock,hostClock);assert.equal(guestGame.clock,guestClock);
  hostPeer.peer.setIce('connected');guestPeer.peer.setIce('connected');
  assert.equal(hostPeer.ready,true);assert.equal(guestPeer.ready,true);
  assert.equal(hostRun.step(1/60),true,'host resumes on its continuing authority tick');
  assert.equal(guestRun.latestTick,hostRun.latestTick,'fresh host snapshot restores guest render state');
  assert.equal(guestRun.step(1/60),true,'guest sends only after receiving fresh authority state');
 }finally{
  guestRun?.dispose();hostRun?.dispose();guestPeer.dispose();hostPeer.dispose();
 }
});
