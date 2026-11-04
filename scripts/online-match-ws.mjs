import {WebSocketServer, WebSocket} from 'ws';

const WS_PATH='/api/v1/matches';
const PROTOCOL='smf-online-v1';
const TICKET=/^ticket\.([a-f0-9]{64})$/;
const MATCH_ID=/^[a-f0-9]{32}$/;
const CLIENT_MESSAGE_KEYS=new Set(['type','matchId','sequence','input']);

function originAllowed(value,allowed){
  if(typeof value!=='string')return false;
  try{const url=new URL(value);return url.protocol==='https:'&&url.origin===value&&allowed.has(value)}catch{return false}
}
function parseProtocols(request){
  const raw=request.headers['sec-websocket-protocol'];
  if(typeof raw!=='string'||raw.length>256)return null;
  const parts=raw.split(',').map(value=>value.trim());
  if(parts.length!==2||parts[0]!==PROTOCOL)return null;
  const ticket=parts[1].match(TICKET);
  return ticket?ticket[1]:null;
}
function jsonRecord(value){return value&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)}
function sendJson(socket,value){
  if(socket.readyState!==WebSocket.OPEN)return false;
  try{socket.send(JSON.stringify(value),{binary:false,compress:false});return true}catch{return false}
}
function reject(socket,status,message){
  if(socket.destroyed)return;
  socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
}

/** Attach the online matchmaking WebSocket to a Node HTTP server. */
export function attachOnlineMatchWebSocket(server,{matchmaking,allowedOrigins,maxConnections=128,maxPayload=8192,
  messagesPerSecond=60,now=Date.now,WebSocketServerClass=WebSocketServer}={}){
  if(!server||typeof server.on!=='function'||typeof server.removeListener!=='function')throw new TypeError('Online match transport requires an HTTP server');
  if(!matchmaking||typeof matchmaking.queuePresentedTicket!=='function'||typeof matchmaking.submitInput!=='function'||
     typeof matchmaking.disconnect!=='function'||typeof matchmaking.cancelQueue!=='function')throw new TypeError('Online match transport requires a matchmaking service');
  if(!Array.isArray(allowedOrigins)||!allowedOrigins.length||allowedOrigins.some(value=>!originAllowed(value,new Set([value]))))throw new TypeError('Online match transport requires exact HTTPS origins');
  if(!Number.isSafeInteger(maxConnections)||maxConnections<1||maxConnections>10000||!Number.isSafeInteger(maxPayload)||maxPayload<256||maxPayload>65536||
     !Number.isSafeInteger(messagesPerSecond)||messagesPerSecond<1||messagesPerSecond>300||typeof now!=='function'||typeof WebSocketServerClass!=='function')throw new TypeError('Invalid online match transport limits');
  const allowed=new Set(allowedOrigins);
  const socketsByUser=new Map();
  const metadata=new WeakMap();
  const wss=new WebSocketServerClass({noServer:true,maxPayload,perMessageDeflate:false,clientTracking:true,
    handleProtocols:protocols=>protocols.has(PROTOCOL)?PROTOCOL:false});

  function notifyRequeue(userId,detail={}){
    const socket=socketsByUser.get(userId),meta=socket&&metadata.get(socket);
    if(!meta)return;
    if(meta.matchId===detail.previousMatchId){meta.matchId=null;meta.side=null;meta.notifiedMatchId=null;}
    if(detail.queued===false){sendJson(socket,{type:'queue-rejected',reason:'service-capacity'});socket.close(1013,'Matchmaking queue is full');return;}
    sendJson(socket,{type:'queued',reason:'opponent-disconnected'});
  }
  function announceMatch(socket,meta,matchId){
    if(meta.side!==0&&meta.side!==1)return false;
    if(meta.notifiedMatchId===matchId&&meta.notifiedSide===meta.side)return true;
    if(!sendJson(socket,{type:'matched',matchId,side:meta.side,...(meta.mode==='career-ai'?{mode:'career-ai'}:{}),...(meta.resumed===true?{resumed:true}:{})}))return false;
    meta.notifiedMatchId=matchId;meta.notifiedSide=meta.side;
    return true;
  }
  function sendSnapshot(userId,envelope,context={}){
    const socket=socketsByUser.get(userId),meta=socket&&metadata.get(socket);
    if(!meta||meta.userId!==userId||!MATCH_ID.test(envelope?.matchId||''))return false;
    if(context===null||typeof context!=='object'||Array.isArray(context))return false;
    const hasSide=Object.hasOwn(context,'side');
    if(hasSide&&context.side!==0&&context.side!==1)return false;
    if(meta.matchId!==envelope.matchId){meta.matchId=envelope.matchId;meta.side=null;meta.notifiedMatchId=null;meta.notifiedSide=null;}
    if(hasSide){if(meta.side!==null&&meta.side!==context.side)return false;meta.side=context.side;}
    if(Object.hasOwn(context,'mode')){if(!['quick','career-ai'].includes(context.mode))return false;meta.mode=context.mode;}
    if(!announceMatch(socket,meta,envelope.matchId))return false;
    return sendJson(socket,{type:'snapshot',matchId:envelope.matchId,tick:envelope.tick,snapshot:envelope.snapshot});
  }
  function onMatchFinished(matchId){
    if(!MATCH_ID.test(matchId||''))return false;
    let delivered=false;
    for(const socket of wss.clients){
      const meta=metadata.get(socket);
      if(!meta||meta.matchId!==matchId)continue;
      delivered=sendJson(socket,{type:'match-finished',matchId})||delivered;
      meta.matchId=null;meta.side=null;meta.notifiedMatchId=null;meta.notifiedSide=null;
    }
    return delivered;
  }
  function onUpgrade(request,socket,head){
    let url;
    try{url=new URL(request.url,'https://match.invalid')}catch{reject(socket,400,'Bad Request');return}
    if(url.pathname!==WS_PATH||url.search||url.hash){reject(socket,404,'Not Found');return;}
    if(!originAllowed(request.headers.origin,allowed)){reject(socket,403,'Forbidden');return;}
    const ticket=parseProtocols(request);
    if(!ticket){reject(socket,401,'Unauthorized');return;}
    if(wss.clients.size>=maxConnections){reject(socket,503,'Service Unavailable');return;}
    try{
      wss.handleUpgrade(request,socket,head,ws=>wss.emit('connection',ws,request,ticket));
    }catch{reject(socket,400,'Bad Request')}
  }
  server.on('upgrade',onUpgrade);
  wss.on('connection',(ws,_request,ticket)=>{
    const meta={userId:null,matchId:null,side:null,notifiedMatchId:null,notifiedSide:null,windowStart:now(),messageCount:0,closed:false};
    metadata.set(ws,meta);
    ws.on('error',()=>{try{ws.terminate()}catch{}});
    ws.on('message',(bytes,isBinary)=>{
      if(isBinary||bytes.length>maxPayload){ws.close(isBinary?1003:1009,'Invalid input frame');return;}
      const at=now();
      if(!Number.isFinite(at)){ws.close(1011,'Service unavailable');return;}
      if(at-meta.windowStart>=1000||at<meta.windowStart){meta.windowStart=at;meta.messageCount=0;}
      if(++meta.messageCount>messagesPerSecond){ws.close(1008,'Input rate exceeded');return;}
      let message;
      try{message=JSON.parse(bytes.toString('utf8'))}catch{ws.close(1007,'Invalid JSON');return;}
      if(!jsonRecord(message)||Object.keys(message).length!==CLIENT_MESSAGE_KEYS.size||Object.keys(message).some(key=>!CLIENT_MESSAGE_KEYS.has(key))||
         message.type!=='input'||!MATCH_ID.test(message.matchId||'')||!Number.isSafeInteger(message.sequence)||message.sequence<1||!jsonRecord(message.input)){
        sendJson(ws,{type:'input-rejected',reason:'invalid-frame'});return;
      }
      if(!meta.userId||!meta.matchId||message.matchId!==meta.matchId){sendJson(ws,{type:'input-rejected',reason:'match-not-active'});return;}
      const result=matchmaking.submitInput({userId:meta.userId,matchId:meta.matchId,sequence:message.sequence,input:message.input});
      if(!result?.accepted)sendJson(ws,{type:'input-rejected',reason:typeof result?.reason==='string'?result.reason:'invalid-input'});
    });
    ws.once('close',code=>{
      if(meta.closed)return;meta.closed=true;
      const wasCurrent=!!meta.userId&&socketsByUser.get(meta.userId)===ws;
      if(wasCurrent)socketsByUser.delete(meta.userId);
      // A delayed close from the replaced socket must not tear down a resumed seat.
      if(wasCurrent&&meta.matchId)matchmaking.disconnect({userId:meta.userId,matchId:meta.matchId,leave:code===1000});
      else if(wasCurrent&&meta.userId)matchmaking.cancelQueue(meta.userId);
    });

    // The synchronous callback sets the trusted identity before asynchronous
    // engine creation can publish the first snapshot. It is never sent to peer.
    const onAccepted=userId=>{
      if(typeof userId!=='string'||meta.closed)return;
      const other=socketsByUser.get(userId);
      if(other&&other!==ws&&other.readyState===WebSocket.OPEN){ws.close(1008,'Account already connected');throw new Error('Account already connected');}
      meta.userId=userId;socketsByUser.set(userId,ws);
    };
    void (async()=>{
      let result;
      try{result=await matchmaking.queuePresentedTicket(ticket,{onAccepted});}
      catch{ws.close(1011,'Matchmaking unavailable');return;}
      if(meta.closed)return;
      if(!result?.ok){sendJson(ws,{type:'queue-rejected',reason:result?.reason==='duplicate-active-user'?'already-queued':'ticket-invalid'});ws.close(1008,'Ticket rejected');return;}
      // Compatible with queue implementations that return identity only after
      // asynchronous pairing; if that delayed the initial snapshot, the
      // matchmaker retains it and flushes it on the next fixed tick.
      if(!meta.userId&&typeof result.userId==='string')onAccepted(result.userId);
      if(result.status==='queued')sendJson(ws,{type:'queued'});
      else if(result.status==='matched'&&MATCH_ID.test(result.matchId||'')){
        const seat=Array.isArray(result.seats)?result.seats.find(row=>row?.userId===meta.userId):null;
        if(seat?.side===0||seat?.side===1){
          if(meta.matchId&&meta.matchId!==result.matchId){meta.matchId=null;meta.side=null;meta.notifiedMatchId=null;}
          meta.matchId=result.matchId;meta.side=seat.side;meta.mode=result.mode==='career-ai'?'career-ai':null;meta.resumed=result.resumed===true;
          if(result.resumeSnapshot&&result.resumeSnapshot.matchId===result.matchId){
            const envelope=result.resumeSnapshot;
            if(!Number.isSafeInteger(envelope.tick)||envelope.tick<0||!announceMatch(ws,meta,result.matchId)||
               !sendJson(ws,{type:'snapshot',matchId:result.matchId,tick:envelope.tick,snapshot:envelope.snapshot}))
              sendJson(ws,{type:'queue-rejected',reason:'resume-snapshot-unavailable'});
          }else announceMatch(ws,meta,result.matchId);
        }else sendJson(ws,{type:'queue-rejected',reason:'match-seat-unavailable'});
      }
    })();
  });

  let closed=false;
  return Object.freeze({sendSnapshot,onRequeue:notifyRequeue,onMatchFinished,close(){
    if(closed)return;closed=true;server.removeListener('upgrade',onUpgrade);
    for(const socket of wss.clients)socket.close(1001,'Server stopping');
    try{wss.close()}catch{}
    socketsByUser.clear();
  }});
}
