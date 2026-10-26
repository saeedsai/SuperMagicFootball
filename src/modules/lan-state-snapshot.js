// Host-authoritative, bounded match snapshot envelope for future two-client LAN sync.
// Coordinates are normalized [-1, 1]. This codec does not wire a game or a transport.
import {LAN_PROTOCOL_VERSION} from './lan-session.js';

const MAX_SNAPSHOT_BYTES = 8192;
const ID = /^[A-Za-z0-9_-]{6,32}$/;
const encoder = new TextEncoder();
const plain = value => value !== null && typeof value === 'object' &&
  !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const keys = (value, expected) => plain(value) &&
  Object.keys(value).length === expected.length &&
  expected.every(key => Object.hasOwn(value, key));
const safe = n => Number.isSafeInteger(n) && n >= 0;
const position = n => Number.isFinite(n) && n >= -1 && n <= 1;
// LAN-059: bounded optional visual payload; old position-only packets still work.
const finite=(n,max)=>Number.isFinite(n)&&n>=0&&n<=max;
const visual=v=>keys(v,['z','face','action','timer','anim','stun','slide','dive'])&&
  finite(v.z,1)&&[1,-1].includes(v.face)&&typeof v.action==='string'&&
  /^[A-Za-z][A-Za-z0-9]{0,23}$/.test(v.action)&&finite(v.timer,10)&&
  finite(v.anim,36000)&&finite(v.stun,10)&&finite(v.slide,10)&&finite(v.dive,10);
// LAN-060: bounded host-authoritative Magic Trick trap visuals.
const hazard=v=>keys(v,['kind','team','x','y','life','arm'])&&
  ['banana','ice'].includes(v.kind)&&[0,1].includes(v.team)&&
  position(v.x)&&position(v.y)&&finite(v.life,3)&&finite(v.arm,.3);
const shotFx=v=>keys(v,['id','color','trail','age','vx','vy'])&&
  typeof v.id==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(v.id)&&
  typeof v.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(v.color)&&
  typeof v.trail==='string'&&/^#[0-9a-fA-F]{6}$/.test(v.trail)&&
  finite(v.age,600)&&[v.vx,v.vy].every(n=>Number.isFinite(n)&&Math.abs(n)<=20000);

function validateLanSnapshot(packet) {
  const baseFields=['type','version','roomId','hostId','tick','clockMs','scores','ball','players'];
  const withHazards=keys(packet,[...baseFields,'hazards']);
  const enhanced=keys(packet,[...baseFields,'meta'])||
    keys(packet,[...baseFields,'meta','hazards']);
  const hasHazards=withHazards||keys(packet,[...baseFields,'meta','hazards']);
  const ballFx=keys(packet?.ball,['x','y','z','fx']);
  if (!(keys(packet,baseFields)||enhanced||withHazards) ||
      (hasHazards&&(!Array.isArray(packet.hazards)||
        packet.hazards.length>24||!packet.hazards.every(hazard))) ||
      packet.type !== 'snapshot' || packet.version !== LAN_PROTOCOL_VERSION ||
      typeof packet.roomId !== 'string' || !ID.test(packet.roomId) ||
      typeof packet.hostId !== 'string' || !ID.test(packet.hostId) ||
      !safe(packet.tick) || !safe(packet.clockMs) || packet.clockMs > 36000000 ||
      !keys(packet.scores, ['home','away']) ||
      !['home','away'].every(k => safe(packet.scores[k]) && packet.scores[k] <= 999) ||
      !(keys(packet.ball,['x','y','z'])||ballFx) ||
      (ballFx&&packet.ball.fx!==null&&!shotFx(packet.ball.fx)) ||
      !['x','y'].every(k => position(packet.ball[k])) ||
      !Number.isFinite(packet.ball.z) || packet.ball.z < 0 || packet.ball.z > 1 ||
      !Array.isArray(packet.players) || packet.players.length > 22) {
    throw new TypeError('Invalid LAN match snapshot');
  }
  const seen = new Set();
  const players = packet.players.map(player => {
    const withVisual=keys(player,['slot','x','y','visual']);
    if (!(keys(player,['slot','x','y'])||withVisual) ||
        (withVisual&&!visual(player.visual)) || !safe(player.slot) ||
        player.slot >= 22 || seen.has(player.slot) ||
        !position(player.x) || !position(player.y)) {
      throw new TypeError('Invalid LAN snapshot player');
    }
    seen.add(player.slot);
    return Object.freeze({slot:player.slot,x:player.x,y:player.y,...(withVisual?{visual:Object.freeze({...player.visual})}:{})});
  });
  // LAN-047 optional state envelope: old nine-field snapshots remain valid.
  // The host alone controls match phase, active players and ball possession.
  let meta;
  if(enhanced){
    const value=packet.meta;
    if(!keys(value,['half','phase','controlled','ballOwnerSlot']) ||
       ![1,2].includes(value.half) ||
       !['play','paused','finished'].includes(value.phase) ||
       !keys(value.controlled,['home','away']) ||
       ![value.controlled.home,value.controlled.away].every(n=>safe(n)&&n<6) ||
       !Number.isSafeInteger(value.ballOwnerSlot) ||
       value.ballOwnerSlot< -1 || value.ballOwnerSlot>=22){
      throw new TypeError('Invalid LAN match snapshot metadata');
    }
    meta=Object.freeze({half:value.half,phase:value.phase,
      controlled:Object.freeze({home:value.controlled.home,away:value.controlled.away}),
      ballOwnerSlot:value.ballOwnerSlot});
  }
  return Object.freeze({type:'snapshot',version:LAN_PROTOCOL_VERSION,
    roomId:packet.roomId,hostId:packet.hostId,tick:packet.tick,clockMs:packet.clockMs,
    scores:Object.freeze({home:packet.scores.home,away:packet.scores.away}),
    ball:Object.freeze({x:packet.ball.x,y:packet.ball.y,z:packet.ball.z,...(ballFx?{fx:packet.ball.fx===null?null:Object.freeze({...packet.ball.fx})}:{})}),
    players:Object.freeze(players),
    ...(hasHazards?{hazards:Object.freeze(packet.hazards.map(h=>Object.freeze({...h})))}:{}),
    ...(enhanced?{meta}:{})});
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
