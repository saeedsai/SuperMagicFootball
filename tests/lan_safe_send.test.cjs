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
 assert.match(source,/const send=safeLanSend;/);
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
