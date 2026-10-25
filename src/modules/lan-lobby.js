// LAN-045: manual trusted-peer SDP setup with optional handoff to the live match.
// SDP may contain local network addresses; users should share it only with a trusted peer.
import {RELEASE} from './release.js';
import {mountAutoLanLobby} from './lan-auto-lobby.js';
import {normalizeLanPacket} from './lan_protocol.js';
import {createLanPeerConnection} from './lan_peer_connection.js';

const LAN_LOBBY_SIGNAL_LIMIT=200000;
function makeLanSession(cryptoSource=globalThis.crypto){
  if(typeof cryptoSource?.getRandomValues!=='function')throw new Error('Secure random session generation unavailable');
  const bytes=cryptoSource.getRandomValues(new Uint8Array(16));
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
function parseGuestLanOffer(raw,build=RELEASE.version){
  if(typeof raw!=='string'||raw.length>LAN_LOBBY_SIGNAL_LIMIT)throw new Error('Invalid LAN offer size');
  let offer;
  try{offer=JSON.parse(raw)}catch{throw new Error('Invalid LAN offer JSON')}
  if(!offer||Object.getPrototypeOf(offer)!==Object.prototype||
      offer.protocol!==1||offer.kind!=='offer'||offer.build!==build||
      typeof offer.sdp!=='string'||!offer.sdp.startsWith('v=0')||
      offer.sdp.length<8||offer.sdp.length>180000){
    throw new Error('LAN offer invalid or installed game versions differ');
  }
  return normalizeLanPacket({protocol:1,type:'hello',role:'guest',session:offer.session,build,sequence:0});
}

function mountLanLobby(root,options={}){
  if(!root||typeof root.querySelector!=='function')throw new TypeError('LAN lobby root required');
  // Same-origin LAN server provides automatic discovery and consent. Public Pages
  // cannot directly scan private networks; retain manual fallback there.
  if(options.auto!==false && !options.peerFactory && globalThis.location?.protocol==='http:' && globalThis.location?.hostname && globalThis.location.hostname!=='saeedsai.github.io')return mountAutoLanLobby(root,options);
  const peerFactory=options.peerFactory??createLanPeerConnection;
  const build=options.build??RELEASE.version;
  const cryptoSource=options.cryptoSource??globalThis.crypto;
  root.innerHTML=`<section class="panel lanConnectionLab" aria-label="Local network connection setup">
    <p class="muted">LAN Quick Match: after both devices exchange offers and answers, the host runs the match and the guest controls the away team. Both devices must use the same installed game version and local network. Share the connection text only with someone you trust; it may contain local network addresses.</p>
    <div class="row"><button type="button" class="btn" id="lanHost">CREATE HOST OFFER</button>
      <button type="button" class="btn" id="lanGuest">JOIN AS GUEST</button>
      <button type="button" class="btn minor" id="lanReset">RESET CONNECTION</button></div>
    <label for="lanIncoming">Incoming offer (guest) or answer (host)</label>
    <textarea id="lanIncoming" rows="5" maxlength="200000" spellcheck="false" autocapitalize="off" aria-describedby="lanStatus"></textarea>
    <div class="row"><button type="button" class="btn" id="lanApply">APPLY INCOMING TEXT</button></div>
    <label for="lanOutgoing">Outgoing offer (host) or answer (guest) — copy to other device</label>
    <textarea id="lanOutgoing" rows="5" readonly spellcheck="false" aria-label="Outgoing connection text"></textarea>
    <div class="row"><button type="button" class="btn minor" id="lanCopy">COPY OUTGOING TEXT</button></div>
    <p id="lanStatus" role="status" aria-live="polite">Choose host or guest to begin connection setup.</p>
  </section>`;
  // Static GitHub Pages cannot discover LAN hosts. Offer an explicit handoff to
  // the companion server rather than presenting manual SDP as the only route.
  const isPublicPages=globalThis.location?.hostname==='saeedsai.github.io';
  if(isPublicPages){
    const gateway=document.createElement('section');
    gateway.className='panel lanConnectionLab';
    gateway.innerHTML='<h2>HOST OR JOIN A LAN GAME</h2><p>Automatic host rooms and guest discovery run on the LAN game server, not on GitHub Pages. On the host computer run <code>npm run serve:lan</code> (or <code>start-lan.cmd</code>). Enter its local IP address below, then open the game on both devices.</p><label for="lanServerIp">Host computer IP address (example: 192.168.1.20)</label><input id="lanServerIp" type="text" inputmode="decimal" autocomplete="off" placeholder="192.168.1.20" aria-label="LAN host IP address"/><div class="row"><button type="button" class="btn" id="lanOpenServer">OPEN LAN HOST / JOIN LOBBY</button></div><p id="lanGatewayStatus" role="status" aria-live="polite">The LAN server must be running and both devices must be on the same network.</p>';
    root.prepend(gateway);
    gateway.querySelector('#lanOpenServer').addEventListener('click',()=>{
      const ip=gateway.querySelector('#lanServerIp').value.trim();
      const parts=ip.split('.');
      if(parts.length!==4||parts.some(part=>!/^\\d{1,3}$/.test(part)||Number(part)>255)||!((Number(parts[0])===10)||(Number(parts[0])===192&&Number(parts[1])===168)||(Number(parts[0])===172&&Number(parts[1])>=16&&Number(parts[1])<=31))){
        gateway.querySelector('#lanGatewayStatus').textContent='Enter a valid private IPv4 address of the host computer.';
        return;
      }
      globalThis.location.assign('http://'+parts.map(Number).join('.')+':8000/');
    });
  }
  const el=id=>root.querySelector('#'+id);
  const status=el('lanStatus'),incoming=el('lanIncoming'),outgoing=el('lanOutgoing');
  let peer=null,mode=null,controller=null,unsubscribe=null,disposed=false;
  const tell=message=>{if(!disposed)status.textContent=message;};
  function cleanup(){
    controller?.abort();controller=null;
    unsubscribe?.();unsubscribe=null;
    peer?.dispose();peer=null;
  }
  function reset(){
    cleanup();mode=null;incoming.value='';outgoing.value='';
    tell('Choose host or guest to begin connection setup.');
  }
  function observe(current){
    unsubscribe=current.subscribeStatus(state=>{
      if(peer!==current||disposed)return;
      if(state.ready)tell('WebRTC connection ready. Starting LAN Quick Match…');
      else tell('Connection: '+state.phase+' · transport '+state.transport+' · channel '+state.channel+'.');
    });
  }
  function handoffReady(current){
    if(peer!==current||disposed)return;
    if(typeof options.onReady!=='function'){
      tell('WebRTC connection ready.');return;
    }
    controller?.abort();controller=null;
    unsubscribe?.();unsubscribe=null;
    peer=null; // transfer ownership: lobby teardown must not close an active match
    try{options.onReady(current,mode)}catch(error){
      current.dispose();tell('Unable to start LAN match: '+error.message);
    }
  }
  function watchReady(current){
    controller=new AbortController();
    current.awaitReady(120000,controller.signal).then(()=>{
      if(peer===current)handoffReady(current);
    }).catch(error=>{
      if(peer===current&&!controller?.signal.aborted)tell('Connection not ready: '+error.message+'. Reset to retry.');
    });
  }
  async function host(){
    reset();mode='host';
    try{
      const hello=normalizeLanPacket({protocol:1,type:'hello',role:'host',session:makeLanSession(cryptoSource),build,sequence:0});
      const current=peerFactory(hello);peer=current;observe(current);
      const offer=await current.createOffer();
      if(peer!==current||disposed)return;
      outgoing.value=offer;
      tell('Host offer ready. Copy it to the guest, then paste the guest answer above and apply.');
    }catch(error){cleanup();tell('Cannot create host offer: '+error.message);}
  }
  function guest(){reset();mode='guest';tell('Paste the host offer into Incoming, then choose APPLY INCOMING TEXT.');}
  async function apply(){
    if(!mode){tell('Choose host or guest first.');return;}
    const raw=incoming.value.trim();
    if(!raw){tell('Paste connection text before applying.');return;}
    try{
      if(mode==='guest'){
        if(peer){tell('Guest answer already created. Reset to start another connection.');return;}
        const hello=parseGuestLanOffer(raw,build);
        const current=peerFactory(hello);peer=current;observe(current);
        const answer=await current.acceptOffer(raw);
        if(peer!==current||disposed)return;
        outgoing.value=answer;
        tell('Guest answer ready. Copy it to the host; waiting for the WebRTC handshake.');
        watchReady(current);
      }else{
        if(!peer){tell('Create a host offer first.');return;}
        const current=peer;
        await current.acceptAnswer(raw);
        if(peer!==current||disposed)return;
        tell('Answer accepted; waiting for the WebRTC handshake.');
        watchReady(current);
      }
    }catch(error){
      if(mode==='guest')cleanup();
      tell('Connection text rejected: '+error.message);
    }
  }
  async function copy(){
    if(!outgoing.value){tell('No outgoing connection text yet.');return;}
    try{
      if(!globalThis.navigator?.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await globalThis.navigator.clipboard.writeText(outgoing.value);
      tell('Connection text copied. Share it privately with the other device.');
    }catch{
      outgoing.focus();outgoing.select();
      tell('Clipboard unavailable. Select and manually copy the outgoing text.');
    }
  }
  const actions=[['lanHost',host],['lanGuest',guest],['lanReset',reset],['lanApply',apply],['lanCopy',copy]];
  for(const [id,handler] of actions)el(id).addEventListener('click',handler);
  return ()=>{
    if(disposed)return;
    disposed=true;
    cleanup();
    for(const [id,handler] of actions)el(id)?.removeEventListener('click',handler);
  };
}
export {makeLanSession,parseGuestLanOffer,mountLanLobby};
