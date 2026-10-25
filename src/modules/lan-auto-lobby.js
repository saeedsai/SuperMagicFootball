import {connectLanSignal} from './lan-auto-signal.js';
import {createLanPeerConnection} from './lan_peer_connection.js';
import {normalizeLanPacket} from './lan_protocol.js';
import {RELEASE} from './release.js';
const makeId=()=>{const b=crypto.getRandomValues(new Uint8Array(16));return Array.from(b,v=>v.toString(16).padStart(2,'0')).join('')};
export function mountAutoLanLobby(root,options={}){
 const build=options.build??RELEASE.version,peerFactory=options.peerFactory??createLanPeerConnection;
 root.innerHTML='<section class="panel lanConnectionLab"><h2>LOCAL NETWORK</h2><p>Create a room on your phone or computer, or find an available game. A secure discovery service is required for browser-to-browser matchmaking.</p><div class="row"><button class="btn" id="autoHost">HOST GAME</button><button class="btn" id="autoFind">FIND GAMES</button><button class="btn minor" id="autoReset">CANCEL</button></div><div id="autoHostInfo" aria-live="polite"></div><div id="autoRooms" aria-live="polite"></div><div id="autoApproval"></div><p id="autoStatus" role="status" aria-live="polite">Connecting to LAN discovery…</p></section>';
 const get=id=>root.querySelector('#'+id),rooms=new Map();
 let mode=null,roomId=null,session=null,peer=null,connection=null,unsub=null,controller=null,disposed=false,requestId=null,approved=false,approvalRequestId=null,started=false,lanUrls=[],signalState='connecting';
 const status=message=>{if(!disposed)get('autoStatus').textContent=message};
 const send=packet=>connection?.send(packet);
 function cleanupPeer(){controller?.abort();controller=null;unsub?.();unsub=null;peer?.dispose();peer=null}
 function render(){const box=get('autoRooms');box.replaceChildren();if(mode!=='guest')return;
  for(const [id,room] of rooms){if(room.build!==build)continue;const button=document.createElement('button');button.className='btn';button.textContent='JOIN '+room.name;button.addEventListener('click',()=>join(id));box.append(button)}
  if(!box.children.length)box.textContent='Searching for available hosts…';
 }
 function watch(current){const aborter=new AbortController();controller=aborter;unsub=current.subscribeStatus(s=>{if(peer===current&&s.ready)ready(current)},aborter.signal);if(peer!==current||aborter.signal.aborted)return;current.awaitReady(120000,aborter.signal).then(()=>ready(current)).catch(e=>{if(peer===current&&!aborter.signal.aborted)status('Connection failed: '+e.message)})}
 function ready(current){if(disposed||peer!==current||!approved||started)return;controller?.abort();controller=null;unsub?.();unsub=null;peer=null;started=true;try{options.onReady?.(current,mode)}catch(e){started=false;current.dispose();status('Unable to start match: '+e.message)}}
 function reset(){get('autoHostInfo').replaceChildren();if(mode==='host'||mode==='guest')send({type:'leave'});cleanupPeer();mode=null;roomId=null;session=null;approved=false;started=false;requestId=null;approvalRequestId=null;rooms.clear();get('autoApproval').replaceChildren();render();status('Select Host Game or Find Games.')}
 function showHostAddress(){if(mode!=='host')return;const guestUrls=lanUrls.length?lanUrls:(location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'?[location.origin]:[]);get('autoHostInfo').textContent='Room ID: '+roomId+' | Open this game address on BOTH devices: '+(guestUrls.length?guestUrls.join(' or '):'Waiting for signaling service connection.')+' | Both devices must use the same Wi-Fi/LAN.'}
 function host(){if(signalState==='unconfigured')return status('Online room discovery is not configured for this build. Hosting is unavailable.');reset();mode='host';roomId='room_'+makeId();session=makeId();if(connection?.ready)send({type:'host',roomId,name:'SuperMagicFootball Match',build});showHostAddress();status(connection?.ready?'Registering room with discovery service…':'Connecting to LAN server; room will register automatically…')}
 function find(){if(signalState==='unconfigured')return status('Online room discovery is not configured for this build. Finding games is unavailable.');reset();mode='guest';if(connection?.ready)send({type:'rooms'});render();status(connection?.ready?'Searching for games on this LAN…':'Connecting to LAN server; search will start automatically…')}
 function join(id){if(!connection?.ready)return status('LAN server disconnected');if(requestId)send({type:'leave'});cleanupPeer();approved=false;roomId=id;requestId='request_'+makeId();send({type:'join',roomId:id,requestId,build});status('Waiting for host approval…')}
 async function onEvent(m){if(disposed)return;
  if(m.type==='lan-addresses'&&Array.isArray(m.urls)){lanUrls=m.urls.filter(url=>typeof url==='string'&&/^http:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)[0-9.]+:[0-9]+$/.test(url)).slice(0,8);if(mode==='host')showHostAddress();return}
  if(m.type==='host-registered'&&mode==='host'&&m.roomId===roomId){showHostAddress();status('Room registered. Waiting for a guest to join.');return}
  if(m.type==='error'&&mode==='host'){status('Unable to register room: '+String(m.message||'server rejected request'));return}
  if(m.type==='host-left'&&mode==='guest'&&m.roomId===roomId){cleanupPeer();approved=false;requestId=null;roomId=null;status('Host disconnected. Select another available room.');return}
  if(m.type==='room-announce'&&typeof m.roomId==='string'){rooms.set(m.roomId,m);render();return}
  if(m.type==='room-remove'){rooms.delete(m.roomId);render();if(mode==='guest'&&roomId===m.roomId){cleanupPeer();approved=false;requestId=null;roomId=null;status('Host room closed. Choose another room.')}return}
  if(m.type==='join-request'&&mode==='host'&&m.roomId===roomId){
   approvalRequestId=m.requestId;
   const container=get('autoApproval');container.replaceChildren();const label=document.createElement('p');label.textContent='A guest wants to join your match.';const yes=document.createElement('button');yes.className='btn';yes.textContent='ACCEPT GUEST';const no=document.createElement('button');no.className='btn minor';no.textContent='REJECT';yes.onclick=()=>{if(approvalRequestId!==m.requestId)return;if(!send({type:'decision',roomId,requestId:m.requestId,accept:true}))return status('Discovery disconnected. Cannot approve guest; reconnect and retry.');approvalRequestId=null;container.replaceChildren();status('Guest approved. Establishing connection…')};no.onclick=()=>{if(approvalRequestId!==m.requestId)return;if(!send({type:'decision',roomId,requestId:m.requestId,accept:false}))return status('Discovery disconnected. Cannot reject guest; reconnect and retry.');approvalRequestId=null;container.replaceChildren()};container.append(label,yes,no);return;
  }
  if(m.type==='join-cancel'&&mode==='host'&&m.roomId===roomId&&m.requestId===approvalRequestId){approvalRequestId=null;get('autoApproval').replaceChildren();status('Guest cancelled their join request.');return}
  if(m.type==='guest-left'&&mode==='host'&&m.roomId===roomId){cleanupPeer();approved=false;approvalRequestId=null;get('autoApproval').replaceChildren();status('Guest disconnected. Hosting remains available for another guest.');return}
  if(m.type==='join-reject'&&m.requestId===requestId){requestId=null;approved=false;status('Join request rejected or expired. Select a game to retry.');return}
  if(m.type==='join-accept'&&mode==='guest'&&m.requestId===requestId){approved=true;status('Approved. Connecting to host…');return}
  if(m.type==='guest-approved'&&mode==='host'&&m.roomId===roomId){
   approved=true;try{const hello=normalizeLanPacket({protocol:1,type:'hello',role:'host',session,build,sequence:0});const current=peerFactory(hello);peer=current;const offer=await current.createOffer();if(peer===current){send({type:'offer',roomId,sdp:offer})}}catch(e){cleanupPeer();status('Host connection failed: '+e.message)}return;
  }
  if(m.type==='offer'&&mode==='guest'&&m.roomId===roomId&&approved&&!peer){
   try{const data=JSON.parse(m.sdp);const hello=normalizeLanPacket({protocol:1,type:'hello',role:'guest',session:data.session,build,sequence:0});const current=peerFactory(hello);peer=current;const answer=await current.acceptOffer(m.sdp);if(peer===current){send({type:'answer',roomId,sdp:answer});watch(current)}}catch(e){cleanupPeer();status('Guest connection failed: '+e.message)}return;
  }
  if(m.type==='answer'&&mode==='host'&&m.roomId===roomId&&peer){try{await peer.acceptAnswer(m.sdp);if(peer)watch(peer)}catch(e){cleanupPeer();status('Host answer failed: '+e.message)}}
 }
 connection=(options.signalFactory??connectLanSignal)({onEvent,onState:s=>{if(started||disposed)return;signalState=s;if(s==='connected'){status('LAN discovery connected.');if(mode==='host'&&roomId){cleanupPeer();approved=false;send({type:'host',roomId,name:'SuperMagicFootball Match',build})}else if(mode==='guest'){if(requestId){cleanupPeer();approved=false;requestId=null;roomId=null;status('Connection restored. Choose a game again.')}send({type:'rooms'})}}else {rooms.clear();render();status('Discovery '+s+'. Automatic hosting requires an online signaling service. If none is configured, rooms cannot be created or found yet.')}}});
 const actions=[['autoHost',host],['autoFind',find],['autoReset',reset]];for(const [id,fn] of actions)get(id).addEventListener('click',fn);
 return ()=>{if(disposed)return;reset();disposed=true;connection.close();for(const [id,fn] of actions)get(id)?.removeEventListener('click',fn)};
}
