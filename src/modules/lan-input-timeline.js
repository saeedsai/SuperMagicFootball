// Deterministic, transport-independent guest controls for a host-authoritative LAN tick.
// The host must first validate each packet using acceptLanPacket in lan-session.js.
const ACTIONS = Object.freeze(['pass', 'shoot', 'dribble', 'jump']);
const NEUTRAL_BUTTONS = Object.freeze({pass:false, shoot:false, dribble:false, jump:false});
const NEUTRAL_AXIS = Object.freeze({x:0, y:0});
const NEUTRAL = Object.freeze({buttons:NEUTRAL_BUTTONS, axis:NEUTRAL_AXIS});

function createLanInputTimeline(maxHoldFrames = 4) {
  if (!Number.isSafeInteger(maxHoldFrames) || maxHoldFrames < 1 || maxHoldFrames > 120) {
    throw new RangeError('maxHoldFrames must be an integer between 1 and 120');
  }
  return Object.freeze({frame:0, maxHoldFrames, lastSequence:-1, lastAcceptedFrame:-1, controls:NEUTRAL});
}

function applyValidatedLanInput(state, validation) {
  const input = validation?.accepted === true ? validation.input : null;
  if (!state || !Number.isSafeInteger(state.frame) || !input ||
      !Number.isSafeInteger(input.sequence) || input.sequence < 0 ||
      !input.buttons || !input.axis ||
      Object.keys(input.buttons).length !== ACTIONS.length ||
      !ACTIONS.every(key => Object.hasOwn(input.buttons,key) && typeof input.buttons[key] === 'boolean') ||
      Object.keys(input.axis).length !== 2 ||
      !['x','y'].every(key => Number.isFinite(input.axis[key]) && Math.abs(input.axis[key]) <= 1)) {
    throw new TypeError('Expected an accepted, valid four-button LAN input');
  }
  if (input.sequence <= state.lastSequence) return state;
  return Object.freeze({
    ...state,
    lastSequence:input.sequence,
    lastAcceptedFrame:state.frame,
    controls:Object.freeze({
      buttons:Object.freeze({...input.buttons}),
      axis:Object.freeze({...input.axis})
    })
  });
}

// On an authenticated guest departure, discard retained controls immediately.
// Keep the host frame monotonic while permitting a new guest to start at sequence zero.
function clearLanInputOnLeave(state, validation) {
  if (!state || !Number.isSafeInteger(state.frame) ||
      validation?.accepted !== true || validation.reason !== 'left' ||
      validation.state?.peerId !== null) {
    throw new TypeError('Expected an authenticated guest leave result');
  }
  return Object.freeze({...state,lastSequence:-1,lastAcceptedFrame:-1,controls:NEUTRAL});
}

function advanceLanInputFrame(state) {
  if (!state || !Number.isSafeInteger(state.frame) || state.frame < 0 ||
      !Number.isSafeInteger(state.maxHoldFrames) || state.maxHoldFrames < 1 ||
      state.frame === Number.MAX_SAFE_INTEGER) throw new TypeError('Invalid LAN input timeline');
  const frame = state.frame + 1;
  const expired = state.lastAcceptedFrame < 0 || frame - state.lastAcceptedFrame > state.maxHoldFrames;
  return Object.freeze({
    state:Object.freeze({...state, frame}),
    controls:expired ? NEUTRAL : state.controls,
    timedOut:expired && state.lastAcceptedFrame >= 0
  });
}

export {createLanInputTimeline, applyValidatedLanInput, advanceLanInputFrame, clearLanInputOnLeave};
