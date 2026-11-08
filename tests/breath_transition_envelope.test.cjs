'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const moduleUrl = pathToFileURL(path.resolve(__dirname, '../src/modules/fitness.js')).href;
const fitness = import(moduleUrl).then(mod => mod.FITNESS);

function simulate(F, stamina, magnitude, sprinting, duration, fps) {
  const intensity = F.breathMovementIntensity(magnitude, sprinting);
  let breath = F.breathCapacity(stamina) * 0.75;
  for (let frame = 0; frame < duration * fps; frame++) {
    breath = F.breathTick(breath, stamina, 1 / fps, intensity);
  }
  return breath;
}

test('ordinary full-stick ball running drains far less Breath than sprint at 30/60/120 FPS', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    const cap = F.breathCapacity(stamina);
    for (const fps of [30, 60, 120]) {
      const ordinary = simulate(F, stamina, 1, false, 2, fps);
      const sprint = simulate(F, stamina, 1, true, 2, fps);
      const starting = cap * .75;
      const ordinaryCost = starting - ordinary;
      const sprintCost = starting - sprint;
      assert.ok(ordinaryCost > 0 && ordinaryCost < cap * .10, `ordinary cost ${ordinaryCost}, stamina ${stamina}, fps ${fps}`);
      assert.ok(sprintCost > ordinaryCost * 7, `sprint cost ${sprintCost}, ordinary ${ordinaryCost}, stamina ${stamina}, fps ${fps}`);
    }
  }
});

test('walking and idle recover Breath while full-stick running never regenerates it', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    const cap = F.breathCapacity(stamina);
    const initial = cap * .25;
    const idle = F.breathTick(initial, stamina, .5, F.breathMovementIntensity(0));
    const walking = F.breathTick(initial, stamina, .5, F.breathMovementIntensity(.3));
    const ordinary = F.breathTick(initial, stamina, .5, F.breathMovementIntensity(1));
    const sprint = F.breathTick(initial, stamina, .5, F.breathMovementIntensity(1, true));
    assert.ok(idle > initial && walking > initial, `recovery at stamina ${stamina}`);
    assert.ok(ordinary < initial && sprint < ordinary, `running drain at stamina ${stamina}`);
  }
});

test('held dribble remains inexpensive beside sprint across stamina and frame rates', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    const cap = F.breathCapacity(stamina);
    const holdRate = F.dribbleHoldBreathRate(stamina);
    assert.ok(holdRate > 0, 'held dribble must have a positive cost');
    for (const fps of [30, 60, 120]) {
      const seconds = 2;
      const initial = cap * .75;
      let dribble = initial;
      let sprint = initial;
      for (let frame = 0; frame < seconds * fps; frame++) {
        const dt = 1 / fps;
        dribble = Math.max(0, dribble - holdRate * dt);
        sprint = F.breathTick(sprint, stamina, dt, F.breathMovementIntensity(1, true));
      }
      const dribbleCost = initial - dribble;
      const sprintCost = initial - sprint;
      assert.ok(dribbleCost < cap * .15, `held dribble cost ${dribbleCost}, stamina ${stamina}, fps ${fps}`);
      assert.ok(sprintCost > dribbleCost * 4, `sprint ${sprintCost} vs hold ${dribbleCost}, stamina ${stamina}, fps ${fps}`);
      assert.ok(Math.abs(dribbleCost - holdRate * seconds) < 1e-8, 'hold cost must be frame-rate independent');
    }
  }
});

test('simultaneous ordinary ball carry plus held dribble stays cheap relative to sprint', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    const costs = [];
    for (const fps of [30, 60, 120]) {
      const initial = F.breathCapacity(stamina) * .75;
      let ordinaryCarry = initial;
      let sprint = initial;
      const dt = 1 / fps;
      for (let frame = 0; frame < 2 * fps; frame++) {
        ordinaryCarry = Math.max(0,
          F.breathTick(ordinaryCarry, stamina, dt, F.breathMovementIntensity(1, false))
          - F.dribbleHoldBreathRate(stamina) * dt);
        sprint = F.breathTick(sprint, stamina, dt, F.breathMovementIntensity(1, true));
      }
      const carryCost = initial - ordinaryCarry;
      const sprintCost = initial - sprint;
      assert.ok(carryCost > 0 && carryCost < initial * .20,
        `ordinary carry/hold cost ${carryCost}, stamina ${stamina}, fps ${fps}`);
      assert.ok(sprintCost > carryCost * 4,
        `sprint ${sprintCost} must dominate ordinary carry ${carryCost}`);
      costs.push(carryCost);
    }
    assert.ok(Math.max(...costs) - Math.min(...costs) < 1e-8,
      `ordinary carry+hold cost must be frame-rate independent at stamina ${stamina}`);
  }
});
