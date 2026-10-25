const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const load = () => import(pathToFileURL(path.resolve('src/modules/lan-guest-lobby.js')).href);
const hostLoad = () => import(pathToFileURL(path.resolve('src/modules/lan-host-lobby.js')).href);
const roomId = 'room_12345678';
const requestId = 'request_12345678';
const response = (type, room = roomId, id = requestId) => ({ version: 1, type, roomId: room, requestId: id });

test('guest waits for explicit host approval and ignores unsolicited or mismatched replies', async () => {
  const { createLanGuestLobby } = await load();
  const guest = createLanGuestLobby({ roomId, requestId });
  assert.equal(guest.status(), 'idle');
  assert.equal(guest.receive(response('join-accept')), false);
  assert.deepEqual(guest.request(), response('join-request'));
  assert.equal(guest.request(), null);
  assert.equal(guest.receive(response('join-accept', 'other_12345678')), false);
  assert.equal(guest.receive(response('join-accept', roomId, 'request_87654321')), false);
  assert.equal(guest.receive(response('room-remove')), false);
  assert.equal(guest.status(), 'pending');
  assert.equal(guest.receive(response('join-accept')), true);
  assert.equal(guest.status(), 'accepted');
  assert.equal(guest.receive(response('join-reject')), false);
  assert.equal(guest.cancel(), false);
});

test('guest rejection, expiry and cancellation cannot be reversed by late approvals', async () => {
  const { createLanGuestLobby } = await load();
  let now = 0;
  const make = id => createLanGuestLobby({ roomId, requestId: id, ttlMs: 1000, now: () => now });
  const rejected = make('request_12345678');
  rejected.request();
  assert.equal(rejected.receive(response('join-reject')), true);
  assert.equal(rejected.status(), 'rejected');
  assert.equal(rejected.receive(response('join-accept')), false);
  const expired = make('request_87654321');
  expired.request();
  now = 1000;
  assert.equal(expired.receive(response('join-accept', roomId, 'request_87654321')), false);
  assert.equal(expired.status(), 'expired');
  const cancelled = make('request_abcdefgh');
  cancelled.request();
  assert.equal(cancelled.cancel(), true);
  assert.equal(cancelled.receive(response('join-accept', roomId, 'request_abcdefgh')), false);
  assert.equal(cancelled.status(), 'cancelled');
});

test('in-process guest-host approval and denial round trips', async () => {
  const { createLanGuestLobby } = await load();
  const { createLanHostLobby } = await hostLoad();
  const host = createLanHostLobby({ roomId });
  const guest = createLanGuestLobby({ roomId, requestId });
  assert.equal(host.receive(guest.request()), true);
  assert.deepEqual(host.pending(), [{ requestId }]);
  assert.equal(guest.status(), 'pending');
  assert.equal(guest.receive(host.decide(requestId, true)), true);
  assert.equal(guest.status(), 'accepted');
  assert.deepEqual(host.guest(), { requestId });
  assert.equal(host.disconnect(requestId), true);
  const nextId = 'request_87654321';
  const next = createLanGuestLobby({ roomId, requestId: nextId });
  assert.equal(host.receive(next.request()), true);
  assert.equal(next.receive(host.decide(nextId, false)), true);
  assert.equal(next.status(), 'rejected');
  assert.equal(host.guest(), null);
});

test('guest options reject invalid identifiers and timeout', async () => {
  const { createLanGuestLobby } = await load();
  assert.throws(() => createLanGuestLobby({ roomId: 'bad', requestId }), TypeError);
  assert.throws(() => createLanGuestLobby({ roomId, requestId: 'bad' }), TypeError);
  assert.throws(() => createLanGuestLobby({ roomId, requestId, ttlMs: 0 }), RangeError);
  assert.throws(() => createLanGuestLobby({ roomId, requestId, now: 1 }), TypeError);
});
