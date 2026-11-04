// Server-owned, fixed-step match session. Network transports authenticate a
// participant before calling submitInput; clients never submit score or clock.
const INPUT_KEYS = new Set(['x', 'y', 'buttons']);
const BUTTON_KEYS = new Set(['pass', 'shoot', 'dribble', 'jump']);
const MAX_SEQUENCE_GAP = 240;
const INPUT_STALE_MS = 250;
const FIXED_STEP_SECONDS = 1 / 30;

function cleanInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).some(key => !INPUT_KEYS.has(key)) ||
      !Number.isFinite(input.x) || input.x < -1 || input.x > 1 ||
      !Number.isFinite(input.y) || input.y < -1 || input.y > 1 ||
      !input.buttons || typeof input.buttons !== 'object' || Array.isArray(input.buttons) ||
      Object.keys(input.buttons).length !== BUTTON_KEYS.size ||
      Object.keys(input.buttons).some(key => !BUTTON_KEYS.has(key)) ||
      [...BUTTON_KEYS].some(key => typeof input.buttons[key] !== 'boolean')) return null;
  return Object.freeze({
    x: input.x,
    y: input.y,
    buttons: Object.freeze({pass:input.buttons.pass, shoot:input.buttons.shoot,
      dribble:input.buttons.dribble, jump:input.buttons.jump})
  });
}

function neutralInput() {
  return Object.freeze({x:0, y:0, buttons:Object.freeze({pass:false, shoot:false, dribble:false, jump:false})});
}

function validId(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(value);
}

/**
 * Creates one authoritative online match. This module has no socket or storage
 * dependency; an authenticated host connects participant IDs to submitInput.
 */
export function createOnlineMatchSession({matchId, participants, engine, now=()=>performance.now(), onSnapshot=()=>{}}) {
  if (!validId(matchId) || !Array.isArray(participants) || participants.length !== 2 ||
      !engine || typeof engine.step !== 'function' || typeof engine.snapshot === 'undefined' && typeof engine.getSnapshot !== 'function' ||
      typeof now !== 'function' || typeof onSnapshot !== 'function') {
    throw new TypeError('Invalid authoritative match session');
  }
  const ids = participants.map(row => row?.userId);
  if (ids.some(id => !validId(id)) || ids[0] === ids[1]) throw new TypeError('Invalid match participants');

  const seats = ids.map(userId => ({userId, sequence:0, input:neutralInput(), receivedAt:-Infinity}));
  let closed = false;
  let ticks = 0;
  let latest = typeof engine.getSnapshot === 'function' ? engine.getSnapshot() : engine.snapshot;

  function submitInput(userId, sequence, input, receivedAt=now()) {
    if (closed) return Object.freeze({accepted:false, reason:'match-closed'});
    const side = seats.findIndex(seat => seat.userId === userId);
    if (side < 0) return Object.freeze({accepted:false, reason:'not-a-participant'});
    const seat = seats[side];
    if (!Number.isSafeInteger(sequence) || sequence <= seat.sequence || sequence - seat.sequence > MAX_SEQUENCE_GAP) {
      return Object.freeze({accepted:false, reason:'invalid-sequence'});
    }
    if (!Number.isFinite(receivedAt) || receivedAt < seat.receivedAt) return Object.freeze({accepted:false, reason:'invalid-time'});
    const clean = cleanInput(input);
    if (!clean) return Object.freeze({accepted:false, reason:'invalid-input'});
    seat.sequence = sequence;
    seat.input = clean;
    seat.receivedAt = receivedAt;
    return Object.freeze({accepted:true, side, sequence});
  }

  // A resumed authenticated seat starts a fresh per-connection sequence space.
  // The session remains authoritative; only the detached seat's input is reset.
  function resetInput(userId) {
    const seat=seats.find(row=>row.userId===userId);
    if(closed||!seat)return false;
    seat.sequence=0;seat.input=neutralInput();seat.receivedAt=-Infinity;
    return true;
  }

  function step() {
    if (closed) return Object.freeze({advanced:false, reason:'match-closed', snapshot:latest});
    const at = now();
    const input = seats.map(seat => at - seat.receivedAt > INPUT_STALE_MS ? neutralInput() : seat.input);
    const result = engine.step(FIXED_STEP_SECONDS, input);
    if (!result || result.accepted !== true) return Object.freeze({advanced:false, reason:result?.reason || 'engine-rejected', snapshot:latest});
    latest = typeof engine.getSnapshot === 'function' ? engine.getSnapshot() : engine.snapshot;
    ticks++;
    const envelope = Object.freeze({matchId, tick:ticks, snapshot:latest});
    try { onSnapshot(envelope); } catch { /* observers cannot break authoritative simulation */ }
    if (latest?.phase === 'finished' || latest?.matchState === 'finished') closed = true;
    return Object.freeze({advanced:true, tick:ticks, snapshot:latest});
  }

  function close() { closed = true; }
  function getState() {
    return Object.freeze({matchId, ticks, closed, participants:Object.freeze(ids.slice()), snapshot:latest});
  }
  return Object.freeze({submitInput, resetInput, step, close, getState});
}

export const ONLINE_MATCH_LIMITS = Object.freeze({inputStaleMs:INPUT_STALE_MS, maxSequenceGap:MAX_SEQUENCE_GAP, tickRate:30});
