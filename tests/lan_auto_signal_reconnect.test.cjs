const {test}=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../src/modules/lan-auto-signal.js');
class FakeSocket extends EventTarget{
 static instances=[];
 constructor(url){super();this.url=url;this.readyState=0;this.sent=[];FakeSocket.instances.push(this)}
 open(){this.readyState=1;this.dispatchEvent(new Event('open'))}
 send(value){if(this.readyState!==1)throw Error('closed');this.sent.push(value)}
 close(){this.readyState=3;this.dispatchEvent(new Event('close'))}
 message(data){const event=new Event('message');event.data=data;this.dispatchEvent(event)}
}
function fixture(){
 FakeSocket.instances=[];
 globalThis.location={protocol:'http:',host:'192.168.1.20:8000'};
 const callbacks=[],connectTimers=[],states=[],packets=[];
 const clientFactory=()=>load().then(({connectLanSignal})=>connectLanSignal({
  WebSocketImpl:FakeSocket,onState:s=>states.push(s),onEvent:p=>packets.push(p),
  setTimeoutImpl:(fn,delay)=>{const item={fn,delay,cancelled:false};(delay>10000?connectTimers:callbacks).push(item);return item},
  clearTimeoutImpl:item=>{item.cancelled=true}
 }));
 return {callbacks,connectTimers,states,packets,clientFactory};
}
test('same-origin discovery reconnects, re-admits messages, and does not accept stale socket events',async()=>{
 const f=fixture(),client=await f.clientFactory(),first=FakeSocket.instances[0];
 assert.equal(first.url,'ws://192.168.1.20:8000/lan-signal');
 assert.equal(client.send({type:'rooms'}),false);
 first.open();
 assert.equal(client.ready,true);assert.equal(client.send({type:'rooms'}),true);
 assert.deepEqual(JSON.parse(first.sent[0]),{type:'rooms'});
 first.message(JSON.stringify({type:'room-announce',roomId:'room_12345678'}));
 first.message('bad-json');first.message('x'.repeat(210001));
 assert.deepEqual(f.packets.map(p=>p.type),['room-announce']);
 first.close();assert.equal(client.ready,false);
 assert.equal(f.callbacks.length,1);
 assert.equal(f.callbacks[0].delay,1000);
 f.callbacks[0].fn();
 const second=FakeSocket.instances[1];second.open();
 first.message(JSON.stringify({type:'host-left'}));
 second.message(JSON.stringify({type:'welcome'}));
 assert.deepEqual(f.packets.map(p=>p.type),['room-announce','welcome']);
 assert.deepEqual(f.states,['connected','disconnected','connected']);
 client.close();assert.equal(second.readyState,3);
});
test('closing an offline lobby cancels pending retry and prevents reconnect',async()=>{
 const f=fixture(),client=await f.clientFactory();
 FakeSocket.instances[0].close();
 assert.equal(f.callbacks.length,1);
 client.close();assert.equal(f.callbacks[0].cancelled,true);
 f.callbacks[0].fn();assert.equal(FakeSocket.instances.length,1);
 assert.equal(client.send({type:'rooms'}),false);
});

test('outbound signaling rejects malformed and oversized UTF-8 frames',async()=>{
 const f=fixture(),client=await f.clientFactory(),socket=FakeSocket.instances[0];socket.open();
 for(const bad of [null,[],42,{roomId:'missing-type'},{type:3},{type:'offer',sdp:'😀'.repeat(60000)}])
  assert.equal(client.send(bad),false);
 const circular={type:'rooms'};circular.self=circular;
 assert.equal(client.send(circular),false);
 assert.equal(socket.sent.length,0);
 assert.equal(client.send({type:'rooms'}),true);
 assert.equal(socket.sent.length,1);
 client.close();
});
test('outbound signaling queue limit closes a stalled socket and reconnects',async()=>{
 const f=fixture(),client=await f.clientFactory(),first=FakeSocket.instances[0];first.open();
 const packet={type:'offer',sdp:'😀'.repeat(300)};
 const bytes=new TextEncoder().encode(JSON.stringify(packet)).byteLength;
 first.bufferedAmount=512*1024-bytes;
 assert.equal(client.send(packet),true,'exact queue budget is allowed');
 first.bufferedAmount++;
 assert.equal(client.send(packet),false,'one byte over budget is rejected');
 assert.equal(first.sent.length,1);
 assert.equal(first.readyState,3);
 assert.equal(client.ready,false);
 assert.equal(f.callbacks.length,1);
 f.callbacks[0].fn();
 const second=FakeSocket.instances[1];second.open();
 assert.equal(client.send({type:'rooms'}),true);
 assert.deepEqual(JSON.parse(second.sent[0]),{type:'rooms'});
 client.close();
});

test('inbound signaling bounds UTF-8 bytes, not just UTF-16 string length',async()=>{
 const f=fixture(),client=await f.clientFactory(),socket=FakeSocket.instances[0];socket.open();
 const valid=JSON.stringify({type:'notice',message:'😀'.repeat(50000)});
 const oversized=JSON.stringify({type:'notice',message:'😀'.repeat(60000)});
 assert.ok(valid.length<210000&&new TextEncoder().encode(valid).byteLength<210000);
 assert.ok(oversized.length<210000&&new TextEncoder().encode(oversized).byteLength>210000);
 socket.message(valid);socket.message(oversized);
 assert.equal(f.packets.length,1,'reject oversized Unicode payload before event dispatch');
 assert.equal(f.packets[0].message.length,100000);
 socket.message(JSON.stringify({type:'rooms-snapshot',rooms:[]}));
 assert.deepEqual(f.packets.map(p=>p.type),['notice','rooms-snapshot'],'subsequent valid frames still work');
 client.close();
});

test('failed WebSocket send reconnects even if close throws and stale events arrive',async()=>{
 const f=fixture(),client=await f.clientFactory(),first=FakeSocket.instances[0];first.open();
 first.send=()=>{throw Error('write failed')};
 first.close=()=>{throw Error('close failed')};
 assert.equal(client.send({type:'rooms'}),false);
 assert.equal(client.ready,false);
 assert.deepEqual(f.states,['connected','disconnected']);
 assert.equal(f.callbacks.length,1);
 first.message(JSON.stringify({type:'stale'}));
 assert.deepEqual(f.packets,[]);
 f.callbacks[0].fn();
 const second=FakeSocket.instances[1];second.open();
 assert.equal(client.send({type:'rooms'}),true);
 assert.deepEqual(JSON.parse(second.sent[0]),{type:'rooms'});
 client.close();
});
test('queue overflow retries when WebSocket close itself throws',async()=>{
 const f=fixture(),client=await f.clientFactory(),first=FakeSocket.instances[0];first.open();
 first.bufferedAmount=512*1024;
 first.close=()=>{throw Error('close failed')};
 assert.equal(client.send({type:'rooms'}),false);
 assert.equal(client.ready,false);
 assert.equal(f.callbacks.length,1);
 f.callbacks[0].fn();
 const second=FakeSocket.instances[1];second.open();
 assert.equal(client.send({type:'rooms'}),true);
 client.close();
});

test('WebSocket error without close event retires the connection and retries',async()=>{
 const f=fixture(),client=await f.clientFactory(),first=FakeSocket.instances[0];first.open();
 first.close=()=>{throw Error('transport close failed')};
 first.dispatchEvent(new Event('error'));
 assert.equal(client.ready,false,'failed socket is retired immediately');
 assert.deepEqual(f.states,['connected','error','disconnected']);
 assert.equal(f.callbacks.length,1,'a retry is scheduled even without close');
 first.message(JSON.stringify({type:'stale'}));
 first.dispatchEvent(new Event('close'));
 assert.deepEqual(f.packets,[],'old socket messages are ignored');
 assert.equal(f.callbacks.length,1,'stale close does not schedule a second retry');
 f.callbacks[0].fn();
 const second=FakeSocket.instances[1];second.open();
 assert.equal(client.send({type:'rooms'}),true);
 assert.deepEqual(JSON.parse(second.sent[0]),{type:'rooms'});
 client.close();
});
test('lobby shutdown tolerates WebSocket close exceptions and ignores stale events',async()=>{
 const f=fixture(),client=await f.clientFactory(),first=FakeSocket.instances[0];first.open();
 first.close=()=>{throw Error('shutdown close failed')};
 assert.doesNotThrow(()=>client.close());
 assert.equal(client.ready,false);
 first.message(JSON.stringify({type:'late'}));
 first.dispatchEvent(new Event('error'));
 assert.deepEqual(f.packets,[]);
 assert.equal(f.callbacks.length,0,'explicit close never schedules reconnect');
 assert.equal(client.send({type:'rooms'}),false);
});


test('connecting WebSocket timeout recovers LAN/P2P discovery when no open or close arrives',async()=>{
 const f=fixture(),client=await f.clientFactory(),first=FakeSocket.instances[0];
 assert.equal(f.connectTimers.length,1);
 assert.equal(f.connectTimers[0].delay,12000);
 f.connectTimers[0].fn();
 assert.equal(client.ready,false);
 assert.deepEqual(f.states,['disconnected']);
 assert.equal(f.callbacks.length,1,'a retry is scheduled after connection timeout');
 first.open();first.message(JSON.stringify({type:'stale'}));
 assert.deepEqual(f.packets,[],'timed-out socket cannot revive discovery');
 f.callbacks[0].fn();
 const second=FakeSocket.instances[1];second.open();
 assert.equal(client.ready,true);
 assert.equal(client.send({type:'rooms'}),true);
 assert.deepEqual(JSON.parse(second.sent[0]),{type:'rooms'});
 client.close();
});
test('successful connection cancels watchdog and stale timer cannot recycle live socket',async()=>{
 const f=fixture(),client=await f.clientFactory(),socket=FakeSocket.instances[0];
 socket.open();
 assert.equal(f.connectTimers[0].cancelled,true);
 f.connectTimers[0].fn();
 assert.equal(client.ready,true);
 assert.deepEqual(f.states,['connected']);
 assert.equal(f.callbacks.length,0);
 client.close();
});
test('leaving a lobby while connecting cancels watchdog and prevents retry',async()=>{
 const f=fixture(),client=await f.clientFactory(),socket=FakeSocket.instances[0];
 client.close();
 assert.equal(f.connectTimers[0].cancelled,true);
 f.connectTimers[0].fn();
 socket.open();
 assert.equal(client.ready,false);
 assert.equal(f.callbacks.length,0);
 assert.equal(FakeSocket.instances.length,1);
});
