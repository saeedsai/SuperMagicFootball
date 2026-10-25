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
  assert.deepEqual(sent.map(packet => packet.type), ['room-announce', 'room-announce', 'room-remove']);
  assert.equal(sent[2].roomId, 'room_12345678');
  host.close();
  host.close();
  assert.equal(sent.length, 4);
  assert.equal(sent[3].type, 'room-remove');
  assert.equal(sent[3].roomId, 'room_87654321');
});

test('close completes when signaling transport fails', async () => {
  const { createLanDiscoveryController } = await load();
  let fail = false;
  const host = createLanDiscoveryController({ send: () => { if (fail) throw new Error('offline'); } });
  host.host('room_12345678', 'Match');
  fail = true;
  assert.doesNotThrow(() => host.close());
  assert.deepEqual(host.rooms(), []);
  assert.throws(() => host.heartbeat(), /closed/);
});

test('stopHosting clears local state when transport disconnects', async () => {
  const { createLanDiscoveryController } = await load();
  let offline = false;
  const sent = [];
  const host = createLanDiscoveryController({ send: packet => {
    if (offline) throw new Error('offline');
    sent.push(packet);
  } });
  host.host('room_12345678', 'Match');
  offline = true;
  assert.equal(host.stopHosting(), true);
  assert.equal(host.heartbeat(), false);
  assert.equal(host.stopHosting(), false);
  offline = false;
  host.host('room_87654321', 'New match');
  assert.deepEqual(sent.map(packet => packet.type), ['room-announce', 'room-announce']);
});

test('host occupancy changes are announced to guests and retained in heartbeats', async () => {
  const { createLanDiscoveryController } = await load();
  const guest = createLanDiscoveryController({ send() {} });
  const sent = [];
  const host = createLanDiscoveryController({ send: packet => {
    sent.push(packet);
    guest.receive(packet);
  }});
  assert.equal(host.setPlayers(2), false);
  host.host(roomId, 'Football');
  assert.equal(guest.rooms()[0].players, 1);
  assert.equal(host.setPlayers(2), true);
  assert.equal(guest.rooms()[0].players, 2);
  assert.equal(host.setPlayers(2), false);
  assert.equal(sent.length, 2);
  assert.equal(host.heartbeat(), true);
  assert.equal(sent.at(-1).players, 2);
  assert.equal(host.setPlayers(1), true);
  assert.equal(guest.rooms()[0].players, 1);
  assert.throws(() => host.setPlayers(3), TypeError);
  assert.throws(() => host.setPlayers(1.5), TypeError);
  assert.equal(guest.rooms()[0].players, 1);
  host.stopHosting();
  assert.deepEqual(guest.rooms(), []);
});

test('failed occupancy announcement does not change host state', async () => {
  const { createLanDiscoveryController } = await load();
  let fail = false;
  const sent = [];
  const host = createLanDiscoveryController({ send: packet => {
    if (fail) throw new Error('offline');
    sent.push(packet);
  }});
  host.host(roomId, 'Match');
  fail = true;
  assert.throws(() => host.setPlayers(2), /offline/);
  fail = false;
  assert.equal(host.heartbeat(), true);
  assert.equal(sent.at(-1).players, 1);
  fail = true;
  assert.doesNotThrow(() => host.stopHosting());
  assert.equal(host.heartbeat(), false);
  assert.equal(host.stopHosting(), false);
});
