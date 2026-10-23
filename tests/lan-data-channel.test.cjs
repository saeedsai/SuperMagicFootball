'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const load = name => import(pathToFileURL(path.resolve('src/modules', name)).href);
const buttons = () => ({pass:false,shoot:true,dribble:false,jump:false});

class FakeChannel {
  constructor() { this.readyState='connecting'; this.listeners=new Map(); this.peer=null; this.failSend=false; }
  addEventListener(name, fn) {
    if (!this.listeners.has(name)) this.listeners.set(name,new Set());
    this.listeners.get(name).add(fn);
  }
  removeEventListener(name, fn) { this.listeners.get(name)?.delete(fn); }
  emit(name, event={}) { for (const fn of [...(this.listeners.get(name)||[])]) fn(event); }
  send(data) {
    if (this.readyState!=='open' || this.failSend) throw new Error('channel unavailable');
    this.peer.emit('message',{data});
  }
  open() { this.readyState='open'; this.emit('open'); }
  close() { this.readyState='closed'; this.emit('close'); }
}
function pair() {
  const host=new FakeChannel(), guest=new FakeChannel();
  host.peer=guest;guest.peer=host;
  return {host,guest};
}

test('RTCDataChannel pair delivers hello and validated four-button guest input to host tick',async()=>{
  const {bindLanHostChannel,bindLanGuestChannel}=await load('lan-data-channel.js');
  const {createLanHostAdapter}=await load('lan-host-adapter.js');
  const {host,guest}=pair();
  const adapter=createLanHostAdapter('room001','host001',3);
  const binding=bindLanHostChannel(adapter,host);
  const client=bindLanGuestChannel(guest,'room001','guest01');
  host.open();guest.open();
  assert.equal(binding.peerId,'guest01');
  assert.equal(adapter.peerId,'guest01');
  assert.equal(client.helloSent,true);
  assert.equal(client.sendInput(buttons(),{x:1,y:1}),true);
  assert.equal(client.nextSequence,1);
  const tick=adapter.tick();
  assert.equal(tick.controls.buttons.shoot,true);
  assert.ok(Math.abs(Math.hypot(tick.controls.axis.x,tick.controls.axis.y)-1)<1e-12);
  assert.equal(client.leave(),true);
  assert.equal(adapter.peerId,null);
  assert.equal(adapter.tick().controls.buttons.shoot,false);
  binding.dispose();client.dispose();
});

test('bound channel cannot switch peer identity or accept malformed and replayed inputs',async()=>{
  const {bindLanHostChannel,bindLanGuestChannel}=await load('lan-data-channel.js');
  const {createLanHostAdapter}=await load('lan-host-adapter.js');
  const {encodeLanWirePacket}=await load('lan-wire.js');
  const {host,guest}=pair(), adapter=createLanHostAdapter('room001','host001');
  const binding=bindLanHostChannel(adapter,host);
  assert.throws(()=>bindLanHostChannel(adapter,host),/already has a bound channel/);
  const client=bindLanGuestChannel(guest,'room001','guest01');
  host.open();guest.open();
  const send=(type,peerId,sequence)=>guest.send(encodeLanWirePacket({
    type,version:1,roomId:'room001',peerId,
    ...(type==='input'?{sequence,buttons:buttons(),axis:{x:0,y:1}}:{})
  }));
  send('leave','guest02');
  send('hello','guest02');
  send('input','guest02',0);
  guest.send('{invalid');
  assert.equal(adapter.peerId,'guest01');
  assert.equal(client.sendInput(buttons(),{x:0,y:1}),true);
  send('input','guest01',0); // replay
  assert.equal(adapter.tick().controls.buttons.shoot,true);
  binding.dispose();client.dispose();
});

test('close/dispose clears retained input; stale channel cannot evict replacement',async()=>{
  const {bindLanHostChannel,bindLanGuestChannel}=await load('lan-data-channel.js');
  const {createLanHostAdapter}=await load('lan-host-adapter.js');
  const adapter=createLanHostAdapter('room001','host001',8);
  const first=pair();
  const binding=bindLanHostChannel(adapter,first.host);
  const client=bindLanGuestChannel(first.guest,'room001','guest01');
  first.host.open();first.guest.open();
  client.sendInput(buttons(),{x:1,y:0});
  first.host.close();first.guest.close();
  assert.equal(adapter.peerId,null);
  assert.equal(adapter.tick().controls.buttons.shoot,false);
  const replacement=pair();
  const second=bindLanHostChannel(adapter,replacement.host);
  const guest2=bindLanGuestChannel(replacement.guest,'room001','guest02');
  replacement.host.open();replacement.guest.open();
  assert.equal(adapter.peerId,'guest02');
  binding.dispose(); // old socket close must not affect new guest
  assert.equal(adapter.peerId,'guest02');
  guest2.sendInput(buttons(),{x:0,y:1});
  assert.equal(adapter.tick().controls.buttons.shoot,true);
  second.dispose();guest2.dispose();
});

test('send failure does not advance sequence and invalid controls are rejected',async()=>{
  const {bindLanHostChannel,bindLanGuestChannel}=await load('lan-data-channel.js');
  const {createLanHostAdapter}=await load('lan-host-adapter.js');
  const {host,guest}=pair(), adapter=createLanHostAdapter('room001','host001');
  const binding=bindLanHostChannel(adapter,host);
  const client=bindLanGuestChannel(guest,'room001','guest01');
  assert.equal(client.sendInput(buttons(),{x:0,y:0}),false);
  host.open();guest.open();
  assert.throws(()=>client.sendInput({...buttons(),jump:1},{x:0,y:0}),TypeError);
  guest.failSend=true;
  assert.equal(client.sendInput(buttons(),{x:0,y:0}),false);
  assert.equal(client.nextSequence,0);
  guest.failSend=false;
  assert.equal(client.sendInput(buttons(),{x:0,y:0}),true);
  assert.equal(client.nextSequence,1);
  client.dispose();
  assert.equal(adapter.peerId,null);
  assert.equal(client.sendInput(buttons(),{x:0,y:0}),false);
  binding.dispose();
});
