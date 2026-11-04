const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const load = () => import(pathToFileURL(path.resolve('src/modules/lan-host-approval.js')).href);
const roomId = 'room_12345678';
const join = requestId => ({ version: 1, type: 'join-request', roomId, requestId });

test('LAN-095 host replay memory has a combined admission bound and recovers after TTL', async () => {
  const { createLanHostApproval } = await load();
  let now = 0;
  const host = createLanHostApproval({ send() {}, now: () => now, ttlMs: 1000, maxPending: 2, maxRemembered: 2 });
  host.start(roomId);

  assert.equal(host.receive(join('request_00000001')), true);
  assert.equal(host.receive(join('request_00000002')), true);
  assert.equal(host.respond('request_00000001', true).type, 'join-accept');
  // One replay-protected decision plus one pending prompt exhausts the bound.
  assert.equal(host.receive(join('request_00000003')), false);
  assert.equal(host.respond('request_00000002', false).type, 'join-reject');
  assert.deepEqual(host.pendingRequests(), []);
  assert.equal(host.receive(join('request_00000004')), false);

  now = 1000;
  assert.equal(host.receive(join('request_00000001')), true, 'expired replay ID may be reused');
  assert.equal(host.pendingCount(), 1);
  host.close();
});

test('LAN-095 host replay bound configuration cannot be smaller than pending capacity', async () => {
  const { createLanHostApproval } = await load();
  assert.throws(() => createLanHostApproval({ send() {}, maxPending: 3, maxRemembered: 2 }), /replay limit/);
  assert.throws(() => createLanHostApproval({ send() {}, maxRemembered: 513 }), /replay limit/);
});
