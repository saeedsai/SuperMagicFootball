// LAN companion server: serve the game and broker same-network room discovery,
// host-approved admission and WebRTC SDP. Run: npm install && npm run serve:lan
// This is a LAN-only server, NOT an Internet matchmaking service.
import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {safeLanSend} from './lan-safe-send.mjs';
import {lanClientIp} from './lan-public-network.mjs';
import {rejectUnavailableJoin} from './lan-unavailable-join.mjs';
import {isPublicLanPath} from './lan-static-policy.mjs';
import {releaseLanGuest} from './lan-guest-release.mjs';
import {expireLanPending} from './lan-pending-expiry.mjs';
import {createLanSignalPolicy} from './lan-signal-policy.mjs';
import {getLanGameUrls} from './lan-addresses.mjs';
import {lanRoomSnapshot} from './lan-room-snapshot.mjs';
import {resolve,extname,sep} from 'node:path';
import {networkInterfaces} from 'node:os';
import {WebSocketServer} from 'ws';
const root=resolve(process.cwd());
const realRoot=await realpath(root);
const port=Number(process.env.LAN_PORT||8000);
const host=process.env.LAN_BIND||'0.0.0.0';
const signalPolicy=createLanSignalPolicy({mode:process.env.SMF_SIGNAL_MODE||'lan',publicOrigin:process.env.SMF_PUBLIC_ORIGIN,selfOrigin:process.env.RENDER_EXTERNAL_URL||null});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav'};
const clients=new Map(),rooms=new Map(),pending=new Map();
let nextId=0;
const MAX=210000;
const MAX_ROOMS=128,MAX_PENDING_PER_GUEST=1,MAX_PENDING_PER_ROOM=1;
const MAX_MESSAGES_PER_WINDOW=120,WINDOW_MS=60000,MAX_CONNECTIONS_PER_IP=8;
function ipOf(request){return lanClientIp(request,{hosted:signalPolicy.mode==='hosted'})}
function sameSubnet(a,b){return signalPolicy.visible(a,b)}
// Keep room availability synchronized when an approved guest leaves or disconnects.
const send=(ws,msg)=>{const delivered=safeLanSend(ws,msg);if(msg?.type==='guest-left'){const room=rooms.get(msg.roomId);if(room)announceRoom(room)}return delivered};
function announceRoom(room){broadcast(room,{type:'room-announce',roomId:room.id,name:room.name,build:room.build,full:!!room.guest})}
function broadcast(room,msg){for(const [ws,meta] of clients)if(sameSubnet(meta.ip,room.ip))send(ws,msg)}
function clearHost(ws){for(const [id,room] of rooms)if(room.host===ws){rooms.delete(id);if(room.guest)send(room.guest,{type:'host-left',roomId:id});broadcast(room,{type:'room-remove',roomId:id});for(const [reqId,req] of pending)if(req.roomId===id){send(req.guest,{type:'join-reject',roomId:id,requestId:reqId,reason:'host-left'});pending.delete(reqId)}}}
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
const wss=new WebSocketServer({server,path:'/lan-signal',maxPayload:MAX,verifyClient:({req})=>{const ip=ipOf(req);const origin=req.headers.origin;return signalPolicy.allows(ip,origin,req.headers.host)&&[...clients.values()].filter(meta=>meta.ip===ip).length<MAX_CONNECTIONS_PER_IP}});
wss.on('connection',(ws,req)=>{
 const meta={id:'peer_'+(++nextId),ip:ipOf(req),windowStart:Date.now(),messageCount:0,alive:true};clients.set(ws,meta);
 ws.on('pong',()=>{meta.alive=true});
 ws.on('error',()=>{try{ws.terminate()}catch{ /* already closing */ }});
 send(ws,{type:'welcome',peerId:meta.id});
 if(signalPolicy.mode==='lan')send(ws,{type:'lan-addresses',urls:getLanGameUrls({interfaces:networkInterfaces(),port,bind:host})});
 else send(ws,{type:'discovery-scope',scope:'public-network'});
 for(const room of rooms.values())if(sameSubnet(meta.ip,room.ip))send(ws,{type:'room-announce',roomId:room.id,name:room.name,build:room.build,full:!!room.guest});
 ws.on('message',bytes=>{
  const now=Date.now();if(now-meta.windowStart>=WINDOW_MS){meta.windowStart=now;meta.messageCount=0}
  if(++meta.messageCount>MAX_MESSAGES_PER_WINDOW){ws.close(1008,'Signaling rate limit');return}
  if(bytes.length>MAX)return;
  let m;try{m=JSON.parse(String(bytes))}catch{return}
  if(!m||typeof m!=='object'||Array.isArray(m)||typeof m.type!=='string')return;
  const id=m.roomId,requestId=m.requestId;
  if(m.type==='host'){
   if(typeof id!=='string'||! /^[a-zA-Z0-9_-]{8,64}$/.test(id)||typeof m.name!=='string'||m.name.length>48||!m.name.trim()||typeof m.build!=='string'||m.build.length>32)return;
   if(rooms.has(id)){if(rooms.get(id).host!==ws)return send(ws,{type:'error',message:'Room already exists'});send(ws,{type:'host-registered',roomId:id});return}
   if(!rooms.has(id)&&rooms.size>=MAX_ROOMS&&!([...rooms.values()].some(room=>room.host===ws)))return send(ws,{type:'error',message:'Room capacity reached'});
   clearHost(ws);
   // Switching from guest/pending admission to host must release the old seat first.
   releaseLanGuest(ws,rooms,pending,send);
   const room={id,name:m.name.trim(),build:m.build,host:ws,ip:meta.ip,guest:null};rooms.set(id,room);
   announceRoom(room);send(ws,{type:'host-registered',roomId:id});return;
  }
  if(m.type==='rooms'){send(ws,lanRoomSnapshot(rooms,meta.ip,sameSubnet));return}
  if(m.type==='leave'){clearHost(ws);releaseLanGuest(ws,rooms,pending,send);return}
  const room=rooms.get(id);if(!room||!sameSubnet(meta.ip,room.ip)){rejectUnavailableJoin(ws,m,send);return;}
  if(m.type==='join'){
   if(ws===room.host||room.guest||[...rooms.values()].some(active=>active.guest===ws||active.host===ws)||typeof requestId!=='string'||! /^[a-zA-Z0-9_-]{8,64}$/.test(requestId)||pending.has(requestId)||m.build!==room.build)return send(ws,{type:'join-reject',requestId,reason:'room-full-or-version'});
   if([...pending.values()].filter(p=>p.guest===ws).length>=MAX_PENDING_PER_GUEST)return send(ws,{type:'join-reject',roomId:id,requestId,reason:'request-already-pending'});
   if([...pending.values()].filter(p=>p.roomId===id).length>=MAX_PENDING_PER_ROOM)return send(ws,{type:'join-reject',roomId:id,requestId,reason:'room-queue-full'});
   pending.set(requestId,{roomId:id,guest:ws,host:room.host,time:Date.now()});send(room.host,{type:'join-request',roomId:id,requestId});return;
  }
  if(m.type==='decision'){
   const req=pending.get(requestId);if(!req||req.host!==ws||req.roomId!==id)return;
   if(Date.now()-req.time>30000){pending.delete(requestId);send(req.guest,{type:'join-reject',roomId:id,requestId,reason:'timeout'});send(ws,{type:'join-cancel',roomId:id,requestId,reason:'timeout'});return}
   pending.delete(requestId);
   if(m.accept===true&&!room.guest){
    // A guest may disconnect after requesting admission but before host approval.
    // Never reserve a room seat for a closed socket.
    if(req.guest.readyState!==1){send(ws,{type:'join-cancel',roomId:id,requestId,reason:'guest-left'});return;}
    room.guest=req.guest;announceRoom(room);for(const [otherId,other] of pending)if(other.roomId===id){pending.delete(otherId);send(other.guest,{type:'join-reject',roomId:id,requestId:otherId,reason:'room-full'});send(ws,{type:'join-cancel',roomId:id,requestId:otherId})}send(req.guest,{type:'join-accept',roomId:id,requestId});send(ws,{type:'guest-approved',roomId:id,requestId});}
   else send(req.guest,{type:'join-reject',roomId:id,requestId});
   return;
  }
  if(m.type==='offer'&&ws===room.host&&room.guest){if(typeof m.sdp==='string'&&m.sdp.length<=200000)send(room.guest,{type:'offer',roomId:id,sdp:m.sdp});return}
  if(m.type==='answer'&&ws===room.guest){if(typeof m.sdp==='string'&&m.sdp.length<=200000)send(room.host,{type:'answer',roomId:id,sdp:m.sdp});return}
 });
 ws.on('close',()=>{clients.delete(ws);clearHost(ws);releaseLanGuest(ws,rooms,pending,send)});
});
setInterval(()=>expireLanPending(pending,send),5000).unref();
// Remove half-open hosts/guests that lost their network without a WebSocket close frame.
setInterval(()=>{for(const [ws,meta] of clients){if(!meta.alive){ws.terminate();continue}meta.alive=false;try{ws.ping()}catch{ws.terminate()}}},20000).unref();

server.listen(port,host,()=>{
 console.log('SuperMagicFootball LAN server listening on '+host+':'+port);
 for(const url of getLanGameUrls({interfaces:networkInterfaces(),port,bind:host}))console.log('LAN game URL: '+url);
});
