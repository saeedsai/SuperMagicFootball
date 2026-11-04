const { test } = require('node:test');
const assert = require('node:assert/strict');

test('a gamepad held through background cancellation stays suppressed until neutral, then rearms', async t => {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const oldNavigator = globalThis.navigator;
  const windowEvents = new Map();
  const documentEvents = new Map();
  const buttons = Array.from({ length: 16 }, () => ({ pressed: false }));
  const pad = { buttons, axes: [0, 0] };
  globalThis.window = { addEventListener(name, callback) { windowEvents.set(name, callback); } };
  globalThis.document = {
    hidden: false,
    addEventListener(name, callback) { documentEvents.set(name, callback); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true, value: { getGamepads: () => [pad] },
  });
  t.after(() => {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
    if (oldNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, 'navigator', { configurable: true, value: oldNavigator });
  });

  const { INPUT } = await import('../src/modules/input.js');
  const { Input } = INPUT;
  const input = new Input();
  buttons[1].pressed = true; // Default gamepad Pass button.
  input.poll();
  assert.equal(input.just(0, 'pass'), true);

  globalThis.document.hidden = true;
  documentEvents.get('visibilitychange')?.();
  input.poll();
  assert.equal(input.held(0, 'pass'), false);
  assert.equal(input.canceled(0, 'pass'), true);
  assert.equal(input.just(0, 'pass'), false);
  assert.equal(input.released(0, 'pass'), false);

  globalThis.document.hidden = false;
  documentEvents.get('visibilitychange')?.();
  input.poll();
  assert.equal(input.held(0, 'pass'), false, 'a continuously held gamepad button cannot resume as a new press');
  assert.equal(input.just(0, 'pass'), false);
  assert.equal(input.released(0, 'pass'), false);

  buttons[1].pressed = false;
  input.poll(); // Neutral poll rearms the gamepad without emitting an action.
  assert.equal(input.just(0, 'pass'), false);
  buttons[1].pressed = true;
  input.poll();
  assert.equal(input.just(0, 'pass'), true, 'a fresh post-neutral press works normally');
});
