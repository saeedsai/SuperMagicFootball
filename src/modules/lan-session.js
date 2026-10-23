// Transport-independent host-authoritative LAN handshake and input validation.
// No network transport or gameplay synchronization is provided by this module.
const LAN_PROTOCOL_VERSION=1;
const LAN_BUTTONS=Object.freeze(['pass','shoot','dribble','jump']);
const idValid=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{6,32}$/.test(id);
const reject=(state,reason)=>({accepted:false,reason,state});
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const buttons=v=>plain(v)&&Object.keys(v).length===4&&LAN_BUTTONS.every(k=>Object.hasOwn(v,k)&&typeof v[k]==='boolean');
const axis=v=>plain(v)&&Object.keys(v).length===2&&['x','y'].every(k=>Number.isFinite(v[k])&&v[k]>=-1&&v[k]<=1);
function createLanHostState(roomId,hostId){
 if(!idValid(roomId)||!idValid(hostId))throw new TypeError('Invalid LAN room or host identifier');
 return Object.freeze({roomId,hostId,peerId:null,lastSequence:-1});
}
function acceptLanPacket(state,packet){
 if(!state||!idValid(state.roomId)||!idValid(state.hostId)||!plain(packet))return reject(state,'invalid-packet');
 if(packet.roomId!==state.roomId)return reject(state,'wrong-room');
 if(packet.version!==LAN_PROTOCOL_VERSION)return reject(state,'protocol-mismatch');
 if(!idValid(packet.peerId)||packet.peerId===state.hostId)return reject(state,'invalid-peer');
 if(packet.type==='hello'){
  if(state.peerId&&state.peerId!==packet.peerId)return reject(state,'room-full');
  if(state.peerId===packet.peerId)return {accepted:true,reason:'already-joined',state};
  return {accepted:true,reason:'joined',state:Object.freeze({...state,peerId:packet.peerId,lastSequence:-1})};
 }
 if(packet.type==='leave'){
  if(state.peerId!==packet.peerId)return reject(state,'not-joined');
  return {accepted:true,reason:'left',state:Object.freeze({...state,peerId:null,lastSequence:-1})};
 }
 if(packet.type!=='input')return reject(state,'unsupported-type');
 if(state.peerId!==packet.peerId)return reject(state,'not-joined');
 if(!Number.isSafeInteger(packet.sequence)||packet.sequence<0)return reject(state,'invalid-sequence');
 if(packet.sequence<=state.lastSequence)return reject(state,'stale-sequence');
 if(!buttons(packet.buttons)||!axis(packet.axis))return reject(state,'invalid-controls');
 const magnitude=Math.hypot(packet.axis.x,packet.axis.y);
 const movement=magnitude>1?{x:packet.axis.x/magnitude,y:packet.axis.y/magnitude}:{...packet.axis};
 const input=Object.freeze({sequence:packet.sequence,buttons:Object.freeze({...packet.buttons}),axis:Object.freeze(movement)});
 return {accepted:true,reason:'input-accepted',state:Object.freeze({...state,lastSequence:packet.sequence}),input};
}
export {LAN_PROTOCOL_VERSION,LAN_BUTTONS,createLanHostState,acceptLanPacket};
