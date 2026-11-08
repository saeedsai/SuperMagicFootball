'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fitness = import(pathToFileURL(path.resolve(__dirname, '../src/modules/fitness.js')).href).then(m => m.FITNESS);

test('analog sprint intensity increases with stick deflection and always exceeds ordinary movement', async () => {
  const F = await fitness;
  const samples = [0.15, 0.3, 0.55, 0.6, 0.75, 0.9, 1];
  let previous = 0;
  for (const magnitude of samples) {
    const ordinary = F.breathMovementIntensity(magnitude, false);
    const sprint = F.breathMovementIntensity(magnitude, true);
    assert.ok(Number.isFinite(ordinary) && Number.isFinite(sprint));
    assert.ok(sprint > ordinary, `sprint must be more intense at analog magnitude ${magnitude}`);
    assert.ok(sprint >= previous, `sprint intensity must not fall as analog magnitude increases: ${magnitude}`);
    previous = sprint;
  }
});

test('partial-stick sprint drains more Breath than ordinary ball movement across stamina and frame rates', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    for (const fps of [30, 60, 120]) {
      for (const magnitude of [0.6, 0.75, 0.9, 1]) {
        const start = F.breathCapacity(stamina) * 0.75;
        let ordinary = start;
        let sprint = start;
        for (let frame = 0; frame < fps; frame++) {
          const dt = 1 / fps;
          ordinary = F.breathTick(ordinary, stamina, dt, F.breathMovementIntensity(magnitude, false));
          sprint = F.breathTick(sprint, stamina, dt, F.breathMovementIntensity(magnitude, true));
        }
        assert.ok(ordinary <= start, 'ordinary running must not regenerate Breath');
        assert.ok(sprint < ordinary, `partial sprint should cost more: stamina=${stamina} fps=${fps} magnitude=${magnitude}`);
      }
    }
  }
});
