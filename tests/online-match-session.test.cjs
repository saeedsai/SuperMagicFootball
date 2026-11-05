const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {pathToFileURL} = require('node:url');

let sessionModule;
test('authoritative online match session owns sanitized input, sequencing, and fixed ticks', async () => {
  sessionModule ||= await import(pathToFileURL(require.resolve('../scripts/online-match-session.mjs')).href);
  let at = 1000;
  const seen = [];
  const engine = {
    state: {tick:0,score:[0,0],clock:120,matchState:'play'},
    getSnapshot() { return Object.freeze({...this.state,score:Object.freeze(this.state.score.slice())}); },
    step(dt, input) {
      assert.equal(dt, 1 / 30);
      this.lastInput = input;
      this.state = {...this.state,tick:this.state.tick + 1,clock:this.state.clock - dt};
      return {accepted:true,snapshot:this.getSnapshot()};
    }
  };
  const session = sessionModule.createOnlineMatchSession({
    matchId:'match_0001', participants:[{userId:'user_0001'},{userId:'user_0002'}], engine,
    now:()=>at, onSnapshot:packet=>seen.push(packet)
  });
  assert.equal(session.submitInput('user_0001',1,{x:.8,y:-.4,buttons:{pass:false,shoot:true,dribble:false,jump:false}}).accepted,true);
  assert.equal(session.submitInput('user_0002',1,{x:-.7,y:0,buttons:{pass:true,shoot:false,dribble:false,jump:false}}).accepted,true);
  assert.equal(session.submitInput('user_0001',1,{x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}).reason,'invalid-sequence');
  assert.equal(session.submitInput('stranger_1',2,{x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}).reason,'not-a-participant');
  assert.equal(session.submitInput('user_0001',2,{x:4,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}).reason,'invalid-input');
  assert.equal(session.submitInput('user_0001',2,{x:0,y:0,score:[99,0],buttons:{pass:false,shoot:false,dribble:false,jump:false}}).reason,'invalid-input');
  const tick = session.step();
  assert.equal(tick.advanced,true);
  assert.equal(engine.lastInput[0].x,.8);
  assert.equal(engine.lastInput[1].buttons.pass,true);
  assert.equal(seen[0].snapshot.score[0],0);
  assert.equal(seen[0].tick,1);

  at += 251;
  session.step();
  assert.equal(engine.lastInput[0].x,0,'stale input becomes neutral');
  assert.equal(engine.lastInput[1].y,0,'each seat expires independently');

  session.close();
  assert.equal(session.step().reason,'match-closed');
  assert.equal(session.submitInput('user_0001',3,{x:0,y:0,buttons:{pass:false,shoot:false,dribble:false,jump:false}}).reason,'match-closed');
});

test('authoritative match session rejects duplicate participants and malformed identities', async () => {
  sessionModule ||= await import(pathToFileURL(require.resolve('../scripts/online-match-session.mjs')).href);
  const engine={step(){return {accepted:true}},snapshot:{matchState:'play'}};
  assert.throws(()=>sessionModule.createOnlineMatchSession({matchId:'bad',participants:[{userId:'user_0001'},{userId:'user_0002'}],engine}),/Invalid authoritative/);
  assert.throws(()=>sessionModule.createOnlineMatchSession({matchId:'match_0001',participants:[{userId:'user_0001'},{userId:'user_0001'}],engine}),/Invalid match participants/);
});

test('authoritative match session has no client-controlled result or settlement fields', () => {
  const source=readFileSync(require.resolve('../scripts/online-match-session.mjs'),'utf8');
  assert.match(source,/const INPUT_KEYS = new Set\(\['x', 'y', 'buttons'\]\)/);
  assert.match(source,/FIXED_STEP_SECONDS = 1 \/ 30/);
  assert.doesNotMatch(source,/token|wallet|settle/i);
});

test('unexpected simulation exception closes only the match and returns a bounded failure result', async () => {
  sessionModule ||= await import(pathToFileURL(require.resolve('../scripts/online-match-session.mjs')).href);
  const engine={snapshot:{matchState:'play'},step(){throw new Error('unexpected simulation fault');}};
  const session=sessionModule.createOnlineMatchSession({matchId:'match_0002',participants:[{userId:'user_0001'},{userId:'user_0002'}],engine});
  const result=session.step();
  assert.equal(result.advanced,false);
  assert.equal(result.reason,'engine-error');
  assert.deepEqual(result.snapshot,{matchState:'play'});
  assert.equal(session.getState().closed,true);
  assert.equal(session.step().reason,'match-closed');
});

test('snapshot failure after an accepted engine tick cannot escape the session timer', async () => {
  sessionModule ||= await import(pathToFileURL(require.resolve('../scripts/online-match-session.mjs')).href);
  const engine={reads:0,getSnapshot(){if(++this.reads>1)throw new Error('snapshot serialization fault');return {matchState:'play'};},step(){return {accepted:true};}};
  const session=sessionModule.createOnlineMatchSession({matchId:'match_0003',participants:[{userId:'user_0001'},{userId:'user_0002'}],engine});
  const result=session.step();
  assert.equal(result.reason,'engine-error');
  assert.equal(result.advanced,false);
  assert.equal(session.getState().closed,true);
});

test('restored authoritative session preserves its checkpoint tick and rejects invalid counters', async () => {
  sessionModule ||= await import(pathToFileURL(require.resolve('../scripts/online-match-session.mjs')).href);
  const engine={snapshot:{matchState:'play',tick:812},step(){return {accepted:true,snapshot:{matchState:'play',tick:813}};}};
  const session=sessionModule.createOnlineMatchSession({matchId:'match_0004',participants:[{userId:'user_0001'},{userId:'user_0002'}],engine,initialTick:812});
  assert.equal(session.getState().ticks,812);
  assert.equal(session.step().tick,813);
  assert.throws(()=>sessionModule.createOnlineMatchSession({matchId:'match_0004',participants:[{userId:'user_0001'},{userId:'user_0002'}],engine,initialTick:-1}),/Invalid authoritative/);
  assert.throws(()=>sessionModule.createOnlineMatchSession({matchId:'match_0004',participants:[{userId:'user_0001'},{userId:'user_0002'}],engine,initialTick:1.5}),/Invalid authoritative/);
});
