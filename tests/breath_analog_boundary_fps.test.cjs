const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercise the production FITNESS implementation rather than duplicating its formula.
const source = fs.readFileSync(path.join(__dirname, '../src/modules/fitness.js'), 'utf8');
const context = {};
vm.runInNewContext(source.replace(/export \\{FITNESS\\};?/g, '') + '\nthis.F = FITNESS;', context);
const F = context.F;

test('analog walking boundary recovers Breath at all Stamina levels', () => {
  for (const stamina of [1, 25, 50, 75, 100]) {
    const cap = F.breathCapacity(stamina);
    const start = cap / 3;
    for (const magnitude of [0, .14, .25, .55, .5500000000000001]) {
      const intensity = F.breathMovementIntensity(magnitude);
      const end = F.breathTick(start, stamina, 1, intensity);
      assert.ok(end > start, `walk must recover: stamina=${stamina}, input=${magnitude}, intensity=${intensity}`);
      assert.ok(end <= cap);
    }
    const ordinary = F.breathTick(start, stamina, 1, F.breathMovementIntensity(1));
    const sprint = F.breathTick(start, stamina, 1, F.breathMovementIntensity(1, true));
    assert.ok(ordinary < start, 'full-speed ordinary running costs a little Breath');
    assert.ok(sprint < ordinary - 1, 'sprint costs substantially more than ordinary running');
  }
});

test('walking recovery and sprint drain remain stable under different frame sizes', () => {
  for (const stamina of [1, 50, 100]) {
    const cap = F.breathCapacity(stamina);
    for (const [input, sprint] of [[.55, false], [1, false], [1, true]]) {
      const intensity = F.breathMovementIntensity(input, sprint);
      const simulate = fps => {
        let breath = cap / 2;
        for (let frame = 0; frame < fps; frame++) {
          breath = F.breathTick(breath, stamina, 1 / fps, intensity);
        }
        return breath;
      };
      assert.ok(Math.abs(simulate(30) - simulate(120)) < 1e-8,
        `frame-rate drift at stamina=${stamina}, input=${input}, sprint=${sprint}`);
    }
  }
});
