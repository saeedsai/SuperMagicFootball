/** Four-button touch dribble rapid re-press input contract (no game physics). */
const { test } = require('node:test');
const assert = require('node:assert/strict');

function element(act) {
  const events = {};
  return {
    dataset: { act },
    events,
    style: {},
    classList: { toggle() {} },
    addEventListener(type, callback) { events[type] = callback; },
    setPointerCapture() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; },
  };
}

async function setup(t) {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const oldNavigator = globalThis.navigator;
  const button = element('dribble');
  const joystick = element('joystick');
  const windowEvents = {};
  globalThis.window = { addEventListener(k, fn) { windowEvents[k] = fn; } };
  globalThis.document = {
    hidden: false,
    addEventListener() {},
    querySelector(s) { return s === '#joyZone' ? joystick : null; },
    querySelectorAll(s) { return s === '[data-act]' ? [button] : []; },
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true, value: { getGamepads: () => [] },
  });
  t.after(() => {
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
    if (oldNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, 'navigator', {
      configurable: true, value: oldNavigator,
    });
  });
  const { INPUT } = await import('../src/modules/input.js');
  const input = new INPUT.Input();
  const touch = (kind, id, timeStamp) => button.events[kind]({
    type: kind, pointerId: id, timeStamp, preventDefault() {},
  });
  return { input, touch };
}

test('mobile DRIBBLE release+repress inside one render frame produces a second just edge', async t => {
  const { input, touch } = await setup(t);
  touch('pointerdown', 1, 100);
  input.poll();
  assert.equal(input.just(0, 'dribble'), true, 'initial press');
  assert.equal(input.held(0, 'dribble'), true);

  touch('pointerup', 1, 135);
  touch('pointerdown', 2, 141); // No game input poll between up and down.
  input.poll();
  assert.equal(input.held(0, 'dribble'), true);
  assert.equal(input.just(0, 'dribble'), true, 'second distinct press must not be swallowed');
  input.poll();
  assert.equal(input.just(0, 'dribble'), false, 'continuous hold is not an extra tap');
  touch('pointerup', 2, 177);
  input.poll();
  assert.equal(input.released(0, 'dribble'), true);
  assert.equal(input.just(0, 'dribble'), false);
});

test('multiple completed touches between frames replay as one press per poll', async t => {
  const { input, touch } = await setup(t);
  touch('pointerdown', 10, 100);
  touch('pointerup', 10, 119);
  touch('pointerdown', 11, 135);
  touch('pointerup', 11, 154);
  input.poll();
  assert.equal(input.just(0, 'dribble'), true);
  assert.equal(input.tapDuration(0, 'dribble') > 0, true);
  input.poll();
  assert.equal(input.just(0, 'dribble'), true);
  input.poll();
  assert.equal(input.just(0, 'dribble'), false);
  assert.equal(input.held(0, 'dribble'), false);
});

test('two pointer fingers sharing DRIBBLE do not synthesize a second tap', async t => {
  const { input, touch } = await setup(t);
  touch('pointerdown', 1, 100);
  input.poll();
  touch('pointerdown', 2, 104);
  input.poll();
  assert.equal(input.just(0, 'dribble'), false);
  touch('pointerup', 1, 112);
  input.poll();
  assert.equal(input.just(0, 'dribble'), false);
  assert.equal(input.held(0, 'dribble'), true);
  touch('pointerup', 2, 125);
  input.poll();
  assert.equal(input.released(0, 'dribble'), true);
});

test('cancelled touch ends gesture without replay or phantom action', async t => {
  const { input, touch } = await setup(t);
  touch('pointerdown', 1, 100);
  input.poll();
  touch('pointercancel', 1, 117);
  input.poll();
  assert.equal(input.just(0, 'dribble'), false);
  assert.equal(input.released(0, 'dribble'), false);
  assert.equal(input.canceled(0, 'dribble'), true);
  input.poll();
  assert.equal(input.just(0, 'dribble'), false);
  touch('pointerdown', 2, 145);
  input.poll();
  assert.equal(input.just(0, 'dribble'), true, 'next deliberate press survives cancellation');
});
