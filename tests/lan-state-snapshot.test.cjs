'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const load = () => import(pathToFileURL(path.resolve('src/modules/lan-state-snapshot.js')).href);
const snapshot = () => ({type:'snapshot',version:1,roomId:'room001',hostId:'host001',tick:12,
  clockMs:45000,scores:{home:2,away:1},ball:{x:0.5,y:-0.25,z:0.1},
  players:[{slot:0,x:-1,y:1},{slot:21,x:1,y:-1}]});

test('LAN host snapshot round trips as immutable normalized game state',async()=>{
  const {encodeLanSnapshot,decodeLanSnapshot,MAX_SNAPSHOT_BYTES} = await load();
  const packet=snapshot();
  const wire=encodeLanSnapshot(packet);
  assert.ok(Buffer.byteLength(wire)<=MAX_SNAPSHOT_BYTES);
  packet.players[0].x=0;
  const decoded=decodeLanSnapshot(wire);
  assert.equal(decoded.players[0].x,-1);
  assert.ok(Object.isFrozen(decoded) && Object.isFrozen(decoded.ball) &&
    Object.isFrozen(decoded.scores) && Object.isFrozen(decoded.players) &&
    Object.isFrozen(decoded.players[0]));
});

test('LAN guest rejects stale, replayed and foreign-room or foreign-host snapshots',async()=>{
  const {acceptLanSnapshot,decodeLanSnapshot,encodeLanSnapshot}=await load();
  const packet=decodeLanSnapshot(encodeLanSnapshot(snapshot()));
  const accepted=acceptLanSnapshot(-1,packet,'room001','host001');
  assert.equal(accepted.accepted,true);assert.equal(accepted.lastTick,12);
  assert.equal(acceptLanSnapshot(accepted.lastTick,packet,'room001','host001').reason,'stale-tick');
  assert.equal(acceptLanSnapshot(13,packet,'room001','host001').reason,'stale-tick');
  assert.equal(acceptLanSnapshot(-1,packet,'room002','host001').reason,'wrong-session');
  assert.equal(acceptLanSnapshot(-1,packet,'room001','host002').reason,'wrong-session');
});

test('LAN snapshot rejects extra fields, duplicate slots, nonfinite coordinates and unsafe ticks',async()=>{
  const {encodeLanSnapshot,decodeLanSnapshot,acceptLanSnapshot,MAX_SNAPSHOT_BYTES}=await load();
  const base=snapshot();
  const invalid=[{...base,magic:true},{...base,tick:1.5},{...base,tick:Number.MAX_SAFE_INTEGER+1},
    {...base,clockMs:-1},{...base,scores:{home:1000,away:1}},
    {...base,ball:{x:Infinity,y:0,z:0}},{...base,ball:{x:0,y:0,z:-1}},
    {...base,players:[{slot:0,x:0,y:0},{slot:0,x:0,y:0}]},
    {...base,players:[{slot:22,x:0,y:0}]},
    {...base,players:[{slot:0,x:1.1,y:0}]},
    {...base,players:Array.from({length:23},(_,slot)=>({slot,x:0,y:0}))}];
  for(const bad of invalid)assert.throws(()=>encodeLanSnapshot(bad),TypeError);
  for(const bad of ['{','null','[]','"snapshot"',' '.repeat(MAX_SNAPSHOT_BYTES+1)])
    assert.throws(()=>decodeLanSnapshot(bad),TypeError);
  assert.throws(()=>decodeLanSnapshot(new Uint8Array([123,125])),TypeError);
  assert.throws(()=>acceptLanSnapshot(-2,base,'room001','host001'),TypeError);
});
