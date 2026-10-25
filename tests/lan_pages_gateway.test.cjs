'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('all platforms default to one-tap automatic Host Game and Find Games',()=>{
 const lobby=read('src/modules/lan-lobby.js');
 assert.ok(lobby.includes('return mountAutoLanLobby(root,options)'));
 assert.ok(!lobby.includes("hostname==='saeedsai.github.io'"));
 assert.ok(!lobby.includes('lanServerIp'));
});
test('secure hosted signaling endpoint is configurable and lobby shows connection failures',()=>{
 const signal=read('src/modules/lan-auto-signal.js');
 const auto=read('src/modules/lan-auto-lobby.js');
 assert.ok(signal.includes('SMF_LAN_SIGNAL_URL'));
 assert.ok(signal.includes('wss:'));
 assert.ok(signal.includes("onState('unconfigured')"));
 assert.ok(signal.includes("hostname==='saeedsai.github.io'"));
 assert.ok(auto.includes('id="autoHost"')&&auto.includes('id="autoFind"'));
 assert.ok(auto.includes('requires an online signaling service'));
});
