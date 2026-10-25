const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const load=()=>import('../scripts/lan-signal-policy.mjs');
test('LAN mode remains private-address and same-subnet scoped',async()=>{
 const {createLanSignalPolicy}=await load(),p=createLanSignalPolicy();
 assert.equal(p.allows('192.168.1.2','http://192.168.1.2:8000','192.168.1.2:8000'),true);
 assert.equal(p.allows('8.8.8.8','http://localhost:8000','localhost:8000'),false);
 assert.equal(p.allows('192.168.1.2','https://evil.example','192.168.1.2:8000'),false);
 assert.equal(p.visible('192.168.1.2','192.168.1.3'),true);
 assert.equal(p.visible('192.168.1.2','192.168.2.3'),false);
});
test('hosted mode requires exact configured HTTPS browser origin',async()=>{
 const {createLanSignalPolicy}=await load(),p=createLanSignalPolicy({mode:'hosted',publicOrigin:'https://saeedsai.github.io'});
 assert.equal(p.allows('8.8.8.8','https://saeedsai.github.io','signal.example'),true);
 for(const origin of [undefined,'http://saeedsai.github.io','https://saeedsai.github.io.evil.test','https://evil.test'])
  assert.equal(p.allows('8.8.8.8',origin,'signal.example'),false);
 assert.equal(p.visible('192.168.1.2','10.1.2.3'),true);
});
test('hosted mode rejects unsafe configuration rather than opening a public socket',async()=>{
 const {createLanSignalPolicy}=await load();
 for(const publicOrigin of [undefined,'*','http://saeedsai.github.io','https://saeedsai.github.io/','https://saeedsai.github.io/path'])
  assert.throws(()=>createLanSignalPolicy({mode:'hosted',publicOrigin}),/exact HTTPS/);
 assert.throws(()=>createLanSignalPolicy({mode:'other'}),/Invalid signaling mode/);
});
test('server wires hosted scope policy to websocket handshake and room visibility',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/createLanSignalPolicy\(\{mode:process\.env\.SMF_SIGNAL_MODE\|\|'lan',publicOrigin:process\.env\.SMF_PUBLIC_ORIGIN\}\)/);
 assert.match(server,/signalPolicy\.allows\(ip,origin,req\.headers\.host\)/);
 assert.match(server,/signalPolicy\.visible\(a,b\)/);
});

test('hosted signaling bounds room count and per-guest/per-room pending requests',()=>{
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 assert.match(server,/MAX_ROOMS=128,MAX_PENDING_PER_GUEST=1,MAX_PENDING_PER_ROOM=8/);
 assert.match(server,/rooms\.size>=MAX_ROOMS/);
 assert.match(server,/p\.guest===ws/);
 assert.match(server,/p\.roomId===id/);
 assert.match(server,/reason:'request-already-pending'/);
 assert.match(server,/reason:'room-queue-full'/);
});
