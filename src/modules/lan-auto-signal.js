// Same-origin LAN lobby signaling. The companion server scopes rooms to its local network.
// GitHub Pages cannot scan a LAN; devices must open the host's companion-server URL.
export function connectLanSignal({WebSocketImpl=globalThis.WebSocket,onEvent=()=>{},onState=()=>{},setTimeoutImpl=globalThis.setTimeout,clearTimeoutImpl=globalThis.clearTimeout}={}){
 if(typeof WebSocketImpl!=='function')throw new Error('WebSocket unavailable');
 const configured=globalThis.SMF_LAN_SIGNAL_URL;
 const url=typeof configured==='string' && /^wss:\/\/[a-z0-9.-]+(?::[0-9]{2,5})?\/lan-signal$/i.test(configured)?configured:(globalThis.location?.protocol==='https:'?'wss://':'ws://')+(globalThis.location?.host||'localhost:8000')+'/lan-signal';
 let socket=null,closed=false,retry=null,attempt=0;
 function scheduleRetry(){
  if(closed||retry!==null)return;
  const delay=Math.min(10000,1000*Math.pow(2,Math.min(attempt++,4)));
  retry=setTimeoutImpl(()=>{retry=null;open()},delay);
 }
 function open(){
  if(closed)return;
  let ws;
  try{ws=new WebSocketImpl(url)}catch{onState('error');scheduleRetry();return}
  socket=ws;
  ws.addEventListener('open',()=>{if(closed||socket!==ws)return;attempt=0;onState('connected')});
  ws.addEventListener('close',()=>{if(closed||socket!==ws)return;onState('disconnected');scheduleRetry()});
  ws.addEventListener('error',()=>{if(!closed&&socket===ws)onState('error')});
  ws.addEventListener('message',event=>{
   if(closed||socket!==ws||typeof event.data!=='string'||event.data.length>210000)return;
   try{const packet=JSON.parse(event.data);if(packet&&typeof packet==='object'&&!Array.isArray(packet))onEvent(packet)}catch{}
  });
 }
 open();
 return Object.freeze({
  send(packet){if(closed||socket?.readyState!==1)return false;try{socket.send(JSON.stringify(packet));return true}catch{return false}},
  close(){if(closed)return;closed=true;if(retry!==null){clearTimeoutImpl(retry);retry=null}socket?.close()},
  get ready(){return !closed&&socket?.readyState===1}
 });
}
