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
