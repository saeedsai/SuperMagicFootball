'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=name=>import(pathToFileURL(path.resolve('src/modules',name)).href);
class FakeChannel {
 constructor(){this.readyState='connecting';this.listeners=new Map();this.peer=null;this.failSend=false;}
 addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
 removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
 emit(name,event={}){for(const fn of [...(this.listeners.get(name)||[])])fn(event);}
 send(data){if(this.readyState!=='open'||this.failSend)throw new Error('not open');this.peer.emit('message',{data});}
 open(){this.readyState='open';this.emit('open');}
 close(){this.readyState='closed';this.emit('close');}
}
const pair=()=>{const host=new FakeChannel(),guest=new FakeChannel();host.peer=guest;guest.peer=host;return {host,guest};};
const packet=(tick,overrides={})=>({type:'snapshot',version:1,roomId:'room001',hostId:'host001',tick,clockMs:45000,
 scores:{home:2,away:1},ball:{x:0.2,y:-0.4,z:0},players:[{slot:0,x:-1,y:1},{slot:21,x:1,y:-1}],...overrides});
test('two RTC channels deliver ordered host snapshots to guest only after join',async()=>{
 const {bindLanSnapshotHostChannel,bindLanSnapshotGuestChannel}=await load('lan-snapshot-channel.js');
 const {host,guest}=pair(),session={peerId:null},received=[];
 const sender=bindLanSnapshotHostChannel(session,host,'room001','host001');
 const receiver=bindLanSnapshotGuestChannel(guest,'room001','host001',s=>received.push(s));
 assert.equal(sender.send(packet(0)),false);host.open();guest.open();
 assert.equal(sender.send(packet(0)),false);session.peerId='guest01';
 assert.equal(sender.send(packet(0)),true);
 assert.equal(sender.send(packet(0)),false);
 assert.equal(sender.send(packet(1)),true);
 assert.deepEqual(received.map(s=>s.tick),[0,1]);
 assert.equal(receiver.lastTick,1);assert.equal(sender.lastTick,1);
 assert.ok(Object.isFrozen(received[0])&&Object.isFrozen(received[0].players[0]));
 session.peerId=null;assert.equal(sender.send(packet(2)),false);
 receiver.dispose();sender.dispose();
});
test('receiver drops malformed, foreign-host and replayed packets and resumes from a checkpoint',async()=>{
 const {bindLanSnapshotGuestChannel}=await load('lan-snapshot-channel.js');
 const {encodeLanSnapshot}=await load('lan-state-snapshot.js');
 const {host,guest}=pair(),received=[];host.open();guest.open();
 const receiver=bindLanSnapshotGuestChannel(guest,'room001','host001',s=>received.push(s.tick),4);
 assert.throws(()=>bindLanSnapshotGuestChannel(guest,'room001','host001',()=>{}),/already bound/);
 host.send('{bad');host.send(encodeLanSnapshot(packet(5,{hostId:'host002'})));
 host.send(encodeLanSnapshot(packet(4)));
 host.send(encodeLanSnapshot(packet(5)));
 host.send(encodeLanSnapshot(packet(5)));
 host.send(encodeLanSnapshot(packet(6,{roomId:'room002'})));
 assert.deepEqual(received,[5]);assert.equal(receiver.lastTick,5);
 guest.close();host.send(encodeLanSnapshot(packet(6)));
 assert.deepEqual(received,[5]);
 const replacement=bindLanSnapshotGuestChannel(guest,'room001','host001',s=>received.push(s.tick),receiver.lastTick);
 guest.open();host.send(encodeLanSnapshot(packet(5)));host.send(encodeLanSnapshot(packet(6)));
 assert.deepEqual(received,[5,6]);replacement.dispose();
});
test('host refuses foreign identity, bad payload, stale tick and failed sends without advancing',async()=>{
 const {bindLanSnapshotHostChannel}=await load('lan-snapshot-channel.js');
 const {host,guest}=pair(),session={peerId:'guest01'};
 const sender=bindLanSnapshotHostChannel(session,host,'room001','host001');
 assert.throws(()=>bindLanSnapshotHostChannel(session,host,'room001','host001'),/already bound/);
 host.open();guest.open();
 assert.throws(()=>sender.send(packet(1,{hostId:'host002'})),TypeError);
 assert.throws(()=>sender.send(packet(1,{players:[{slot:22,x:0,y:0}]})),TypeError);
 host.failSend=true;assert.equal(sender.send(packet(1)),false);assert.equal(sender.lastTick,-1);
 host.failSend=false;assert.equal(sender.send(packet(1)),true);assert.equal(sender.send(packet(0)),false);
 host.close();assert.equal(sender.send(packet(2)),false);
});
test('throwing snapshot consumer does not advance receiver cursor or crash channel',async()=>{
 const {bindLanSnapshotGuestChannel}=await load('lan-snapshot-channel.js');
 const {encodeLanSnapshot}=await load('lan-state-snapshot.js');
 const {host,guest}=pair();host.open();guest.open();let fail=true,count=0;
 const receiver=bindLanSnapshotGuestChannel(guest,'room001','host001',()=>{count++;if(fail)throw Error('not ready');});
 host.send(encodeLanSnapshot(packet(2)));assert.equal(receiver.lastTick,-1);
 fail=false;host.send(encodeLanSnapshot(packet(2)));assert.equal(receiver.lastTick,2);assert.equal(count,2);
 receiver.dispose();
});

test('LAN-037 abort stops guest snapshots and releases channel for a new receiver',async()=>{
 const {bindLanSnapshotGuestChannel}=await load('lan-snapshot-channel.js');
 const {encodeLanSnapshot}=await load('lan-state-snapshot.js');
 const {host,guest}=pair(),received=[];
 host.open();guest.open();
 const controller=new AbortController();
 const receiver=bindLanSnapshotGuestChannel(guest,'room001','host001',s=>received.push(s.tick),-1,controller.signal);
 host.send(encodeLanSnapshot(packet(0)));
 assert.deepEqual(received,[0]);
 controller.abort();
 host.send(encodeLanSnapshot(packet(1)));
 assert.deepEqual(received,[0]);
 assert.equal(receiver.lastTick,0);
 const resumed=bindLanSnapshotGuestChannel(guest,'room001','host001',s=>received.push(s.tick),receiver.lastTick);
 host.send(encodeLanSnapshot(packet(1)));
 assert.deepEqual(received,[0,1]);
 resumed.dispose();
});
test('LAN-037 pre-aborted guest signal never binds or consumes a snapshot',async()=>{
 const {bindLanSnapshotGuestChannel}=await load('lan-snapshot-channel.js');
 const {encodeLanSnapshot}=await load('lan-state-snapshot.js');
 const {host,guest}=pair(),received=[];
 host.open();guest.open();
 const controller=new AbortController();
 controller.abort();
 const stopped=bindLanSnapshotGuestChannel(guest,'room001','host001',s=>received.push(s.tick),-1,controller.signal);
 host.send(encodeLanSnapshot(packet(0)));
 assert.deepEqual(received,[]);
 assert.equal(stopped.lastTick,-1);
 assert.throws(()=>bindLanSnapshotGuestChannel(guest,'room001','host001',()=>{},-1,{}),/Invalid LAN snapshot guest binding/);
 const active=bindLanSnapshotGuestChannel(guest,'room001','host001',s=>received.push(s.tick));
 host.send(encodeLanSnapshot(packet(0)));
 assert.deepEqual(received,[0]);
 active.dispose();
});
