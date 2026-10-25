// LAN companion server: serve the game and broker same-network room discovery,
// host-approved admission and WebRTC SDP. Run: npm install && npm run serve:lan
// This is a LAN-only server, NOT an Internet matchmaking service.
import http from 'node:http';
import {readFile,stat,realpath} from 'node:fs/promises';
import {isPublicLanPath} from './lan-static-policy.mjs';
import {releaseLanGuest} from './lan-guest-release.mjs';
import {resolve,extname,sep} from 'node:path';
import {networkInterfaces} from 'node:os';
import {WebSocketServer} from 'ws';
const root=resolve(process.cwd());
const realRoot=await realpath(root);
const port=Number(process.env.LAN_PORT||8000);
const host=process.env.LAN_BIND||'0.0.0.0';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav'};
const clients=new Map(),rooms=new Map(),pending=new Map();
let nextId=0;
const MAX=210000;
function ipOf(request){return String(request.socket.remoteAddress||'').replace(/^::ffff:/,'')}
function lanIp(ip){if(ip==='::1'||ip==='127.0.0.1')return true;if(!/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip))return false;return true}
function sameSubnet(a,b){if(a===b)return true;if(a==='127.0.0.1'||b==='127.0.0.1'||a==='::1'||b==='::1')return false;return a.split('.').slice(0,3).join('.')===b.split('.').slice(0,3).join('.')}
const send=(ws,msg)=>{if(ws?.readyState===1)ws.send(JSON.stringify(msg))};
function broadcast(room,msg){for(const [ws,meta] of clients)if(sameSubnet(meta.ip,room.ip))send(ws,msg)}
function clearHost(ws){for(const [id,room] of rooms)if(room.host===ws){rooms.delete(id);if(room.guest)send(room.guest,{type:'host-left',roomId:id});broadcast(room,{type:'room-remove',roomId:id});for(const [reqId,req] of pending)if(req.roomId===id){send(req.guest,{type:'join-reject',roomId:id,requestId:reqId,reason:'host-left'});pending.delete(reqId)}}}
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
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
const wss=new WebSocketServer({server,path:'/lan-signal',maxPayload:MAX,verifyClient:({req})=>{const ip=ipOf(req);const origin=req.headers.origin;return lanIp(ip)&&(!origin||(()=>{try{const u=new URL(origin);return u.host===req.headers.host}catch{return false}})())}});
wss.on('connection',(ws,req)=>{
 const meta={id:'peer_'+(++nextId),ip:ipOf(req)};clients.set(ws,meta);
 send(ws,{type:'welcome',peerId:meta.id});
 for(const room of rooms.values())if(sameSubnet(meta.ip,room.ip))send(ws,{type:'room-announce',roomId:room.id,name:room.name,build:room.build});
 ws.on('message',bytes=>{
  if(bytes.length>MAX)return;
  let m;try{m=JSON.parse(String(bytes))}catch{return}
  if(!m||typeof m!=='object'||Array.isArray(m)||typeof m.type!=='string')return;
  const id=m.roomId,requestId=m.requestId;
  if(m.type==='host'){
   if(typeof id!=='string'||! /^[a-zA-Z0-9_-]{8,64}$/.test(id)||typeof m.name!=='string'||m.name.length>48||!m.name.trim()||typeof m.build!=='string'||m.build.length>32)return;
   clearHost(ws);if(rooms.has(id))return send(ws,{type:'error',message:'Room already exists'});
   const room={id,name:m.name.trim(),build:m.build,host:ws,ip:meta.ip,guest:null};rooms.set(id,room);
   broadcast(room,{type:'room-announce',roomId:id,name:room.name,build:room.build});send(ws,{type:'host-registered',roomId:id});return;
  }
  if(m.type==='rooms'){for(const room of rooms.values())if(sameSubnet(meta.ip,room.ip))send(ws,{type:'room-announce',roomId:room.id,name:room.name,build:room.build});return}
  if(m.type==='leave'){clearHost(ws);releaseLanGuest(ws,rooms,pending,send);return}
  const room=rooms.get(id);if(!room||!sameSubnet(meta.ip,room.ip))return;
  if(m.type==='join'){
   if(ws===room.host||room.guest||typeof requestId!=='string'||! /^[a-zA-Z0-9_-]{8,64}$/.test(requestId)||pending.has(requestId)||m.build!==room.build)return send(ws,{type:'join-reject',requestId,reason:'room-full-or-version'});
   pending.set(requestId,{roomId:id,guest:ws,host:room.host,time:Date.now()});send(room.host,{type:'join-request',roomId:id,requestId});return;
  }
  if(m.type==='decision'){
   const req=pending.get(requestId);if(!req||req.host!==ws||req.roomId!==id)return;
   pending.delete(requestId);
   if(m.accept===true&&!room.guest){room.guest=req.guest;send(req.guest,{type:'join-accept',roomId:id,requestId});send(ws,{type:'guest-approved',roomId:id,requestId});}
   else send(req.guest,{type:'join-reject',roomId:id,requestId});
   return;
  }
  if(m.type==='offer'&&ws===room.host&&room.guest){if(typeof m.sdp==='string'&&m.sdp.length<=200000)send(room.guest,{type:'offer',roomId:id,sdp:m.sdp});return}
  if(m.type==='answer'&&ws===room.guest){if(typeof m.sdp==='string'&&m.sdp.length<=200000)send(room.host,{type:'answer',roomId:id,sdp:m.sdp});return}
 });
 ws.on('close',()=>{clients.delete(ws);clearHost(ws);releaseLanGuest(ws,rooms,pending,send)});
});
setInterval(()=>{for(const [id,p] of pending)if(Date.now()-p.time>30000){pending.delete(id);send(p.guest,{type:'join-reject',roomId:p.roomId,requestId:id,reason:'timeout'})}},5000).unref();
server.listen(port,host,()=>{
 console.log('SuperMagicFootball LAN server listening on '+host+':'+port);
 for(const [name,entries] of Object.entries(networkInterfaces()))for(const e of entries||[])if(e.family==='IPv4'&&!e.internal)console.log('LAN URL ('+name+'): http://'+e.address+':'+port);
});
