// Deterministic, transport-independent guest controls for a host-authoritative LAN tick.
// The host must first validate each packet using acceptLanPacket in lan-session.js.
const ACTIONS = Object.freeze(['pass', 'shoot', 'dribble', 'jump']);
const NEUTRAL_BUTTONS = Object.freeze({pass:false, shoot:false, dribble:false, jump:false});
const NEUTRAL_AXIS = Object.freeze({x:0, y:0});
const NEUTRAL = Object.freeze({buttons:NEUTRAL_BUTTONS, axis:NEUTRAL_AXIS});

function validButtons(buttons) {
  return !!buttons && typeof buttons === 'object' && !Array.isArray(buttons) &&
    Object.keys(buttons).length === ACTIONS.length &&
    ACTIONS.every(key => Object.hasOwn(buttons,key) && typeof buttons[key] === 'boolean');
}

function validAxis(axis) {
  return !!axis && typeof axis === 'object' && !Array.isArray(axis) &&
    Object.keys(axis).length === 2 && ['x','y'].every(key =>
      Object.hasOwn(axis,key) && Number.isFinite(axis[key]) && Math.abs(axis[key]) <= 1);
}

function validControls(controls) {
  return !!controls && typeof controls === 'object' && !Array.isArray(controls) &&
    Object.keys(controls).length === 2 && Object.hasOwn(controls,'buttons') &&
    Object.hasOwn(controls,'axis') && validButtons(controls.buttons) && validAxis(controls.axis);
}

function assertTimeline(state) {
  const valid = !!state && typeof state === 'object' && !Array.isArray(state) &&
    Number.isSafeInteger(state.frame) && state.frame >= 0 &&
    Number.isSafeInteger(state.maxHoldFrames) && state.maxHoldFrames >= 1 && state.maxHoldFrames <= 120 &&
    Number.isSafeInteger(state.lastSequence) && state.lastSequence >= -1 &&
    Number.isSafeInteger(state.lastAcceptedFrame) && state.lastAcceptedFrame >= -1 &&
    state.lastAcceptedFrame <= state.frame && typeof state.timeoutReported === 'boolean' &&
    (!state.timeoutReported || state.lastSequence >= 0 &&
      state.frame - state.lastAcceptedFrame > state.maxHoldFrames) && validControls(state.controls) &&
    (state.lastSequence === -1
      ? state.lastAcceptedFrame === -1 && !state.timeoutReported &&
        ACTIONS.every(key => state.controls.buttons[key] === false) &&
        state.controls.axis.x === 0 && state.controls.axis.y === 0
      : state.lastAcceptedFrame >= 0);
  if (!valid) throw new TypeError('Invalid LAN input timeline state');
}

function createLanInputTimeline(maxHoldFrames = 4) {
  if (!Number.isSafeInteger(maxHoldFrames) || maxHoldFrames < 1 || maxHoldFrames > 120) {
    throw new RangeError('maxHoldFrames must be an integer between 1 and 120');
  }
  return Object.freeze({frame:0, maxHoldFrames, lastSequence:-1, lastAcceptedFrame:-1, timeoutReported:false, controls:NEUTRAL});
}

function applyValidatedLanInput(state, validation) {
  assertTimeline(state);
  const input = validation?.accepted === true ? validation.input : null;
  if (!state || !Number.isSafeInteger(state.frame) || !input ||
      !Number.isSafeInteger(input.sequence) || input.sequence < 0 ||
      !validButtons(input.buttons) || !validAxis(input.axis)) {
    throw new TypeError('Expected an accepted, valid four-button LAN input');
  }
  if (input.sequence <= state.lastSequence) return state;
  return Object.freeze({
    ...state,
    lastSequence:input.sequence,
    lastAcceptedFrame:state.frame,
    timeoutReported:false,
    controls:Object.freeze({
      buttons:Object.freeze({...input.buttons}),
      axis:Object.freeze({...input.axis})
    })
  });
}

// On an authenticated guest departure, discard retained controls immediately.
// Keep the host frame monotonic while permitting a new guest to start at sequence zero.
function clearLanInputOnLeave(state, validation) {
  assertTimeline(state);
  if (validation?.accepted !== true || validation.reason !== 'left' ||
      validation.state?.peerId !== null) {
    throw new TypeError('Expected an authenticated guest leave result');
  }
  return Object.freeze({...state,lastSequence:-1,lastAcceptedFrame:-1,timeoutReported:false,controls:NEUTRAL});
}

function advanceLanInputFrame(state) {
  assertTimeline(state);
  if (state.frame === Number.MAX_SAFE_INTEGER) throw new TypeError('Invalid LAN input timeline');
  const frame = state.frame + 1;
  const expired = state.lastAcceptedFrame < 0 || frame - state.lastAcceptedFrame > state.maxHoldFrames;
  const timedOut=expired && state.lastAcceptedFrame >= 0 && !state.timeoutReported;
  return Object.freeze({
    state:Object.freeze({...state, frame, timeoutReported:state.timeoutReported||timedOut}),
    controls:expired ? NEUTRAL : state.controls,
    timedOut
  });
}

export {createLanInputTimeline, applyValidatedLanInput, advanceLanInputFrame, clearLanInputOnLeave};
