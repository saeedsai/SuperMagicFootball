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
  const pads = [];
  const navigator = { getGamepads: () => pads };
  const sandbox = { window, document, navigator, console, Date, Number, Set, Map, Array, Object, Math };
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
  return { input, dispatch, blur, visibility, pads };
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


test('backgrounded held gamepad Dribble requires a neutral poll before a fresh press', () => {
  const { input, pads, visibility } = harness();
  const buttons = Array.from({ length: 16 }, () => ({ pressed: false }));
  pads[0] = { buttons, axes: [0, 0] };
  buttons[2].pressed = true;
  input.poll();
  assert.equal(input.held(0, 'dribble'), true);
  assert.equal(input.just(0, 'dribble'), true);
  visibility(true);
  visibility(false);
  input.poll();
  assert.equal(input.held(0, 'dribble'), false, 'still-held gamepad cannot reactivate after background');
  assert.equal(input.just(0, 'dribble'), false);
  buttons[2].pressed = false;
  input.poll();
  assert.equal(input.held(0, 'dribble'), false);
  buttons[2].pressed = true;
  input.poll();
  assert.equal(input.held(0, 'dribble'), true);
  assert.equal(input.just(0, 'dribble'), true, 'new physical press must work after neutral');
  input.poll();
  assert.equal(input.just(0, 'dribble'), false, 'continued hold cannot create another edge');
});


test('backgrounded second local gamepad seat cannot leak Dribble into either human seat', () => {
  const { input, pads, visibility } = harness();
  const buttons0 = Array.from({ length: 16 }, () => ({ pressed: false }));
  const buttons1 = Array.from({ length: 16 }, () => ({ pressed: false }));
  pads[0] = { buttons: buttons0, axes: [0, 0] };
  pads[1] = { buttons: buttons1, axes: [0, 0] };
  buttons1[2].pressed = true;
  input.poll(true);
  assert.equal(input.just(0, 'dribble'), false, 'second controller must not control home seat');
  assert.equal(input.just(1, 'dribble'), true, 'second seat receives its own press');
  visibility(true);
  visibility(false);
  input.poll(true);
  assert.equal(input.held(0, 'dribble'), false);
  assert.equal(input.held(1, 'dribble'), false, 'held away controller remains suppressed');
  assert.equal(input.just(1, 'dribble'), false);
  buttons1[2].pressed = false;
  input.poll(true);
  buttons1[2].pressed = true;
  input.poll(true);
  assert.equal(input.just(0, 'dribble'), false);
  assert.equal(input.just(1, 'dribble'), true, 'neutral re-arms only the second seat');
  input.poll(true);
  assert.equal(input.just(1, 'dribble'), false, 'continuous hold cannot repeat');
});


test('two local gamepads independently rearm after background without cross-seat Dribble edges', () => {
  const { input, pads, visibility } = harness();
  const home = Array.from({ length: 16 }, () => ({ pressed: false }));
  const away = Array.from({ length: 16 }, () => ({ pressed: false }));
  pads[0] = { buttons: home, axes: [0, 0] };
  pads[1] = { buttons: away, axes: [0, 0] };
  home[2].pressed = true;
  away[2].pressed = true;
  input.poll(true);
  assert.equal(input.just(0, 'dribble'), true);
  assert.equal(input.just(1, 'dribble'), true);

  visibility(true);
  visibility(false);
  input.poll(true);
  for (const seat of [0, 1]) {
    assert.equal(input.held(seat, 'dribble'), false, 'backgrounded hold must be suppressed');
    assert.equal(input.just(seat, 'dribble'), false);
  }

  home[2].pressed = false;
  input.poll(true);
  home[2].pressed = true;
  input.poll(true);
  assert.equal(input.just(0, 'dribble'), true, 'home neutral re-arms home only');
  assert.equal(input.just(1, 'dribble'), false, 'away still-held button stays suppressed');
  assert.equal(input.held(1, 'dribble'), false);

  away[2].pressed = false;
  input.poll(true);
  away[2].pressed = true;
  input.poll(true);
  assert.equal(input.just(0, 'dribble'), false, 'home continuous hold cannot repeat');
  assert.equal(input.just(1, 'dribble'), true, 'away neutral re-arms independently');
  input.poll(true);
  assert.equal(input.just(0, 'dribble'), false);
  assert.equal(input.just(1, 'dribble'), false);
});
