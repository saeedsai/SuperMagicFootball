'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const load=()=>import('../scripts/lan-safe-send.mjs');
test('open socket sends JSON and remains connected on success',async()=>{
 const {safeLanSend}=await load();let payload,cb,closed=0;
 const ws={readyState:1,send(p,f){payload=p;cb=f},terminate(){closed++}};
 assert.equal(safeLanSend(ws,{type:'room-announce',roomId:'test1234'}),true);
 assert.deepEqual(JSON.parse(payload),{type:'room-announce',roomId:'test1234'});
 cb();assert.equal(closed,0);
});
test('closed or absent socket is ignored',async()=>{
 const {safeLanSend}=await load();
 assert.equal(safeLanSend(null,{type:'x'}),false);
 assert.equal(safeLanSend({readyState:3,send(){throw Error('called')}},{type:'x'}),false);
});
test('synchronous send exception terminates socket without escaping',async()=>{
 const {safeLanSend}=await load();let closed=0;
 assert.equal(safeLanSend({readyState:1,send(){throw Error('closed')},terminate(){closed++}},{type:'x'}),false);
 assert.equal(closed,1);
});
test('asynchronous write error terminates socket for normal close cleanup',async()=>{
 const {safeLanSend}=await load();let cb,closed=0;
 assert.equal(safeLanSend({readyState:1,send(_p,f){cb=f},terminate(){closed++}},{type:'x'}),true);
 cb(Error('broken pipe'));assert.equal(closed,1);
});
test('already-closing socket during termination cannot crash signaling',async()=>{
 const {safeLanSend}=await load();
 assert.equal(safeLanSend({readyState:1,send(){throw Error('closed')},terminate(){throw Error('closing')}},{type:'x'}),false);
});
test('LAN server wires safe signaling and handles socket error events',()=>{
 const source=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(source,/import \{safeLanSend\} from '\.\/lan-safe-send\.mjs'/);
 assert.match(source,/const send=\(ws,msg\)=>\{safeLanSend\(ws,msg\)/,'all signaling must still pass through safeLanSend before occupancy announcements');
 assert.match(source,/ws\.on\('error',/);
});

test('unserializable signaling payload is contained and peer terminated',async()=>{
 const {safeLanSend}=await load();let closed=0,sent=0;
 const ws={readyState:1,send(){sent++},terminate(){closed++}};
 const circular={type:'offer'};circular.self=circular;
 assert.equal(safeLanSend(ws,circular),false);
 assert.equal(sent,0);assert.equal(closed,1);
 assert.equal(safeLanSend({readyState:1,send(){sent++},terminate(){closed++}},{type:'offer',bad:1n}),false);
 assert.equal(sent,0);assert.equal(closed,2);
});

test('undefined and function payloads never reach the socket',async()=>{
 const {safeLanSend}=await load();let sent=0,terminated=0;
 const ws={readyState:1,send(){sent++},terminate(){terminated++}};
 assert.equal(safeLanSend(ws,undefined),false);
 assert.equal(safeLanSend(ws,()=>{}),false);
 assert.equal(sent,0);assert.equal(terminated,0);
 assert.equal(safeLanSend(ws,{type:'rooms'}),true);
 assert.equal(sent,1);
});

test('oversized UTF-8 signaling frames are rejected without harming socket',async()=>{
 const {safeLanSend}=await load();let sent=0,terminated=0;
 const ws={readyState:1,send(){sent++},terminate(){terminated++}};
 assert.equal(safeLanSend(ws,{type:'offer',sdp:'x'.repeat(210000)}),false);
 assert.equal(safeLanSend(ws,{type:'offer',sdp:'😀'.repeat(60000)}),false);
 assert.equal(sent,0);assert.equal(terminated,0);
 assert.equal(safeLanSend(ws,{type:'rooms'}),true);
 assert.equal(sent,1);
});

test('outbound signaling rejects primitives and malformed envelopes',async()=>{
 const {safeLanSend}=await load();let sent=0,closed=0;
 const ws={readyState:1,send(){sent++},terminate(){closed++}};
 for(const payload of [null,'hello',42,true,[],{type:3},{roomId:'missing-type'}])assert.equal(safeLanSend(ws,payload),false);
 assert.equal(sent,0);assert.equal(closed,0);
 assert.equal(safeLanSend(ws,{type:'rooms'}),true);assert.equal(sent,1);
});

test('socket closed by custom toJSON is not sent to or terminated',async()=>{
 const {safeLanSend}=await load();let sent=0,terminated=0;
 const ws={readyState:1,send(){sent++},terminate(){terminated++}};
 const message={type:'rooms',toJSON(){ws.readyState=3;return {type:'rooms'}}};
 assert.equal(safeLanSend(ws,message),false);
 assert.equal(sent,0);assert.equal(terminated,0);
});

test('toJSON cannot rewrite a valid envelope into an invalid signaling frame',async()=>{
 const {safeLanSend}=await load();let sent=0,terminated=0;
 const ws={readyState:1,send(){sent++},terminate(){terminated++}};
 for(const rewritten of ['hello',[],{type:99},{roomId:'no-type'}]){
  assert.equal(safeLanSend(ws,{type:'rooms',toJSON(){return rewritten}}),false);
 }
 assert.equal(sent,0);assert.equal(terminated,0);
 assert.equal(safeLanSend(ws,{type:'rooms'}),true);assert.equal(sent,1);
});

test('slow client is terminated before exceeding signaling queue budget',async()=>{
 const {safeLanSend,LAN_MAX_OUTBOUND_QUEUE_BYTES}=await load();let sent=0,closed=0;
 const message={type:'offer',sdp:'x'.repeat(1000)},bytes=Buffer.byteLength(JSON.stringify(message),'utf8');
 const ws={readyState:1,bufferedAmount:LAN_MAX_OUTBOUND_QUEUE_BYTES-bytes+1,send(){sent++},terminate(){closed++}};
 assert.equal(safeLanSend(ws,message),false);assert.equal(sent,0);assert.equal(closed,1);
});
test('UTF-8 queue budget boundary accepts exact fit and rejects one extra byte',async()=>{
 const {safeLanSend,LAN_MAX_OUTBOUND_QUEUE_BYTES}=await load();let sent=0,closed=0;
 const message={type:'offer',sdp:'😀'.repeat(300)},bytes=Buffer.byteLength(JSON.stringify(message),'utf8');
 const ws={readyState:1,bufferedAmount:LAN_MAX_OUTBOUND_QUEUE_BYTES-bytes,send(p){sent++;assert.equal(p,JSON.stringify(message))},terminate(){closed++}};
 assert.equal(safeLanSend(ws,message),true);assert.equal(sent,1);assert.equal(closed,0);
 ws.bufferedAmount++;assert.equal(safeLanSend(ws,message),false);assert.equal(sent,1);assert.equal(closed,1);
});
test('backpressure termination exception is contained',async()=>{
 const {safeLanSend,LAN_MAX_OUTBOUND_QUEUE_BYTES}=await load();
 const ws={readyState:1,bufferedAmount:LAN_MAX_OUTBOUND_QUEUE_BYTES,send(){throw Error('should not send')},terminate(){throw Error('already closing')}};
 assert.equal(safeLanSend(ws,{type:'rooms'}),false);
});
test('socket mocks without bufferedAmount preserve successful signaling',async()=>{
 const {safeLanSend}=await load();let sent=0;
 assert.equal(safeLanSend({readyState:1,send(){sent++}},{type:'rooms'}),true);assert.equal(sent,1);
});

test('host approval checks guest readiness before occupying a room seat',()=>{
 const source=fs.readFileSync('scripts/lan-server.mjs','utf8');
 const accept=source.indexOf('if(m.accept===true&&!room.guest)');
 const guard=source.indexOf('if(req.guest.readyState!==1)',accept);
 const assign=source.indexOf('room.guest=req.guest',accept);
 assert.ok(accept>=0 && guard>accept && assign>guard,'disconnected guest must be rejected before seat assignment');
 assert.match(source.slice(guard,assign),/join-cancel[^\n]*guest-left/);
});
