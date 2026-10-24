'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const load=()=>import('../src/modules/lan-lobby.js');
const build=require('../package.json').version;
const session='0123456789abcdef0123456789abcdef';
const offer=()=>JSON.stringify({protocol:1,kind:'offer',session,build,sdp:'v=0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\n'});
test('LAN-024 secure random session has protocol-compatible length and entropy',async()=>{
  const {makeLanSession}=await load();
  const a=makeLanSession(webcrypto),b=makeLanSession(webcrypto);
  assert.match(a,/^[a-f0-9]{32}$/);
  assert.notEqual(a,b);
  assert.throws(()=>makeLanSession({}),/Secure random/);
});
test('LAN-024 guest adopts host session only for valid matching-version offers',async()=>{
  const {parseGuestLanOffer}=await load();
  const hello=parseGuestLanOffer(offer(),build);
  assert.deepEqual(hello,{protocol:1,type:'hello',role:'guest',session,build,sequence:0});
  assert.equal(Object.isFrozen(hello),true);
});
test('LAN-024 rejects foreign, oversized and malformed signaling without starting WebRTC',async()=>{
  const {parseGuestLanOffer}=await load();
  for(const raw of ['not-json','x'.repeat(200001),JSON.stringify({...JSON.parse(offer()),kind:'answer'}),JSON.stringify({...JSON.parse(offer()),build:'0.0.0.0'}),JSON.stringify({...JSON.parse(offer()),session:'short'}),JSON.stringify({...JSON.parse(offer()),sdp:'invalid'})]){
    assert.throws(()=>parseGuestLanOffer(raw,build),/LAN/);
  }
});
test('LAN-024 local network menu is explicitly a connection preview, not a playable match',()=>{
  const root=path.resolve(__dirname,'..');
  const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  const fixture=fs.readFileSync(path.join(root,'scripts/build.py'),'utf8');
  assert.match(ui,/navItem\('Local Network · Connection Preview','navLan'/);
  assert.match(ui,/mountLanLobby\(\$\('lanLobby'\)\)/);
  assert.match(ui,/lanLobbyDispose\(\)/);
  assert.match(sw,/'lan_protocol','lan-protocol-channel','lan_peer_connection','lan-lobby'/);
  assert.match(fixture,/'lan_protocol','lan-protocol-channel','lan_peer_connection','lan-lobby'/);
});
test('LAN-024 host creates a copyable offer and disposes peer on navigation',async()=>{
  const {mountLanLobby}=await load();
  const nodes=new Map();
  class Element extends EventTarget{
    constructor(){super();this.value='';this.textContent='';}
    focus(){} select(){}
  }
  const root={innerHTML:'',querySelector(sel){
    if(!nodes.has(sel))nodes.set(sel,new Element());
    return nodes.get(sel);
  }};
  let disposed=0,created=0;
  const fakeFactory=hello=>{
    created++;
    return {
      subscribeStatus(listener){listener({phase:'new',transport:'new',channel:'connecting',ready:false});return ()=>{};},
      async createOffer(){return JSON.stringify({protocol:1,kind:'offer',session:hello.session,build:hello.build,sdp:'v=0\r\nhello\r\n'});},
      dispose(){disposed++;}
    };
  };
  const cleanup=mountLanLobby(root,{peerFactory:fakeFactory,build,cryptoSource:{getRandomValues(arr){arr.fill(4);return arr;}}});
  nodes.get('#lanHost').dispatchEvent(new Event('click'));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(created,1);
  assert.equal(JSON.parse(nodes.get('#lanOutgoing').value).kind,'offer');
  assert.match(nodes.get('#lanStatus').textContent,/Host offer ready/);
  cleanup();
  assert.equal(disposed,1);
});
