'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fitness = import(pathToFileURL(path.resolve(__dirname, '../src/modules/fitness.js')).href).then(m => m.FITNESS);

test('Breath transitions stay bounded and monotone near exhaustion and full capacity', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    const cap = F.breathCapacity(stamina);
    assert.ok(Number.isFinite(cap) && cap > 0);
    for (const fps of [30, 60, 120]) {
      const dt = 1 / fps;
      for (const start of [0, cap * 0.001, cap * 0.5, cap * 0.999, cap]) {
        const ordinary = F.breathTick(start, stamina, dt, F.breathMovementIntensity(1, false));
        const sprint = F.breathTick(start, stamina, dt, F.breathMovementIntensity(1, true));
        const idle = F.breathTick(start, stamina, dt, F.breathMovementIntensity(0));
        for (const value of [ordinary, sprint, idle]) {
          assert.ok(Number.isFinite(value) && value >= 0 && value <= cap,
            `out-of-bounds Breath ${value} at stamina=${stamina} fps=${fps} start=${start}`);
        }
        assert.ok(sprint <= ordinary + 1e-10,
          `sprint cannot retain more Breath than ordinary running at stamina=${stamina}`);
        assert.ok(ordinary <= start + 1e-10, 'running cannot regenerate Breath');
        assert.ok(idle >= start - 1e-10, 'idle cannot consume Breath');
      }
    }
  }
});
