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

test('LAN-059 validates immutable visual states and rejects malformed effects',async()=>{
 const {encodeLanSnapshot,decodeLanSnapshot}=await load(),p=snapshot();
 const v={z:.48,face:-1,action:'doubleJump',timer:.4,anim:2.5,stun:0,slide:0,dive:0};
 const fx={id:'nuts',color:'#ffc15f',trail:'#ed763c',age:.3,vx:930,vy:-80};
 p.players[0].visual=v;p.ball.fx=fx;
 const got=decodeLanSnapshot(encodeLanSnapshot(p));
 assert.deepEqual(got.players[0].visual,v);assert.deepEqual(got.ball.fx,fx);
 assert.ok(Object.isFrozen(got.players[0].visual)&&Object.isFrozen(got.ball.fx));
 for(const bad of [{...v,action:'<script>'},{...v,z:Infinity},{...v,face:0},{...v,extra:1}])
  assert.throws(()=>encodeLanSnapshot({...p,players:[{slot:0,x:0,y:0,visual:bad}]}),TypeError);
 for(const bad of [{...fx,color:'red'},{...fx,trail:'url(x)'},{...fx,vx:Infinity},{...fx,extra:1}])
  assert.throws(()=>encodeLanSnapshot({...p,ball:{...p.ball,fx:bad}}),TypeError);
 assert.equal(decodeLanSnapshot(encodeLanSnapshot(snapshot())).ball.fx,undefined);
});

test('LAN-060 validates and freezes bounded Magic Trick ground traps',async()=>{
 const {encodeLanSnapshot,decodeLanSnapshot}=await load(),p=snapshot();
 const banana={kind:'banana',team:0,x:-.25,y:.5,life:2.7,arm:.1};
 const ice={kind:'ice',team:1,x:.25,y:-.5,life:1.8,arm:0};
 p.hazards=[banana,ice];
 const result=decodeLanSnapshot(encodeLanSnapshot(p));
 assert.deepEqual(result.hazards,[banana,ice]);
 assert.ok(Object.isFrozen(result.hazards)&&result.hazards.every(Object.isFrozen));
 assert.equal(decodeLanSnapshot(encodeLanSnapshot(snapshot())).hazards,undefined,
   'old position-only snapshots remain supported');
 for(const invalid of [
  {...banana,kind:'fire'}, {...banana,team:2},{...banana,x:1.1},
  {...banana,life:-1},{...banana,arm:.4},{...banana,extra:true}
 ])assert.throws(()=>encodeLanSnapshot({...p,hazards:[invalid]}),TypeError);
 assert.throws(()=>encodeLanSnapshot({...p,hazards:Array.from({length:25},()=>banana)}),TypeError);
 assert.throws(()=>encodeLanSnapshot({...p,hazards:'banana'}),TypeError);
 const all={...p,hazards:Array.from({length:24},(_,i)=>({...banana,team:i%2,x:i/24*2-1}))};
 assert.ok(Buffer.byteLength(encodeLanSnapshot(all))<=8192);
});


test('LAN-061 validates signed goalkeeper dive direction without breaking old visual snapshots',async()=>{
 const {encodeLanSnapshot,decodeLanSnapshot}=await load(),p=snapshot();
 const old={z:0,face:1,action:'keeperDive',timer:.42,anim:1,stun:0,slide:0,dive:.2};
 p.players[0].visual={...old,diveY:-.8};
 assert.equal(decodeLanSnapshot(encodeLanSnapshot(p)).players[0].visual.diveY,-.8);
 for(const invalid of [1.1,-1.1,Infinity,NaN,'left',null]){
  p.players[0].visual={...old,diveY:invalid};
  assert.throws(()=>encodeLanSnapshot(p),TypeError);
 }
 p.players[0].visual=old;
 assert.deepEqual(decodeLanSnapshot(encodeLanSnapshot(p)).players[0].visual,old,
   'existing 0.10.7.2/.3 visual packets remain accepted');
});
