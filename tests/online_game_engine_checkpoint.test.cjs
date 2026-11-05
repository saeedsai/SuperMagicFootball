const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');

let createOnlineGameEngine;
test.before(async()=>{({createOnlineGameEngine}=await import('../scripts/online-game-engine.mjs'));});

const neutral=()=>({x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}});
const inputs=(left={},right={})=>[
  {...neutral(),...left,buttons:{...neutral().buttons,...left.buttons}},
  {...neutral(),...right,buttons:{...neutral().buttons,...right.buttons}}
];
const step=(engine,streams)=>engine.step(1/60,streams);
const canonical=value=>{
  if(Array.isArray(value))return `[${value.map(canonical).join(',')}]`;
  if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
};
const digest=value=>crypto.createHash('sha256').update(canonical(value)).digest('hex');
function resigned(checkpoint){
  const copy=structuredClone(checkpoint);
  delete copy.checksumSha256;copy.checksumSha256=digest(copy);
  return copy;
}

test('checkpoint restore continues deterministic gameplay, held-button edges and random behavior',async()=>{
  const config={home:0,away:9,halfSeconds:90,seed:4281,mode:'career-ai',humans:1};
  const continuous=await createOnlineGameEngine(config);
  const prefix=[
    inputs({x:.25,y:-.1}),
    inputs({buttons:{shoot:true}}),
    inputs({buttons:{shoot:true}}),
  ];
  for(const frame of prefix)assert.equal(step(continuous,frame).accepted,true);
  const checkpoint=continuous.exportCheckpoint();
  assert.equal(checkpoint.format,'smf-online-game-engine-checkpoint');
  assert.equal(checkpoint.schemaVersion,1);
  assert.equal(checkpoint.state.previousButtons[0].shoot,true);
  assert.equal(checkpoint.state.game.subbedOut[0].$smfSet instanceof Array,true);
  assert.ok(Buffer.byteLength(JSON.stringify(checkpoint))<64*1024,'typical checkpoint remains compact');

  const restored=await createOnlineGameEngine(config);
  assert.equal(restored.restoreCheckpoint(checkpoint),true);
  assert.deepEqual(restored.snapshot,continuous.snapshot);
  // Continue holding shoot (which must not generate a second press edge), then
  // release and perform a fresh shot (which consumes engine RNG).
  const suffix=[
    inputs({buttons:{shoot:true}}),
    inputs({buttons:{shoot:false}}),
    inputs({x:.7,y:.4,buttons:{shoot:true}}),
    ...Array.from({length:24},(_,i)=>inputs(i%2?{x:-.5,y:.3}:{x:.35,y:-.25})),
  ];
  for(const frame of suffix){
    assert.deepEqual(step(restored,frame),step(continuous,frame));
    assert.deepEqual(restored.snapshot,continuous.snapshot);
  }
  assert.notEqual(restored.exportCheckpoint().state.randomState,checkpoint.state.randomState,'career CPU advances the captured RNG');
  assert.deepEqual(restored.exportCheckpoint(),continuous.exportCheckpoint(),'the full authoritative state and RNG state reconverge');
  const expanded=structuredClone(checkpoint);
  assert.deepEqual(expanded.state.game.subbedOut[0],{$smfSet:[]});
});

test('malformed, wrong-version, corrupt, and config-mismatched checkpoints fail closed',async()=>{
  const source=await createOnlineGameEngine({home:0,away:9,seed:19});
  step(source,inputs({x:.5}));
  const valid=source.exportCheckpoint();
  const target=await createOnlineGameEngine({home:0,away:9,seed:19});
  const before=target.exportCheckpoint();
  const cases=[];
  const malformed=structuredClone(valid);malformed.state.game.unreviewed=true;cases.push(resigned(malformed));
  const version=structuredClone(valid);version.schemaVersion=99;cases.push(version);
  const corrupt=structuredClone(valid);corrupt.state.tick++;cases.push(corrupt);
  for(const bad of cases){
    assert.throws(()=>target.restoreCheckpoint(bad));
    assert.deepEqual(target.exportCheckpoint(),before);
  }
  const wrongConfig=await createOnlineGameEngine({home:1,away:9,seed:19});
  assert.throws(()=>wrongConfig.restoreCheckpoint(valid),/configuration mismatch/);
  assert.equal(wrongConfig.snapshot.tick,0);
  const advanced=await createOnlineGameEngine({home:0,away:9,seed:19});
  step(advanced,inputs());
  assert.throws(()=>advanced.restoreCheckpoint(valid),/newly initialized/,'restore after live advancement is rejected');
});
