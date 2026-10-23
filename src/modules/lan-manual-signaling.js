// Explicit, manual copy/paste signaling for a future two-browser WebRTC LAN room.
// No signaling server, discovery, identity authentication or match sync is provided.
const MAX_SIGNAL_BYTES=65536;
const encoder=new TextEncoder();
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function parseLanSignal(text){
 if(typeof text!=='string'||encoder.encode(text).length>MAX_SIGNAL_BYTES)throw new TypeError('Invalid LAN signal size');
 let data;try{data=JSON.parse(text)}catch{throw new TypeError('Invalid LAN signal JSON')}
 if(!plain(data)||Object.keys(data).length!==3||data.version!==1||
    !['offer','answer'].includes(data.type)||!plain(data.description)||
    Object.keys(data.description).length!==2||
    data.description.type!==data.type||typeof data.description.sdp!=='string'||
    data.description.sdp.length<1||encoder.encode(data.description.sdp).length>MAX_SIGNAL_BYTES-128)
    throw new TypeError('Invalid LAN signal description');
 return Object.freeze({version:1,type:data.type,description:Object.freeze({type:data.type,sdp:data.description.sdp})});
}
function encodeLanSignal(description){
 if(!plain(description)||!['offer','answer'].includes(description.type)||
    typeof description.sdp!=='string')throw new TypeError('Invalid SDP description');
 const wire=JSON.stringify({version:1,type:description.type,description:{type:description.type,sdp:description.sdp}});
 parseLanSignal(wire);
 return wire;
}
async function createLanOffer(peer){
 if(!peer||typeof peer.createOffer!=='function'||typeof peer.setLocalDescription!=='function')throw new TypeError('Expected RTCPeerConnection');
 const offer=await peer.createOffer();await peer.setLocalDescription(offer);
 return encodeLanSignal(peer.localDescription||offer);
}
async function acceptLanOffer(peer,wire){
 if(!peer||typeof peer.setRemoteDescription!=='function'||typeof peer.createAnswer!=='function'||typeof peer.setLocalDescription!=='function')throw new TypeError('Expected RTCPeerConnection');
 const signal=parseLanSignal(wire);if(signal.type!=='offer')throw new TypeError('Expected offer');
 await peer.setRemoteDescription(signal.description);
 const answer=await peer.createAnswer();await peer.setLocalDescription(answer);
 return encodeLanSignal(peer.localDescription||answer);
}
async function acceptLanAnswer(peer,wire){
 if(!peer||typeof peer.setRemoteDescription!=='function')throw new TypeError('Expected RTCPeerConnection');
 const signal=parseLanSignal(wire);if(signal.type!=='answer')throw new TypeError('Expected answer');
 await peer.setRemoteDescription(signal.description);
}
export {MAX_SIGNAL_BYTES,parseLanSignal,encodeLanSignal,createLanOffer,acceptLanOffer,acceptLanAnswer};
