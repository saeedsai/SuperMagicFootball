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
  f.emit({type:'join-reject',roomId:join.roomId,requestId:join.requestId});
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
  f.emit({type:'join-reject',roomId:stale.roomId,requestId:request});
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
  f.emit({type:'join-accept',roomId:room.roomId,requestId:first.requestId});
  assert.doesNotMatch(f.elements.get('#autoStatus').textContent,/Approved/);
  f.elements.get('#autoRooms').children[0].click();
  const second=f.packets.at(-1);assert.equal(second.type,'join');
  assert.notEqual(second.requestId,first.requestId);
  f.emit({type:'join-accept',roomId:room.roomId,requestId:second.requestId});
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


test('approved LAN guest releases occupied seat and retries after offer negotiation failure',async()=>{
 const f=setup();let disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.6.4',signalFactory:f.signalFactory,
   peerFactory:()=>({acceptOffer:async()=>{throw Error('invalid offer')},dispose(){disposed++}})});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.10.6.4',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const first=f.packets.at(-1);f.emit({type:'join-accept',roomId:room.roomId,requestId:first.requestId});
  await f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
  assert.deepEqual(f.packets.slice(-2).map(packet=>packet.type),['leave','rooms']);
  assert.equal(disposed,1);
  assert.match(f.elements.get('#autoStatus').textContent,/Guest connection failed.*retry/);
  f.emit({type:'rooms-snapshot',rooms:[{roomId:room.roomId,name:room.name,build:room.build,full:false}]});
  f.elements.get('#autoRooms').children[0].click();
  const second=f.packets.at(-1);assert.equal(second.type,'join');assert.notEqual(second.requestId,first.requestId);
  dispose();
 }finally{f.cleanup()}
});

test('approved LAN guest recovers when the WebRTC answer cannot be signaled',async()=>{
 const f=setup();let disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.6.4',signalFactory:f.signalFactory,
   peerFactory:()=>({acceptOffer:async()=>'{"answer":true}',dispose(){disposed++}})});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.10.6.4',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const first=f.packets.at(-1);f.emit({type:'join-accept',roomId:room.roomId,requestId:first.requestId});
  const original=f.connection.send.bind(f.connection);
  f.connection.send=packet=>packet.type==='answer'?false:original(packet);
  await f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
  assert.deepEqual(f.packets.slice(-2).map(packet=>packet.type),['leave','rooms']);
  assert.equal(disposed,1);
  assert.match(f.elements.get('#autoStatus').textContent,/unable to send answer/);
  f.emit({type:'rooms-snapshot',rooms:[]});
  assert.equal(f.elements.get('#autoRooms').children.length,0,'failed negotiation must unlock directory updates');
  dispose();
 }finally{f.cleanup()}
});


test('LAN-064 host retries registration until acknowledged and cancels stale timers',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.10.7.7',signalFactory:f.signalFactory,
   setIntervalImpl:(fn,ms)=>{const timer={fn,ms,stopped:false};timers.push(timer);return timer},
   clearIntervalImpl:timer=>{timer.stopped=true}});
  f.connect();f.elements.get('#autoHost').click();
  const first=f.packets.at(-1);assert.equal(first.type,'host');
  assert.equal(timers.at(-1).ms,10000);
  timers.at(-1).fn();
  assert.equal(f.packets.filter(p=>p.type==='host').length,2);
  assert.equal(f.packets.at(-1).roomId,first.roomId,'retry keeps original room identity');
  f.emit({type:'host-registered',roomId:first.roomId});
  assert.equal(timers.at(-1).stopped,true,'ack stops retry timer');
  const count=f.packets.length;
  timers.at(-1).fn();assert.equal(f.packets.length,count,'stale timer must not send after ack');
  f.elements.get('#autoHost').click();
  assert.equal(timers.at(-1).stopped,false);
  f.emit({type:'error',message:'Room capacity reached'});
  assert.equal(timers.at(-1).stopped,false,'temporary broker capacity keeps retry alive');
   const beforeRetry=f.packets.filter(p=>p.type==='host').length;
   timers.at(-1).fn();
   assert.equal(f.packets.filter(p=>p.type==='host').length,beforeRetry+1,'capacity retry re-advertises the same room');
  f.elements.get('#autoReset').click();
  const before=f.packets.length;timers.at(-1).fn();
  assert.equal(f.packets.length,before,'cancel removes pending registration');
  dispose();
 }finally{f.cleanup()}
});

test('approved LAN/P2P guest recovers if host never sends offer and can retry',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.6',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true}});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.11.3.6',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const first=f.packets.at(-1);
  f.emit({type:'join-accept',roomId:room.roomId,requestId:first.requestId});
  assert.equal(timers.length,2);assert.equal(timers[0].cleared,true);assert.equal(timers[1].ms,25000);
  timers[1].fn();
  assert.deepEqual(f.packets.slice(-2).map(p=>p.type),['leave','rooms']);
  assert.match(f.elements.get('#autoStatus').textContent,/Host offer timed out.*retry/);
  const status=f.elements.get('#autoStatus').textContent;
  await f.emit({type:'offer',roomId:room.roomId,sdp:'late'});
  f.emit({type:'join-accept',roomId:room.roomId,requestId:first.requestId});
  assert.equal(f.elements.get('#autoStatus').textContent,status);
  f.elements.get('#autoRooms').children[0].click();
  const second=f.packets.at(-1);
  assert.equal(second.type,'join');assert.notEqual(second.requestId,first.requestId);
  timers[1].fn();
  assert.equal(f.packets.at(-1).requestId,second.requestId);
  dispose();
 }finally{f.cleanup()}
});

test('arriving host offer cancels guest offer timeout before negotiation',async()=>{
 const f=setup(),timers=[];let disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.6',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({acceptOffer:async()=>{throw Error('bad SDP')},dispose(){disposed++}})});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.11.3.6',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const join=f.packets.at(-1);
  f.emit({type:'join-accept',roomId:room.roomId,requestId:join.requestId});
  await f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
  assert.equal(timers[1].cleared,true);assert.equal(disposed,1);
  assert.deepEqual(f.packets.slice(-2).map(p=>p.type),['leave','rooms']);
  const before=f.packets.length;timers[1].fn();assert.equal(f.packets.length,before);
  dispose();
 }finally{f.cleanup()}
});

test('host failed offer send disposes broken peer and reports error',async()=>{
 const f=setup();let disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.6',signalFactory:f.signalFactory,
   peerFactory:()=>({createOffer:async()=>'offer',dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;f.emit({type:'host-registered',roomId});
  const original=f.connection.send.bind(f.connection);
  f.connection.send=p=>p.type==='offer'?false:original(p);
  await f.emit({type:'guest-approved',roomId});
  assert.equal(disposed,1);
  assert.match(f.elements.get('#autoStatus').textContent,/Unable to send host offer/);
  assert.equal(f.packets.some(p=>p.type==='offer'),false);
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P stalled guest SDP answer releases seat and ignores late completion',async()=>{
 const f=setup(),timers=[];let finish,disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.7',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({acceptOffer:()=>new Promise(resolve=>{finish=resolve}),dispose(){disposed++}})});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.11.3.7',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const join=f.packets.at(-1);f.emit({type:'join-accept',roomId:room.roomId,requestId:join.requestId});
  const pending=f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
  assert.equal(timers.length,3);assert.equal(timers[1].cleared,true);
  assert.equal(timers[2].ms,25000);timers[2].fn();
  assert.deepEqual(f.packets.slice(-2).map(p=>p.type),['leave','rooms']);
  assert.equal(disposed,1);assert.match(f.elements.get('#autoStatus').textContent,/Guest offer negotiation timed out.*retry/);
  finish('late-answer');await pending;
  assert.equal(f.packets.some(p=>p.type==='answer'),false);
  f.emit({type:'rooms-snapshot',rooms:[{roomId:room.roomId,name:room.name,build:room.build,full:false}]});
  f.elements.get('#autoRooms').children[0].click();assert.equal(f.packets.at(-1).type,'join');
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P completed SDP answer cancels negotiation timeout',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.7',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({acceptOffer:async()=>'valid-answer',subscribeStatus:()=>()=>{},
    awaitReady:()=>new Promise(()=>{}),dispose(){}})});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.11.3.7',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const join=f.packets.at(-1);f.emit({type:'join-accept',roomId:room.roomId,requestId:join.requestId});
  await f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
  assert.equal(timers[2].cleared,true);assert.equal(f.packets.at(-1).type,'answer');
  const count=f.packets.length;timers[2].fn();assert.equal(f.packets.length,count);
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P host SDP creation timeout disposes stale peer without sending a late offer',async()=>{
 const f=setup(),timers=[];let finish,created=0,disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.8',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({createOffer:()=>++created===1?new Promise(resolve=>{finish=resolve}):Promise.resolve('new-offer'),dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;f.emit({type:'host-registered',roomId});
  const pending=f.emit({type:'guest-approved',roomId});
  assert.equal(timers[0].ms,25000);
  timers[0].fn();
  assert.equal(disposed,1);
  assert.match(f.elements.get('#autoStatus').textContent,/Host offer creation timed out/);
  finish('stale-offer');await pending;
  assert.equal(f.packets.filter(p=>p.type==='offer').length,0);
  f.emit({type:'guest-left',roomId});
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).type,'offer');
  assert.equal(f.packets.at(-1).sdp,'new-offer');
  assert.equal(f.packets.some(p=>p.type==='leave'),false,'host room must remain registered');
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P guest departure cancels pending host offer and late rejection cannot kill replacement',async()=>{
 const f=setup(),timers=[];let rejectOld,disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.8',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({createOffer:()=>timers.length===1?new Promise((_,reject)=>{rejectOld=reject}):Promise.resolve('replacement-offer'),dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;
  const old=f.emit({type:'guest-approved',roomId});
  f.emit({type:'guest-left',roomId});
  assert.equal(timers[0].cleared,true);
  assert.equal(disposed,1);
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).sdp,'replacement-offer');
  assert.equal(timers[1].cleared,true,'successful offer cancels its deadline');
  rejectOld(Error('late failure'));await old;
  assert.equal(disposed,1,'old rejection must not dispose the new peer');
  assert.doesNotMatch(f.elements.get('#autoStatus').textContent,/Host connection failed/);
  const count=f.packets.length;timers[1].fn();
  assert.equal(f.packets.length,count,'expired callback must not send or change room');
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P host answer timeout releases stalled peer but preserves hosting',async()=>{
 const f=setup(),timers=[];let disposed=0,created=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.9',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({createOffer:async()=>String(++created),dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;f.emit({type:'host-registered',roomId});
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).type,'offer');
  assert.equal(timers.length,2);assert.equal(timers[0].cleared,true);
  assert.equal(timers[1].ms,25000);
  timers[1].fn();assert.equal(disposed,1);
  assert.match(f.elements.get('#autoStatus').textContent,/Guest answer timed out/);
  f.emit({type:'guest-left',roomId});
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).sdp,'2');
  assert.equal(f.packets.filter(p=>p.type==='host').length,1,'host room remains registered');
  const before=disposed;timers[1].fn();assert.equal(disposed,before);
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P delayed host answer rejection cannot dispose replacement peer',async()=>{
 const f=setup(),timers=[];let rejectOld,disposed=0,created=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.9',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>{const id=++created;return {createOffer:async()=>String(id),
    acceptAnswer:()=>id===1?new Promise((_,reject)=>{rejectOld=reject}):Promise.resolve(),
    subscribeStatus:()=>()=>{},awaitReady:()=>new Promise(()=>{}),dispose(){disposed++}}}});
  f.connect();f.elements.get('#autoHost').click();const roomId=f.packets.at(-1).roomId;
  await f.emit({type:'guest-approved',roomId});
  const old=f.emit({type:'answer',roomId,sdp:'old-answer'});
  assert.equal(timers[1].cleared,true);
  f.emit({type:'guest-left',roomId});assert.equal(disposed,1);
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).sdp,'2');
  rejectOld(Error('obsolete answer'));await old;
  assert.equal(disposed,1,'old answer failure cannot close the new peer');
  assert.doesNotMatch(f.elements.get('#autoStatus').textContent,/Host answer failed/);
  const before=disposed;timers[1].fn();assert.equal(disposed,before);
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P host recovers from WebRTC readiness rejection without losing registered room',async()=>{
 const f=setup();let rejectReady,disposed=0,created=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.10',signalFactory:f.signalFactory,
   peerFactory:()=>({createOffer:async()=>String(++created),acceptAnswer:async()=>{},
    subscribeStatus:()=>()=>{},awaitReady:()=>new Promise((_,reject)=>{rejectReady=reject}),
    dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;f.emit({type:'host-registered',roomId});
  await f.emit({type:'guest-approved',roomId});
  await f.emit({type:'answer',roomId,sdp:'answer'});
  rejectReady(Error('RTC transport failed'));await new Promise(resolve=>setImmediate(resolve));
  assert.equal(disposed,1,'failed peer must be released');
  assert.match(f.elements.get('#autoStatus').textContent,/Host connection failed.*Waiting for guest retry/);
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).type,'offer');
  assert.equal(f.packets.at(-1).sdp,'2','a new guest must receive a new offer');
  assert.equal(f.packets.filter(p=>p.type==='host').length,1);
  assert.equal(f.packets.some(p=>p.type==='leave'),false,'hosting must remain registered');
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P failed host match startup allows a fresh guest without closing the room',async()=>{
 const f=setup();let onStatus,disposed=0,created=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.10',signalFactory:f.signalFactory,
   onReady:()=>{throw Error('match initialization failed')},
   peerFactory:()=>({createOffer:async()=>String(++created),acceptAnswer:async()=>{},
    subscribeStatus:fn=>{onStatus=fn;return ()=>{}},awaitReady:()=>new Promise(()=>{}),
    dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();const roomId=f.packets.at(-1).roomId;
  await f.emit({type:'guest-approved',roomId});
  await f.emit({type:'answer',roomId,sdp:'answer'});
  onStatus({ready:true});
  assert.equal(disposed,1,'failed startup must dispose its peer');
  assert.match(f.elements.get('#autoStatus').textContent,/Unable to start host match.*Waiting for guest retry/);
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).sdp,'2');
  assert.equal(f.packets.some(p=>p.type==='leave'),false);
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P host SDP answer processing timeout releases peer and ignores stale rejection',async()=>{
 const f=setup(),timers=[];let rejectOld,disposed=0,created=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.11',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({createOffer:async()=>String(++created),
    acceptAnswer:()=>new Promise((_,reject)=>{rejectOld=reject}),
    dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;f.emit({type:'host-registered',roomId});
  await f.emit({type:'guest-approved',roomId});
  const old=f.emit({type:'answer',roomId,sdp:'old-answer'});
  assert.equal(timers.length,3,'offer, answer wait and SDP negotiation each have a deadline');
  assert.equal(timers[1].cleared,true);
  assert.equal(timers[2].ms,25000);
  timers[2].fn();
  assert.equal(disposed,1,'timed-out SDP peer is released');
  assert.match(f.elements.get('#autoStatus').textContent,/Host answer negotiation timed out.*Waiting for guest retry/);
  f.emit({type:'guest-left',roomId});
  await f.emit({type:'guest-approved',roomId});
  assert.equal(f.packets.at(-1).sdp,'2','replacement guest receives a fresh offer');
  rejectOld(Error('obsolete SDP failure'));await old;
  assert.equal(disposed,1,'old SDP rejection cannot destroy replacement peer');
  assert.equal(f.packets.filter(p=>p.type==='host').length,1,'host room remains registered');
  assert.equal(f.packets.some(p=>p.type==='leave'),false);
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P completed host SDP answer cancels negotiation watchdog',async()=>{
 const f=setup(),timers=[];let disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.11',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({createOffer:async()=>'offer',acceptAnswer:async()=>{},
    subscribeStatus:()=>()=>{},awaitReady:()=>new Promise(()=>{}),dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;
  await f.emit({type:'guest-approved',roomId});
  await f.emit({type:'answer',roomId,sdp:'valid-answer'});
  assert.equal(timers.length,3);
  assert.equal(timers[2].cleared,true,'successful SDP acceptance clears the watchdog');
  timers[2].fn();
  assert.equal(disposed,0,'expired callback cannot tear down an active RTC peer');
  assert.doesNotMatch(f.elements.get('#autoStatus').textContent,/Host answer negotiation timed out/);
  dispose();assert.equal(disposed,1);
 }finally{f.cleanup()}
});

test('LAN/P2P duplicate host answer cannot restart pending SDP watchdog',async()=>{
 const f=setup(),timers=[];let resolveAnswer,accepts=0,disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.12',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({createOffer:async()=>'offer',acceptAnswer:()=>{accepts++;return new Promise(resolve=>{resolveAnswer=resolve})},dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;f.emit({type:'host-registered',roomId});
  await f.emit({type:'guest-approved',roomId});
  const pending=f.emit({type:'answer',roomId,sdp:'first'});
  await f.emit({type:'answer',roomId,sdp:'duplicate'});
  assert.equal(accepts,1);assert.equal(timers.length,3);
  assert.equal(timers[2].cleared,false);
  timers[2].fn();assert.equal(disposed,1);
  resolveAnswer();await pending;
  assert.match(f.elements.get('#autoStatus').textContent,/Host answer negotiation timed out/);
  assert.equal(f.packets.filter(p=>p.type==='host').length,1);
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P duplicate host answer after SDP success cannot renegotiate',async()=>{
 const f=setup(),timers=[];let accepts=0,disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.12',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({createOffer:async()=>'offer',acceptAnswer:async()=>{accepts++},
    subscribeStatus:()=>()=>{},awaitReady:()=>new Promise(()=>{}),dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const roomId=f.packets.at(-1).roomId;f.emit({type:'host-registered',roomId});
  await f.emit({type:'guest-approved',roomId});
  await f.emit({type:'answer',roomId,sdp:'first'});
  assert.equal(timers[2].cleared,true);
  await f.emit({type:'answer',roomId,sdp:'duplicate'});
  assert.equal(accepts,1);assert.equal(timers.length,3);assert.equal(disposed,0);
  dispose();assert.equal(disposed,1);
 }finally{f.cleanup()}
});


test('duplicate LAN/P2P guest approval cannot restart the original offer deadline',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.13',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true}});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.11.3.13',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const request=f.packets.at(-1).requestId;
  f.emit({type:'join-accept',roomId:room.roomId,requestId:request});
  assert.equal(timers.length,2);assert.equal(timers[1].ms,25000);
  f.emit({type:'join-accept',roomId:room.roomId,requestId:request});
  assert.equal(timers.length,2,'duplicate approval cannot rearm the offer deadline');
  assert.equal(timers[1].cleared,false,'original offer deadline remains active');
  timers[1].fn();
  assert.deepEqual(f.packets.slice(-2).map(p=>p.type),['leave','rooms']);
  assert.match(f.elements.get('#autoStatus').textContent,/Host offer timed out.*retry/);
  dispose();
 }finally{f.cleanup()}
});

test('duplicate LAN/P2P approval cannot replace a pending guest SDP deadline',async()=>{
 const f=setup(),timers=[];let finish,disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.13',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const t={fn,ms,cleared:false};timers.push(t);return t},
   clearTimeoutImpl:t=>{t.cleared=true},
   peerFactory:()=>({acceptOffer:()=>new Promise(resolve=>{finish=resolve}),dispose(){disposed++}})});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.11.3.13',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const request=f.packets.at(-1).requestId;
  f.emit({type:'join-accept',roomId:room.roomId,requestId:request});
  const pending=f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
  assert.equal(timers.length,3);assert.equal(timers[1].cleared,true);
  f.emit({type:'join-accept',roomId:room.roomId,requestId:request});
  assert.equal(timers.length,3,'duplicate approval cannot create a new offer timeout');
  assert.equal(timers[2].cleared,false,'SDP deadline must remain active');
  timers[2].fn();
  assert.equal(disposed,1);assert.deepEqual(f.packets.slice(-2).map(p=>p.type),['leave','rooms']);
  finish('late-answer');await pending;
  assert.equal(f.packets.some(p=>p.type==='answer'),false,'late SDP must not be sent');
  dispose();
 }finally{f.cleanup()}
});


test('LAN/P2P rejected admission clears stale room identity and permits a different host',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.14',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();f.connect();
  const first={type:'room-announce',roomId:'room_12345678',name:'Old host',build:'0.11.3.14',full:false};
  const second={...first,roomId:'room_87654321',name:'New host'};
  f.emit(first);f.emit(second);f.elements.get('#autoRooms').children[0].click();
  const oldRequest=f.packets.at(-1).requestId;
  f.emit({type:'join-reject',roomId:first.roomId,requestId:oldRequest});
  assert.match(f.elements.get('#autoStatus').textContent,/Join request rejected or expired/);
  f.emit({type:'room-remove',roomId:first.roomId});
  assert.match(f.elements.get('#autoStatus').textContent,/Join request rejected or expired/,'stale room removal cannot reset a rejected admission');
  f.elements.get('#autoRooms').children[0].click();
  const next=f.packets.at(-1);
  assert.equal(next.type,'join');assert.equal(next.roomId,second.roomId);
  assert.notEqual(next.requestId,oldRequest);
  f.emit({type:'join-accept',roomId:first.roomId,requestId:oldRequest});
  assert.match(f.elements.get('#autoStatus').textContent,/Waiting for host approval/,'late approval cannot replace new request');
  dispose();
 }finally{f.cleanup()}
});

test('LAN/P2P rejection during guest SDP cancels negotiation and blocks a late answer',async()=>{
 const f=setup(),timers=[];let finish,disposed=0;
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.3.14',signalFactory:f.signalFactory,
   setTimeoutImpl:(fn,ms)=>{const timer={fn,ms,cleared:false};timers.push(timer);return timer},
   clearTimeoutImpl:timer=>{timer.cleared=true},
   peerFactory:()=>({acceptOffer:()=>new Promise(resolve=>{finish=resolve}),dispose(){disposed++}})});
  f.elements.get('#autoFind').click();f.connect();
  const room={type:'room-announce',roomId:'room_12345678',name:'Friendly',build:'0.11.3.14',full:false};
  f.emit(room);f.elements.get('#autoRooms').children[0].click();
  const request=f.packets.at(-1).requestId;
  f.emit({type:'join-accept',roomId:room.roomId,requestId:request});
  const pending=f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
  assert.equal(timers.length,3);assert.equal(timers[2].cleared,false);
  f.emit({type:'join-reject',roomId:room.roomId,requestId:request});
  assert.equal(disposed,1,'rejected guest peer must be disposed');
  assert.equal(timers[2].cleared,true,'SDP watchdog must be cancelled');
  finish('late-answer');await pending;
  assert.equal(f.packets.some(p=>p.type==='answer'),false,'rejected session must never transmit a late SDP answer');
  assert.match(f.elements.get('#autoStatus').textContent,/Join request rejected or expired/);
  dispose();
 }finally{f.cleanup()}
});


test('both LAN and Online P2P identify players through discovery, join request and host consent',async()=>{
 for(const internet of [false,true]){
  const host=setup();
  try{
   const {mountAutoLanLobby}=await load();
   const stop=mountAutoLanLobby(host.root,{internet,build:'0.11.4.0',signalFactory:host.signalFactory});
   host.connect();host.root.querySelector('#autoPlayerName').value=' Alice ';
   host.elements.get('#autoHost').click();
   const registration=host.packets.find(packet=>packet.type==='host');
   assert.equal(registration.name,'Alice');
   assert.match(host.elements.get('#autoHostInfo').textContent,/Hosting as Alice/);
   host.emit({type:'join-request',roomId:registration.roomId,requestId:'request_12345678',guestName:'Bob'});
   assert.match(host.elements.get('#autoApproval').children[0].textContent,/Bob wants to join/);
   host.elements.get('#autoApproval').children[1].click();
   assert.deepEqual(host.packets.at(-1),{type:'decision',roomId:registration.roomId,requestId:'request_12345678',accept:true});
   stop();
  }finally{host.cleanup()}
  const guest=setup();
  try{
   const {mountAutoLanLobby}=await load();
   const stop=mountAutoLanLobby(guest.root,{internet,build:'0.11.4.0',signalFactory:guest.signalFactory});
   guest.connect();guest.root.querySelector('#autoPlayerName').value=' Bob ';
   guest.elements.get('#autoFind').click();
   const room={type:'room-announce',roomId:'room_12345678',name:'Alice',build:'0.11.4.0',full:false,...(internet?{scope:'internet-p2p'}:{})};
   guest.emit(room);
   assert.match(guest.elements.get('#autoRooms').children[0].textContent,/Alice/);
   guest.elements.get('#autoRooms').children[0].click();
   const join=guest.packets.at(-1);
   assert.equal(join.guestName,'Bob');
   guest.emit({type:'join-accept',roomId:room.roomId,requestId:join.requestId,hostName:'Alice'});
   assert.match(guest.elements.get('#autoStatus').textContent,/Approved by Alice/);
   stop();
  }finally{guest.cleanup()}
 }
});
test('failed internet P2P readiness uses bounded direct timeout and cleans up safely',async()=>{
 const f=setup();let waited=0,disposed=0,stop;
 try{
  const {mountAutoLanLobby}=await load();
  // A custom peerFactory intentionally replaces native WebRTC and cannot
  // create the approved broker relay, so it must report the host error honestly.
  stop=mountAutoLanLobby(f.root,{internet:true,build:'0.11.4.0',signalFactory:f.signalFactory,
   peerFactory:()=>({createOffer:async()=>'{"offer":1}',acceptAnswer:async()=>{},
    subscribeStatus:()=>()=>{},awaitReady:(ms)=>{waited=ms;return Promise.reject(Error('ICE failed'))},dispose(){disposed++}})});
  f.connect();f.elements.get('#autoHost').click();
  const register=f.packets.find(packet=>packet.type==='host');
  await f.emit({type:'guest-approved',roomId:register.roomId,requestId:'request_12345678',guestName:'Bob'});
  assert.equal(f.packets.at(-1).type,'offer');
  await f.emit({type:'answer',roomId:register.roomId,sdp:'{"answer":true}'});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(waited,10000,'internet host attempts direct P2P for ten seconds before fallback');
  assert.match(f.elements.get('#autoStatus').textContent,/Host connection failed: ICE failed/);
  assert.equal(disposed,1,'broken peer is disposed exactly once');
  assert.equal(f.packets.some(packet=>packet.type==='relay-offer'),false,
   'injected peer factories must not silently create a native relay');
 }finally{stop?.();f.cleanup()}
});

test('network match HUD keeps both player names visible without changing four controls',()=>{
 const fs=require('node:fs');
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/lanPlayerNames=\{home:role==='host'\?ownName:opponentName,away:role==='host'\?opponentName:ownName\}/);
 assert.match(ui,/lanPlayerNames\?\.home/);
 assert.match(ui,/lanPlayerNames\?\.away/);
 assert.match(ui,/lanPlayerNames=null/);
});

// LAN-ROOM-STALE-01: old DOM buttons must never join removed or superseded rooms.
test('LAN and internet P2P refuse stale room buttons after removal or incompatible refresh',async()=>{
 for(const internet of [false,true]){
  const f=setup();
  try{
   const {mountAutoLanLobby}=await load();
   const stop=mountAutoLanLobby(f.root,{internet,build:'0.11.4.2',signalFactory:f.signalFactory});
   f.elements.get('#autoFind').click();f.connect();
   const room={type:'room-announce',roomId:'room_12345678',name:'Alice',build:'0.11.4.2',full:false,...(internet?{scope:'internet-p2p'}:{})};
   f.emit(room);
   const removedButton=f.elements.get('#autoRooms').children[0];
   f.emit({type:'room-remove',roomId:room.roomId});
   removedButton.click();
   assert.equal(f.packets.filter(p=>p.type==='join').length,0,'removed room cannot be joined from stale button');
   assert.match(f.elements.get('#autoStatus').textContent,/no longer available/);
   f.emit(room);
   const oldVersionButton=f.elements.get('#autoRooms').children[0];
   f.emit({type:'rooms-snapshot',rooms:[{...room,build:'0.11.4.1'}]});
   oldVersionButton.click();
   assert.equal(f.packets.filter(p=>p.type==='join').length,0,'incompatible refreshed room cannot be joined');
   assert.match(f.elements.get('#autoStatus').textContent,/no longer available/);
   stop();
  }finally{f.cleanup()}
 }
});


test('LAN-082 temporary broker capacity rejection retains automatic host registration retry',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.4.33',signalFactory:f.signalFactory,
   setIntervalImpl:(fn,ms)=>{const timer={fn,ms,stopped:false};timers.push(timer);return timer},
   clearIntervalImpl:timer=>{timer.stopped=true}});
  f.connect();f.elements.get('#autoHost').click();
  const first=f.packets.at(-1);
  assert.equal(first.type,'host');
  assert.equal(timers.length,1);assert.equal(timers[0].ms,10000);
  f.emit({type:'error',message:'Room capacity reached'});
  assert.equal(timers[0].stopped,false,'capacity is transient; retain bounded retry');
  assert.match(f.elements.get('#autoStatus').textContent,/Waiting to retry hosting automatically/);
  timers[0].fn();
  const hosts=f.packets.filter(p=>p.type==='host');
  assert.equal(hosts.length,2,'retry host advertisement after capacity becomes available');
  assert.equal(hosts[1].roomId,first.roomId,'do not abandon original host identity');
  f.emit({type:'host-registered',roomId:first.roomId});
  assert.equal(timers[0].stopped,true,'acknowledged registration ends retry');
  assert.match(f.elements.get('#autoStatus').textContent,/Room registered/);
  dispose();
 }finally{f.cleanup()}
});

test('LAN-082 permanent broker scope rejection stops host retry instead of flooding server',async()=>{
 const f=setup(),timers=[];
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.4.33',signalFactory:f.signalFactory,
   setIntervalImpl:(fn,ms)=>{const timer={fn,ms,stopped:false};timers.push(timer);return timer},
   clearIntervalImpl:timer=>{timer.stopped=true}});
  f.connect();f.elements.get('#autoHost').click();
  assert.equal(f.packets.filter(p=>p.type==='host').length,1);
  f.emit({type:'error',message:'Unsupported discovery scope'});
  assert.equal(timers[0].stopped,true,'permanent configuration errors cannot retry');
  assert.match(f.elements.get('#autoStatus').textContent,/Unable to register room: Unsupported discovery scope/);
  dispose();
 }finally{f.cleanup()}
});

test('LAN-083 busy admission refreshes directory immediately without replaying a stale rejection',async()=>{
 const f=setup();
 try{
  const {mountAutoLanLobby}=await load();
  const dispose=mountAutoLanLobby(f.root,{build:'0.11.4.34',signalFactory:f.signalFactory});
  f.elements.get('#autoFind').click();f.connect();
  const room={roomId:'room_12345678',name:'Busy host',build:'0.11.4.34',full:false};
  f.emit({type:'room-announce',...room});
  f.elements.get('#autoRooms').children[0].click();
  const join=f.packets.at(-1);assert.equal(join.type,'join');
  const reads=f.packets.filter(p=>p.type==='rooms').length;
  f.emit({type:'join-reject',roomId:room.roomId,requestId:join.requestId,reason:'room-queue-full'});
  assert.equal(f.packets.filter(p=>p.type==='rooms').length,reads+1,'busy rejection requests fresh room occupancy immediately');
  f.emit({type:'rooms-snapshot',rooms:[{...room,full:true}]});
  assert.equal(f.elements.get('#autoRooms').children[0].disabled,true,'fresh occupancy disables join');
  f.emit({type:'join-reject',roomId:room.roomId,requestId:join.requestId,reason:'room-queue-full'});
  assert.equal(f.packets.filter(p=>p.type==='rooms').length,reads+1,'replayed rejection cannot flood directory');
  dispose();
 }finally{f.cleanup()}
});


test('LAN-084 directory scope isolation rejects internet rooms in LAN and LAN rooms in Online P2P',async()=>{
 for(const internet of [false,true]){
  const f=setup();
  try{
   const {mountAutoLanLobby}=await load();
   const dispose=mountAutoLanLobby(f.root,{build:'0.11.4.35',internet,signalFactory:f.signalFactory});
   f.elements.get('#autoFind').click();f.connect();
   const own={roomId:'room_12345678',name:'Correct scope',build:'0.11.4.35',full:false,...(internet?{scope:'internet-p2p'}:{})};
   const foreign={roomId:'room_87654321',name:'Wrong scope',build:'0.11.4.35',full:false,scope:internet?'lan':'internet-p2p'};
   f.emit({type:'rooms-snapshot',rooms:[own]});
   assert.equal(f.elements.get('#autoRooms').children.length,1);
   assert.match(f.elements.get('#autoRooms').children[0].textContent,/Correct scope/);
   f.emit({type:'room-announce',...foreign});
   assert.equal(f.elements.get('#autoRooms').children.length,1,'cross-scope announce must not enter directory');
   f.emit({type:'rooms-snapshot',rooms:[foreign]});
   assert.match(f.elements.get('#autoRooms').children[0].textContent,/Correct scope/,'cross-scope snapshot cannot erase valid rooms');
   if(!internet){
    f.emit({type:'room-announce',...own,scope:'lan'});
    assert.equal(f.elements.get('#autoRooms').children.length,1,'explicit LAN scope remains valid');
   }else{
    f.emit({type:'room-announce',...own,scope:undefined});
    assert.equal(f.elements.get('#autoRooms').children.length,1,'unscoped LAN announcements cannot enter P2P');
   }
   f.elements.get('#autoRooms').children[0].click();
   assert.equal(f.packets.at(-1).roomId,own.roomId,'only matching scope is joinable');
   dispose();
  }finally{f.cleanup()}
 }
});


test('LAN-085 duplicate taps keep pending approval in LAN and Online P2P',async()=>{
 for(const internet of [false,true]){
  const f=setup();
  try{
   const {mountAutoLanLobby}=await load();
   const dispose=mountAutoLanLobby(f.root,{build:'0.11.4.36',internet,signalFactory:f.signalFactory});
   f.elements.get('#autoFind').click();f.connect();
   const scope=internet?{scope:'internet-p2p'}:{};
   f.emit({type:'room-announce',roomId:'room_12345678',name:'First host',build:'0.11.4.36',full:false,...scope});
   f.emit({type:'room-announce',roomId:'room_87654321',name:'Second host',build:'0.11.4.36',full:false,...scope});
   const buttons=f.elements.get('#autoRooms').children;
   buttons[0].click();const pending=f.packets.at(-1);
   assert.equal(pending.type,'join');
   buttons[0].click();buttons[0].click();
   assert.equal(f.packets.filter(p=>p.type==='join').length,1,'same room cannot generate another JOIN');
   assert.equal(f.packets.filter(p=>p.type==='leave').length,0,'same room cannot cancel consent');
   buttons[1].click();const switched=f.packets.at(-1);
   assert.equal(switched.type,'join');assert.notEqual(switched.requestId,pending.requestId);
   assert.deepEqual(f.packets.slice(-2).map(p=>p.type),['leave','join'],'another room still cancels old request');
   f.emit({type:'join-accept',roomId:'room_12345678',requestId:pending.requestId,hostName:'Old host'});
   assert.doesNotMatch(f.elements.get('#autoStatus').textContent,/Approved by Old host/);
   f.emit({type:'join-accept',roomId:'room_87654321',requestId:switched.requestId,hostName:'New host'});
   assert.match(f.elements.get('#autoStatus').textContent,/Approved by New host/);
   dispose();
  }finally{f.cleanup()}
 }
});


test('LAN-086 LAN and Online P2P ignore cross-room admission replies even with a matching request ID',async()=>{
 for(const internet of [false,true]){
  const f=setup();
  try{
   const {mountAutoLanLobby}=await load();
   const build='0.11.4.37';
   const dispose=mountAutoLanLobby(f.root,{build,internet,signalFactory:f.signalFactory});
   f.elements.get('#autoFind').click();f.connect();
   const roomId='room_12345678',wrongRoom='room_87654321';
   f.emit({type:'room-announce',roomId,name:'Valid host',build,full:false,...(internet?{scope:'internet-p2p'}:{})});
   f.elements.get('#autoRooms').children[0].click();
   const request=f.packets.at(-1);assert.equal(request.type,'join');
   f.emit({type:'join-reject',roomId:wrongRoom,requestId:request.requestId,reason:'room-full-or-version'});
   assert.match(f.elements.get('#autoStatus').textContent,/Waiting for host approval/);
   assert.equal(f.packets.filter(p=>p.type==='rooms').length,1,'cross-room rejection must not refresh discovery');
   f.emit({type:'join-accept',roomId:wrongRoom,requestId:request.requestId,hostName:'Wrong host'});
   assert.match(f.elements.get('#autoStatus').textContent,/Waiting for host approval/);
   f.emit({type:'join-accept',roomId,requestId:request.requestId,hostName:'Valid host'});
   assert.match(f.elements.get('#autoStatus').textContent,/Approved by Valid host/);
   f.emit({type:'join-reject',roomId:wrongRoom,requestId:request.requestId});
   assert.match(f.elements.get('#autoStatus').textContent,/Approved by Valid host/,'cross-room denial must not tear down an approved negotiation');
   f.emit({type:'join-reject',roomId,requestId:request.requestId});
   assert.match(f.elements.get('#autoStatus').textContent,/Join request rejected or expired/,'correctly bound rejection still releases the seat');
   dispose();
  }finally{f.cleanup()}
 }
});


test('LAN-087 mixed-scope directory snapshots retain valid local hosts without cross-mode contamination',async()=>{
 for(const internet of [false,true]){
  const f=setup();
  try{
   const {mountAutoLanLobby}=await load();
   const build='0.11.4.38';
   const dispose=mountAutoLanLobby(f.root,{build,internet,signalFactory:f.signalFactory});
   f.elements.get('#autoFind').click();f.connect();
   const scope=internet?'internet-p2p':'lan';
   const old={roomId:'room_12345678',name:'Old local host',build,full:false,scope};
   const current={roomId:'room_87654321',name:'Fresh local host',build,full:false,scope};
   const foreign={roomId:'room_99999999',name:'Foreign scope host',build,full:false,scope:internet?'lan':'internet-p2p'};
   f.emit({type:'rooms-snapshot',rooms:[old]});
   f.emit({type:'rooms-snapshot',rooms:[foreign]});
   assert.equal(f.elements.get('#autoRooms').children.length,1,'foreign-only snapshot cannot clear a valid local room');
   assert.match(f.elements.get('#autoRooms').children[0].textContent,/Old local host/);
   f.emit({type:'rooms-snapshot',rooms:[foreign,current]});
   assert.equal(f.elements.get('#autoRooms').children.length,1,'mixed snapshot must include only the matching mode');
   assert.match(f.elements.get('#autoRooms').children[0].textContent,/Fresh local host/);
   const joinCount=f.packets.filter(p=>p.type==='join').length;
   f.emit({type:'rooms-snapshot',rooms:[foreign,{...current,name:' '}]});
   assert.match(f.elements.get('#autoRooms').children[0].textContent,/Fresh local host/,'malformed same-scope data must not replace the valid directory');
   f.elements.get('#autoRooms').children[0].click();
   assert.equal(f.packets.filter(p=>p.type==='join').length,joinCount+1);
   assert.equal(f.packets.at(-1).roomId,current.roomId,'guest joins only the matching-scope room');
   dispose();
  }finally{f.cleanup()}
 }
});

test('LAN-088 host departure retires pending room and cannot interrupt a started LAN/P2P match',async()=>{
 for(const internet of [false,true]){
  const f=setup();let onStatus=null,readyCount=0,disposed=0;
  try{
   const {mountAutoLanLobby}=await load();
   const build='0.11.4.39';
   const dispose=mountAutoLanLobby(f.root,{build,internet,signalFactory:f.signalFactory,
    onReady:()=>{readyCount++},
    peerFactory:()=>({acceptOffer:async()=>'{"answer":true}',
     subscribeStatus:fn=>{onStatus=fn;return ()=>{}},
     awaitReady:()=>new Promise(()=>{}),dispose(){disposed++}})});
   f.elements.get('#autoFind').click();f.connect();
   const room={type:'room-announce',roomId:'room_12345678',name:'Available host',build,full:false,
    ...(internet?{scope:'internet-p2p'}:{})};
   f.emit(room);f.elements.get('#autoRooms').children[0].click();
   const oldJoin=f.packets.at(-1);assert.equal(oldJoin.type,'join');
   const previousReads=f.packets.filter(p=>p.type==='rooms').length;
   f.emit({type:'host-left',roomId:room.roomId});
   assert.equal(f.elements.get('#autoRooms').children.length,0,'departed host cannot remain joinable');
   assert.equal(f.packets.filter(p=>p.type==='rooms').length,previousReads+1,'refresh immediately after host departure');
   assert.match(f.elements.get('#autoStatus').textContent,/Host disconnected/);
   f.emit({type:'join-accept',roomId:room.roomId,requestId:oldJoin.requestId});
   assert.equal(readyCount,0,'late approval cannot start abandoned room');
   f.emit(room);f.elements.get('#autoRooms').children[0].click();
   const newJoin=f.packets.at(-1);assert.equal(newJoin.type,'join');
   assert.notEqual(newJoin.requestId,oldJoin.requestId);
   f.emit({type:'join-accept',roomId:room.roomId,requestId:newJoin.requestId});
   await f.emit({type:'offer',roomId:room.roomId,sdp:JSON.stringify({session:'session_12345678'})});
   assert.equal(typeof onStatus,'function','guest negotiates the approved match');
   onStatus({ready:true});assert.equal(readyCount,1);
   const activeStatus=f.elements.get('#autoStatus').textContent;
   f.emit({type:'room-remove',roomId:room.roomId});
   f.emit({type:'host-left',roomId:room.roomId});
   assert.equal(readyCount,1,'directory notices cannot restart a live match');
   assert.equal(disposed,0,'directory notices cannot dispose the active transport');
   assert.equal(f.elements.get('#autoStatus').textContent,activeStatus,'live-match status is preserved');
   dispose();
  }finally{f.cleanup()}
 }
});


test('LAN-089 late guest-left and host registration ack cannot reset a started host match',async()=>{
 for(const internet of [false,true]){
  const f=setup();let onStatus=null,readyCount=0,disposed=0;
  try{
   const {mountAutoLanLobby}=await load();
   const dispose=mountAutoLanLobby(f.root,{build:'0.11.4.40',internet,signalFactory:f.signalFactory,
    onReady:()=>{readyCount++},
    peerFactory:()=>({createOffer:async()=>'host-offer',acceptAnswer:async()=>{},
     subscribeStatus:fn=>{onStatus=fn;return ()=>{}},
     awaitReady:()=>new Promise(()=>{}),dispose(){disposed++}})});
   f.connect();f.elements.get('#autoHost').click();
   const roomId=f.packets.at(-1).roomId;
   f.emit({type:'host-registered',roomId});
   await f.emit({type:'guest-approved',roomId});
   assert.equal(f.packets.at(-1).type,'offer');
   await f.emit({type:'answer',roomId,sdp:'guest-answer'});
   assert.equal(typeof onStatus,'function');
   onStatus({ready:true});assert.equal(readyCount,1);
   const matchStatus=f.elements.get('#autoStatus').textContent;
   const offerCount=f.packets.filter(p=>p.type==='offer').length;
   f.emit({type:'guest-left',roomId});
   f.emit({type:'host-registered',roomId});
   await f.emit({type:'guest-approved',roomId});
   assert.equal(readyCount,1,'late signaling cannot restart the established match');
   assert.equal(disposed,0,'late broker notices cannot dispose the active transport');
   assert.equal(f.packets.filter(p=>p.type==='offer').length,offerCount,'no new SDP offer after kickoff');
   assert.equal(f.elements.get('#autoStatus').textContent,matchStatus,'active host match status must not be overwritten');
   dispose();
  }finally{f.cleanup()}
 }
});
