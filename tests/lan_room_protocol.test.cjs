const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const load = () => import(pathToFileURL(path.resolve('src/modules/lan-room-protocol.js')).href);
const roomId = 'room_12345678';
const requestId = 'request_12345678';
test('LAN discovery room announces and removes with validated fields', async () => {
  const { createLanRoomMessage, validateLanRoomMessage } = await load();
  assert.deepEqual(createLanRoomMessage('room-announce', roomId, { name: ' Match ', players: 1 }),
    { version: 1, type: 'room-announce', roomId, name: 'Match', players: 1 });
  assert.equal(createLanRoomMessage('room-remove', roomId).type, 'room-remove');
  assert.equal(validateLanRoomMessage({ version: 1, type: 'room-announce', roomId, name: '', players: 1 }), null);
  assert.equal(validateLanRoomMessage({ version: 1, type: 'room-announce', roomId, name: 'ok', players: 3 }), null);
});
test('LAN host approval messages require valid request identity', async () => {
  const { createLanRoomMessage, validateLanRoomMessage } = await load();
  for (const type of ['join-request', 'join-accept', 'join-reject']) {
    assert.equal(createLanRoomMessage(type, roomId, { requestId }).requestId, requestId);
    assert.equal(validateLanRoomMessage({ version: 1, type, roomId, requestId: '!' }), null);
  }
  assert.equal(validateLanRoomMessage({ version: 2, type: 'room-remove', roomId }), null);
  assert.equal(validateLanRoomMessage({ version: 1, type: '__proto__', roomId }), null);
  assert.equal(validateLanRoomMessage(null), null);
});
