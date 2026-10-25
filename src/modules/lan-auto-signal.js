// Same-origin LAN lobby signaling. The companion server scopes rooms to its local network.
// A browser on GitHub Pages cannot scan a LAN; run the LAN server on one computer.
export function connectLanSignal({WebSocketImpl=globalThis.WebSocket,onEvent=()=>{},onState=()=>{}}={}){
 if(typeof WebSocketImpl!=='function')throw new Error('WebSocket unavailable');
 const url=(globalThis.location?.protocol==='https:'?'wss://':'ws://')+(globalThis.location?.host||'localhost:8000')+'/lan-signal';
 const socket=new WebSocketImpl(url);
 let closed=false;
 socket.addEventListener('open',()=>{if(!closed)onState('connected')});
 socket.addEventListener('close',()=>{if(!closed)onState('disconnected')});
 socket.addEventListener('error',()=>{if(!closed)onState('error')});
 socket.addEventListener('message',event=>{
   if(closed||typeof event.data!=='string'||event.data.length>210000)return;
   try{const packet=JSON.parse(event.data);if(packet&&typeof packet==='object'&&!Array.isArray(packet))onEvent(packet)}catch{}
 });
 return Object.freeze({
  send(packet){if(closed||socket.readyState!==1)return false;socket.send(JSON.stringify(packet));return true},
  close(){closed=true;socket.close()},
  get ready(){return !closed&&socket.readyState===1}
 });
}
