const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const load = () => import(pathToFileURL(path.resolve('src/modules/lan-room-selector.js')).href);
test('room browser excludes full rooms and own room', async () => {
  const { selectJoinableLanRooms } = await load();
  const rooms = [
    { roomId: 'room_12345678', name: 'Home', players: 1 },
    { roomId: 'room_87654321', name: 'Football', players: 1 },
    { roomId: 'room_abcdefgh', name: 'Full', players: 2 }
  ];
  assert.deepEqual(selectJoinableLanRooms(rooms, { ownRoomId: 'room_12345678' }), [
    { roomId: 'room_87654321', name: 'Football', players: 1 }
  ]);
  assert.deepEqual(selectJoinableLanRooms(rooms, { search: 'FOOT' }), [
    { roomId: 'room_87654321', name: 'Football', players: 1 }
  ]);
  assert.deepEqual(selectJoinableLanRooms(rooms, { search: 'missing' }), []);
  assert.throws(() => selectJoinableLanRooms(null), TypeError);
});
