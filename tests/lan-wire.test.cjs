'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const load = name => import(pathToFileURL(path.resolve('src/modules', name)).href);
const buttons = () => ({pass:false, shoot:true, dribble:false, jump:false});
const guest = () => ({type:'input', version:1, roomId:'room001', peerId:'guest01',
  sequence:0, buttons:buttons(), axis:{x:1, y:1}});

test('LAN wire hello/leave and four-button input round-trip with host validation', async () => {
  const {encodeLanWirePacket, decodeLanWirePacket, LAN_MAX_WIRE_BYTES} = await load('lan-wire.js');
  const {createLanHostState, acceptLanPacket} = await load('lan-session.js');
  const hello = {type:'hello',version:1,roomId:'room001',peerId:'guest01'};
  let host = acceptLanPacket(createLanHostState('room001','host001'),
    decodeLanWirePacket(encodeLanWirePacket(hello)));
  assert.equal(host.reason,'joined');
  const wire = encodeLanWirePacket(guest());
  assert.ok(Buffer.byteLength(wire) <= LAN_MAX_WIRE_BYTES);
  const decoded = decodeLanWirePacket(wire);
  assert.equal(Object.isFrozen(decoded),true);
  assert.equal(Object.isFrozen(decoded.buttons),true);
  assert.equal(Object.isFrozen(decoded.axis),true);
  const input = acceptLanPacket(host.state,decoded);
  assert.equal(input.accepted,true);
  assert.ok(Math.abs(Math.hypot(input.input.axis.x,input.input.axis.y)-1)<1e-12);
  host = input;
  const leave = decodeLanWirePacket(encodeLanWirePacket({...hello,type:'leave'}));
  assert.equal(acceptLanPacket(host.state,leave).reason,'left');
});

test('LAN wire rejects unknown fields, malformed JSON, unsupported protocol and invalid control shapes', async () => {
  const {encodeLanWirePacket,decodeLanWirePacket} = await load('lan-wire.js');
  const cases = [
    {...guest(), extra:true},
    {...guest(), version:2},
    {...guest(), roomId:undefined},
    {...guest(), peerId:123456},
    {...guest(), sequence:-1},
    {...guest(), sequence:1.5},
    {...guest(), buttons:{...buttons(), sprint:true}},
    {...guest(), buttons:{...buttons(), pass:1}},
    {...guest(), axis:{x:Infinity,y:0}},
    {...guest(), axis:{x:1.1,y:0}},
    {...guest(), axis:{x:0,y:0,z:0}},
    {type:'hello',version:1,roomId:'room001',peerId:'guest01',sequence:0},
    {type:'unknown',version:1,roomId:'room001',peerId:'guest01'},
  ];
  for (const invalid of cases) assert.throws(() => encodeLanWirePacket(invalid),TypeError);
  for (const invalid of ['{','null','[]','"hello"','{"type":"hello"}']) {
    assert.throws(() => decodeLanWirePacket(invalid),TypeError);
  }
});

test('LAN wire enforces UTF-8 byte cap and avoids mutation of caller controls', async () => {
  const {encodeLanWirePacket,decodeLanWirePacket,LAN_MAX_WIRE_BYTES} = await load('lan-wire.js');
  const input = guest();
  const wire = encodeLanWirePacket(input);
  input.buttons.shoot = false;
  input.axis.x = 0;
  const result = decodeLanWirePacket(wire);
  assert.equal(result.buttons.shoot,true);
  assert.equal(result.axis.x,1);
  assert.throws(() => decodeLanWirePacket(' '.repeat(LAN_MAX_WIRE_BYTES + 1)),TypeError);
  assert.throws(() => decodeLanWirePacket('é'.repeat(LAN_MAX_WIRE_BYTES)),TypeError);
  assert.throws(() => decodeLanWirePacket(new Uint8Array([123,125])),TypeError);
});
