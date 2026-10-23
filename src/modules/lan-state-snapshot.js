// Host-authoritative, bounded match snapshot envelope for future two-client LAN sync.
// Coordinates are normalized [-1, 1]. This codec does not wire a game or a transport.
import {LAN_PROTOCOL_VERSION} from './lan-session.js';

const MAX_SNAPSHOT_BYTES = 4096;
const ID = /^[A-Za-z0-9_-]{6,32}$/;
const encoder = new TextEncoder();
const plain = value => value !== null && typeof value === 'object' &&
  !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const keys = (value, expected) => plain(value) &&
  Object.keys(value).length === expected.length &&
  expected.every(key => Object.hasOwn(value, key));
const safe = n => Number.isSafeInteger(n) && n >= 0;
const position = n => Number.isFinite(n) && n >= -1 && n <= 1;

function validateLanSnapshot(packet) {
  if (!keys(packet, ['type','version','roomId','hostId','tick','clockMs','scores','ball','players']) ||
      packet.type !== 'snapshot' || packet.version !== LAN_PROTOCOL_VERSION ||
      typeof packet.roomId !== 'string' || !ID.test(packet.roomId) ||
      typeof packet.hostId !== 'string' || !ID.test(packet.hostId) ||
      !safe(packet.tick) || !safe(packet.clockMs) || packet.clockMs > 36000000 ||
      !keys(packet.scores, ['home','away']) ||
      !['home','away'].every(k => safe(packet.scores[k]) && packet.scores[k] <= 999) ||
      !keys(packet.ball, ['x','y','z']) ||
      !['x','y'].every(k => position(packet.ball[k])) ||
      !Number.isFinite(packet.ball.z) || packet.ball.z < 0 || packet.ball.z > 1 ||
      !Array.isArray(packet.players) || packet.players.length > 22) {
    throw new TypeError('Invalid LAN match snapshot');
  }
  const seen = new Set();
  const players = packet.players.map(player => {
    if (!keys(player, ['slot','x','y']) || !safe(player.slot) ||
        player.slot >= 22 || seen.has(player.slot) ||
        !position(player.x) || !position(player.y)) {
      throw new TypeError('Invalid LAN snapshot player');
    }
    seen.add(player.slot);
    return Object.freeze({slot:player.slot,x:player.x,y:player.y});
  });
  return Object.freeze({type:'snapshot',version:LAN_PROTOCOL_VERSION,
    roomId:packet.roomId,hostId:packet.hostId,tick:packet.tick,clockMs:packet.clockMs,
    scores:Object.freeze({home:packet.scores.home,away:packet.scores.away}),
    ball:Object.freeze({x:packet.ball.x,y:packet.ball.y,z:packet.ball.z}),
    players:Object.freeze(players)});
}

function encodeLanSnapshot(packet) {
  const wire = JSON.stringify(validateLanSnapshot(packet));
  if (encoder.encode(wire).byteLength > MAX_SNAPSHOT_BYTES) {
    throw new RangeError('LAN snapshot exceeds byte limit');
  }
  return wire;
}

function decodeLanSnapshot(wire) {
  if (typeof wire !== 'string' || encoder.encode(wire).byteLength > MAX_SNAPSHOT_BYTES) {
    throw new TypeError('Invalid LAN snapshot wire size or type');
  }
  let parsed;
  try { parsed = JSON.parse(wire); }
  catch { throw new TypeError('Invalid LAN snapshot JSON'); }
  return validateLanSnapshot(parsed);
}

function acceptLanSnapshot(lastTick, packet, roomId, hostId) {
  if (!Number.isSafeInteger(lastTick) || lastTick < -1 ||
      typeof roomId !== 'string' || !ID.test(roomId) ||
      typeof hostId !== 'string' || !ID.test(hostId)) {
    throw new TypeError('Invalid LAN snapshot receiver state');
  }
  const snapshot = validateLanSnapshot(packet);
  if (snapshot.roomId !== roomId || snapshot.hostId !== hostId) {
    return Object.freeze({accepted:false,reason:'wrong-session',lastTick});
  }
  if (snapshot.tick <= lastTick) {
    return Object.freeze({accepted:false,reason:'stale-tick',lastTick});
  }
  return Object.freeze({accepted:true,reason:'snapshot-accepted',lastTick:snapshot.tick,snapshot});
}

export {MAX_SNAPSHOT_BYTES,validateLanSnapshot,encodeLanSnapshot,decodeLanSnapshot,acceptLanSnapshot};
