// LAN companion server: serve the game and broker same-network room discovery,
// host-approved admission and WebRTC SDP. Run: npm install && npm run serve:lan
// This is a LAN-only server, NOT an Internet matchmaking service.
import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {safeLanSend} from './lan-safe-send.mjs';
import {lanClientIp} from './lan-public-network.mjs';
import {rejectUnavailableJoin} from './lan-unavailable-join.mjs';
import {rejectBusyLanJoin} from './lan-busy-join.mjs';
import {isPublicLanPath} from './lan-static-policy.mjs';
import {releaseLanGuest} from './lan-guest-release.mjs';
import {expireLanPending} from './lan-pending-expiry.mjs';
import {createLanSignalPolicy} from './lan-signal-policy.mjs';
import {getLanGameUrls} from './lan-addresses.mjs';
import {lanRoomSnapshot} from './lan-room-snapshot.mjs';
import {createLanConnectionBudget} from './lan-connection-budget.mjs';
import {createLanMonotonicClock} from './lan-monotonic-clock.mjs';
import {resolve,extname,sep} from 'node:path';
import {networkInterfaces} from 'node:os';
import {WebSocketServer} from 'ws';
const root=resolve(process.cwd());
const realRoot=await realpath(root);
const port=Number(process.env.LAN_PORT||8000);
const host=process.env.LAN_BIND||'0.0.0.0';
const signalPolicy=createLanSignalPolicy({mode:process.env.SMF_SIGNAL_MODE||'lan',publicOrigin:process.env.SMF_PUBLIC_ORIGIN,selfOrigin:process.env.RENDER_EXTERNAL_URL||null});
const MAX_CONNECTIONS_PER_IP=8;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav'};
const clients=new Map(),rooms=new Map(),pending=new Map();
const connectionBudget=createLanConnectionBudget({
 maxConnections:process.env.LAN_MAX_CONNECTIONS===undefined?256:Number(process.env.LAN_MAX_CONNECTIONS),
 maxPerIp:MAX_CONNECTIONS_PER_IP
});
let nextId=0;
const brokerNow=createLanMonotonicClock();
const MAX=210000;
const MAX_ROOMS=128,MAX_PENDING_PER_GUEST=1,MAX_PENDING_PER_ROOM=1;
// Keep broker request IDs replay-safe for the host approval window; the cap
// bounds tombstone memory even if a peer generates only unique IDs.
const JOIN_REPLAY_TTL_MS=30000,MAX_JOIN_REPLAY_PER_ROOM=64;
// Request IDs are unique only inside their room; distinct guests may use the
// same wire ID while two unrelated hosts are awaiting approval.
const pendingKey=(roomId,requestId)=>`${roomId}:${requestId}`;
const safeGuestName=value=>typeof value==='string'?(value.replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ').slice(0,32)||'Guest'):'Guest';
const MAX_MESSAGES_PER_WINDOW=120,WINDOW_MS=60000;
// Consent-approved internet-only relay fallback. Keep signaling rate limit independent.
const MAX_RELAY_WIRE=24000,MAX_RELAY_FRAMES_PER_SECOND=90,MAX_RELAY_BYTES_PER_SECOND=512*1024;
function ipOf(request){return lanClientIp(request,{hosted:signalPolicy.mode==='hosted'})}
function sameSubnet(a,b){return signalPolicy.visible(a,b)}
function pruneJoinReplay(room,now){for(const [requestId,expiresAt] of room.joinReplay)if(expiresAt<=now)room.joinReplay.delete(requestId)}
function rememberJoinReplay(room,requestId,now){
 pruneJoinReplay(room,now);
 if(room.joinReplay.has(requestId))return 'request-replay';
 if(room.joinReplay.size>=MAX_JOIN_REPLAY_PER_ROOM)return 'request-replay-capacity';
 room.joinReplay.set(requestId,now+JOIN_REPLAY_TTL_MS);
 return '';
}
const roomScope=m=>m?.scope===undefined||m.scope==='lan'?'lan':m.scope==='internet-p2p'&&signalPolicy.mode==='hosted'?'internet-p2p':null;
function roomVisible(room,meta){return meta.discoveryScope===(room.scope??'lan')&&((room.scope??'lan')==='internet-p2p'||sameSubnet(meta.ip,room.ip))}
// Keep room availability synchronized when an approved guest leaves or disconnects.
const send=(ws,msg)=>{const delivered=safeLanSend(ws,msg);if(msg?.type==='guest-left'){const room=rooms.get(msg.roomId);if(room)announceRoom(room)}return delivered};
function announceRoom(room){broadcast(room,{type:'room-announce',roomId:room.id,name:room.name,build:room.build,full:!!room.guest,...(room.scope==='internet-p2p'?{scope:room.scope}:{})})}
function broadcast(room,msg){if(room.scope==='internet-p2p'&&room.listed===false&&msg.type!=='room-remove')return;for(const [ws,meta] of clients)if(roomVisible(room,meta))send(ws,msg)}
function clearHost(ws){for(const [id,room] of rooms)if(room.host===ws){rooms.delete(id);if(room.guest)send(room.guest,{type:'host-left',roomId:id});if(room.scope!=='internet-p2p'||room.listed!==false)broadcast(room,{type:'room-remove',roomId:id});for(const [key,req] of pending)if(req.roomId===id){const reqId=req.requestId??key;send(req.guest,{type:'join-reject',roomId:id,requestId:reqId,reason:'host-left'});pending.delete(key)}}}
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/healthz'){res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end('ok');return}
  if(pathname==='/lan-signal'){res.writeHead(426);res.end('WebSocket required');return}
  if(!isPublicLanPath(pathname)){res.writeHead(403);res.end('Forbidden');return}
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const actualFile=await realpath(file);
  if(!actualFile.startsWith(realRoot+sep)){res.writeHead(403);res.end('Forbidden');return}
  const info=await stat(actualFile);if(!info.isFile())throw Error('not file');
  const bytes=await readFile(actualFile);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found')}
});
const wss=new WebSocketServer({server,path:'/lan-signal',maxPayload:MAX,verifyClient:({req},done)=>{
 const ip=ipOf(req),origin=req.headers.origin;
 if(!signalPolicy.allows(ip,origin,req.headers.host)){done(false,403,'Forbidden');return;}
 if(!connectionBudget.reserve(req,ip)){done(false,503,'Connection capacity reached');return;}
 done(true);
}});
wss.on('connection',(ws,req)=>{
 if(!connectionBudget.connect(req)){ws.close(1013,'Connection capacity reached');return;}
 const connectedAt=brokerNow();
 const meta={id:'peer_'+(++nextId),ip:ipOf(req),windowStart:connectedAt,messageCount:0,relayWindowStart:connectedAt,relayFrames:0,relayBytes:0,alive:true,discoveryScope:'lan'};clients.set(ws,meta);
 ws.on('pong',()=>{meta.alive=true});
 ws.on('error',()=>{try{ws.terminate()}catch{ /* already closing */ }});
 send(ws,{type:'welcome',peerId:meta.id});
 if(signalPolicy.mode==='lan')send(ws,{type:'lan-addresses',urls:getLanGameUrls({interfaces:networkInterfaces(),port,bind:host})});
 else send(ws,{type:'discovery-scope',scope:'public-network'});
 for(const room of rooms.values())if(roomVisible(room,meta)&&!(room.scope==='internet-p2p'&&room.listed===false))send(ws,{type:'room-announce',roomId:room.id,name:room.name,build:room.build,full:!!room.guest,scope:room.scope});
 ws.on('message',bytes=>{
  const elapsedNow=brokerNow();if(elapsedNow-meta.windowStart>=WINDOW_MS){meta.windowStart=elapsedNow;meta.messageCount=0}
  const rateLimited=()=>++meta.messageCount>MAX_MESSAGES_PER_WINDOW;
  if(bytes.length>MAX){ws.close(1009,'Signaling message too large');return;}
  let m;try{m=JSON.parse(String(bytes))}catch{if(rateLimited())ws.close(1008,'Signaling rate limit');return}
  if(!m||typeof m!=='object'||Array.isArray(m)||typeof m.type!=='string'){if(rateLimited())ws.close(1008,'Signaling rate limit');return}
  if(m.type==='relay-frame'){
   if(elapsedNow-meta.relayWindowStart>=1000){meta.relayWindowStart=elapsedNow;meta.relayFrames=0;meta.relayBytes=0}
   meta.relayFrames++;meta.relayBytes+=bytes.length;
   if(meta.relayFrames>MAX_RELAY_FRAMES_PER_SECOND||meta.relayBytes>MAX_RELAY_BYTES_PER_SECOND){ws.close(1008,'Relay traffic limit');return}
   const room=rooms.get(m.roomId);
   if(!room||room.scope!=='internet-p2p'||!room.relay||!room.guest||
      (ws!==room.host&&ws!==room.guest)||typeof m.data!=='string'||
      Buffer.byteLength(m.data,'utf8')>MAX_RELAY_WIRE)return;
   send(ws===room.host?room.guest:room.host,{type:'relay-frame',roomId:room.id,data:m.data});return;
  }
  if(rateLimited()){ws.close(1008,'Signaling rate limit');return}
  const id=m.roomId,requestId=m.requestId;
  const requestKey=typeof id==='string'&&typeof requestId==='string'?pendingKey(id,requestId):'';
  if(m.type==='host'){
   if(typeof id!=='string'||! /^[a-zA-Z0-9_-]{8,64}$/.test(id)||typeof m.name!=='string'||m.name.length>48||!m.name.trim()||typeof m.build!=='string'||m.build.length>32)return;
   const requested=roomScope(m);
   if(!requested)return send(ws,{type:'error',message:'Unsupported discovery scope'});
   if(requested==='internet-p2p'&&m.public!==undefined&&typeof m.public!=='boolean')return send(ws,{type:'error',message:'Invalid public listing choice'});
   if(rooms.has(id)){const existing=rooms.get(id);if(existing.host!==ws)return send(ws,{type:'error',message:'Room already exists'});if(existing.scope!==requested)return send(ws,{type:'error',message:'Cannot change discovery scope for an active room'});const wasListed=existing.listed!==false;existing.listed=requested!=='internet-p2p'||m.public!==false;if(wasListed!==existing.listed){if(existing.listed)announceRoom(existing);else broadcast(existing,{type:'room-remove',roomId:existing.id})}send(ws,{type:'host-registered',roomId:id});return}
   if(!rooms.has(id)&&rooms.size>=MAX_ROOMS&&!([...rooms.values()].some(room=>room.host===ws)))return send(ws,{type:'error',message:'Room capacity reached'});
   clearHost(ws);
   // Switching from guest/pending admission to host must release the old seat first.
   releaseLanGuest(ws,rooms,pending,send);
   meta.discoveryScope=requested;
   const room={id,name:m.name.trim(),build:m.build,host:ws,ip:meta.ip,guest:null,scope:requested,listed:requested!=='internet-p2p'||m.public!==false,joinReplay:new Map()};rooms.set(id,room);
   announceRoom(room);send(ws,{type:'host-registered',roomId:id});return;
  }
  if(m.type==='rooms'){
   const requested=roomScope(m);
   if(!requested)return send(ws,{type:'rooms-snapshot',rooms:[]});
   meta.discoveryScope=requested;
   send(ws,lanRoomSnapshot(rooms,meta.ip,sameSubnet,requested));return
  }
  if(m.type==='leave'){clearHost(ws);releaseLanGuest(ws,rooms,pending,send);return}
  const room=rooms.get(id);if(!room||!roomVisible(room,meta)){rejectUnavailableJoin(ws,m,send);return;}
  if(m.type==='join'){
   if(ws===room.host||room.guest||[...rooms.values()].some(active=>active.guest===ws||active.host===ws)||typeof requestId!=='string'||! /^[a-zA-Z0-9_-]{8,64}$/.test(requestId)||pending.has(requestKey)||m.build!==room.build)return rejectBusyLanJoin(ws,m,send);
   if([...pending.values()].filter(p=>p.guest===ws).length>=MAX_PENDING_PER_GUEST)return send(ws,{type:'join-reject',roomId:id,requestId,reason:'request-already-pending'});
   if([...pending.values()].filter(p=>p.roomId===id).length>=MAX_PENDING_PER_ROOM)return send(ws,{type:'join-reject',roomId:id,requestId,reason:'room-queue-full'});
   const replayReason=rememberJoinReplay(room,requestId,elapsedNow);
   if(replayReason)return send(ws,{type:'join-reject',roomId:id,requestId,reason:replayReason});
   pending.set(requestKey,{roomId:id,requestId,guest:ws,host:room.host,guestName:safeGuestName(m.guestName),time:elapsedNow});send(room.host,{type:'join-request',roomId:id,requestId,guestName:safeGuestName(m.guestName)});return;
  }
  if(m.type==='decision'){
   const req=pending.get(requestKey);if(!req||req.host!==ws||req.roomId!==id)return;
   if(brokerNow()-req.time>30000){pending.delete(requestKey);send(req.guest,{type:'join-reject',roomId:id,requestId,reason:'timeout'});send(ws,{type:'join-cancel',roomId:id,requestId,reason:'timeout'});return}
   pending.delete(requestKey);
   if(m.accept===true&&!room.guest){
    // A guest may disconnect after requesting admission but before host approval.
    // Never reserve a room seat for a closed socket.
    if(req.guest.readyState!==1){send(ws,{type:'join-cancel',roomId:id,requestId,reason:'guest-left'});return;}
    room.relay=false;room.guest=req.guest;announceRoom(room);for(const [otherKey,other] of pending)if(other.roomId===id){const otherId=other.requestId??otherKey;pending.delete(otherKey);send(other.guest,{type:'join-reject',roomId:id,requestId:otherId,reason:'room-full'});send(ws,{type:'join-cancel',roomId:id,requestId:otherId})}send(req.guest,{type:'join-accept',roomId:id,requestId,hostName:room.name});send(ws,{type:'guest-approved',roomId:id,requestId,guestName:req.guestName});}
   else send(req.guest,{type:'join-reject',roomId:id,requestId});
   return;
  }
  // Only an approved internet guest can request fallback; never a stranger or LAN guest.
  if(m.type==='relay-request'){
   if(room.scope==='internet-p2p'&&room.guest===ws&&!room.relay)
    send(room.host,{type:'relay-request',roomId:id});
   return;
  }
  if(m.type==='relay-offer'&&ws===room.host&&room.guest&&room.scope==='internet-p2p'){
   if(typeof m.sdp==='string'&&m.sdp.length<=1024&&m.sdp.length>=8){room.relay=true;send(room.guest,{type:'relay-offer',roomId:id,sdp:m.sdp})}return;
  }
  if(m.type==='relay-answer'&&ws===room.guest&&room.relay){
   if(typeof m.sdp==='string'&&m.sdp.length<=1024&&m.sdp.length>=8)send(room.host,{type:'relay-answer',roomId:id,sdp:m.sdp});return;
  }
  if(m.type==='offer'&&ws===room.host&&room.guest){if(typeof m.sdp==='string'&&m.sdp.length<=200000)send(room.guest,{type:'offer',roomId:id,sdp:m.sdp});return}
  if(m.type==='answer'&&ws===room.guest){if(typeof m.sdp==='string'&&m.sdp.length<=200000)send(room.host,{type:'answer',roomId:id,sdp:m.sdp});return}
 });
 ws.on('close',()=>{clients.delete(ws);connectionBudget.release(req);clearHost(ws);releaseLanGuest(ws,rooms,pending,send)});
});
wss.on('wsClientError',(_error,_socket,req)=>connectionBudget.release(req));
setInterval(()=>expireLanPending(pending,send,brokerNow()),5000).unref();
// Remove half-open hosts/guests that lost their network without a WebSocket close frame.
setInterval(()=>{for(const [ws,meta] of clients){if(!meta.alive){ws.terminate();continue}meta.alive=false;try{ws.ping()}catch{ws.terminate()}}},20000).unref();

server.listen(port,host,()=>{
 console.log('SuperMagicFootball LAN server listening on '+host+':'+port);
 for(const url of getLanGameUrls({interfaces:networkInterfaces(),port,bind:host}))console.log('LAN game URL: '+url);
});
