const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('LAN Quick Match uses automatic lobby on Pages and LAN without manual IP fallback',()=>{
 const lobby=fs.readFileSync('src/modules/lan-lobby.js','utf8');
 assert.match(lobby,/mountAutoLanLobby\(root,options\)/);
 assert.doesNotMatch(lobby,/saeedsai\.github\.io/);
});
test('automatic LAN path includes discovery, approval and SDP exchange',()=>{
 const lobby=fs.readFileSync('src/modules/lan-auto-lobby.js','utf8');
 const server=fs.readFileSync('scripts/lan-server.mjs','utf8');
 for(const type of ['room-announce','join-request','join-accept','offer','answer']){assert.ok(lobby.includes(type),type+' client');assert.ok(server.includes(type),type+' server')}
 assert.match(server,/sameSubnet/);
 assert.match(server,/m\.accept===true/);
});

test('automatic LAN uses real HTTP browser origins and preserves offline imports',()=>{
 const lobby=fs.readFileSync('src/modules/lan-lobby.js','utf8');
 const sw=fs.readFileSync('sw.js','utf8');
 assert.match(lobby,/options\.auto!==false/);
 assert.match(lobby,/!options\.peerFactory/);
 assert.match(sw,/'lan-auto-signal','lan-auto-lobby','lan-lobby'/);
});
test('LAN host can recover after an approved guest disconnects',()=>{
 const lobby=fs.readFileSync('src/modules/lan-auto-lobby.js','utf8');
 assert.match(lobby,/m\.type==='guest-left'/);
 assert.match(lobby,/cleanupPeer\(\);approved=false/);
});
