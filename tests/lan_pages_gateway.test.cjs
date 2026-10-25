'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('public Pages LAN setup exposes a private-IP gateway to local companion server',()=>{
 const lobby=read('src/modules/lan-lobby.js');
 assert.match(lobby,/hostname==='saeedsai\\.github\\.io'/);
 assert.match(lobby,/id="lanServerIp"/);
 assert.match(lobby,/id="lanOpenServer"/);
 assert.match(lobby,/location\\.assign\\('http:\\/\\/'/);
 assert.match(lobby,/const parts=ip\\.split\\('\\.'\\)/);
 assert.match(lobby,/Number\\(parts\\[1\\]\\)>=16/);
 assert.match(lobby,/Number\\(parts\\[1\\]\\)<=31/);
 assert.ok(lobby.indexOf('root.prepend(gateway)')>lobby.indexOf('root.innerHTML=\\`'),'gateway must mount after manual fallback DOM');
});
test('LAN companion lobby has working host and discovery entry points',()=>{
 const auto=read('src/modules/lan-auto-lobby.js');
 assert.match(auto,/id="autoHost"/);
 assert.match(auto,/id="autoFind"/);
 assert.match(auto,/function host\\(\\)/);
 assert.match(auto,/function find\\(\\)/);
});
