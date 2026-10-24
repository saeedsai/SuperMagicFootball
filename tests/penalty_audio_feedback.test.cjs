/** Playable modular penalty feedback, isolated from AI and match physics. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

async function audioFixture(t) {
  const { AUDIO } = await import('../src/modules/audio.js');
  class FakeCtx {
    constructor() { this.currentTime = 1; this.state = 'running'; this.destination = {}; }
    close() { this.state = 'closed'; return Promise.resolve(); }
    resume() { this.state = 'running'; return Promise.resolve(); }
  }
  const a = new AUDIO.ArcadeAudio({}, FakeCtx);
  const notes = [];
  a.tone = (...args) => notes.push({ freq: args[0], kind: args[2] || 'sfx' });
  t.after(() => a.dispose());
  return { a, notes };
}

test('actual penaltyKick outcome chooses distinct rising goal and falling save melodies', async t => {
  const { a, notes } = await audioFixture(t);
  a.cue({ type: 'penaltyKick', goal: true });
  assert.equal(notes.length, 0, 'no sound before user gesture');
  assert.equal(a.unlock(), true);
  a.cue({ type: 'penaltyKick', goal: true });
  assert.deepEqual(notes.map(n => n.freq), [587, 740, 880]);
  assert(notes.every(n => n.kind === 'sfx'), 'penalty outcome respects effects fader');
  a.ctx.currentTime += 0.4;
  notes.length = 0;
  a.cue({ type: 'penaltyKick', goal: false });
  assert.deepEqual(notes.map(n => n.freq), [392, 294, 220]);
});

test('penalty dive and shootout introduction have their own small cues and volume buses', async t => {
  const { a, notes } = await audioFixture(t);
  a.unlock();
  a.cue({ type: 'penaltyStart' });
  assert.deepEqual(notes.map(n => n.freq), [330, 440]);
  assert(notes.every(n => n.kind === 'ui'));
  a.ctx.currentTime += 0.4;
  notes.length = 0;
  a.cue({ type: 'penaltyDive', team: 1 });
  assert.deepEqual(notes.map(n => n.freq), [165]);
  assert.equal(notes[0].kind, 'sfx');
});

test('duplicate outcome events rate limit without suppressing alternating success and save', async t => {
  const { a, notes } = await audioFixture(t);
  a.unlock();
  a.cue({ type: 'penaltyKick', goal: true });
  a.cue({ type: 'penaltyKick', goal: true });
  assert.equal(notes.length, 3);
  a.cue({ type: 'penaltyKick', goal: false });
  assert.equal(notes.length, 6, 'separate outcomes have independent debounce keys');
  a.ctx.currentTime += 0.19;
  a.cue({ type: 'penaltyKick', goal: false });
  assert.equal(notes.length, 9);
});

test('mute, zero-volume and suspended tab suppress penalty cues', async t => {
  const { a, notes } = await audioFixture(t);
  a.unlock();
  a.configure({ mute: true });
  a.cue({ type: 'penaltyKick', goal: true });
  assert.equal(notes.length, 0);
  a.configure({ master: 75, sfx: 0, ui: 50 });
  a.cue({ type: 'penaltyKick', goal: false });
  assert.equal(notes.length, 0);
  a.cue({ type: 'penaltyStart' });
  assert.equal(notes.length, 2, 'UI fader remains independently functional');
  notes.length = 0;
  a.ctx.currentTime += 0.3;
  a.configure({ master: 75, sfx: 50, ui: 0 });
  a.cue({ type: 'penaltyStart' });
  assert.equal(notes.length, 0);
  a.cue({ type: 'penaltyKick', goal: true });
  assert.equal(notes.length, 3);
  notes.length = 0;
  a.visibilityPaused = true;
  a.ctx.currentTime += 0.3;
  a.cue({ type: 'penaltyKick', goal: true });
  assert.equal(notes.length, 0);
});

test('legacy string penaltyKick still sounds like kick and existing goals stay unchanged', async t => {
  const { a, notes } = await audioFixture(t);
  a.unlock();
  a.cue('penaltyKick');
  assert.deepEqual(notes.map(n => n.freq), [230]);
  a.ctx.currentTime += 0.3;
  notes.length = 0;
  a.cue({ type: 'goal' });
  assert.deepEqual(notes.map(n => n.freq), [523, 659, 784, 1046]);
});

test('real playable engine/UI forward resolved PK goal flag to modular audio', () => {
  const root = path.join(__dirname, '..');
  const engine = readFileSync(path.join(root, 'src/modules/engine.js'), 'utf8');
  const ui = readFileSync(path.join(root, 'src/modules/ui.js'), 'utf8');
  const audio = readFileSync(path.join(root, 'src/modules/audio.js'), 'utf8');
  assert.match(engine, /this\.emit\('penaltyKick',\{team:at,goal:success\}\)/);
  assert.match(engine, /this\.emit\('penaltyStart'\)/);
  assert.match(ui, /game\.onEvent=e=>\{[\s\S]{0,700}audio\.cue\(e\)/);
  assert.match(audio, /event\.goal\?'penaltyGoal':'penaltySave'/);
});
