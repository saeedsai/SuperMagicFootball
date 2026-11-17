'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/modules/input.js'), 'utf8')
  .replace(/export \{INPUT\};\s*$/, 'globalThis.__INPUT=INPUT;');

function harness() {
  const listeners = new Map();
  const window = { addEventListener(type, fn) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
  } };
  const document = { hidden: false, addEventListener(type, fn) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(fn);
  }, querySelector() { return null; },
    querySelectorAll() { return []; } };
  const sandbox = { window, document, console, Date, Number, Set, Map, Array, Object, Math };
  vm.runInNewContext(source, sandbox, { filename: 'input.js' });
  const input = new sandbox.__INPUT.Input();
  function dispatch(type, code, timeStamp = 0) {
    const target = { tagName: 'CANVAS', closest() { return null; } };
    let prevented = false;
    for (const fn of listeners.get(type) || [])
      fn({ code, target, timeStamp, preventDefault() { prevented = true; } });
    return prevented;
  }
  function blur() {
    for (const fn of listeners.get('blur') || []) fn({});
  }
  function visibility(hidden) {
    document.hidden = hidden;
    for (const fn of listeners.get('visibilitychange') || []) fn({});
  }
  return { input, dispatch, blur, visibility };
}

test('keyboard auto-repeat does not multiply four-button action pulses', () => {
  const { input, dispatch } = harness();
  assert.equal(dispatch('keydown', 'KeyI', 100), false);
  for (let i = 0; i < 30; i++) dispatch('keydown', 'KeyI', 120 + i * 20);
  assert.equal(input.keyPending.size, 1, 'held Dribble must create one press edge');
  assert.equal(input.keyDownTimes.get('KeyI'), 100, 'repeat must not reset hold duration');
  dispatch('keyup', 'KeyI', 1200);
  assert.equal(input.keyPulsePending.get('KeyI')?.length, 1, 'release must enqueue one tap');
  assert.ok(Math.abs(input.keyPulsePending.get('KeyI')[0] - 1.1) < 1e-9);
  assert.equal(input.keys.has('KeyI'), false);
});

test('background blur discards held and queued Dribble, preventing a ghost Magic Trick', () => {
  const { input, dispatch, blur } = harness();
  dispatch('keydown', 'KeyI', 100);
  dispatch('keyup', 'KeyI', 1200);
  assert.equal(input.keyPulsePending.get('KeyI')?.length, 1);
  dispatch('keydown', 'KeyI', 1300);
  blur();
  assert.equal(input.keys.size, 0);
  assert.equal(input.keyPending.size, 0);
  assert.equal(input.keyPulsePending.size, 0);
  assert.equal(input.keyDownTimes.size, 0);
  assert.equal(input.globalCancelPending, true);
});

test('hidden tab cancels queued Dribble but visible transition does not erase fresh input', () => {
  const { input, dispatch, visibility } = harness();
  dispatch('keydown', 'KeyI', 100);
  dispatch('keyup', 'KeyI', 1250);
  dispatch('keydown', 'KeyI', 1300);
  assert.equal(input.keyPulsePending.get('KeyI')?.length, 1);
  visibility(true);
  assert.equal(input.keys.size, 0);
  assert.equal(input.keyPending.size, 0);
  assert.equal(input.keyPulsePending.size, 0);
  assert.equal(input.keyDownTimes.size, 0);
  assert.equal(input.globalCancelPending, true);
  dispatch('keydown', 'KeyI', 2000);
  visibility(false);
  assert.equal(input.keys.has('KeyI'), true, 'returning to visible must not cancel a fresh press');
  assert.equal(input.keyDownTimes.get('KeyI'), 2000);
});
