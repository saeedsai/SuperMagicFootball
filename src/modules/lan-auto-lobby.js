import {connectLanSignal} from './lan-auto-signal.js';
import {createLanPeerConnection} from './lan_peer_connection.js';
import {normalizeLanPacket} from './lan_protocol.js';
import {RELEASE} from './release.js';
const ADMISSION_TIMEOUT_MS=25000;
const makeId=()=>{const b=crypto.getRandomValues(new Uint8Array(16));return Array.from(b,v=>v.toString(16).padStart(2,'0')).join('')};
export function mountAutoLanLobby(root,options={}){
 const build=options.build??RELEASE.version,peerFactory=options.peerFactory??createLanPeerConnection;
 root.innerHTML='<section class="panel lanConnectionLab"><h2>LOCAL NETWORK</h2><p>Create a room on your phone or computer, or find an available game. A secure discovery service is required for browser-to-browser matchmaking.</p><div class="row"><button class="btn" id="autoHost">HOST GAME</button><button class="btn" id="autoFind">FIND GAMES</button><button class="btn minor" id="autoReset">CANCEL</button></div><div id="autoHostInfo" aria-live="polite"></div><div id="autoRooms" aria-live="polite"></div><div id="autoApproval"></div><p id="autoStatus" role="status" aria-live="polite">Connecting to LAN discovery…</p></section>';
 const get=id=>root.querySelector('#'+id),rooms=new Map();
 let mode=null,roomId=null,session=null,peer=null,connection=null,unsub=null,controller=null,disposed=false,requestId=null,approved=false,approvalRequestId=null,started=false,refreshTimer=null,admissionTimer=null,lanUrls=[],signalState='connecting',discoveryScope='lan';
 const status=message=>{if(!disposed)get('autoStatus').textContent=message};
 const send=packet=>connection?.send(packet);
 // Recover room availability if an advertisement was missed while Find Games stays open.
 // Six reads per minute stay well below the broker's signaling rate limit.
 function stopRefresh(){if(refreshTimer!==null){(options.clearIntervalImpl??clearInterval)(refreshTimer);refreshTimer=null}}
 function startRefresh(){stopRefresh();refreshTimer=(options.setIntervalImpl??setInterval)(()=>{if(!disposed&&mode==='guest'&&!requestId&&!started&&connection?.ready)send({type:'rooms'})},10000)}
 function clearAdmissionTimeout(){if(admissionTimer!==null){(options.clearTimeoutImpl??clearTimeout)(admissionTimer);admissionTimer=null}}
 function waitForAdmission(id){clearAdmissionTimeout();admissionTimer=(options.setTimeoutImpl??setTimeout)(()=>{
  admissionTimer=null;if(disposed||mode!=='guest'||requestId!==id||approved||started)return;
  send({type:'leave'});cleanupPeer();requestId=null;roomId=null;
  status('Host approval timed out. Select a game to retry.');
  if(connection?.ready)send({type:'rooms'});
 },ADMISSION_TIMEOUT_MS)}
 function cleanupPeer(){controller?.abort();controller=null;unsub?.();unsub=null;peer?.dispose();peer=null}
 // An approved guest must release the reserved seat if WebRTC negotiation fails.
 // Keep the room browser usable without reopening Find Games or changing the host room.
 function recoverGuestHandshake(message){
  if(disposed||mode!=='guest'||started)return;
  clearAdmissionTimeout();cleanupPeer();send({type:'leave'});
  approved=false;requestId=null;roomId=null;
  status(message+' Select a game to retry.');
  if(connection?.ready)send({type:'rooms'});
 }
 // Bound unsolicited room advertisements to the same schema and capacity as full directory snapshots.
 // Older local companions may omit full; treat that as an available room for compatibility.
 function validRoom(room,legacyFull=false){return !!room&&typeof room.roomId==='string'&&/^[a-zA-Z0-9_-]{8,64}$/.test(room.roomId)&&typeof room.name==='string'&&!!room.name.trim()&&room.name.length<=48&&typeof room.build==='string'&&room.build.length<=32&&(typeof room.full==='boolean'||(legacyFull&&room.full===undefined))}
 function render(){const box=get('autoRooms');box.replaceChildren();if(mode!=='guest')return;
  for(const [id,room] of rooms){if(room.build!==build)continue;const button=document.createElement('button');button.className='btn';button.disabled=room.full===true;button.textContent=(room.full===true?'IN MATCH · ':'JOIN ')+room.name;button.addEventListener('click',()=>join(id));box.append(button)}
  if(!box.children.length)box.textContent='Searching for available hosts…';
 }
 function watch(current){const aborter=new AbortController();controller=aborter;unsub=current.subscribeStatus(s=>{if(peer===current&&s.ready)ready(current)},aborter.signal);if(peer!==current||aborter.signal.aborted)return;current.awaitReady(120000,aborter.signal).then(()=>ready(current)).catch(e=>{if(peer===current&&!aborter.signal.aborted){if(mode==='guest')recoverGuestHandshake('Connection failed: '+e.message);else status('Connection failed: '+e.message)}})}
 function ready(current){if(disposed||peer!==current||!approved||started)return;controller?.abort();controller=null;unsub?.();unsub=null;peer=null;started=true;try{options.onReady?.(current,mode)}catch(e){started=false;current.dispose();if(mode==='guest')recoverGuestHandshake('Unable to start match: '+e.message);else status('Unable to start match: '+e.message)}}
 function reset(){stopRefresh();clearAdmissionTimeout();get('autoHostInfo').replaceChildren();if(mode==='host'||mode==='guest')send({type:'leave'});cleanupPeer();mode=null;roomId=null;session=null;approved=false;started=false;requestId=null;approvalRequestId=null;rooms.clear();get('autoApproval').replaceChildren();render();status('Select Host Game or Find Games.')}
 function showHostAddress(){if(mode!=='host')return;const guestUrls=lanUrls.length?lanUrls:(location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'?[location.origin]:[]);get('autoHostInfo').textContent='Room ID: '+roomId+' | Open this game address on BOTH devices: '+(guestUrls.length?guestUrls.join(' or '):'Waiting for signaling service connection.')+(discoveryScope==='public-network'?' | Automatic discovery uses the same public-network address; host approval is required.':' | Both devices must use the same Wi-Fi/LAN.')}
 function host(){if(signalState==='unconfigured')return status('Online room discovery is not configured for this build. Hosting is unavailable.');reset();mode='host';roomId='room_'+makeId();session=makeId();if(connection?.ready)send({type:'host',roomId,name:'SuperMagicFootball Match',build});showHostAddress();status(connection?.ready?'Registering room with discovery service…':'Connecting to LAN server; room will register automatically…')}
 function find(){if(signalState==='unconfigured')return status('Online room discovery is not configured for this build. Finding games is unavailable.');reset();mode='guest';startRefresh();if(connection?.ready)send({type:'rooms'});render();status(connection?.ready?'Searching for games on this LAN…':'Connecting to LAN server; search will start automatically…')}
 function join(id){if(mode!=='guest'||disposed||started)return;if(rooms.get(id)?.full===true)return status('This room is already playing. Choose another host.');if(!connection?.ready)return status('LAN server disconnected');if(requestId){clearAdmissionTimeout();send({type:'leave'})}cleanupPeer();approved=false;roomId=id;const nextRequestId='request_'+makeId();let submitted=false;try{submitted=send({type:'join',roomId:id,requestId:nextRequestId,build})===true}catch{}if(!submitted){roomId=null;requestId=null;status('Unable to send join request. Check discovery connection and retry.');return}requestId=nextRequestId;waitForAdmission(nextRequestId);status('Waiting for host approval…')}
 async function onEvent(m){if(disposed)return;
  if(m.type==='discovery-scope'&&m.scope==='public-network'){discoveryScope='public-network';if(mode==='host')showHostAddress();return}
  if(m.type==='lan-addresses'&&Array.isArray(m.urls)){lanUrls=m.urls.filter(url=>typeof url==='string'&&/^http:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)[0-9.]+:[0-9]+$/.test(url)).slice(0,8);if(mode==='host')showHostAddress();return}
  if(m.type==='host-registered'&&mode==='host'&&m.roomId===roomId){showHostAddress();status('Room registered. Waiting for a guest to join.');return}
  if(m.type==='error'&&mode==='host'){status('Unable to register room: '+String(m.message||'server rejected request'));return}
  if(m.type==='host-left'&&mode==='guest'&&m.roomId===roomId){clearAdmissionTimeout();cleanupPeer();approved=false;requestId=null;roomId=null;status('Host disconnected. Select another available room.');return}
  if(m.type==='rooms-snapshot'){
   // Ignore malformed or out-of-phase replies; never replace an active admission.
   if(mode!=='guest'||requestId||started||!Array.isArray(m.rooms)||m.rooms.length>128)return;
   const fresh=new Map();
   for(const room of m.rooms){
    if(!validRoom(room))return;
    fresh.set(room.roomId,room);
   }
   rooms.clear();for(const [id,room] of fresh)rooms.set(id,room);
   render();return;
  }
  if(m.type==='room-announce'){
   if(mode!=='guest'||!validRoom(m,true))return;
   if(!rooms.has(m.roomId)&&rooms.size>=128)return;
   rooms.set(m.roomId,{...m,full:m.full===true});render();return;
  }
  if(m.type==='room-remove'){rooms.delete(m.roomId);render();if(mode==='guest'&&roomId===m.roomId){clearAdmissionTimeout();cleanupPeer();approved=false;requestId=null;roomId=null;status('Host room closed. Choose another room.')}return}
  if(m.type==='join-request'&&mode==='host'&&m.roomId===roomId){
   approvalRequestId=m.requestId;
   const container=get('autoApproval');container.replaceChildren();const label=document.createElement('p');label.textContent='A guest wants to join your match.';const yes=document.createElement('button');yes.className='btn';yes.textContent='ACCEPT GUEST';const no=document.createElement('button');no.className='btn minor';no.textContent='REJECT';yes.onclick=()=>{if(approvalRequestId!==m.requestId)return;if(!send({type:'decision',roomId,requestId:m.requestId,accept:true}))return status('Discovery disconnected. Cannot approve guest; reconnect and retry.');approvalRequestId=null;container.replaceChildren();status('Guest approved. Establishing connection…')};no.onclick=()=>{if(approvalRequestId!==m.requestId)return;if(!send({type:'decision',roomId,requestId:m.requestId,accept:false}))return status('Discovery disconnected. Cannot reject guest; reconnect and retry.');approvalRequestId=null;container.replaceChildren()};container.append(label,yes,no);return;
  }
  if(m.type==='join-cancel'&&mode==='host'&&m.roomId===roomId&&m.requestId===approvalRequestId){approvalRequestId=null;get('autoApproval').replaceChildren();status('Guest cancelled their join request.');return}
  if(m.type==='guest-left'&&mode==='host'&&m.roomId===roomId){cleanupPeer();approved=false;approvalRequestId=null;get('autoApproval').replaceChildren();status('Guest disconnected. Hosting remains available for another guest.');return}
  if(m.type==='join-reject'&&m.requestId===requestId){clearAdmissionTimeout();requestId=null;approved=false;status('Join request rejected or expired. Select a game to retry.');return}
  if(m.type==='join-accept'&&mode==='guest'&&m.requestId===requestId){clearAdmissionTimeout();approved=true;status('Approved. Connecting to host…');return}
  if(m.type==='guest-approved'&&mode==='host'&&m.roomId===roomId){
   approved=true;try{const hello=normalizeLanPacket({protocol:1,type:'hello',role:'host',session,build,sequence:0});const current=peerFactory(hello);peer=current;const offer=await current.createOffer();if(peer===current){send({type:'offer',roomId,sdp:offer})}}catch(e){cleanupPeer();status('Host connection failed: '+e.message)}return;
  }
  if(m.type==='offer'&&mode==='guest'&&m.roomId===roomId&&approved&&!peer){
   let current=null;
   try{const data=JSON.parse(m.sdp);const hello=normalizeLanPacket({protocol:1,type:'hello',role:'guest',session:data.session,build,sequence:0});current=peerFactory(hello);peer=current;const answer=await current.acceptOffer(m.sdp);if(peer===current){if(!send({type:'answer',roomId,sdp:answer}))throw Error('unable to send answer');watch(current)}}catch(e){if(!current||peer===current)recoverGuestHandshake('Guest connection failed: '+e.message)}return;
  }
  if(m.type==='answer'&&mode==='host'&&m.roomId===roomId&&peer){try{await peer.acceptAnswer(m.sdp);if(peer)watch(peer)}catch(e){cleanupPeer();status('Host answer failed: '+e.message)}}
 }
 connection=(options.signalFactory??connectLanSignal)({onEvent,onState:s=>{if(started||disposed)return;signalState=s;if(s==='connected'){status('LAN discovery connected.');if(mode==='host'&&roomId){cleanupPeer();approved=false;approvalRequestId=null;get('autoApproval').replaceChildren();send({type:'host',roomId,name:'SuperMagicFootball Match',build})}else if(mode==='guest'){if(requestId){clearAdmissionTimeout();cleanupPeer();approved=false;requestId=null;roomId=null;status('Connection restored. Choose a game again.')}send({type:'rooms'})}}else {rooms.clear();render();approvalRequestId=null;get('autoApproval').replaceChildren();status('Discovery '+s+'. Automatic hosting requires an online signaling service. If none is configured, rooms cannot be created or found yet.')}}});
 const actions=[['autoHost',host],['autoFind',find],['autoReset',reset]];for(const [id,fn] of actions)get(id).addEventListener('click',fn);
 return ()=>{if(disposed)return;reset();disposed=true;connection.close();for(const [id,fn] of actions)get(id)?.removeEventListener('click',fn)};
}
