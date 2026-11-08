'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fitness = import(pathToFileURL(path.resolve(__dirname, '../src/modules/fitness.js')).href).then(m => m.FITNESS);

test('sprint exhaustion, walking recovery and resumed ordinary ball carry remain bounded', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    for (const fps of [30, 60, 120]) {
      const dt = 1 / fps;
      const cap = F.breathCapacity(stamina);
      let breath = cap;
      for (let i = 0; i < fps * 15; i++) {
        breath = F.breathTick(breath, stamina, dt, F.breathMovementIntensity(1, true));
      }
      assert.equal(breath, 0, `sprint should exhaust Breath: stamina=${stamina}, fps=${fps}`);
      const exhausted = breath;
      for (let i = 0; i < fps; i++) {
        breath = F.breathTick(breath, stamina, dt, F.breathMovementIntensity(.3, false));
      }
      assert.ok(breath > exhausted && breath < cap,
        `walking must partially restore Breath: stamina=${stamina}, fps=${fps}`);
      const recovered = breath;
      for (let i = 0; i < fps; i++) {
        breath = F.breathTick(breath, stamina, dt, F.breathMovementIntensity(1, false));
        breath = Math.max(0, breath - F.dribbleHoldBreathRate(stamina) * dt);
      }
      assert.ok(breath < recovered && breath >= 0,
        `ordinary ball carry with held dribble should spend a small positive amount: stamina=${stamina}, fps=${fps}`);
      assert.ok(recovered - breath < cap * .1,
        `ordinary ball carry must remain cheap after sprint exhaustion: stamina=${stamina}, fps=${fps}`);
    }
  }
});
