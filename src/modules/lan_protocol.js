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
export {LAN_PROTOCOL_VERSION,ACTIONS,normalizeLanPacket,parseLanPacket,serializeLanPacket,acceptLanPacket,validateLanHandshake};
