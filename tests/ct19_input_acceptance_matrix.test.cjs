/** CT19 deterministic four-button input matrix across source ordering and handoff. */
const { test } = require('node:test');
const assert = require('node:assert/strict');

function element(act) {
  const events = {};
  return {
    dataset: { act }, events, style: {}, classList: { toggle() {} },
    addEventListener(type, callback) { events[type] = callback; },
    setPointerCapture() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 100 }; },
    emit(type, pointerId, timeStamp, x = 50, y = 50) {
      events[type]?.({ type, pointerId, timeStamp, clientX: x, clientY: y, preventDefault() {} });
    },
  };
}

async function setup(t) {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  const oldNavigator = globalThis.navigator;
  const oldInput = globalThis.HTMLInputElement;
  const oldSelect = globalThis.HTMLSelectElement;
  const windowEvents = new Map();
  const documentEvents = new Map();
  const pads = [];
  const elements = new Map(['joyZone', 'joyKnob', 'pass', 'shoot', 'dribble', 'jump']
    .map(name => [name, element(name)]));
  globalThis.window = { addEventListener(name, callback) { windowEvents.set(name, callback); } };
  globalThis.HTMLInputElement = class {};
  globalThis.HTMLSelectElement = class {};
  globalThis.document = {
    hidden: false,
    addEventListener(name, callback) { documentEvents.set(name, callback); },
    querySelector(selector) { return elements.get(selector.slice(1)) || null; },
    querySelectorAll(selector) {
      return selector === '[data-act]' ? ['pass', 'shoot', 'dribble', 'jump'].map(k => elements.get(k)) : [];
    },
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true, value: { getGamepads: () => pads },
  });
  t.after(() => {
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument;
    if (oldNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, 'navigator', { configurable: true, value: oldNavigator });
    if (oldInput === undefined) delete globalThis.HTMLInputElement; else globalThis.HTMLInputElement = oldInput;
    if (oldSelect === undefined) delete globalThis.HTMLSelectElement; else globalThis.HTMLSelectElement = oldSelect;
  });
  const { Input } = await import('../src/input.js');
  const input = new Input();
  const key = (type, code, timeStamp) => {
    const event={type,code,timeStamp,target:{},defaultPrevented:false,preventDefault(){this.defaultPrevented=true}};
    windowEvents.get(type)?.(event);
    return event;
  };
  const keyTap = (code, down, up) => { key('keydown', code, down); key('keyup', code, up); };
  const touch = (act, type, id, timeStamp, x, y) => elements.get(act).emit(type, id, timeStamp, x, y);
  return { input, key, keyTap, pads, elements, touch, documentEvents };
}

test('Tab preserves native keyboard focus navigation without becoming a game action',async t=>{
 const {input,key}=await setup(t);
 const event=key('keydown','Tab',100);
 assert.equal(event.defaultPrevented,false,'the global game input layer must not trap native Tab navigation');
 input.poll();
 for(const action of ['pass','shoot','dribble','jump','pause','confirm'])
  assert.equal(input.held(0,action),false,`Tab does not activate ${action}`);
});

test('keyboard tap, hold, ordered double tap, and simultaneous action edges stay distinct', async t => {
  const { input, key, keyTap } = await setup(t);

  keyTap('KeyK', 100, 114); // Pass
  keyTap('KeyJ', 120, 140); // Shoot, after Pass in the same render interval
  input.poll();
  assert.equal(input.just(0, 'pass'), true);
  assert.equal(input.released(0, 'pass'), true);
  assert.equal(input.just(0, 'shoot'), true);
  assert.equal(input.released(0, 'shoot'), true);
  assert.equal(input.tapDuration(0, 'pass'), 0.014);
  assert.equal(input.tapDuration(0, 'shoot'), 0.02);
  input.poll();
  assert.equal(input.just(0, 'pass'), false);
  assert.equal(input.just(0, 'shoot'), false);

  keyTap('KeyI', 200, 208);
  keyTap('KeyI', 215, 230);
  input.poll();
  assert.equal(input.just(0, 'dribble'), true);
  assert.equal(input.tapDuration(0, 'dribble'), 0.008);
  input.poll();
  assert.equal(input.just(0, 'dribble'), true, 'second ordered tap replays once');
  assert.equal(input.tapDuration(0, 'dribble'), 0.015);
  input.poll();
  assert.equal(input.just(0, 'dribble'), false);

  key('keydown', 'KeyK', 300);
  input.poll();
  assert.equal(input.just(0, 'pass'), true);
  input.poll();
  assert.equal(input.held(0, 'pass'), true);
  assert.equal(input.just(0, 'pass'), false, 'held action does not auto-repeat');
  key('keyup', 'KeyK', 500);
  input.poll();
  assert.equal(input.held(0, 'pass'), false);
  assert.equal(input.released(0, 'pass'), true);
});

test('touch cancellation, same-action multitouch handoff, and joystick precedence are deterministic', async t => {
  const { input, touch } = await setup(t);

  touch('shoot', 'pointerdown', 1, 100);
  input.poll();
  assert.equal(input.just(0, 'shoot'), true);
  touch('shoot', 'pointercancel', 1, 115);
  input.poll();
  assert.equal(input.canceled(0, 'shoot'), true);
  assert.equal(input.released(0, 'shoot'), false, 'cancel must not commit a charged release');
  touch('shoot', 'pointerdown', 2, 130);
  input.poll();
  assert.equal(input.just(0, 'shoot'), true, 'a deliberate retry remains usable');

  touch('shoot', 'pointerdown', 3, 140);
  input.poll();
  assert.equal(input.just(0, 'shoot'), false, 'second finger on held action is not another tap');
  touch('shoot', 'pointerup', 2, 150);
  input.poll();
  assert.equal(input.held(0, 'shoot'), true, 'first finger release preserves second finger hold');
  assert.equal(input.released(0, 'shoot'), false);
  touch('shoot', 'pointerup', 3, 160);
  input.poll();
  assert.equal(input.released(0, 'shoot'), true, 'action releases after the final pointer');

  // Simultaneous distinct buttons coexist; the joystick vector takes precedence
  // over digital movement while a joystick pointer is active.
  touch('pass', 'pointerdown', 4, 200);
  touch('jump', 'pointerdown', 5, 201);
  input.poll();
  assert.equal(input.just(0, 'pass'), true);
  assert.equal(input.just(0, 'jump'), true);
  const zone = (await import('../src/input.js')); // Keep the fixture tied to the actual touch zone.
  void zone;
  const joy = globalThis.document.querySelector('#joyZone');
  joy.emit('pointerdown', 6, 205, 88, 50);
  input.poll();
  assert.ok(input.state[0].x > 0.5, 'active joystick directs right');
  touch('shoot', 'pointerdown', 7, 206);
  input.poll();
  assert.equal(input.just(0, 'shoot'), true, 'joystick and action pointer are independent');
  joy.emit('pointercancel', 6, 210);
  input.poll();
  assert.equal(input.state[0].x, 0, 'joystick cancellation clears movement');
});

test('CT19 backgrounding cancels held keyboard/touch input without queuing releases or taps', async t => {
  const { input, key, touch, documentEvents } = await setup(t);

  key('keydown', 'KeyK', 100); // Held Pass.
  touch('jump', 'pointerdown', 7, 101);
  input.poll();
  assert.equal(input.held(0, 'pass'), true);
  assert.equal(input.held(0, 'jump'), true);

  globalThis.document.hidden = true;
  documentEvents.get('visibilitychange')?.();
  input.poll();

  for (const action of ['pass', 'jump']) {
    assert.equal(input.held(0, action), false, `${action} cannot stay held after the page backgrounds`);
    assert.equal(input.canceled(0, action), true, `${action} is reported as cancelled`);
    assert.equal(input.released(0, action), false, `${action} does not become a charged release`);
    assert.equal(input.just(0, action), false, `${action} does not replay as a fresh press`);
  }
  assert.equal(input.pulseBacklog[0].pass || 0, 0, 'backgrounding clears completed tap replay');
});

test('keyboard and gamepad sources merge without premature release; bindings and multiplayer slots remain usable', async t => {
  const { input, key, pads } = await setup(t);
  const buttons = Array.from({ length: 16 }, () => ({ pressed: false }));
  pads[0] = { buttons, axes: [0, 0] };

  key('keydown', 'KeyK', 100);
  buttons[1].pressed = true; // Default gamepad Pass binding.
  input.poll();
  assert.equal(input.just(0, 'pass'), true);
  key('keyup', 'KeyK', 120);
  input.poll();
  assert.equal(input.held(0, 'pass'), true, 'gamepad keeps the merged action down after keyboard release');
  assert.equal(input.released(0, 'pass'), false);
  buttons[1].pressed = false;
  input.poll();
  assert.equal(input.released(0, 'pass'), true);

  buttons[0].pressed = true;
  buttons[2].pressed = true;
  buttons[3].pressed = true;
  input.poll();
  for (const action of ['shoot', 'dribble', 'jump']) assert.equal(input.just(0, action), true);
  buttons[0].pressed = false;
  buttons[2].pressed = false;
  buttons[3].pressed = false;
  input.poll();
  for (const action of ['shoot', 'dribble', 'jump']) assert.equal(input.released(0, action), true);

  const remapped = input.getBindings();
  remapped.keyboard = ['KeyL', 'KeyJ', 'KeyI', 'Space'];
  assert.equal(input.setBindings(remapped), true);
  key('keydown', 'KeyL', 200);
  input.poll();
  assert.equal(input.just(0, 'pass'), true, 'remapped key keeps action index');
  key('keyup', 'KeyL', 210);
  input.poll();

  // In local multiplayer, arrows belong to player two, while player one's
  // movement keys stay on player one; action keys remain independently mapped.
  key('keydown', 'ArrowLeft', 300);
  key('keydown', 'KeyD', 300);
  input.poll(true);
  assert.equal(input.state[0].right, 1, 'player-one arrows are suppressed in versus mode while WASD remains active');
  assert.equal(input.state[1].left, 1, 'arrows drive player two');
  assert.equal(input.state[0].x > 0, true, 'WASD continues to drive player one');
});

test('real input Pass release reaches field possession and same-team keeper distribution', async t => {
  const { input, key } = await setup(t);
  const { GameEngine } = await import('../src/engine.js');
  const { DEFAULT_OPTIONS } = await import('../src/data.js');
  const game = new GameEngine({ ...DEFAULT_OPTIONS, weather: 'Clear' }, input);
  game.init({ home: 0, away: 9, options: { ...DEFAULT_OPTIONS, weather: 'Clear' } });
  game.cooldown = 0;
  game.clock = 5;
  game.driveAI = () => {};
  game.humans = 1;
  const player = game.player(0, 3);
  game.take(player);
  game.controlled[0] = player.i;
  let passDuration = null;
  game.pass = (_player, isLong) => { passDuration = isLong; };

  key('keydown', 'KeyK', 100);
  key('keyup', 'KeyK', 150);
  input.poll();
  game.updatePlayers(0.016);
  assert.equal(passDuration, false, 'short Pass release while carrying is a short pass');

  game.take(player);
  key('keydown', 'KeyK', 200);
  key('keyup', 'KeyK', 550);
  input.poll();
  assert.equal(input.tapDuration(0, 'pass'), 0.35);
  game.updatePlayers(0.016);
  assert.equal(passDuration, true, 'long Pass duration reaches a field carrier');

  const keeper = game.player(0, 0);
  game.take(keeper);
  game.controlled[0] = keeper.i;
  game.events.length = 0;
  key('keydown', 'KeyK', 700);
  key('keyup', 'KeyK', 750);
  input.poll();
  game.updatePlayers(0.016);
  assert.ok(game.events.some(event => event.type === 'keeperDistribution'),
    'Pass release while a same-team keeper owns the ball reaches keeper distribution');

  game.take(keeper);
  game.events.length = 0;
  const requestedKeeperModes = [];
  game.distributeKeeper = (_player, mode) => { requestedKeeperModes.push(mode); };
  key('keydown', 'KeyK', 800);
  key('keyup', 'KeyK', 1150);
  input.poll();
  assert.equal(input.tapDuration(0, 'pass'), 0.35);
  game.updatePlayers(0.016);
  assert.ok(requestedKeeperModes.includes('long'),
    `long Pass duration should request long keeper distribution; got ${requestedKeeperModes.join(',')}`);

});

test('long Pass while selected field player has keeper possession requests long distribution', async t => {
  const { input, key } = await setup(t);
  const { GameEngine } = await import('../src/engine.js');
  const { DEFAULT_OPTIONS } = await import('../src/data.js');
  const game = new GameEngine({ ...DEFAULT_OPTIONS, weather: 'Clear' }, input);
  game.init({ home: 0, away: 9, options: { ...DEFAULT_OPTIONS, weather: 'Clear' } });
  game.cooldown = 0;
  game.clock = 5;
  game.driveAI = () => {};
  game.humans = 1;
  const keeper = game.player(0, 0);
  game.take(keeper);
  game.controlled[0] = 3; // normal field-player selection remains active after a keeper catch
  assert.equal(game.ball.owner, keeper);
  assert.equal(game.controlled[0], 3);
  const modes = [];
  game.distributeKeeper = (_player, mode) => { modes.push(mode); };

  key('keydown', 'KeyK', 100);
  key('keyup', 'KeyK', 450);
  input.poll();
  assert.equal(input.released(0, 'pass'), true);
  assert.equal(input.tapDuration(0, 'pass'), 0.35);
  game.updatePlayers(0.016);
  assert.equal(game.controlledPlayer(0).controlled, true, 'the selected field player receives the action frame');
  assert.ok(modes.includes('long'),
    `selected field player's long Pass must reach keeper distribution; got ${modes.join(',')}`);
});
