// Internet P2P backup: carry the existing LAN protocol through the already-approved
// signaling broker when direct WebRTC cannot traverse NAT. NOT direct P2P or TURN.
// No game simulation on the broker; the host remains authoritative.
import {createLanPeerConnection} from './lan_peer_connection.js';
const RELAY_SDP='v=0\r\ns=smf-approved-relay\r\nt=0 0\r\n';
const MAX_RELAY_WIRE=24000;
// The broker enforces UTF-8 bytes, not UTF-16 code units. Match its limit locally.
const relayEncoder=new TextEncoder();
class RelayChannel extends EventTarget {
 constructor(send){super();this.label='smf-lan';this.readyState='connecting';this._send=send;}
 open(){if(this.readyState!=='connecting')return;this.readyState='open';this.dispatchEvent(new Event('open'));}
 send(data){
  if(this.readyState!=='open'||typeof data!=='string'||data.length>MAX_RELAY_WIRE||relayEncoder.encode(data).byteLength>MAX_RELAY_WIRE||!this._send(data))
   throw Error('Approved backup relay unavailable');
 }
 receive(data){
  if(this.readyState!=='open'||typeof data!=='string'||data.length>MAX_RELAY_WIRE||relayEncoder.encode(data).byteLength>MAX_RELAY_WIRE)return;
  const event=new Event('message');Object.defineProperty(event,'data',{value:data});
  this.dispatchEvent(event);
 }
 close(){if(this.readyState==='closed')return;this.readyState='closed';this.dispatchEvent(new Event('close'));}
}
export function createLanRelayPeerConnection(hello,{connection,roomId}={}){
 if(!connection||typeof connection.send!=='function'||typeof roomId!=='string'||
    !/^room_[a-f0-9]{32}$/.test(roomId))throw Error('Invalid approved relay session');
 let physical=null;
 class RelayPeer extends EventTarget {
  constructor(){super();this.connectionState='connecting';this.iceConnectionState='checking';
   this.iceGatheringState='complete';this.localDescription=null;this.remoteDescription=null;
   this.channel=null;physical=this;}
  createDataChannel(label){if(label!=='smf-lan'||this.channel)throw Error('Invalid backup channel');
   this.channel=new RelayChannel(data=>connection.send({type:'relay-frame',roomId,data})===true);
   return this.channel;}
  async createOffer(){return {type:'offer',sdp:RELAY_SDP};}
  async createAnswer(){return {type:'answer',sdp:RELAY_SDP};}
  async setLocalDescription(description){this.localDescription=description;}
  async setRemoteDescription(description){
   this.remoteDescription=description;
   if(description.type==='offer'){
    this.channel=new RelayChannel(data=>connection.send({type:'relay-frame',roomId,data})===true);
    this.dispatchEvent(Object.assign(new Event('datachannel'),{channel:this.channel}));
    this.connectionState='connected';this.iceConnectionState='connected';
    this.channel.open();
   }else if(description.type==='answer'){
    this.connectionState='connected';this.iceConnectionState='connected';
    this.channel?.open();
   }
   this.dispatchEvent(new Event('connectionstatechange'));
  }
  receive(data){this.channel?.receive(data);}
  close(){this.connectionState='closed';this.iceConnectionState='closed';this.channel?.close();}
  disconnect(){this.connectionState='failed';this.iceConnectionState='failed';this.channel?.close();this.dispatchEvent(new Event('connectionstatechange'));}
 }
 const peer=createLanPeerConnection(hello,{RTCPeerConnection:RelayPeer,internet:false});
 return new Proxy(peer,{get(target,key){
  if(key==='relay')return true;
  if(key==='receiveRelayFrame')return data=>physical?.receive(data);
  if(key==='disconnectRelay')return ()=>physical?.disconnect();
  return Reflect.get(target,key);
 }});
}
