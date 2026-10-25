'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(p,'utf8');
test('public Pages LAN setup exposes a private-IP gateway to local companion server',()=>{
 const lobby=read('src/modules/lan-lobby.js');
 for(const token of ["hostname==='saeedsai.github.io'",'id="lanServerIp"','id="lanOpenServer"',"location.assign('http://'","const parts=ip.split('.')","Number(parts[1])>=16","Number(parts[1])<=31"]){
  assert.ok(lobby.includes(token),'missing LAN gateway: '+token);
 }
 assert.ok(lobby.indexOf('root.prepend(gateway)')>lobby.indexOf('root.innerHTML='),'gateway must mount after fallback DOM');
});
test('LAN companion lobby exposes host and guest discovery controls',()=>{
 const auto=read('src/modules/lan-auto-lobby.js');
 for(const token of ['id="autoHost"','id="autoFind"','function host()','function find()']){
  assert.ok(auto.includes(token),'missing LAN action: '+token);
 }
});
