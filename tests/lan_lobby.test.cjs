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
test('LAN-046 Quick Match routes ready LAN sessions to live gameplay',()=>{
  const root=path.resolve(__dirname,'..');
  const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  const fixture=fs.readFileSync(path.join(root,'scripts/build.py'),'utf8');
  assert.match(ui,/navItem\('Local Network · LAN Quick Match','navLan'/);
  assert.match(ui,/mountLanLobby\(\$\('lanLobby'\),\{onReady:startLanQuickMatch\}\)/);
  assert.match(ui,/createLanLiveMatch\(\{peer,role,game,input,field:ENGINE\.WORLD\.field\}\)/);
  assert.match(ui,/\(screen==='LOCAL NETWORK'\|\|screen==='ONLINE P2P'\)\&\&e\.code==='Escape'/);
  assert.match(ui,/lanLobbyDispose\(\)/);
  assert.match(sw,/'lan_peer_connection','lan-auto-signal','lan-auto-lobby','lan-lobby','lan-live-match','render'/);
  assert.match(fixture,/'lan_peer_connection','lan-auto-signal','lan-auto-lobby','lan-lobby','lan-live-match','render'/);
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

test('LAN-024 guest accepts a trusted host offer and reset closes the peer',async()=>{
  const {mountLanLobby}=await load();
  const nodes=new Map();
  class Element extends EventTarget{
    constructor(){super();this.value='';this.textContent='';}
    focus(){} select(){}
  }
  const root={innerHTML:'',querySelector(sel){if(!nodes.has(sel))nodes.set(sel,new Element());return nodes.get(sel);}};
  let guestHello=null,closed=0;
  const factory=hello=>{
    guestHello=hello;
    return {
      subscribeStatus(listener){listener({phase:'new',transport:'new',channel:'unavailable',ready:false});return ()=>{};},
      async acceptOffer(raw){assert.equal(JSON.parse(raw).kind,'offer');return JSON.stringify({protocol:1,kind:'answer',session:hello.session,build:hello.build,sdp:'v=0\\r\\nanswer\\r\\n'});},
      awaitReady(){return new Promise(()=>{});},
      dispose(){closed++;}
    };
  };
  const cleanup=mountLanLobby(root,{peerFactory:factory,build});
  nodes.get('#lanGuest').dispatchEvent(new Event('click'));
  nodes.get('#lanIncoming').value=offer();
  nodes.get('#lanApply').dispatchEvent(new Event('click'));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(guestHello.role,'guest');
  assert.equal(guestHello.session,session);
  assert.equal(JSON.parse(nodes.get('#lanOutgoing').value).kind,'answer');
  nodes.get('#lanReset').dispatchEvent(new Event('click'));
  assert.equal(closed,1);
  cleanup();
  assert.equal(closed,1);
});


test('Online P2P Quick Match reuses LAN authoritative engine without changing top-level Online',()=>{
 const ui=fs.readFileSync(path.join(path.resolve(__dirname,'..'),'src/modules/ui.js'),'utf8');
 const peer=fs.readFileSync(path.join(path.resolve(__dirname,'..'),'src/modules/lan_peer_connection.js'),'utf8');
 const lobby=fs.readFileSync(path.join(path.resolve(__dirname,'..'),'src/modules/lan-lobby.js'),'utf8');
 assert.match(ui,/navItem\('Online P2P · Private Quick Match','navOnlineP2P'/);
 assert.match(ui,/mountLanLobby\(\$\('lanLobby'\),\{auto:false,internet:true,onReady:startLanQuickMatch\}\)/);
 assert.match(ui,/else if\(a==='navOnlineP2P'\)showOnlineP2PLobby\(\)/);
 assert.match(ui,/function showOnlineMenu\(\)\{menuChoices\('nav-online'/);
 assert.match(peer,/options\.internet===true\?\[\{urls:'stun:/);
 assert.match(lobby,/createLanPeerConnection\(hello,\{internet\}\)/);
 assert.match(lobby,/Some firewalls\/NATs require TURN/);
});


test('P2P-002 clipboard paste is bounded, manual-approval-only and has a touch fallback',async()=>{
  const {mountLanLobby}=await load();
  const nodes=new Map();
  class Element extends EventTarget{
    constructor(){super();this.value='';this.textContent='';this.focused=false;}
    focus(){this.focused=true;} select(){}
  }
  const root={innerHTML:'',querySelector(sel){
    if(!nodes.has(sel))nodes.set(sel,new Element());return nodes.get(sel);
  }};
  let text=offer(),fail=false,created=0;
  const cleanup=mountLanLobby(root,{auto:false,internet:true,build,
    peerFactory(){created++;throw new Error('must not auto-connect');},
    clipboard:{async readText(){if(fail)throw new Error('permission denied');return text;}}
  });
  assert.match(root.innerHTML,/id="lanPaste"/);
  const click=async()=>{nodes.get('#lanPaste').dispatchEvent(new Event('click'));
    await new Promise(resolve=>setImmediate(resolve));};
  await click();
  assert.equal(nodes.get('#lanIncoming').value,offer());
  assert.equal(created,0,'paste must never accept SDP or start a peer');
  assert.match(nodes.get('#lanStatus').textContent,/Verify the sender/);
  assert.match(nodes.get('#lanStatus').textContent,/choose host or guest before applying/);
  text='x'.repeat(200001);
  await click();
  assert.equal(nodes.get('#lanIncoming').value,offer(),'oversized clipboard never replaces existing text');
  assert.match(nodes.get('#lanStatus').textContent,/too large/);
  fail=true;
  await click();
  assert.equal(nodes.get('#lanIncoming').focused,true);
  assert.match(nodes.get('#lanStatus').textContent,/paste manually/);
  cleanup();
});

test('P2P-003 previews validated offer/answer metadata without trusting or applying SDP',async()=>{
  const {inspectLanConnectionText}=await load();
  assert.deepEqual(inspectLanConnectionText(offer(),build),{kind:'offer',session,build});
  const answer=JSON.stringify({...JSON.parse(offer()),kind:'answer'});
  assert.equal(inspectLanConnectionText(answer,build).kind,'answer');
  for(const wire of ['{','null','[]','{}','x'.repeat(200001),
    JSON.stringify({...JSON.parse(offer()),session:'invalid'}),
    JSON.stringify({...JSON.parse(offer()),build:'0.0.0.0'}),
    JSON.stringify({...JSON.parse(offer()),sdp:'not-sdp'})]){
    assert.throws(()=>inspectLanConnectionText(wire,build),/Connection text|versions differ/);
  }
});
test('P2P-003 ignores clipboard completion after role reset or manual edits',async()=>{
  const {mountLanLobby}=await load();
  const nodes=new Map(),pending=[];
  class Element extends EventTarget{
    constructor(){super();this.value='';this.textContent='';}
    focus(){} select(){}
  }
  const root={innerHTML:'',querySelector(sel){
    if(!nodes.has(sel))nodes.set(sel,new Element());
    return nodes.get(sel);
  }};
  let created=0;
  const cleanup=mountLanLobby(root,{auto:false,internet:true,build,
    peerFactory(){created++;throw new Error('no automatic connection');},
    clipboard:{readText(){return new Promise(resolve=>pending.push(resolve));}}
  });
  const click=id=>nodes.get('#'+id).dispatchEvent(new Event('click'));
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  click('lanGuest');
  click('lanPaste');
  nodes.get('#lanIncoming').value='manually typed text';
  nodes.get('#lanIncoming').dispatchEvent(new Event('input'));
  pending.shift()(offer());await flush();
  assert.equal(nodes.get('#lanIncoming').value,'manually typed text','late paste must not replace edits');
  click('lanPaste');
  click('lanReset');
  pending.shift()(offer());await flush();
  assert.equal(nodes.get('#lanIncoming').value,'','late paste must not revive a reset session');
  click('lanGuest');
  click('lanPaste');
  pending.shift()(offer());await flush();
  assert.equal(nodes.get('#lanIncoming').value,offer());
  assert.match(nodes.get('#lanStatus').textContent,/Host offer matches game version/);
  assert.match(nodes.get('#lanStatus').textContent,/Verify the sender/);
  assert.equal(created,0,'preview must not create a peer');
  nodes.get('#lanIncoming').value=JSON.stringify({...JSON.parse(offer()),kind:'answer'});
  nodes.get('#lanIncoming').dispatchEvent(new Event('input'));
  assert.match(nodes.get('#lanStatus').textContent,/Expected a host offer/);
  cleanup();
});


test('P2P-004 stale host offer rejection cannot dispose a replacement host',async()=>{
  const {mountLanLobby}=await load();
  const nodes=new Map();
  class Element extends EventTarget{
    constructor(){super();this.value='';this.textContent='';}
    focus(){} select(){}
  }
  const root={innerHTML:'',querySelector(sel){if(!nodes.has(sel))nodes.set(sel,new Element());return nodes.get(sel);}};
  let rejectOld,created=0,oldClosed=0,newClosed=0;
  const oldOffer=new Promise((resolve,reject)=>{rejectOld=reject;});
  const cleanup=mountLanLobby(root,{auto:false,build,cryptoSource:{getRandomValues(arr){arr.fill(7);return arr;}},
    peerFactory(){
      const id=++created;
      return {
        subscribeStatus(listener){listener({phase:'new',transport:'new',channel:'connecting',ready:false});return ()=>{};},
        createOffer(){return id===1?oldOffer:Promise.resolve('replacement offer');},
        dispose(){if(id===1)oldClosed++;else newClosed++;}
      };
    }
  });
  const click=id=>nodes.get('#'+id).dispatchEvent(new Event('click'));
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  click('lanHost');await flush();
  click('lanHost');await flush();
  assert.equal(nodes.get('#lanOutgoing').value,'replacement offer');
  rejectOld(new Error('old host failed'));await flush();
  assert.equal(oldClosed,1);
  assert.equal(newClosed,0,'old rejection must not dispose the new host');
  assert.equal(nodes.get('#lanOutgoing').value,'replacement offer');
  assert.match(nodes.get('#lanStatus').textContent,/Host offer ready/);
  cleanup();assert.equal(newClosed,1);
});

test('P2P-004 stale guest negotiation rejection cannot close a new host',async()=>{
  const {mountLanLobby}=await load();
  const nodes=new Map();
  class Element extends EventTarget{
    constructor(){super();this.value='';this.textContent='';}
    focus(){} select(){}
  }
  const root={innerHTML:'',querySelector(sel){if(!nodes.has(sel))nodes.set(sel,new Element());return nodes.get(sel);}};
  let rejectGuest,guestClosed=0,hostClosed=0;
  const pendingGuest=new Promise((resolve,reject)=>{rejectGuest=reject;});
  const cleanup=mountLanLobby(root,{auto:false,build,cryptoSource:{getRandomValues(arr){arr.fill(8);return arr;}},
    peerFactory(hello){
      return {
        subscribeStatus(listener){listener({phase:'new',transport:'new',channel:'connecting',ready:false});return ()=>{};},
        acceptOffer(){return pendingGuest;},
        createOffer(){return Promise.resolve('new host offer');},
        dispose(){if(hello.role==='guest')guestClosed++;else hostClosed++;}
      };
    }
  });
  const click=id=>nodes.get('#'+id).dispatchEvent(new Event('click'));
  const flush=()=>new Promise(resolve=>setImmediate(resolve));
  click('lanGuest');nodes.get('#lanIncoming').value=offer();click('lanApply');await flush();
  click('lanHost');await flush();
  assert.equal(nodes.get('#lanOutgoing').value,'new host offer');
  rejectGuest(new Error('stale guest negotiation failed'));await flush();
  assert.equal(guestClosed,1);
  assert.equal(hostClosed,0,'old guest rejection must not close replacement host');
  assert.equal(nodes.get('#lanOutgoing').value,'new host offer');
  assert.match(nodes.get('#lanStatus').textContent,/Host offer ready/);
  cleanup();assert.equal(hostClosed,1);
});


test('LAN fallback switches from discovery to the same manual WebRTC lobby used by P2P',async()=>{
 const {mountLanLobby}=await load();
 const nodes=new Map();
 class Element extends EventTarget{
  constructor(){super();this.children=[];this.value='';this.textContent='';}
  append(...items){this.children.push(...items);for(const item of items)if(item.id)nodes.set('#'+item.id,item);}
  replaceChildren(){this.children=[];}
  focus(){} select(){}
 }
 const root={
  innerHTML:'',
  ownerDocument:{createElement(){return new Element();}},
  querySelector(sel){if(!nodes.has(sel))nodes.set(sel,new Element());return nodes.get(sel);}
 };
 let closeCount=0;
 const cleanup=mountLanLobby(root,{
  signalFactory(){return {send(){return false;},close(){closeCount++;},get ready(){return false;}};}
 });
 assert.match(root.innerHTML,/FIND GAMES/,'default LAN remains automatic');
 const manual=nodes.get('#lanManualFallback');
 assert.ok(manual,'a discoverable manual option must exist when automatic signaling is unavailable');
 manual.dispatchEvent(new Event('click'));
 assert.equal(closeCount,1,'switching modes must dispose discovery connection');
 assert.match(root.innerHTML,/CREATE HOST OFFER/,'LAN manual fallback uses common offer/answer workflow');
 assert.match(root.innerHTML,/APPLY INCOMING TEXT/);
 assert.match(root.innerHTML,/COPY OUTGOING TEXT/);
 cleanup();
 assert.equal(closeCount,1,'disposal must not try to close old discovery twice');
});

test('LAN automatic, LAN manual, and internet P2P remain wired to one live match engine',()=>{
 const root=path.resolve(__dirname,'..');
 const ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
 const lobby=fs.readFileSync(path.join(root,'src/modules/lan-lobby.js'),'utf8');
 const peer=fs.readFileSync(path.join(root,'src/modules/lan_peer_connection.js'),'utf8');
 assert.match(ui,/mountLanLobby\(\$\('lanLobby'\),\{onReady:startLanQuickMatch\}\)/);
 assert.match(ui,/mountLanLobby\(\$\('lanLobby'\),\{auto:false,internet:true,onReady:startLanQuickMatch\}\)/);
 assert.equal((ui.match(/createLanLiveMatch\(\{peer,role,game,input,field:ENGINE\.WORLD\.field\}\)/g)||[]).length,1,
  'all modes must share exactly one authoritative gameplay bridge');
 assert.match(lobby,/stop=mountLanLobby\(root,\{\.\.\.options,auto:false\}\)/,
  'LAN fallback must reuse manual connection implementation');
 assert.match(lobby,/createLanPeerConnection\(hello,\{internet\}\)/,
  'LAN manual and P2P must share transport factory');
 assert.match(peer,/options\.internet===true\?\[\{urls:'stun:/,
  'only internet P2P requests STUN; local peers do not need internet services');
});
