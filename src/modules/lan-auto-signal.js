// Same-origin LAN lobby signaling. The companion server scopes rooms to its local network.
// GitHub Pages cannot scan a LAN; devices must open the host's companion-server URL.
// Bound outbound signaling bytes and WebSocket queue growth on slow connections.
const MAX_SIGNAL_FRAME_BYTES=210000,MAX_SIGNAL_QUEUE_BYTES=512*1024;
// Public WSS brokers can cold-start after an idle period; retain the fast LAN watchdog.
const LAN_CONNECT_TIMEOUT_MS=12000,HOSTED_CONNECT_TIMEOUT_MS=60000;
const signalEncoder=new TextEncoder();
export function connectLanSignal({internet=false,WebSocketImpl=globalThis.WebSocket,onEvent=()=>{},onState=()=>{},setTimeoutImpl=globalThis.setTimeout,clearTimeoutImpl=globalThis.clearTimeout}={}){
 if(typeof WebSocketImpl!=='function')throw new Error('WebSocket unavailable');
 const hosted='wss://supermagicfootball-lan-signal.onrender.com/lan-signal';
 const override=internet?globalThis.SMF_P2P_SIGNAL_URL:globalThis.SMF_LAN_SIGNAL_URL;
 const configured=override??(internet?hosted:(globalThis.location?.hostname==='saeedsai.github.io'?hosted:null));
 const secureEndpoint=typeof configured==='string' && /^wss:\/\/[a-z0-9.-]+(?::[0-9]{2,5})?\/lan-signal$/i.test(configured)?configured:null;
 const publicPages=globalThis.location?.hostname==='saeedsai.github.io';
 // Never silently switch signaling scope when an explicitly configured broker is invalid.
 // A typo or insecure URL must not turn internet P2P into local LAN (or vice versa).
 if(override!=null&&!secureEndpoint){onState('unconfigured');return Object.freeze({send(){return false},close(){},get ready(){return false}})}
 const connectTimeoutMs=secureEndpoint?HOSTED_CONNECT_TIMEOUT_MS:LAN_CONNECT_TIMEOUT_MS;
 const url=secureEndpoint||(!publicPages?(globalThis.location?.protocol==='https:'?'wss://':'ws://')+(globalThis.location?.host||'localhost:8000')+'/lan-signal':null);
 if(!url){onState('unconfigured');return Object.freeze({send(){return false},close(){},get ready(){return false}})}
 let socket=null,closed=false,retry=null,attempt=0,connectTimeout=null;
 function clearConnectTimeout(){if(connectTimeout!==null){clearTimeoutImpl(connectTimeout);connectTimeout=null}}
 function scheduleRetry(){
  if(closed||retry!==null)return;
  const delay=Math.min(10000,1000*Math.pow(2,Math.min(attempt++,4)));
  retry=setTimeoutImpl(()=>{retry=null;open()},delay);
 }
 // Retire a broken socket even if close throws or never emits an event.
 // Old socket events cannot reattach to the lobby.
 function recycleSocket(code,reason){
  if(closed||!socket)return;
  const stale=socket;socket=null;clearConnectTimeout();
  try{stale.close(code,reason)}catch{try{stale.close()}catch{}}
  onState('disconnected');scheduleRetry();
 }
 function open(){
  if(closed)return;
  let ws;
  try{ws=new WebSocketImpl(url)}catch{onState('error');scheduleRetry();return}
  socket=ws;
  clearConnectTimeout();
  connectTimeout=setTimeoutImpl(()=>{
   if(closed||socket!==ws||ws.readyState===1)return;
   connectTimeout=null;recycleSocket(1001,'Signaling connect timeout');
  },connectTimeoutMs);
  ws.addEventListener('open',()=>{if(closed||socket!==ws)return;clearConnectTimeout();attempt=0;onState('connected')});
  ws.addEventListener('close',()=>{if(closed||socket!==ws)return;clearConnectTimeout();socket=null;onState('disconnected');scheduleRetry()});
  ws.addEventListener('error',()=>{if(closed||socket!==ws)return;onState('error');recycleSocket(1011,'Signaling transport error')});
  ws.addEventListener('message',event=>{
   if(closed||socket!==ws||typeof event.data!=='string'||event.data.length>MAX_SIGNAL_FRAME_BYTES)return;
   // JavaScript string length counts UTF-16 units, not WebSocket UTF-8 bytes.
   if(signalEncoder.encode(event.data).byteLength>MAX_SIGNAL_FRAME_BYTES)return;
   try{const packet=JSON.parse(event.data);if(packet&&typeof packet==='object'&&!Array.isArray(packet))onEvent(packet)}catch{}
  });
 }
 open();
 return Object.freeze({
  send(packet){
   if(closed||socket?.readyState!==1||!packet||typeof packet!=='object'||Array.isArray(packet)||typeof packet.type!=='string')return false;
   try{
    const payload=JSON.stringify(packet);
    if(typeof payload!=='string'||payload.length>MAX_SIGNAL_FRAME_BYTES)return false;
    const bytes=signalEncoder.encode(payload).byteLength;
    if(bytes>MAX_SIGNAL_FRAME_BYTES)return false;
    const queued=socket.bufferedAmount;
    if(Number.isFinite(queued)&&queued>=0&&queued+bytes>MAX_SIGNAL_QUEUE_BYTES){
     recycleSocket(1009,'Signaling queue full');
     return false;
    }
    if(closed||socket.readyState!==1)return false;
    try{socket.send(payload);return true}
    catch{recycleSocket(1011,'Signaling send failed');return false}
   }catch{return false}
  },
  close(){if(closed)return;closed=true;clearConnectTimeout();if(retry!==null){clearTimeoutImpl(retry);retry=null}const stale=socket;socket=null;try{stale?.close()}catch{}},
  get ready(){return !closed&&socket?.readyState===1}
 });
}
