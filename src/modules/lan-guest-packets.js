// Guest-side LAN packet construction. Transport wiring is a later milestone.
import {LAN_PROTOCOL_VERSION} from './lan-session.js';
function createLanGuest(roomId,peerId) {
 if(!/^[a-zA-Z0-9_-]{6,32}$/.test(roomId)||!/^[a-zA-Z0-9_-]{6,32}$/.test(peerId))throw new TypeError('Invalid LAN identifiers');
 return Object.freeze({roomId,peerId,sequence:0});
}
function nextLanGuestPacket(state,buttons,axis) {
 const names=['pass','shoot','dribble','jump'];
 if(!state||!Number.isSafeInteger(state.sequence)||state.sequence<0||state.sequence>=Number.MAX_SAFE_INTEGER||
 !buttons||Object.keys(buttons).length!==4||!names.every(k=>typeof buttons[k]==='boolean')||
 !axis||Object.keys(axis).length!==2||!Number.isFinite(axis.x)||!Number.isFinite(axis.y)||
 Math.abs(axis.x)>1||Math.abs(axis.y)>1)throw new TypeError('Invalid LAN controls');
 const magnitude=Math.hypot(axis.x,axis.y);
 const normalized=magnitude>1?{x:axis.x/magnitude,y:axis.y/magnitude}:{x:axis.x,y:axis.y};
 return Object.freeze({state:Object.freeze({...state,sequence:state.sequence+1}),
 packet:Object.freeze({type:'input',version:LAN_PROTOCOL_VERSION,roomId:state.roomId,
 peerId:state.peerId,sequence:state.sequence,buttons:Object.freeze({...buttons}),axis:Object.freeze(normalized)})});
}
export {createLanGuest,nextLanGuestPacket};
