// BREATH-STAMINA-SCALING-01: test the shipped FITNESS implementation without mocks.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../src/modules/fitness.js'), 'utf8');
const context = {};
vm.runInNewContext(source.replace(/export \{FITNESS\};?/, '') + '\nthis.F = FITNESS;', context);
const F = context.F;
function simulate(stamina, magnitude, sprint, seconds = 1, fps = 60) {
  const cap = F.breathCapacity(stamina);
  let breath = cap;
  for (let frame = 0; frame < seconds * fps; frame++) {
    breath = F.breathTick(breath, stamina, 1 / fps, F.breathMovementIntensity(magnitude, sprint));
  }
  return { cap, breath, spent: cap - breath };
}
test('sprint costs more than ordinary ball movement at all stamina levels', () => {
  for (const stamina of [1, 35, 60, 100]) {
    const ordinary = simulate(stamina, 1, false);
    const sprint = simulate(stamina, 1, true);
    assert.ok(ordinary.spent >= 0 && ordinary.spent < 0.2, 'ordinary movement must remain inexpensive');
    assert.ok(sprint.spent > ordinary.spent + 1, 'sprint must be materially more expensive');
    assert.ok(sprint.breath >= 0 && sprint.breath <= sprint.cap);
  }
});
test('higher stamina increases capacity and lowers absolute sprint drain', () => {
  const low = simulate(1, 1, true);
  const high = simulate(100, 1, true);
  assert.ok(high.cap > low.cap);
  assert.ok(high.spent < low.spent);
});
test('walking restores depleted breath without changing long-term energy', () => {
  for (const stamina of [1, 60, 100]) {
    const cap = F.breathCapacity(stamina);
    const before = cap / 4;
    const energy = 0.42;
    const after = F.breathTick(before, stamina, 0.5, F.breathMovementIntensity(0.25, false));
    assert.ok(after > before && after <= cap);
    assert.equal(energy, 0.42);
  }
});
