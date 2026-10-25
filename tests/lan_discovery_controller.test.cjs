const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const load = () => import(pathToFileURL(path.resolve('src/modules/lan-discovery-controller.js')).href);
const roomId = 'room_12345678';
test('host announces, heartbeats and removes room', async () => {
  const { createLanDiscoveryController } = await load();
  const sent = [];
  const host = createLanDiscoveryController({ send: packet => sent.push(packet) });
  assert.equal(host.heartbeat(), false);
  host.host(roomId, 'Football');
  assert.equal(host.heartbeat(), true);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].type, 'room-announce');
  assert.equal(host.stopHosting(), true);
  assert.equal(sent[2].type, 'room-remove');
  assert.equal(host.stopHosting(), false);
});
test('guest receives and expires rooms; closed controller is inert', async () => {
  const { createLanDiscoveryController } = await load();
  let time = 0;
  const guest = createLanDiscoveryController({ send() {}, now: () => time, ttlMs: 1000 });
  assert.equal(guest.receive({ version: 1, type: 'room-announce', roomId, name: 'Match', players: 1 }), true);
  assert.equal(guest.rooms().length, 1);
  time = 1000;
  assert.equal(guest.rooms().length, 0);
  guest.close();
  assert.equal(guest.receive({ version: 1, type: 'room-remove', roomId }), false);
  assert.deepEqual(guest.rooms(), []);
  assert.throws(() => guest.host(roomId, 'Match'), /closed/);
});

test('switching host rooms withdraws old listing; close withdraws active listing once', async () => {
  const { createLanDiscoveryController } = await load();
  const sent = [];
  const host = createLanDiscoveryController({ send: packet => sent.push(packet) });
  host.host('room_12345678', 'First');
  host.host('room_87654321', 'Second');
  assert.deepEqual(sent.map(packet => packet.type), ['room-announce', 'room-remove', 'room-announce']);
  assert.equal(sent[1].roomId, 'room_12345678');
  host.close();
  host.close();
  assert.equal(sent.length, 4);
  assert.equal(sent[3].type, 'room-remove');
  assert.equal(sent[3].roomId, 'room_87654321');
});
