/** Human dribble trick acoustic-feedback contracts for modular playable game. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

async function setup(t) {
  const { AUDIO } = await import('../src/modules/audio.js');
  class MockAudioContext {
    constructor() { this.currentTime = 2; this.state = 'running'; }
    close() { this.state = 'closed'; return Promise.resolve(); }
    resume() { this.state = 'running'; return Promise.resolve(); }
  }
  const audio = new AUDIO.ArcadeAudio({}, MockAudioContext);
  const notes = [];
  audio.tone = (frequency, duration, kind = 'sfx') =>
    notes.push({frequency, duration, kind});
  t.after(() => audio.dispose());
  return {audio, notes};
}

test('successful human skill-move plays a rising two-note feedback cue', async t => {
  const {audio, notes} = await setup(t);
  audio.unlock();
  audio.cue({type:'dribbleTrick', success:true, ai:false, style:'rainbow'});
  assert.deepEqual(notes.map(x=>x.frequency), [440, 659]);
  assert(notes.every(x=>x.kind==='sfx'));
});

test('unsuccessful human skill-move emits distinct soft low-pitched cue', async t => {
  const {audio, notes} = await setup(t);
  audio.unlock();
  audio.cue({type:'dribbleTrick', success:false, ai:false, style:'rainbow'});
  assert.deepEqual(notes.map(x=>x.frequency), [175]);
  audio.ctx.currentTime+=0.19;
  audio.cue({type:'dribbleTrick', success:true, ai:false, style:'spin'});
  assert.deepEqual(notes.map(x=>x.frequency), [175, 440, 659]);
});

test('AI dribbles and malformed event payloads cannot generate sound', async t => {
  const {audio, notes} = await setup(t);
  audio.unlock();
  audio.cue({type:'dribbleTrick', success:true, ai:true});
  audio.cue({type:'dribbleTrick', success:false, ai:true});
  audio.cue({type:'dribbleTrick', success:true}); // unknown ownership
  audio.cue({type:'dribbleTrick', ai:false}); // unknown result
  audio.cue('dribbleTrick');
  assert.deepEqual(notes, []);
  audio.cue({type:'dribbleTrick', success:true, ai:false});
  assert.equal(notes.length, 2, 'ignored AI attempts do not throttle human audio');
});

test('skill feedback obeys autoplay gesture gate, mute and effects volume', async t => {
  const {audio, notes} = await setup(t);
  audio.cue({type:'dribbleTrick', success:true, ai:false});
  assert.equal(notes.length,0);
  audio.unlock();
  audio.configure({mute:true});
  audio.cue({type:'dribbleTrick', success:true, ai:false});
  assert.equal(notes.length,0);
  audio.configure({master:100,sfx:0});
  audio.cue({type:'dribbleTrick', success:false, ai:false});
  assert.equal(notes.length,0);
  audio.configure({master:70,sfx:70});
  audio.cue({type:'dribbleTrick', success:true, ai:false});
  assert.equal(notes.length,2);
  audio.visibilityPaused=true;
  audio.ctx.currentTime+=1;
  audio.cue({type:'dribbleTrick', success:false, ai:false});
  assert.equal(notes.length,2);
});

test('repeat skill events debounce; penalty/keeper sound mapping remains unaffected', async t => {
  const {audio, notes} = await setup(t);
  audio.unlock();
  const e={type:'dribbleTrick',success:true,ai:false};
  audio.cue(e);
  audio.cue(e);
  assert.equal(notes.length,2);
  audio.ctx.currentTime+=0.18;
  audio.cue(e);
  assert.equal(notes.length,4);
  audio.ctx.currentTime+=0.3;
  audio.cue({type:'penaltyKick', goal:false});
  assert.deepEqual(notes.slice(-3).map(x=>x.frequency),[392,294,220]);
});

test('the real engine emits success/failure and human/AI flags to the existing UI audio bridge', () => {
  const dir=join(__dirname,'..');
  const engine=readFileSync(join(dir,'src/modules/engine.js'),'utf8');
  const ui=readFileSync(join(dir,'src/modules/ui.js'),'utf8');
  assert.match(engine,/this\.emit\('dribbleTrick',\{team:p\.t,player:p\.src\.name,style:style\.id,name:style\.name,success,ai:byAI\}\)/);
  assert.match(ui,/game\.onEvent=e=>\{audio\.cue\(e\)/);
});
