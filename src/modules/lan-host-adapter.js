// Transport-neutral host adapter for one LAN guest. A WebRTC data channel can
// call receive() with wire strings and disconnected() when its socket closes.
// No browser transport or match rendering is created by this module.
import {createLanHostState,acceptLanPacket,disconnectLanPeer} from './lan-session.js';
import {createLanInputTimeline,applyValidatedLanInput,advanceLanInputFrame,clearLanInputOnLeave} from './lan-input-timeline.js';
import {decodeLanWirePacket} from './lan-wire.js';

function createLanHostAdapter(roomId,hostId,holdFrames=4){
 let session=createLanHostState(roomId,hostId);
 let timeline=createLanInputTimeline(holdFrames);
 return Object.freeze({
  receive(wire){
   let packet;
   try {packet=decodeLanWirePacket(wire);}
   catch {return {accepted:false,reason:'invalid-wire'};}
   const result=acceptLanPacket(session,packet);
   if(!result.accepted)return {accepted:false,reason:result.reason};
   if(result.reason==='input-accepted')timeline=applyValidatedLanInput(timeline,result);
   if(result.reason==='left')timeline=clearLanInputOnLeave(timeline,result);
   session=result.state;
   return {accepted:true,reason:result.reason};
  },
  disconnected(peerId){
   const result=disconnectLanPeer(session,peerId);
   if(!result.accepted)return {accepted:false,reason:result.reason};
   timeline=clearLanInputOnLeave(timeline,result);
   session=result.state;
   return {accepted:true,reason:result.reason};
  },
  tick(){
   const next=advanceLanInputFrame(timeline);
   timeline=next.state;
   return {controls:next.controls,timedOut:next.timedOut,frame:timeline.frame};
  },
  get peerId(){return session.peerId;}
 });
}
export {createLanHostAdapter};
