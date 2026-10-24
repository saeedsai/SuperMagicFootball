/** Match-pass outcome audio contracts: actual teammate completion vs interception. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');

async function setup(t) {
  const {AUDIO}=await import('../src/modules/audio.js');
  class StubAudioContext {
    constructor(){this.state='running';this.currentTime=3;this.destination={};}
    close(){this.state='closed';return Promise.resolve();}
    resume(){this.state='running';return Promise.resolve();}
  }
  const a=new AUDIO.ArcadeAudio({},StubAudioContext),tones=[];
  a.tone=(frequency,duration,kind='sfx',shape='sine',delay=0)=>tones.push({frequency,kind,shape,delay});
  t.after(()=>a.dispose());
  return {a,tones};
}

test('completed pass to its intended teammate gives two short rising notes',async t=>{
  const {a,tones}=await setup(t);
  a.cue({type:'passReceived',friendly:true,accurate:true,speed:500});
  assert.equal(tones.length,0,'autoplay audio remains gesture-gated');
  a.unlock();
  a.cue({type:'passReceived',friendly:true,accurate:true,speed:500});
  assert.deepEqual(tones.map(n=>n.frequency),[370,494]);
  assert(tones.every(n=>n.kind==='sfx'),'ordinary effect volume bus');
});

test('opponent interception gives distinct descending pair, not a success sound',async t=>{
  const {a,tones}=await setup(t);a.unlock();
  a.cue({type:'passReceived',friendly:false,accurate:false});
  assert.deepEqual(tones.map(n=>n.frequency),[262,175]);
  a.ctx.currentTime+=0.31;
  a.cue({type:'passReceived',friendly:true,accurate:true});
  assert.deepEqual(tones.map(n=>n.frequency),[262,175,370,494]);
});

test('accidental teammate pickup, garbage telemetry and loose ball are silent',async t=>{
  const {a,tones}=await setup(t);a.unlock();
  for(const event of [
    {type:'passReceived',friendly:true,accurate:false},
    {type:'passReceived',friendly:true},
    {type:'passReceived',friendly:1,accurate:true},
    {type:'passReceived',friendly:false,accurate:'false'},
    'passReceived',
    {type:'reboundRecovery',team:0},
    {type:'passExpired',team:0}
  ])a.cue(event);
  assert.deepEqual(tones,[]);
  a.cue({type:'passReceived',friendly:false,accurate:false});
  assert.equal(tones.length,2,'ignored events must not consume the debounce key');
});

test('high-frequency pass reception events have distinct per-outcome throttles',async t=>{
  const {a,tones}=await setup(t);a.unlock();
  const caught={type:'passReceived',friendly:true,accurate:true};
  const taken={type:'passReceived',friendly:false,accurate:false};
  a.cue(caught);a.cue(caught);
  assert.equal(tones.length,2);
  a.cue(taken);
  assert.equal(tones.length,4,'different outcome immediately audible');
  a.ctx.currentTime+=.22;
  a.cue(caught);a.cue(taken);
  assert.equal(tones.length,4,'each same outcome suppressed for 0.30 seconds');
  a.ctx.currentTime+=.09;
  a.cue(caught);a.cue(taken);
  assert.equal(tones.length,8);
});

test('existing master/SFX fader and mute suppress pass cues without changing UI bus',async t=>{
  const {a,tones}=await setup(t);a.unlock();
  a.configure({mute:true});
  a.cue({type:'passReceived',friendly:true,accurate:true});
  assert.equal(tones.length,0);
  a.configure({master:70,sfx:0,ui:60});
  a.cue({type:'passReceived',friendly:false,accurate:false});
  assert.equal(tones.length,0);
  a.cue({type:'ui'});
  assert.equal(tones.length,1,'UI bus still works independently');
  a.configure({master:70,sfx:70});
  a.ctx.currentTime+=.4;
  a.cue({type:'passReceived',friendly:false,accurate:false});
  assert.equal(tones.length,3);
  a.visibilityPaused=true;
  a.ctx.currentTime+=.4;
  a.cue({type:'passReceived',friendly:true,accurate:true});
  assert.equal(tones.length,3);
});

test('pass audio leaves penalty, goal and dribble outcome mappings unchanged',async t=>{
  const {a,tones}=await setup(t);a.unlock();
  a.cue({type:'penaltyKick',goal:false});
  assert.deepEqual(tones.splice(0).map(n=>n.frequency),[392,294,220]);
  a.ctx.currentTime+=.4;
  a.cue({type:'dribbleTrick',ai:false,success:true});
  assert.deepEqual(tones.splice(0).map(n=>n.frequency),[440,659]);
  a.ctx.currentTime+=.4;
  a.cue({type:'goal'});
  assert.deepEqual(tones.splice(0).map(n=>n.frequency),[523,659,784,1046]);
});

test('playable engine emits passReceived accurate/friendly fields through UI to audio',()=>{
  const root=join(__dirname,'..');
  const engine=readFileSync(join(root,'src/modules/engine.js'),'utf8');
  const ui=readFileSync(join(root,'src/modules/ui.js'),'utf8');
  assert.match(engine,/this\.emit\('passReceived',\{team:p\.t,player:p\.src\.id,from:incoming\.from,/);
  assert.match(engine,/intendedTarget:incoming\.target,accurate:incoming\.target===p\.src\.id,friendly/);
  assert.match(ui,/game\.onEvent=e=>\{[\s\S]{0,700}audio\.cue\(e\)/);
});
