const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../src/modules/fitness.js'), 'utf8');
const context = {};
vm.runInNewContext(source.replace(/export \{FITNESS\};?/g, '') + '\nthis.F=FITNESS;', context);
const F = context.F;

// Boundary and ownership regressions supplement the existing rate/FPS suites.
// Test the real module so future balance changes cannot silently invert sprint cost.
test('analog movement intensity and Breath response are monotonic across the walk/sprint transition', () => {
  for (const stamina of [1, 25, 50, 75, 100]) {
    const cap = F.breathCapacity(stamina);
    const start = cap * .5;
    for (const input of [.15, .25, .4, .55, .56, .75, 1]) {
      const ordinary = F.breathMovementIntensity(input);
      const sprint = F.breathMovementIntensity(input, true);
      assert.ok(sprint > ordinary, `sprint must be more intense: ${input}`);
      const normalEnd = F.breathTick(start, stamina, .25, ordinary);
      const sprintEnd = F.breathTick(start, stamina, .25, sprint);
      assert.ok(sprintEnd < normalEnd, `sprint must cost more: stamina=${stamina} input=${input}`);
      assert.ok(normalEnd >= 0 && normalEnd <= cap && sprintEnd >= 0 && sprintEnd <= cap);
    }
    const walking = F.breathTick(start, stamina, .25, F.breathMovementIntensity(.55));
    const running = F.breathTick(start, stamina, .25, F.breathMovementIntensity(.56));
    assert.ok(walking > start, 'walking threshold still recovers');
    assert.ok(running < start, 'just above threshold must drain, not recover');
  }
});

test('ordinary ball carrying costs little across frame rates even after one-off Dribble', () => {
  for (const stamina of [1, 50, 100]) {
    const cap = F.breathCapacity(stamina);
    const initial = F.spendBreath(cap, stamina, 'dribble');
    for (const fps of [30, 60, 120]) {
      let ordinary = initial, sprint = initial;
      for (let i = 0; i < fps; i++) {
        const dt = 1 / fps;
        ordinary = Math.max(0, F.breathTick(ordinary, stamina, dt, F.breathMovementIntensity(1)) - dt * F.dribbleHoldBreathRate(stamina));
        sprint = F.breathTick(sprint, stamina, dt, F.breathMovementIntensity(1, true));
      }
      assert.ok(initial - ordinary < .25, 'ordinary dribble drain budget');
      assert.ok(ordinary - sprint > 1, 'sprint costs much more than ordinary dribble');
    }
  }
});
