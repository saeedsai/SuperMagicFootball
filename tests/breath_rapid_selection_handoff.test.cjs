const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Regression: the production visibility predicate must not depend on stale
// per-player "controlled" flags, or leak a ring across a local seat handoff.
const render = fs.readFileSync(path.join(__dirname, '../src/modules/render.js'), 'utf8');
const match = render.match(/function shouldShowBreathRing\(p,game,inMatchDraw\)\{[\s\S]*?\n\}/);
test('Breath ring fails closed across rapid selection and local-seat handoffs', () => {
  assert.ok(match, 'production visibility predicate exists');
  const visible = vm.runInNewContext('(' + match[0] + ')');
  const teams = [
    Array.from({length: 3}, (_, i) => ({t: 0, i, controlled: i === 0})),
    Array.from({length: 3}, (_, i) => ({t: 1, i, controlled: i === 0}))
  ];
  const selected = [teams[0][0], teams[1][0]];
  const game = {
    localBreathSide: 0,
    humans: 2,
    inControl(t) { return this.humans === 2 || t === 0; },
    controlledPlayer(t) { return selected[t]; }
  };
  const rings = () => teams.flat().filter(p => visible(p, game, true));
  for (let turn = 0; turn < 24; turn++) {
    const seat = turn % 2;
    game.localBreathSide = seat;
    selected[seat] = teams[seat][turn % 3];
    assert.deepEqual(rings(), [selected[seat]], 'exactly one local selected player ring');
    const old = selected[seat];
    selected[seat] = null;
    assert.equal(rings().length, 0, 'missing selection cannot show stale ring');
    selected[seat] = old;
    assert.deepEqual(rings(), [old], 'ring returns only on restored selection');
  }
  game.localBreathSide = 1;
  game.humans = 1;
  assert.equal(rings().length, 0, 'CPU team is excluded');
  game.humans = 2;
  assert.equal(teams.flat().filter(p => visible(p, game, false)).length, 0, 'outside match');
  selected[1].preview = true;
  assert.equal(rings().length, 0, 'Studio preview excluded');
});
