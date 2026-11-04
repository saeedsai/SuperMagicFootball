'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../scripts/lan-connection-budget.mjs');

test('LAN server connection budget counts pending handshakes and live sockets globally',async()=>{
 const {createLanConnectionBudget}=await load(),budget=createLanConnectionBudget({maxConnections:3,maxPerIp:2});
 const requests=[{}, {}, {}, {}];
 assert.equal(budget.reserve(requests[0],'192.168.1.2'),true);
 assert.equal(budget.reserve(requests[1],'192.168.1.3'),true);
 assert.equal(budget.connect(requests[0]),true,'accepted handshake transitions without consuming another slot');
 assert.equal(budget.size,2);
 assert.equal(budget.reserve(requests[2],'192.168.1.4'),true);
 assert.equal(budget.reserve(requests[3],'192.168.1.5'),false,'a fourth concurrent handshake is rejected at the global cap');
 assert.equal(budget.size,3);
 assert.equal(budget.release(requests[1]),true);
 assert.equal(budget.reserve(requests[3],'192.168.1.5'),true,'disconnect/error releases capacity for another IP');
 assert.equal(budget.size,3);
});

test('LAN server connection budget also caps and releases per-IP pending/live connections',async()=>{
 const {createLanConnectionBudget}=await load(),budget=createLanConnectionBudget({maxConnections:8,maxPerIp:2});
 const sameIp=[{}, {}, {}];
 assert.equal(budget.reserve(sameIp[0],'10.0.0.4'),true);
 assert.equal(budget.reserve(sameIp[1],'10.0.0.4'),true);
 assert.equal(budget.reserve(sameIp[2],'10.0.0.4'),false,'in-flight handshakes count against the per-IP cap');
 assert.equal(budget.countForIp('10.0.0.4'),2);
 assert.equal(budget.connect(sameIp[0]),true);
 assert.equal(budget.release(sameIp[1]),true);
 assert.equal(budget.reserve(sameIp[2],'10.0.0.4'),true,'released socket frees per-IP capacity');
 assert.equal(budget.connect(sameIp[0]),false,'a reservation cannot transition twice');
 assert.equal(budget.release(sameIp[0]),true);
 assert.equal(budget.release(sameIp[0]),false,'release is idempotent');
});

test('LAN server connection budget rejects duplicate reservations and invalid limits',async()=>{
 const {createLanConnectionBudget}=await load(),budget=createLanConnectionBudget();
 const request={};assert.equal(budget.reserve(request,'127.0.0.1'),true);
 assert.equal(budget.reserve(request,'127.0.0.1'),false);
 for(const options of [{maxConnections:0},{maxConnections:4097},{maxPerIp:0},{maxPerIp:257}])
  assert.throws(()=>createLanConnectionBudget(options),/Invalid LAN connection budget/);
});
