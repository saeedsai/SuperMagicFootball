// LAN-001: strict, transport-independent two-peer message contract.
// Foundation only: no live networking, matchmaking or online-play claim.
const LAN_PROTOCOL_VERSION=1;
const ACTIONS=Object.freeze(['pass','shoot','dribble','jump']);
const SESSION_RE=/^[a-zA-Z0-9_-]{12,64}$/;
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
  if(![-1,0,1].includes(raw.dx)||![-1,0,1].includes(raw.dy))throw new Error('Invalid LAN direction');
  return Object.freeze({protocol:1,type:'input',session:raw.session,sequence:raw.sequence,frame:raw.frame,buttons:Object.freeze([...raw.buttons]),dx:raw.dx,dy:raw.dy});
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

// LAN-006: WebRTC DataChannel-compatible boundary; signaling/connection establishment
// remains separate. No packet can be sent before the channel is open.
function sendLanChannelPacket(channel,packet){
 if(!channel||channel.readyState!=='open'||typeof channel.send!=='function')throw new Error('LAN channel is not open');
 const payload=serializeLanPacket(packet);
 if(payload.length>4096)throw new Error('LAN payload exceeds packet limit');
 channel.send(payload);
 return payload.length;
}
function receiveLanChannelPacket(message,session,lastSequence=-1){
 const payload=typeof message==='string'?message:message?.data;
 const packet=parseLanPacket(payload);
 return acceptLanPacket(packet,session,lastSequence);
}
export {LAN_PROTOCOL_VERSION,ACTIONS,normalizeLanPacket,parseLanPacket,serializeLanPacket,acceptLanPacket,validateLanHandshake,LAN_INPUT_LEAD_FRAMES,createHostLanInputQueue,enqueueGuestLanInput,dequeueGuestLanInput,resolveGuestLanFrame,createGuestLanSender,buildGuestLanInput,sendLanChannelPacket,receiveLanChannelPacket};
