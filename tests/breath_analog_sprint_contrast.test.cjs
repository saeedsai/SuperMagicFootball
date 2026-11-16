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

test('analog walk-to-carry threshold never grants free Breath while held Dribble, but sprint is costly', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    for (const fps of [30, 60, 120]) {
      const dt = 1 / fps;
      const cap = F.breathCapacity(stamina);
      const start = cap * 0.6;
      const holdRate = F.dribbleHoldBreathRate(stamina);
      let walk = start, carry = start, sprint = start;
      for (let frame = 0; frame < fps; frame++) {
        walk = F.breathTick(walk, stamina, dt, F.breathMovementIntensity(0.55, false));
        carry = Math.max(0, F.breathTick(carry, stamina, dt, F.breathMovementIntensity(0.56, false)) - holdRate * dt);
        sprint = F.breathTick(sprint, stamina, dt, F.breathMovementIntensity(0.56, true));
      }
      assert.ok(walk > start, `walking should recover: stamina=${stamina} fps=${fps}`);
      assert.ok(carry < start && start - carry < 0.25,
        `held ball carry must cost little, never recharge: stamina=${stamina} fps=${fps}`);
      assert.ok(sprint < carry && start - sprint > (start - carry) * 6,
        `partial-stick sprint must be substantially costlier: stamina=${stamina} fps=${fps}`);
    }
  }
});

test('exhausted sprint recovers by walking but never exceeds the Stamina-dependent cap', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    for (const fps of [30, 60, 120]) {
      const dt = 1 / fps;
      const cap = F.breathCapacity(stamina);
      let breath = cap;
      for (let frame = 0; frame < 2 * fps; frame++)
        breath = F.breathTick(breath, stamina, dt, F.breathMovementIntensity(1, true));
      assert.ok(breath < cap - Math.min(2, cap * .3), `sprinting must exhaust a meaningful portion: stamina=${stamina} fps=${fps}`);
      const exhausted = breath;
      for (let frame = 0; frame < fps; frame++)
        breath = F.breathTick(breath, stamina, dt, F.breathMovementIntensity(.55, false));
      assert.ok(breath > exhausted, `walking must restore sprint-depleted Breath: stamina=${stamina} fps=${fps}`);
      const afterWalk = breath;
      for (let frame = 0; frame < fps; frame++)
        breath = F.breathTick(breath, stamina, dt, F.breathMovementIntensity(.56, false));
      assert.ok(breath < afterWalk, `ordinary ball carrying must not refill Breath: stamina=${stamina} fps=${fps}`);
      for (let frame = 0; frame < 30 * fps; frame++)
        breath = F.breathTick(breath, stamina, dt, 0);
      assert.ok(Math.abs(breath - cap) < 1e-8, `idle recovery must stop at cap: stamina=${stamina} fps=${fps}`);
    }
  }
});

test('rapid walk/carry/sprint transitions preserve Breath accounting without frame-rate exploits', async () => {
  const F = await fitness;
  for (const stamina of [1, 35, 70, 100]) {
    const cap = F.breathCapacity(stamina);
    for (const fps of [30, 60, 120]) {
      const dt = 1 / fps;
      const start = cap * 0.65;
      let breath = start;
      const stages = [
        {magnitude: 0.55, sprint: false, seconds: 1},
        {magnitude: 0.56, sprint: false, seconds: 1, hold: true},
        {magnitude: 0.56, sprint: true, seconds: 1},
        {magnitude: 0, sprint: false, seconds: 1},
      ];
      const snapshots = [];
      for (const stage of stages) {
        for (let frame = 0; frame < stage.seconds * fps; frame++) {
          breath = F.breathTick(breath, stamina, dt,
            F.breathMovementIntensity(stage.magnitude, stage.sprint));
          if (stage.hold)
            breath = Math.max(0, breath - F.dribbleHoldBreathRate(stamina) * dt);
          assert.ok(Number.isFinite(breath) && breath >= 0 && breath <= cap,
            `invalid Breath at stamina=${stamina} fps=${fps}`);
        }
        snapshots.push(breath);
      }
      assert.ok(snapshots[0] > start, 'walking must refill before running');
      assert.ok(snapshots[1] < snapshots[0], 'ordinary carry must not refill');
      assert.ok(snapshots[2] < snapshots[1] - 0.3, 'sprint must deplete meaningfully');
      assert.ok(snapshots[3] > snapshots[2], 'idle must recover after sprint');
    }
  }
});
