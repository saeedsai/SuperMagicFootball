import {connectLanSignal} from './lan-auto-signal.js';
import {createLanPeerConnection} from './lan_peer_connection.js';
import {createLanRelayPeerConnection} from './lan-relay-peer.js';
import {normalizeLanPacket} from './lan_protocol.js';
import {RELEASE} from './release.js';
const ADMISSION_TIMEOUT_MS=25000;
const HOST_REGISTRATION_RETRY_MS=10000;
const CONNECTION_READY_TIMEOUT_MS=35000;
const P2P_DIRECT_TIMEOUT_MS=10000;
const displayName=value=>typeof value==='string'?(value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,32)||'Player'):'Player'; // six idempotent attempts per minute
const makeId=()=>{const b=crypto.getRandomValues(new Uint8Array(16));return Array.from(b,v=>v.toString(16).padStart(2,'0')).join('')};
export function mountAutoLanLobby(root,options={}){
 const internet=options.internet===true,roomScope=internet?'internet-p2p':'lan';
 const build=options.build??RELEASE.version,peerFactory=options.peerFactory??(hello=>createLanPeerConnection(hello,{internet}));
 const ownName=()=>displayName(get('autoPlayerName')?.value);
 const registerHost=()=>send({type:'host',roomId,name:hostName,build,...(internet?{scope:roomScope}:{})});
 const requestRooms=()=>send(internet?{type:'rooms',scope:roomScope}:{type:'rooms'});
 root.innerHTML=`<section class="panel lanConnectionLab"><h2>${internet?'ONLINE P2P':'LOCAL NETWORK'}</h2><p>${internet?'Host or find internet P2P games automatically. A lightweight signaling directory finds rooms and exchanges offers; physics stays peer-to-peer and the host approves each guest. On restrictive networks, the consent-approved match can fall back to a relay through the discovery service (not direct P2P).':'Create a room on your phone or computer, or find an available game. A secure discovery service is required for browser-to-browser matchmaking.'}</p><label for="autoPlayerName">Your player name (visible to opponent)</label><input id="autoPlayerName" type="text" maxlength="32" autocomplete="nickname" placeholder="Enter your name"><div class="row"><button class="btn" id="autoHost">HOST GAME</button><button class="btn" id="autoFind">FIND GAMES</button><button class="btn minor" id="autoReset">CANCEL</button></div><div id="autoHostInfo" aria-live="polite"></div><div id="autoRooms" aria-live="polite"></div><div id="autoApproval"></div><p id="autoStatus" role="status" aria-live="polite">Connecting to LAN discovery…</p></section>`;
 const get=id=>root.querySelector('#'+id),rooms=new Map();
 let mode=null,roomId=null,session=null,peer=null,connection=null,unsub=null,controller=null,disposed=false,requestId=null,approved=false,approvalRequestId=null,started=false,answerProcessingPeer=null,refreshTimer=null,hostRetryTimer=null,hostRegistered=false,admissionTimer=null,lanUrls=[],signalState='connecting',discoveryScope='lan',hostName='Player',opponentName='Player',localName='Player',relayStarted=false,activeRelay=null;
 const status=message=>{if(!disposed)get('autoStatus').textContent=message};
 const send=packet=>connection?.send(packet);
 // Recover room availability if an advertisement was missed while Find Games stays open.
 // Six reads per minute stay well below the broker's signaling rate limit.
 function stopRefresh(){if(refreshTimer!==null){(options.clearIntervalImpl??clearInterval)(refreshTimer);refreshTimer=null}}
 // The broker responds to duplicate registrations from the same socket without changing the room.
 function stopHostRetry(){if(hostRetryTimer!==null){(options.clearIntervalImpl??clearInterval)(hostRetryTimer);hostRetryTimer=null}}
 function startHostRetry(){stopHostRetry();hostRetryTimer=(options.setIntervalImpl??setInterval)(()=>{
  if(!disposed&&mode==='host'&&roomId&&!hostRegistered&&!started&&connection?.ready)
   registerHost();
 },HOST_REGISTRATION_RETRY_MS)}
 function startRefresh(){stopRefresh();refreshTimer=(options.setIntervalImpl??setInterval)(()=>{if(!disposed&&mode==='guest'&&!requestId&&!started&&connection?.ready)requestRooms()},10000)}
 function clearAdmissionTimeout(){if(admissionTimer!==null){(options.clearTimeoutImpl??clearTimeout)(admissionTimer);admissionTimer=null}}
 // An approved guest may never receive a WebRTC offer from the host.
 function waitForOffer(id){
  clearAdmissionTimeout();
  const timer=(options.setTimeoutImpl??setTimeout)(()=>{
   if(admissionTimer!==timer)return;
   admissionTimer=null;
   if(disposed||mode!=='guest'||requestId!==id||!approved||peer||started)return;
   if(!requestRelay('Host offer timed out'))recoverGuestHandshake('Host offer timed out.');
  },ADMISSION_TIMEOUT_MS);
  admissionTimer=timer;
 }
 // A received offer can still hang while the browser computes an SDP answer.
 function waitForGuestNegotiation(id,current){
  clearAdmissionTimeout();
  const timer=(options.setTimeoutImpl??setTimeout)(()=>{
   if(admissionTimer!==timer)return;
   admissionTimer=null;
   if(disposed||mode!=='guest'||requestId!==id||!approved||peer!==current||started)return;
   if(!requestRelay('Guest offer negotiation timed out'))recoverGuestHandshake('Guest offer negotiation timed out.');
  },ADMISSION_TIMEOUT_MS);
  admissionTimer=timer;
 }
 // Host SDP creation can hang without rejecting, leaving a stale peer after the guest gives up.
 function waitForHostOffer(current){
  clearAdmissionTimeout();
  const timer=(options.setTimeoutImpl??setTimeout)(()=>{
   if(admissionTimer!==timer)return;
   admissionTimer=null;
   if(disposed||mode!=='host'||peer!==current||!approved||started)return;
   if(startRelay('Direct offer timed out'))return;
   cleanupPeer();approved=false;
   status('Host offer creation timed out. Waiting for guest retry.');
  },internet?20000:ADMISSION_TIMEOUT_MS);
  admissionTimer=timer;
 }
 // Bound the time a host waits for an answer after transmitting its offer.
 function waitForHostAnswer(current){
  clearAdmissionTimeout();
  const timer=(options.setTimeoutImpl??setTimeout)(()=>{
   if(admissionTimer!==timer)return;
   admissionTimer=null;
   if(disposed||mode!=='host'||peer!==current||!approved||started)return;
   if(startRelay('Direct answer timed out'))return;
   cleanupPeer();approved=false;
   status('Guest answer timed out. Waiting for guest retry.');
  },ADMISSION_TIMEOUT_MS);
  admissionTimer=timer;
 }
 // A host can receive an answer but hang while the browser processes its SDP.
 // Bound the pending peer, retaining the registered room for the next guest.
 function waitForHostNegotiation(current){
  clearAdmissionTimeout();
  const timer=(options.setTimeoutImpl??setTimeout)(()=>{
   if(admissionTimer!==timer)return;
   admissionTimer=null;
   if(disposed||mode!=='host'||peer!==current||!approved||started)return;
   if(startRelay('Direct negotiation timed out'))return;
   cleanupPeer();approved=false;
   status('Host answer negotiation timed out. Waiting for guest retry.');
  },ADMISSION_TIMEOUT_MS);
  admissionTimer=timer;
 }
 function waitForAdmission(id){clearAdmissionTimeout();admissionTimer=(options.setTimeoutImpl??setTimeout)(()=>{
  admissionTimer=null;if(disposed||mode!=='guest'||requestId!==id||approved||started)return;
  send({type:'leave'});cleanupPeer();requestId=null;roomId=null;
  status('Host approval timed out. Select a game to retry.');
  if(connection?.ready)requestRooms();
 },ADMISSION_TIMEOUT_MS)}
 function cleanupPeer(){controller?.abort();controller=null;unsub?.();unsub=null;peer?.dispose();peer=null;answerProcessingPeer=null}
 // Direct ICE may not cross restrictive NAT. The host can use the consent broker
 // as a last-resort transport for the SAME validated game protocol.
 function canRelay(){return internet&&!options.peerFactory&&connection?.ready&&mode==='host'&&approved&&roomId&&!relayStarted&&!started&&!disposed}
 function startRelay(reason){
  if(!canRelay())return false;
  relayStarted=true;clearAdmissionTimeout();cleanupPeer();
  status(reason+'. Activating approved relay backup…');
  (async()=>{
   let current=null;
   try{
    const hello=normalizeLanPacket({protocol:1,type:'hello',role:'host',session,build,sequence:0});
    current=createLanRelayPeerConnection(hello,{connection,roomId});peer=current;
    const offer=await current.createOffer();
    if(peer!==current)return;
    if(!send({type:'relay-offer',roomId,sdp:offer}))throw Error('relay offer could not be sent');
    waitForHostAnswer(current);
    status('Direct WebRTC unavailable. Waiting for backup relay handshake…');
   }catch(e){if(!current||peer===current){cleanupPeer();approved=false;status('Backup relay failed: '+e.message+'. Retry the match.')}}
  })();
  return true;
 }
 // A guest can fail before producing an SDP answer (unsupported WebRTC, ICE).
 // Keep host approval alive and ask the host to start the same broker backup.
 function requestRelay(reason){
  if(!internet||mode!=='guest'||!approved||!roomId||!connection?.ready||
     relayStarted||peer?.relay||started||disposed)return false;
  clearAdmissionTimeout();cleanupPeer();relayStarted=true;
  if(!send({type:'relay-request',roomId})){relayStarted=false;return false}
  waitForOffer(requestId);
  status(reason+'. Asking host for approved relay backup…');
  return true;
 }
 // An approved guest must release the reserved seat if WebRTC negotiation fails.
 // Keep the room browser usable without reopening Find Games or changing the host room.
 function recoverGuestHandshake(message){
  if(disposed||mode!=='guest'||started)return;
  clearAdmissionTimeout();cleanupPeer();send({type:'leave'});
  relayStarted=false;approved=false;requestId=null;roomId=null;
  status(message+' Select a game to retry.');
  if(connection?.ready)requestRooms();
 }
 // Bound unsolicited room advertisements to the same schema and capacity as full directory snapshots.
 // Older local companions may omit full; treat that as an available room for compatibility.
 // Keep LAN-only discovery isolated from internet rooms, even if a misconfigured
 // broker sends cross-scope advertisements. Legacy LAN companions omit scope.
 // A mixed-scope snapshot may be emitted by a misconfigured or older broker.
 // Skip only recognized rooms from the other mode; malformed local-scope data
 // still invalidates the entire snapshot, preserving the previous directory.
 const foreignRoomScope=room=>internet?(room?.scope===undefined||room?.scope==='lan'):room?.scope==='internet-p2p';
 function validRoom(room,legacyFull=false){const scopeMatches=internet?room?.scope===roomScope:room?.scope===undefined||room?.scope==='lan';return !!room&&scopeMatches&&typeof room.roomId==='string'&&/^[a-zA-Z0-9_-]{8,64}$/.test(room.roomId)&&typeof room.name==='string'&&!!room.name.trim()&&room.name.length<=48&&typeof room.build==='string'&&room.build.length<=32&&(typeof room.full==='boolean'||(legacyFull&&room.full===undefined))}
 function render(){const box=get('autoRooms');box.replaceChildren();if(mode!=='guest')return;
  for(const [id,room] of rooms){if(room.build!==build)continue;const button=document.createElement('button');button.className='btn';button.disabled=room.full===true;button.textContent=(room.full===true?'IN MATCH · ':'JOIN ')+room.name;button.addEventListener('click',()=>join(id));box.append(button)}
  if(!box.children.length)box.textContent='Searching for available hosts…';
 }
 function watch(current){const aborter=new AbortController();controller=aborter;unsub=current.subscribeStatus(s=>{if(peer===current&&s.ready)ready(current)},aborter.signal);if(peer!==current||aborter.signal.aborted)return;current.awaitReady(internet&&mode==='host'&&!current.relay?P2P_DIRECT_TIMEOUT_MS:CONNECTION_READY_TIMEOUT_MS,aborter.signal).then(()=>ready(current)).catch(e=>{if(peer===current&&!aborter.signal.aborted){if(mode==='host'&&startRelay('Direct connection failed: '+e.message))return;if(mode==='guest'){if(requestRelay('Direct connection failed: '+e.message))return;recoverGuestHandshake('Connection failed: '+e.message+(internet?' Direct P2P and backup relay unavailable.':''));}else {cleanupPeer();approved=false;status('Host connection failed: '+e.message+' Waiting for guest retry.')}}})}
 function ready(current){if(disposed||peer!==current||!approved||started)return;controller?.abort();controller=null;unsub?.();unsub=null;peer=null;answerProcessingPeer=null;started=true;if(current.relay)activeRelay=current;try{options.onReady?.(current,mode,opponentName,localName);if(current.relay)status('Match connected through approved relay backup (not direct P2P).')}catch(e){started=false;current.dispose();activeRelay=null;if(mode==='guest')recoverGuestHandshake('Unable to start match: '+e.message);else {approved=false;status('Unable to start host match: '+e.message+'. Waiting for guest retry.')}}}
 function reset(){activeRelay?.dispose();activeRelay=null;relayStarted=false;stopRefresh();stopHostRetry();hostRegistered=false;clearAdmissionTimeout();get('autoHostInfo').replaceChildren();if(mode==='host'||mode==='guest')send({type:'leave'});cleanupPeer();mode=null;roomId=null;session=null;approved=false;started=false;requestId=null;approvalRequestId=null;rooms.clear();get('autoApproval').replaceChildren();render();status('Select Host Game or Find Games.')}
 function showHostAddress(){if(mode!=='host')return;
 if(internet){get('autoHostInfo').textContent='Hosting as '+hostName+' | Room ID: '+roomId+' | Public Online P2P room; every guest requires host approval. Direct WebRTC preferred; approved backup may relay via the discovery service.';return;}const guestUrls=lanUrls.length?lanUrls:(location.hostname!=='localhost'&&location.hostname!=='127.0.0.1'?[location.origin]:[]);get('autoHostInfo').textContent='Hosting as '+hostName+' | Room ID: '+roomId+' | Open this game address on BOTH devices: '+(guestUrls.length?guestUrls.join(' or '):'Waiting for signaling service connection.')+(discoveryScope==='public-network'?' | Automatic discovery uses the same public-network address; host approval is required.':' | Both devices must use the same Wi-Fi/LAN.')}
 function host(){if(signalState==='unconfigured')return status('Online room discovery is not configured for this build. Hosting is unavailable.');reset();mode='host';roomId='room_'+makeId();session=makeId();hostName=ownName();localName=hostName;startHostRetry();if(connection?.ready)registerHost();showHostAddress();status(connection?.ready?'Registering room with discovery service…':'Connecting to LAN server; room will register automatically…')}
 function find(){if(signalState==='unconfigured')return status('Online room discovery is not configured for this build. Finding games is unavailable.');reset();mode='guest';startRefresh();if(connection?.ready)requestRooms();render();status(connection?.ready?(internet?'Searching for Online P2P games…':'Searching for games on this LAN…'):(internet?'Connecting to P2P discovery…':'Connecting to LAN server; search will start automatically…'))}
 function join(id){if(mode!=='guest'||disposed||started)return;
  // LAN-085: duplicate taps on a pending room must not cancel host consent.
  // Deliberate switching to another host still sends LEAVE before JOIN.
  if(requestId&&roomId===id)return;
  const selected=rooms.get(id);if(!selected||selected.build!==build||!validRoom(selected,true))return status('This game is no longer available. Refresh the room list.');if(selected.full===true)return status('This room is already playing. Choose another host.');if(!connection?.ready)return status('LAN server disconnected');if(requestId){clearAdmissionTimeout();send({type:'leave'})}cleanupPeer();relayStarted=false;approved=false;roomId=id;localName=ownName();const nextRequestId='request_'+makeId();let submitted=false;try{submitted=send({type:'join',roomId:id,requestId:nextRequestId,build,guestName:localName})===true}catch{}if(!submitted){roomId=null;requestId=null;status('Unable to send join request. Check discovery connection and retry.');return}requestId=nextRequestId;waitForAdmission(nextRequestId);status('Waiting for host approval… '+(rooms.get(id)?.name||'Host'))}
 async function onEvent(m){if(disposed)return;
  if(m.type==='relay-frame'){if(internet&&m.roomId===roomId)(activeRelay||peer)?.receiveRelayFrame?.(m.data);return;}
  if(m.type==='discovery-scope'&&m.scope==='public-network'){discoveryScope='public-network';if(mode==='host')showHostAddress();return}
  if(m.type==='lan-addresses'&&Array.isArray(m.urls)){lanUrls=m.urls.filter(url=>typeof url==='string'&&/^http:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)[0-9.]+:[0-9]+$/.test(url)).slice(0,8);if(mode==='host')showHostAddress();return}
  // LAN-089: late broker registration acknowledgements cannot revert an active host match.
  if(m.type==='host-registered'&&mode==='host'&&!started&&m.roomId===roomId){hostRegistered=true;stopHostRetry();showHostAddress();status('Room registered. Waiting for a guest to join.');return}
  if(m.type==='error'&&mode==='host'&&!started){
   // Broker room capacity is temporary: keep the bounded ten-second registration
   // retry alive with the same room ID. Permanent scope errors must not loop.
   const capacity=String(m.message||'')==='Room capacity reached';
   if(!capacity)stopHostRetry();
   status(capacity?'Room capacity reached. Waiting to retry hosting automatically…':'Unable to register room: '+String(m.message||'server rejected request'));
   return;
  }
  // LAN-088: signaling departure before kickoff invalidates the stale room card;
  // after kickoff, a broker notice must not break an established direct/relay match.
  if(m.type==='host-left'&&mode==='guest'&&!started&&m.roomId===roomId){clearAdmissionTimeout();cleanupPeer();approved=false;requestId=null;roomId=null;rooms.delete(m.roomId);render();status('Host disconnected. Select another available room.');if(connection?.ready)requestRooms();return}
  if(m.type==='rooms-snapshot'){
   // Ignore malformed or out-of-phase replies; never replace an active admission.
   if(mode!=='guest'||requestId||started||!Array.isArray(m.rooms)||m.rooms.length>128)return;
   const fresh=new Map();
   for(const room of m.rooms){
    if(foreignRoomScope(room))continue;
    if(!validRoom(room))return;
    fresh.set(room.roomId,room);
   }
   // An all-foreign snapshot must not erase valid rooms from our own mode.
   // A truly empty snapshot still clears the directory as usual.
   if(m.rooms.length>0&&fresh.size===0)return;
   rooms.clear();for(const [id,room] of fresh)rooms.set(id,room);
   render();return;
  }
  if(m.type==='room-announce'){
   if(mode!=='guest'||!validRoom(m,true))return;
   if(!rooms.has(m.roomId)&&rooms.size>=128)return;
   rooms.set(m.roomId,{...m,full:m.full===true});render();return;
  }
  if(m.type==='room-remove'){rooms.delete(m.roomId);render();if(mode==='guest'&&!started&&roomId===m.roomId){clearAdmissionTimeout();cleanupPeer();approved=false;requestId=null;roomId=null;status('Host room closed. Choose another room.');if(connection?.ready)requestRooms()}return}
  if(m.type==='join-request'&&mode==='host'&&!approved&&!started&&m.roomId===roomId){
   approvalRequestId=m.requestId;opponentName=displayName(m.guestName);
   const container=get('autoApproval');container.replaceChildren();const label=document.createElement('p');label.textContent=opponentName+' wants to join your match.';const yes=document.createElement('button');yes.className='btn';yes.textContent='ACCEPT GUEST';const no=document.createElement('button');no.className='btn minor';no.textContent='REJECT';yes.onclick=()=>{if(approvalRequestId!==m.requestId)return;if(!send({type:'decision',roomId,requestId:m.requestId,accept:true}))return status('Discovery disconnected. Cannot approve guest; reconnect and retry.');approvalRequestId=null;container.replaceChildren();status(opponentName+' approved. Establishing WebRTC connection…')};no.onclick=()=>{if(approvalRequestId!==m.requestId)return;if(!send({type:'decision',roomId,requestId:m.requestId,accept:false}))return status('Discovery disconnected. Cannot reject guest; reconnect and retry.');approvalRequestId=null;container.replaceChildren()};container.append(label,yes,no);return;
  }
  if(m.type==='join-cancel'&&mode==='host'&&m.roomId===roomId&&m.requestId===approvalRequestId){approvalRequestId=null;get('autoApproval').replaceChildren();status('Guest cancelled their join request.');return}
  // After kickoff, match transport owns disconnects; broker notices must not reset host approval.
  if(m.type==='guest-left'&&mode==='host'&&!started&&m.roomId===roomId){clearAdmissionTimeout();cleanupPeer();approved=false;approvalRequestId=null;get('autoApproval').replaceChildren();status('Guest disconnected. Hosting remains available for another guest.');return}
  // Rejection can arrive after approval while guest SDP is still pending.
  // Retire that peer and room identity so delayed offers/answers cannot revive a denied seat.
  if(m.type==='join-reject'&&mode==='guest'&&!started&&requestId&&m.roomId===roomId&&m.requestId===requestId){
   clearAdmissionTimeout();cleanupPeer();requestId=null;roomId=null;approved=false;
   status('Join request rejected or expired. Select a game to retry.');
   // Busy room or approval queue: refresh immediately, not after the ten-second poll.
   // The requestId guard above prevents stale rejections from repeating the refresh.
   if((m.reason==='room-full-or-version'||m.reason==='room-queue-full')&&connection?.ready)requestRooms();
   return;
  }
  // Ignore replayed approvals: they must not restart the offer or SDP deadline.
  if(m.type==='join-accept'&&mode==='guest'&&m.roomId===roomId&&m.requestId===requestId&&!approved&&!started){approved=true;opponentName=displayName(m.hostName||rooms.get(roomId)?.name);waitForOffer(m.requestId);status('Approved by '+opponentName+'. Waiting for host offer…');return}
  if(m.type==='guest-approved'&&mode==='host'&&m.roomId===roomId){
   relayStarted=false;
   if(peer||started)return;
   approved=true;let current=null;
   try{
    const hello=normalizeLanPacket({protocol:1,type:'hello',role:'host',session,build,sequence:0});
    current=peerFactory(hello);peer=current;waitForHostOffer(current);
    const offer=await current.createOffer();
    if(peer!==current)return;
    clearAdmissionTimeout();
    if(!send({type:'offer',roomId,sdp:offer})){
     cleanupPeer();approved=false;status('Unable to send host offer. Waiting for guest retry.');
    }else waitForHostAnswer(current);
   }catch(e){
    if(peer===current&&startRelay('Direct host offer failed: '+e.message))return;
    // A rejected offer from an abandoned session must not dispose a newer peer.
    if(!current||peer===current){
     clearAdmissionTimeout();cleanupPeer();approved=false;
     status('Host connection failed: '+e.message);
    }
   }
   return;
  }
  if(m.type==='relay-request'&&internet&&mode==='host'&&m.roomId===roomId&&approved&&!started){
   startRelay('Guest requested backup after direct connection failure');return;
  }
  if(m.type==='relay-offer'&&internet&&mode==='guest'&&m.roomId===roomId&&approved&&!started){
   if(peer?.relay)return;
   clearAdmissionTimeout();cleanupPeer();relayStarted=true;
   let current=null;
   try{
    const data=JSON.parse(m.sdp);
    const hello=normalizeLanPacket({protocol:1,type:'hello',role:'guest',session:data.session,build,sequence:0});
    current=createLanRelayPeerConnection(hello,{connection,roomId});peer=current;
    const answer=await current.acceptOffer(m.sdp);
    if(peer!==current)return;
    if(!send({type:'relay-answer',roomId,sdp:answer}))throw Error('relay answer could not be sent');
    status('Direct P2P unavailable. Connecting through approved relay backup…');
    watch(current);
   }catch(e){if(!current||peer===current)recoverGuestHandshake('Backup relay failed: '+e.message)}
   return;
  }
  if(m.type==='relay-answer'&&internet&&mode==='host'&&m.roomId===roomId&&peer?.relay){
   if(answerProcessingPeer===peer)return;
   const current=peer;answerProcessingPeer=current;waitForHostNegotiation(current);
   try{await current.acceptAnswer(m.sdp);if(peer===current){clearAdmissionTimeout();watch(current)}}
   catch(e){if(peer===current){clearAdmissionTimeout();cleanupPeer();approved=false;status('Backup relay answer failed: '+e.message)}}
   return;
  }
  if(m.type==='offer'&&mode==='guest'&&m.roomId===roomId&&approved&&!peer){
   clearAdmissionTimeout();
   let current=null;
   try{const data=JSON.parse(m.sdp);const hello=normalizeLanPacket({protocol:1,type:'hello',role:'guest',session:data.session,build,sequence:0});current=peerFactory(hello);peer=current;waitForGuestNegotiation(requestId,current);const answer=await current.acceptOffer(m.sdp);if(peer===current){clearAdmissionTimeout();if(!send({type:'answer',roomId,sdp:answer}))throw Error('unable to send answer');watch(current)}}catch(e){if(!current||peer===current){if(!requestRelay('Guest direct connection failed: '+e.message))recoverGuestHandshake('Guest connection failed: '+e.message)}}return;
  }
  if(m.type==='answer'&&mode==='host'&&m.roomId===roomId&&peer&&!peer.relay){
   // Ignore duplicate guest answers while SDP is processing or transport readiness is pending.
   if(answerProcessingPeer===peer)return;
   const current=peer;answerProcessingPeer=current;waitForHostNegotiation(current);
   try{await current.acceptAnswer(m.sdp);if(peer===current){clearAdmissionTimeout();watch(current)}}
   catch(e){if(peer===current){clearAdmissionTimeout();cleanupPeer();approved=false;status('Host answer failed: '+e.message)}}
  }
 }
 connection=(options.signalFactory??connectLanSignal)({internet,onEvent,onState:s=>{if(disposed)return;if(started){if(s!=='connected')activeRelay?.disconnectRelay?.();return;}signalState=s;if(s==='connected'){status(internet?'Online P2P discovery connected.':'LAN discovery connected.');if(mode==='host'&&roomId){hostRegistered=false;startHostRetry();clearAdmissionTimeout();cleanupPeer();approved=false;approvalRequestId=null;get('autoApproval').replaceChildren();registerHost()}else if(mode==='guest'){if(requestId){clearAdmissionTimeout();cleanupPeer();approved=false;requestId=null;roomId=null;status('Connection restored. Choose a game again.')}requestRooms()}}else {if(mode==='host'){hostRegistered=false;stopHostRetry()}rooms.clear();render();approvalRequestId=null;get('autoApproval').replaceChildren();status('Discovery '+s+'. Automatic hosting requires a signaling directory. If unavailable, choose MANUAL CONNECTION to exchange an offer and answer privately.')}}});
 const actions=[['autoHost',host],['autoFind',find],['autoReset',reset]];for(const [id,fn] of actions)get(id).addEventListener('click',fn);
 return ()=>{if(disposed)return;reset();disposed=true;connection.close();for(const [id,fn] of actions)get(id)?.removeEventListener('click',fn)};
}
