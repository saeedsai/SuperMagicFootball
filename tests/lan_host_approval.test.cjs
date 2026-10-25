const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const load = () => import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
const roomId = 'room_12345678';
const join = (requestId, room = roomId) => ({ version: 1, type: 'join-request', roomId: room, requestId });

test('host queues requests until explicit acceptance or rejection', async () => {
  const { createLanHostApproval } = await load();
  const sent = [];
  const host = createLanHostApproval({ send: packet => sent.push(packet) });
  assert.equal(host.receive(join('request_12345678')), false);
  host.start(roomId);
  assert.equal(host.receive(join('request_12345678')), true);
  assert.deepEqual(host.pendingRequests(), ['request_12345678']);
  assert.equal(sent.length, 0);
  assert.equal(host.respond('request_12345678', false).type, 'join-reject');
  assert.deepEqual(host.pendingRequests(), []);
  assert.equal(host.receive(join('request_12345678')), false);
  assert.equal(host.receive(join('request_87654321')), true);
  assert.equal(host.respond('request_87654321', true).type, 'join-accept');
  assert.deepEqual(sent.map(packet => packet.type), ['join-reject', 'join-accept']);
});

test('rejects other rooms, malformed packets, duplicates and queue overflow', async () => {
  const { createLanHostApproval } = await load();
  const host = createLanHostApproval({ send() {}, maxPending: 2 });
  assert.throws(() => host.start('bad'), TypeError);
  host.start(roomId);
  assert.equal(host.receive(join('request_12345678', 'room_87654321')), false);
  assert.equal(host.receive({ ...join('request_12345678'), version: 2 }), false);
  assert.equal(host.receive(join('request_12345678')), true);
  assert.equal(host.receive(join('request_12345678')), false);
  assert.equal(host.receive(join('request_87654321')), true);
  assert.equal(host.receive(join('request_99999999')), false);
  assert.deepEqual(host.pendingRequests(), ['request_12345678', 'request_87654321']);
});

test('expires requests, frees capacity and resets when host changes room', async () => {
  const { createLanHostApproval } = await load();
  let time = 0;
  const host = createLanHostApproval({ send() {}, now: () => time, ttlMs: 1000, maxPending: 1 });
  host.start(roomId);
  assert.equal(host.receive(join('request_12345678')), true);
  time = 999;
  assert.deepEqual(host.pendingRequests(), ['request_12345678']);
  time = 1000;
  assert.deepEqual(host.pendingRequests(), []);
  assert.equal(host.respond('request_12345678', true), false);
  assert.equal(host.receive(join('request_87654321')), true);
  host.start('room_87654321');
  assert.deepEqual(host.pendingRequests(), []);
  assert.equal(host.receive(join('request_87654321')), false);
  host.stop();
  assert.equal(host.receive(join('request_12345678')), false);
  host.close();
  assert.deepEqual(host.pendingRequests(), []);
  assert.throws(() => host.respond('request_12345678', true), /closed/);
});

test('transport failure keeps pending decision retryable', async () => {
  const { createLanHostApproval } = await load();
  let offline = true;
  const host = createLanHostApproval({ send() { if (offline) throw new Error('offline'); } });
  host.start(roomId);
  host.receive(join('request_12345678'));
  assert.throws(() => host.respond('request_12345678', true), /offline/);
  assert.deepEqual(host.pendingRequests(), ['request_12345678']);
  offline = false;
  assert.equal(host.respond('request_12345678', true).type, 'join-accept');
  assert.equal(host.respond('request_12345678', true), false);
  assert.throws(() => host.respond('request_12345678', 'yes'), TypeError);
});
