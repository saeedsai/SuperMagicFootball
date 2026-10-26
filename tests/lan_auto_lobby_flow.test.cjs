const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../src/modules/lan-auto-lobby.js');

class MockElement extends EventTarget{
 constructor(){super();this.children=[];this.textContent='';this.className='';this.onclick=null}
 replaceChildren(...elements){this.children=[...elements];this.textContent=''}
 append(...elements){this.children.push(...elements)}
 click(){this.onclick?.();this.dispatchEvent(new Event('click'))}
}
function setup(){
 const oldDoc=globalThis.document,oldLocation=globalThis.location;
 globalThis.location={origin:'http://localhost:8000',host:'localhost:8000',hostname:'localhost',protocol:'http:'};
 globalThis.document={createElement:()=>new MockElement()};
 const elements=new Map();
 const root={innerHTML:'',querySelector(selector){
  if(!elements.has(selector))elements.set(selector,new MockElement());
  return elements.get(selector);
 }};
 const packets=[];
 let hooks=null;
 const connection={ready:false,closed:false,send(packet){if(!this.ready)return false;packets.push(packet);return true},close(){this.closed=true}};
 const signalFactory=handlers=>{hooks=handlers;return connection};
 return {root,elements,packets,connection,signalFactory,emit:packet=>hooks.onEvent(packet),
  connect(){connection.ready=true;hooks.onState('connected')},
  cleanup(){globalThis.document=oldDoc;globalThis.location=oldLocation}};
}
test('one Host click before signaling opens registers once and shows reachable guest address',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.0.0',signalFactory:f.signalFactory});
  f.elements.get('#autoHost').click();
  assert.match(f.elements.get('#autoStatus').textContent,/register automatically/);
  assert.doesNotMatch(f.elements.get('#autoHostInfo').textContent,/Guest address: http:\/\/localhost/);
  f.emit({type:'lan-addresses',urls:['http://192.168.1.20:8000','http://evil.test']});
  f.connect();
  assert.equal(f.packets.length,1);
  assert.equal(f.packets[0].type,'host');
  const roomId=f.packets[0].roomId;
  f.emit({type:'host-registered',roomId});
  assert.match(f.elements.get('#autoStatus').textContent,/Room registered/);
  assert.match(f.elements.get('#autoHostInfo').textContent,/http:\/\/192\.168\.1\.20:8000/);
  assert.doesNotMatch(f.elements.get('#autoHostInfo').textContent,/evil/);
  dispose();
  assert.equal(f.connection.closed,true);
 }finally{f.cleanup()}
});
test('one Find Games click before signaling opens later discovers and joins host',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.0.0',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();
  assert.match(f.elements.get('#autoStatus').textContent,/search will start automatically/);
  f.connect();
  assert.equal(f.packets[0].type,'rooms');
  f.emit({type:'room-announce',roomId:'room_12345678',name:'A match',build:'0.10.0.0'});
  const buttons=f.elements.get('#autoRooms').children;
  assert.equal(buttons.length,1);
  assert.match(buttons[0].textContent,/JOIN A match/);
  buttons[0].click();
  assert.equal(f.packets.at(-1).type,'join');
  assert.equal(f.packets.at(-1).roomId,'room_12345678');
  dispose();
 }finally{f.cleanup()}
});

test('occupied LAN rooms cannot be joined until the approved guest leaves',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.4.0',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_87654321',name:'Friendly',build:'0.10.4.0'};
  f.emit({...room,full:false});
  assert.equal(f.elements.get('#autoRooms').children[0].disabled,false);
  f.emit({...room,full:true});
  const occupied=f.elements.get('#autoRooms').children[0];
  assert.equal(occupied.disabled,true);
  assert.match(occupied.textContent,/IN MATCH/);
  occupied.click();
  assert.equal(f.packets.some(p=>p.type==='join'),false);
  assert.match(f.elements.get('#autoStatus').textContent,/already playing/);
  f.emit({...room,full:false});
  const open=f.elements.get('#autoRooms').children[0];
  assert.equal(open.disabled,false);
  open.click();
  assert.equal(f.packets.at(-1).type,'join');
  dispose();
 }finally{f.cleanup()}
});
test('LAN broker publishes occupancy on approval, new discovery and guest departure',()=>{
 const fs=require('node:fs');
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/function announceRoom\(room\)[^\n]*full:!!room\.guest/);
 assert.match(server,/room\.guest=req\.guest;announceRoom\(room\)/);
 assert.match(server,/msg\?\.type==='guest-left'/);
 assert.match(server,/full:!!room\.guest/);
});

test('Find Games refreshes room discovery but pauses during admission and stops after leaving',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.5.0',signalFactory:f.signalFactory,
   setIntervalImpl:(fn,ms)=>{const timer={fn,ms,stopped:false};timers.push(timer);return timer},
   clearIntervalImpl:timer=>{timer.stopped=true}});
  f.elements.get('#autoFind').click();
  assert.equal(timers.length,1);assert.equal(timers[0].ms,10000);
  timers[0].fn();assert.equal(f.packets.length,0,'do not send while disconnected');
  f.connect();assert.equal(f.packets.filter(p=>p.type==='rooms').length,1);
  timers[0].fn();assert.equal(f.packets.filter(p=>p.type==='rooms').length,2);
  f.emit({type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.10.5.0',full:false});
  f.elements.get('#autoRooms').children[0].click();
  const join=f.packets.at(-1);assert.equal(join.type,'join');
  timers[0].fn();assert.equal(f.packets.filter(p=>p.type==='rooms').length,2,'pending admission should not poll');
  f.emit({type:'join-reject',requestId:join.requestId});
  timers[0].fn();assert.equal(f.packets.filter(p=>p.type==='rooms').length,3,'poll resumes after rejection');
  f.elements.get('#autoHost').click();assert.equal(timers[0].stopped,true);
  const reads=f.packets.filter(p=>p.type==='rooms').length;
  timers[0].fn();assert.equal(f.packets.filter(p=>p.type==='rooms').length,reads,'old timer cannot poll as host');
  dispose();assert.equal(f.connection.closed,true);
 }finally{f.cleanup()}
});

test('authoritative LAN room refresh removes stale cards, rejects malformed replies and respects admission',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.6.0',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();f.connect();
  const stale={roomId:'room_12345678',name:'Stale',build:'0.10.6.0',full:false};
  const fresh={roomId:'room_87654321',name:'Current',build:'0.10.6.0',full:true};
  f.emit({type:'room-announce',...stale});
  assert.match(f.elements.get('#autoRooms').children[0].textContent,/Stale/);
  f.emit({type:'rooms-snapshot',rooms:[fresh]});
  assert.equal(f.elements.get('#autoRooms').children.length,1);
  assert.match(f.elements.get('#autoRooms').children[0].textContent,/IN MATCH.*Current/);
  f.emit({type:'rooms-snapshot',rooms:[{...stale,full:'false'}]});
  assert.match(f.elements.get('#autoRooms').children[0].textContent,/Current/,'invalid response cannot erase valid directory');
  f.emit({type:'rooms-snapshot',rooms:[{...stale,full:false}]});
  f.elements.get('#autoRooms').children[0].click();
  assert.equal(f.packets.at(-1).type,'join');
  f.emit({type:'rooms-snapshot',rooms:[]});
  assert.match(f.elements.get('#autoRooms').children[0].textContent,/Stale/,'pending admission cannot be overwritten');
  const request=f.packets.at(-1).requestId;
  f.emit({type:'join-reject',requestId:request});
  f.emit({type:'rooms-snapshot',rooms:[]});
  assert.equal(f.elements.get('#autoRooms').children.length,0);
  assert.match(f.elements.get('#autoRooms').textContent,/Searching/);
  dispose();
 }finally{f.cleanup()}
});

test('failed LAN join send does not strand guest admission and allows immediate retry',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.6.1',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();f.connect();
  const originalSend=f.connection.send.bind(f.connection);
  let failure='return';
  f.connection.send=packet=>{
   if(packet.type==='join'&&failure==='return')return false;
   if(packet.type==='join'&&failure==='throw')throw Error('transport closed');
   return originalSend(packet);
  };
  const room={roomId:'room_12345678',name:'Friendly',build:'0.10.6.1',full:false};
  f.emit({type:'room-announce',...room});
  f.elements.get('#autoRooms').children[0].click();
  assert.match(f.elements.get('#autoStatus').textContent,/Unable to send join request/);
  assert.equal(f.packets.some(packet=>packet.type==='join'),false);
  f.emit({type:'rooms-snapshot',rooms:[]});
  assert.equal(f.elements.get('#autoRooms').children.length,0,'failed join must not lock snapshot reconciliation');
  f.emit({type:'room-announce',...room});
  failure='throw';
  assert.doesNotThrow(()=>f.elements.get('#autoRooms').children[0].click());
  assert.match(f.elements.get('#autoStatus').textContent,/Unable to send join request/);
  failure='none';
  f.elements.get('#autoRooms').children[0].click();
  assert.equal(f.packets.at(-1).type,'join');
  assert.match(f.elements.get('#autoStatus').textContent,/Waiting for host approval/);
  dispose();
 }finally{f.cleanup()}
});

test('LAN unanswered host approval expires locally and allows a fresh join',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.6.2',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const timer={fn,ms,cleared:false};timers.push(timer);return timer},
   clearTimeoutImpl:timer=>{timer.cleared=true}});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.10.6.2',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const first=f.packets.at(-1);assert.equal(first.type,'join');
  assert.equal(timers[0].ms,25000);
  timers[0].fn();
  assert.deepEqual(f.packets.slice(-2).map(p=>p.type),['leave','rooms']);
  assert.match(f.elements.get('#autoStatus').textContent,/approval timed out/);
  f.emit({type:'join-accept',requestId:first.requestId});
  assert.doesNotMatch(f.elements.get('#autoStatus').textContent,/Approved/);
  f.elements.get('#autoRooms').children[0].click();
  const second=f.packets.at(-1);assert.equal(second.type,'join');
  assert.notEqual(second.requestId,first.requestId);
  f.emit({type:'join-accept',requestId:second.requestId});
  assert.equal(timers[1].cleared,true,'approval cancels timeout');
  dispose();
 }finally{f.cleanup()}
});

test('LAN room announcements reject malformed cards and cap unsolicited directory growth',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.6.3',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.10.6.3',full:false};
  for(const bad of [
   {...room,roomId:'../bad'}, {...room,name:' '}, {...room,name:'x'.repeat(49)},
   {...room,build:'x'.repeat(33)}, {...room,full:'false'}
  ])f.emit(bad);
  assert.equal(f.elements.get('#autoRooms').children.length,0,'invalid announcements never create cards');
  f.emit({...room,full:undefined});
  assert.equal(f.elements.get('#autoRooms').children.length,1,'legacy local broker may omit full');
  assert.equal(f.elements.get('#autoRooms').children[0].disabled,false);
  for(let i=1;i<128;i++)f.emit({...room,roomId:'room_'+String(i).padStart(8,'0')});
  assert.equal(f.elements.get('#autoRooms').children.length,128);
  f.emit({...room,roomId:'room_99999999'});
  assert.equal(f.elements.get('#autoRooms').children.length,128,'new cards beyond broker capacity are ignored');
  f.emit({...room,full:true});
  assert.equal(f.elements.get('#autoRooms').children.length,128,'existing cards remain updatable at capacity');
  assert.equal(f.elements.get('#autoRooms').children[0].disabled,true);
  f.emit({type:'rooms-snapshot',rooms:[]});
  assert.equal(f.elements.get('#autoRooms').children.length,0,'authoritative snapshot still clears directory');
  f.emit({...room,roomId:'room_99999999'});
  assert.equal(f.elements.get('#autoRooms').children.length,1,'room becomes visible after capacity frees');
  dispose();
 }finally{f.cleanup()}
});
