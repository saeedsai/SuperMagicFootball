// LAN-001: strict, transport-independent two-peer message contract.
// Foundation only: no live networking, matchmaking or online-play claim.
const LAN_PROTOCOL_VERSION=1;
const ACTIONS=Object.freeze(['pass','shoot','dribble','jump']);
// Inputs become stale quickly; keep their reliable ordered DataChannel queue
// small so a temporarily slow peer cannot accumulate seconds of old controls.
const LAN_GUEST_INPUT_MAX_BUFFERED_BYTES=16*1024;
const SESSION_RE=/^[a-zA-Z0-9_-]{12,64}$/;
// Production host IDs are `host_` plus the 28-character room suffix (33 chars).
const RESULT_RECEIPT_RE=/^lan:[A-Za-z0-9_-]{6,32}:[A-Za-z0-9_-]{6,33}:[a-f0-9]{32}$/;
const VERSION_RE=/^\d+\.\d+\.\d+\.\d+$/;
const own=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);
function isRecord(value){return value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.getPrototypeOf(value)===Object.prototype;}
function uint(value,max=Number.MAX_SAFE_INTEGER){return Number.isSafeInteger(value)&&value>=0&&value<=max;}
function normalizeLanPacket(raw){
 if(!isRecord(raw))throw new TypeError('LAN packet must be a plain object');
 if(raw.protocol!==LAN_PROTOCOL_VERSION)throw new Error('Unsupported LAN protocol');
 if(typeof raw.session!=='string'||!SESSION_RE.test(raw.session))throw new Error('Invalid LAN session');
 if(!uint(raw.sequence))throw new Error('Invalid LAN sequence');
 if(raw.type==='hello'){
  if(!['host','guest'].includes(raw.role)||(typeof raw.build!=='string'||!VERSION_RE.test(raw.build)))throw new Error('Invalid LAN hello');
  return Object.freeze({protocol:1,type:'hello',session:raw.session,sequence:raw.sequence,role:raw.role,build:raw.build});
 }
 if(raw.type==='input'){
  if(!uint(raw.frame,1000000000)||!Array.isArray(raw.buttons)||raw.buttons.length>4)throw new Error('Invalid LAN input');
  if(!raw.buttons.every(button=>ACTIONS.includes(button))||new Set(raw.buttons).size!==raw.buttons.length)throw new Error('Invalid LAN buttons');
  // Fractional analog axes must survive the wire; keyboard -1/0/1 is unchanged.
  if(!Number.isFinite(raw.dx)||!Number.isFinite(raw.dy)||
     raw.dx < -1||raw.dx > 1||raw.dy < -1||raw.dy > 1)throw new Error('Invalid LAN direction');
  return Object.freeze({protocol:1,type:'input',session:raw.session,sequence:raw.sequence,frame:raw.frame,buttons:Object.freeze([...raw.buttons]),dx:raw.dx,dy:raw.dy});
 }
 // Result acknowledgements are separate from the ordered control sequence so
 // they cannot consume, reorder, or poison gameplay input. Repeats are safe.
 if(raw.type==='result-ack'){
  const expected=['protocol','type','session','sequence','receiptId'];
  if(Object.keys(raw).length!==expected.length||expected.some(key=>!own(raw,key))||
     raw.sequence!==0||typeof raw.receiptId!=='string'||!RESULT_RECEIPT_RE.test(raw.receiptId))
   throw new Error('Invalid LAN result acknowledgement');
  return Object.freeze({protocol:1,type:'result-ack',session:raw.session,sequence:0,receiptId:raw.receiptId});
 }
 throw new Error('Unsupported LAN packet type');
}
function parseLanPacket(raw){
 if(typeof raw!=='string'||raw.length>4096)throw new Error('Invalid LAN payload size');
 return normalizeLanPacket(JSON.parse(raw));
}
function serializeLanPacket(packet){return JSON.stringify(normalizeLanPacket(packet));}
function acceptLanPacket(packet,session,lastSequence=-1){
 const clean=normalizeLanPacket(packet);
 if(clean.session!==session)throw new Error('LAN session mismatch');
 if(!Number.isSafeInteger(lastSequence)||lastSequence< -1)throw new Error('Invalid prior LAN sequence');
 if(clean.sequence<=lastSequence)return Object.freeze({accepted:false,lastSequence});
 return Object.freeze({accepted:true,lastSequence:clean.sequence,packet:clean});
}

// LAN-002: accept a guest only after both peers agree on session, build and roles.
function validateLanHandshake(localHello,remoteHello){
 const local=normalizeLanPacket(localHello),remote=normalizeLanPacket(remoteHello);
 if(local.type!=='hello'||remote.type!=='hello')throw new Error('LAN handshake requires two hello packets');
 if(local.session!==remote.session)throw new Error('LAN handshake session mismatch');
 if(local.build!==remote.build)throw new Error('LAN game version mismatch');
 if(local.role===remote.role)throw new Error('LAN handshake requires complementary roles');
 if(local.sequence!==0||remote.sequence!==0)throw new Error('LAN handshake must begin at sequence zero');
 return Object.freeze({session:local.session,build:local.build,localRole:local.role,remoteRole:remote.role});
}

// LAN-003: bounded, host-authoritative input buffering. This is transport independent.
// The host never accepts guest input for a frame already simulated.
const LAN_INPUT_LEAD_FRAMES=8;
function createHostLanInputQueue(localHello,remoteHello){
 const handshake=validateLanHandshake(localHello,remoteHello);
 if(handshake.localRole!=='host')throw new Error('Only LAN host can own the input queue');
 return Object.freeze({session:handshake.session,lastSequence:0,lastFrame:-1,pending:Object.freeze([])});
}
function enqueueGuestLanInput(state,raw,hostFrame){
 if(!isRecord(state)||!Array.isArray(state.pending)||!uint(hostFrame,1000000000))throw new Error('Invalid LAN host queue');
 const packet=normalizeLanPacket(raw);
 if(packet.type!=='input'||packet.session!==state.session)throw new Error('Invalid guest LAN input session or type');
 if(packet.sequence<=state.lastSequence)return Object.freeze({accepted:false,reason:'replay',state});
 if(packet.frame<=state.lastFrame)return Object.freeze({accepted:false,reason:'stale-frame',state});
 if(packet.frame<hostFrame||packet.frame>hostFrame+LAN_INPUT_LEAD_FRAMES)return Object.freeze({accepted:false,reason:'outside-frame-window',state});
 const pending=Object.freeze([...state.pending.filter(item=>item.frame>=hostFrame),packet]);
 return Object.freeze({accepted:true,state:Object.freeze({session:state.session,lastSequence:packet.sequence,lastFrame:packet.frame,pending})});
}
function dequeueGuestLanInput(state,hostFrame){
 if(!isRecord(state)||!Array.isArray(state.pending)||!uint(hostFrame,1000000000))throw new Error('Invalid LAN host queue');
 const packet=state.pending.find(item=>item.frame===hostFrame)||null;
 const pending=Object.freeze(state.pending.filter(item=>item.frame>hostFrame));
 return Object.freeze({packet,state:Object.freeze({session:state.session,lastSequence:state.lastSequence,lastFrame:state.lastFrame,pending})});
}
// LAN-004: host advances a frame even when the guest packet is late.
// Neutral input is deterministic, does not invent an action or consume a sequence.
function resolveGuestLanFrame(state,hostFrame){
 const consumed=dequeueGuestLanInput(state,hostFrame);
 const packet=consumed.packet;
 const input=Object.freeze({
  frame:hostFrame,
  buttons:packet?packet.buttons:Object.freeze([]),
  dx:packet?packet.dx:0,
  dy:packet?packet.dy:0
 });
 return Object.freeze({received:packet!==null,input,state:consumed.state});
}

// LAN-005: guest-side deterministic packet construction, independent of transport.
// Sequence and frame advance together; invalid controls never advance sender state.
function createGuestLanSender(localHello,remoteHello){
 const peer=validateLanHandshake(localHello,remoteHello);
 if(peer.localRole!=='guest')throw new Error('Only LAN guest can construct guest inputs');
 return Object.freeze({session:peer.session,lastSequence:0,lastFrame:-1});
}
function buildGuestLanInput(sender,frame,buttons=[],dx=0,dy=0){
 if(!isRecord(sender)||typeof sender.session!=='string'||!SESSION_RE.test(sender.session)
    ||!uint(sender.lastSequence)||!Number.isSafeInteger(sender.lastFrame)||sender.lastFrame< -1
    ||!uint(frame,1000000000)||frame<=sender.lastFrame)throw new Error('Invalid LAN guest sender or frame');
 if(sender.lastSequence===Number.MAX_SAFE_INTEGER)throw new Error('LAN sequence exhausted');
 const packet=normalizeLanPacket({
  protocol:LAN_PROTOCOL_VERSION,type:'input',session:sender.session,
  sequence:sender.lastSequence+1,frame,buttons,dx,dy
 });
 return Object.freeze({
  packet,
  state:Object.freeze({session:sender.session,lastSequence:packet.sequence,lastFrame:frame})
 });
}
function buildLanResultAck(session,receiptId){
 if(typeof session!=='string'||!SESSION_RE.test(session))throw new Error('Invalid LAN result acknowledgement session');
 return normalizeLanPacket({protocol:LAN_PROTOCOL_VERSION,type:'result-ack',session,sequence:0,receiptId});
}

// LAN-006: WebRTC DataChannel-compatible boundary; signaling/connection establishment
// remains separate. No packet can be sent before the channel is open.
function sendLanChannelPacket(channel,packet,options={}){
 if(!channel||channel.readyState!=='open'||typeof channel.send!=='function')throw new Error('LAN channel is not open');
 const payload=serializeLanPacket(packet);
 if(payload.length>4096)throw new Error('LAN payload exceeds packet limit');
 if(options.maxBufferedAmount!==undefined){
  const bufferedAmount=channel.bufferedAmount===undefined?0:channel.bufferedAmount;
  const maxBufferedAmount=options.maxBufferedAmount;
  const bytes=new TextEncoder().encode(payload).byteLength;
  if(!Number.isSafeInteger(bufferedAmount)||bufferedAmount<0||
     !Number.isSafeInteger(maxBufferedAmount)||maxBufferedAmount<1||
     !Number.isSafeInteger(bufferedAmount+bytes)||bufferedAmount+bytes>maxBufferedAmount){
   throw new Error('LAN channel input backpressure limit reached');
  }
 }
 channel.send(payload);
 return payload.length;
}
function receiveLanChannelPacket(message,session,lastSequence=-1){
 const payload=typeof message==='string'?message:message?.data;
 const packet=parseLanPacket(payload);
 return acceptLanPacket(packet,session,lastSequence);
}

// LAN-007: explicit handshake gate before accepting any networked inputs.
// Peer state is immutable so rejected packets cannot advance the session.
function createLanPeerGate(localHello){
 const local=normalizeLanPacket(localHello);
 if(local.type!=='hello'||local.sequence!==0)throw new Error('LAN peer requires initial hello');
 return Object.freeze({local,ready:false,remote:null,lastSequence:0});
}
function receiveLanPeerPacket(state,message){
 if(!isRecord(state)||!state.local||typeof state.ready!=='boolean'||!uint(state.lastSequence))throw new Error('Invalid LAN peer state');
 const packet=parseLanPacket(typeof message==='string'?message:message?.data);
 if(!state.ready){
  if(packet.type!=='hello')throw new Error('LAN handshake required before input');
  const handshake=validateLanHandshake(state.local,packet);
  return Object.freeze({kind:'ready',state:Object.freeze({local:state.local,remote:packet,ready:true,lastSequence:0}),handshake});
 }
 if(packet.type==='result-ack'){
  if(packet.session!==state.local.session)throw new Error('LAN result acknowledgement session mismatch');
  return Object.freeze({kind:'result-ack',packet,state});
 }
 if(packet.type!=='input')throw new Error('LAN renegotiation is not supported');
 const accepted=acceptLanPacket(packet,state.local.session,state.lastSequence);
 if(!accepted.accepted)return Object.freeze({kind:'replay',state});
 // WebRTC DataChannels are reliable and ordered, and the guest increments
 // once per emitted input. A sequence jump must not poison the session cursor.
 if(packet.sequence!==state.lastSequence+1)return Object.freeze({kind:'sequence-gap',state});
 return Object.freeze({kind:'input',packet:accepted.packet,state:Object.freeze({
  local:state.local,remote:state.remote,ready:true,lastSequence:accepted.lastSequence
 })});
}

// LAN-008: atomically bridge validated guest DataChannel traffic to the host frame queue.
// A frame rejected by host timing must not consume its sequence number in the peer gate.
function createLanHostSession(localHello){
 const local=normalizeLanPacket(localHello);
 if(local.type!=='hello'||local.role!=='host'||local.sequence!==0)throw new Error('LAN host hello required');
 return Object.freeze({peer:createLanPeerGate(local),queue:null});
}
function acceptLanHostMessage(state,message,hostFrame){
 if(!isRecord(state)||!isRecord(state.peer)||!uint(hostFrame,1000000000))throw new Error('Invalid LAN host session');
 const received=receiveLanPeerPacket(state.peer,message);
 if(received.kind==='ready'){
  if(state.queue!==null)throw new Error('LAN host cannot reinitialize');
  const queue=createHostLanInputQueue(received.state.local,received.state.remote);
  return Object.freeze({kind:'ready',state:Object.freeze({peer:received.state,queue})});
 }
 if(received.kind==='result-ack')return Object.freeze({kind:'result-ack',packet:received.packet,state});
 if(!state.queue)throw new Error('LAN host queue unavailable');
 if(received.kind==='replay')return Object.freeze({kind:'replay',state});
 if(received.kind==='sequence-gap')return Object.freeze({kind:'sequence-gap',state});
 // A frame already simulated cannot be resurrected by a delayed packet,
 // even when the caller provides a stale hostFrame snapshot.
 const nextFrame=Math.max(hostFrame,(state.lastSimulatedFrame??-1)+1);
 const queued=enqueueGuestLanInput(state.queue,received.packet,nextFrame);
 if(!queued.accepted){
  // A contiguous, valid input that arrives after its target frame is stale,
  // so discard its controls but consume its sequence. Otherwise one delayed
  // frame would make every later current input look like a forged sequence gap.
  if(queued.reason==='outside-frame-window'&&received.packet.frame<nextFrame){
   return Object.freeze({kind:'late-frame',state:Object.freeze({...state,peer:received.state})});
  }
  return Object.freeze({kind:queued.reason,state});
 }
 return Object.freeze({kind:'accepted',state:Object.freeze({peer:received.state,queue:queued.state,lastSimulatedFrame:state.lastSimulatedFrame??-1})});
}

// LAN-009: host frame advancement occurs at most once per frame.
// Returned state records the last simulated frame without mutating the queue.
function advanceLanHostFrame(state,frame){
 if(!isRecord(state)||!isRecord(state.peer)||!state.peer.ready||!isRecord(state.queue)
    ||!uint(frame,1000000000))throw new Error('LAN host session is not ready');
 const last=state.lastSimulatedFrame??-1;
 if(!Number.isSafeInteger(last)||last< -1||frame<=last)throw new Error('LAN host frame must advance');
 const result=resolveGuestLanFrame(state.queue,frame);
 return Object.freeze({
  input:result.input,received:result.received,
  state:Object.freeze({peer:state.peer,queue:result.state,lastSimulatedFrame:frame})
 });
}

// LAN-012: start either endpoint on an already-open RTCDataChannel.
// The first wire packet is always the canonical local hello (sequence zero).
// No session is returned if the channel is closed or send() fails.
function startLanHostChannel(localHello,channel){
 const state=createLanHostSession(localHello);
 const bytes=sendLanChannelPacket(channel,state.peer.local);
 return Object.freeze({state,bytes});
}
function startLanGuestChannel(localHello,channel){
 const state=createLanGuestSession(localHello);
 const bytes=sendLanChannelPacket(channel,state.peer.local);
 return Object.freeze({state,bytes});
}

// LAN-010: guest-side session gate and DataChannel sender.
// This is transport wiring for an already-open channel, not WebRTC signaling.
function createLanGuestSession(localHello){
 const local=normalizeLanPacket(localHello);
 if(local.type!=='hello'||local.role!=='guest'||local.sequence!==0)throw new Error('LAN guest hello required');
 return Object.freeze({peer:createLanPeerGate(local),sender:null});
}
function acceptLanGuestHello(state,message){
 if(!isRecord(state)||!isRecord(state.peer)||state.sender!==null)throw new Error('Invalid or ready LAN guest session');
 const received=receiveLanPeerPacket(state.peer,message);
 if(received.kind!=='ready'||received.handshake.localRole!=='guest')throw new Error('LAN guest requires host hello');
 return Object.freeze({peer:received.state,sender:createGuestLanSender(received.state.local,received.state.remote)});
}
function sendLanGuestFrame(state,channel,frame,buttons=[],dx=0,dy=0){
 if(!isRecord(state)||!isRecord(state.peer)||!state.peer.ready||!isRecord(state.sender))
  throw new Error('LAN guest handshake required before sending input');
 const built=buildGuestLanInput(state.sender,frame,buttons,dx,dy);
 // Do not advance the sender if the channel is closed or send() throws.
 // RTCDataChannel.send() can queue successfully while the peer is draining
 // slowly. Bound guest controls and preserve the same sequence/frame on reject.
 const bytes=sendLanChannelPacket(channel,built.packet,{maxBufferedAmount:LAN_GUEST_INPUT_MAX_BUFFERED_BYTES});
 return Object.freeze({packet:built.packet,bytes,state:Object.freeze({peer:state.peer,sender:built.state})});
}
export {LAN_PROTOCOL_VERSION,ACTIONS,LAN_GUEST_INPUT_MAX_BUFFERED_BYTES,normalizeLanPacket,parseLanPacket,serializeLanPacket,acceptLanPacket,validateLanHandshake,LAN_INPUT_LEAD_FRAMES,createHostLanInputQueue,enqueueGuestLanInput,dequeueGuestLanInput,resolveGuestLanFrame,createGuestLanSender,buildGuestLanInput,buildLanResultAck,sendLanChannelPacket,receiveLanChannelPacket,createLanPeerGate,receiveLanPeerPacket,createLanHostSession,acceptLanHostMessage,advanceLanHostFrame,createLanGuestSession,acceptLanGuestHello,sendLanGuestFrame,startLanHostChannel,startLanGuestChannel};
