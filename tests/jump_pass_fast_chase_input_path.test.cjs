/** CT19/CT20: off-ball Jump+Pass remains a grounded fast chase with auto-tackle. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let runtimePromise;
function runtime() {
  if (!runtimePromise) {
    let bundle = fs.readFileSync(path.join(__dirname, '.generated/game.js'), 'utf8');
    const ui = bundle.indexOf('// Supermagic Football v0.8.25.30 | UI |');
    if (ui >= 0) bundle = bundle.slice(0, ui);
    bundle += '\nexport { ENGINE, DATA };';
    runtimePromise = import(`data:text/javascript;base64,${Buffer.from(bundle).toString('base64')}`);
  }
  return runtimePromise;
}

test('off-ball Jump+Pass pursues and auto-tackles instead of jumping out of chase', async () => {
  const { ENGINE, DATA } = await runtime();
  const edges = { jump: true, pass: true };
  const input = {
    state: [{ x: 1, y: 0, right: 1, jump: 1, pass: 1 }, {}],
    poll() {},
    just: (_team, action) => !!edges[action],
    released: () => false,
    canceled: () => false,
    held: (_team, action) => !!input.state[0]?.[action],
    tapDuration: () => 0,
  };
  const game = new ENGINE.GameEngine({ ...DATA.DEFAULT_OPTIONS, weather: 'Clear' }, input);
  game.init({ home: 0, away: 9, options: { ...DATA.DEFAULT_OPTIONS, weather: 'Clear' } });
  game.humans = 1;
  game.cooldown = 0;
  game.driveAI = () => {};
  const runner = game.player(0, 3);
  runner.x = 1400;
  runner.y = 650;
  runner.stun = 0;
  runner.cd = 0;
  runner.fatigue = 0;
  game.controlled[0] = runner.i;
  game.ball.owner = null;
  game.ball.x = 1485;
  game.ball.y = runner.y;
  for (const opponent of game.players.filter(player => player.t !== runner.t)) {
    opponent.x = 2350;
    opponent.y = 1050;
  }

  // First simultaneous chord edge, then a sustained four-button-compatible
  // hold. At 60 Hz the contextual Pass hold enters pursuit after 0.24 seconds.
  game.updatePlayers(1 / 60);
  edges.jump = false;
  edges.pass = false;
  for (let frame = 1; frame < 30; frame++) game.updatePlayers(1 / 60);

  assert.equal(runner.z, 0, 'off-ball Jump+Pass must not launch the player and clear pursuit');
  assert.ok(runner.x > 1400, 'the directional input continues to move the chaser');
  assert.ok(runner.cd > 0, 'close contact triggers the chase auto-tackle');
  assert.ok(game.events.some(event => event.type === 'tackleHit' && event.team === 0) || runner.action === 'punch',
    'the contextual chase resolves through the existing tackle action');
});
