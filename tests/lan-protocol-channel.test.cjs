'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../src/modules/lan-protocol-channel.js');
const hello = {protocol:1,type:'hello',session:'room_1234567890',sequence:0,role:'host',build:'0.9.39.0'};
const guestHello = {...hello,role:'guest'};

class FakeChannel {
  constructor() {
    this.readyState='connecting'; this.listeners=new Map(); this.peer=null; this.failSend=false;
  }
  addEventListener(name,fn) {
    if (!this.listeners.has(name)) this.listeners.set(name,new Set());
    this.listeners.get(name).add(fn);
  }
  removeEventListener(name,fn) { this.listeners.get(name)?.delete(fn); }
  emit(name,event={}) { for (const fn of [...(this.listeners.get(name)||[])]) fn(event); }
  send(data) {
    if (this.readyState!=='open' || this.failSend) throw new Error('channel unavailable');
    this.peer.emit('message',{data});
  }
  open() { this.readyState='open'; this.emit('open'); }
  close() { this.readyState='closed'; this.emit('close'); }
}
function pair() {
  const host=new FakeChannel(), guest=new FakeChannel();
  host.peer=guest; guest.peer=host; return {host,guest};
}

test('LAN-013 bound channels exchange hello and host consumes guest input once',async()=>{
  const {bindLanProtocolChannel}=await load(),{host,guest}=pair();
  const H=bindLanProtocolChannel(hello,host),G=bindLanProtocolChannel(guestHello,guest);
  assert.equal(H.ready,false); assert.equal(G.ready,false);
  host.open();guest.open();
  assert.equal(H.ready,true); assert.equal(G.ready,true);
  assert.deepEqual(H.advance(0),{input:{frame:0,buttons:[],dx:0,dy:0},received:false});
  assert.equal(G.sendInput(2,['pass','jump'],1,0).sequence,1);
  assert.deepEqual(H.advance(2),{input:{frame:2,buttons:['pass','jump'],dx:1,dy:0},received:true});
  assert.equal(H.state.queue.pending.length,0);
  assert.throws(()=>H.advance(2),/must advance/);
  assert.throws(()=>H.sendInput(3,['shoot']),/not ready/);
  assert.throws(()=>G.advance(3),/not ready/);
  H.dispose();G.dispose();
});

test('LAN-013 recovers hello when either endpoint binds after channel is open',async()=>{
  const {bindLanProtocolChannel}=await load();
  for(const lateRole of ['host','guest']){
    const {host,guest}=pair();host.open();guest.open();
    let H,G;
    if(lateRole==='guest'){
      H=bindLanProtocolChannel(hello,host);
      assert.equal(H.ready,false);
      G=bindLanProtocolChannel(guestHello,guest);
    }else{
      G=bindLanProtocolChannel(guestHello,guest);
      assert.equal(G.ready,false);
      H=bindLanProtocolChannel(hello,host);
    }
    assert.equal(H.ready,true);assert.equal(G.ready,true);
    assert.equal(Object.isFrozen(H.state),true);
    assert.throws(()=>bindLanProtocolChannel(hello,host),/already bound/);
    H.dispose();G.dispose();
  }
});

test('LAN-013 malformed, wrong-build and out-of-window traffic never advances host',async()=>{
  const {bindLanProtocolChannel}=await load(),{host,guest}=pair();
  host.open();guest.open();
  const H=bindLanProtocolChannel(hello,host);
  guest.send('{broken');
  const {serializeLanPacket}=await import('../src/modules/lan_protocol.js');
  guest.send(serializeLanPacket({...guestHello,build:'0.9.40.0'}));
  assert.equal(H.ready,false);
  const G=bindLanProtocolChannel(guestHello,guest);
  assert.equal(H.ready,true);assert.equal(G.ready,true);
  assert.equal(G.sendInput(20,['pass'],1,0).sequence,1);
  assert.equal(H.state.queue.pending.length,0);
  assert.equal(H.state.peer.lastSequence,0);
  assert.equal(H.advance(0).received,false);
  guest.send('{broken');
  assert.equal(H.ready,true);
  H.dispose();G.dispose();
});

test('LAN-013 send failure retains guest sequence; close/dispose removes listeners',async()=>{
  const {bindLanProtocolChannel}=await load(),{host,guest}=pair();
  host.open();guest.open();
  const H=bindLanProtocolChannel(hello,host),G=bindLanProtocolChannel(guestHello,guest);
  guest.failSend=true;
  assert.throws(()=>G.sendInput(2,['shoot']),/channel unavailable/);
  assert.equal(G.state.sender.lastSequence,0);
  guest.failSend=false;
  assert.equal(G.sendInput(2,['shoot']).sequence,1);
  assert.equal(H.advance(2).received,true);
  guest.close();
  assert.equal(G.disposed,true);assert.equal(G.ready,false);
  assert.throws(()=>G.sendInput(3,['pass']),/not ready/);
  host.close();
  assert.equal(H.disposed,true);
  assert.equal(host.listeners.get('message').size,0);
});
