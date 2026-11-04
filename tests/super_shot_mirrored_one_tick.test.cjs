const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '.generated', 'game.js'), 'utf8');
const uiStart = source.indexOf('// Supermagic Football v0.8.25.30 | UI |');
assert.ok(uiStart > 0, 'the generated game contains the UI boundary');
const runtimeSource = source.slice(0, uiStart) + '\nexport {ENGINE,DATA};';
const savedWindow = global.window;
const savedDocument = global.document;
global.window = {addEventListener() {}};
global.document = {addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }};
let runtime;
async function loadRuntime() {
  if (!runtime) runtime = await import('data:text/javascript;base64,' + Buffer.from(runtimeSource).toString('base64'));
  return runtime;
}

function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function normalizedSnapshot(game, attackTeam, ENGINE) {
  const field = ENGINE.WORLD.field;
  const mirrorX = x => attackTeam === 0 ? x : field.x + field.w - (x - field.x);
  const players = game.players.map(p => ({
    side: p.t === attackTeam ? 0 : 1,
    id: p.src.id,
    role: p.src.role,
    keeper: !!p.keeper,
    x: +mirrorX(p.x).toFixed(6), y: +p.y.toFixed(6),
    dx: +(attackTeam === 0 ? p.dx : -p.dx).toFixed(6), dy: +p.dy.toFixed(6),
    homeX: +mirrorX(p.homeX).toFixed(6), homeY: +p.homeY.toFixed(6),
    face: attackTeam === 0 ? p.face : -p.face,
    action: p.action || '', actionTimer: +(p.actionTimer || 0).toFixed(6),
    aiTarget: p.aiTarget ? {x:+mirrorX(p.aiTarget.x).toFixed(6), y:+p.aiTarget.y.toFixed(6)} : null,
    stun: +(p.stun || 0).toFixed(6), fatigue: +(p.fatigue || 0).toFixed(6),
  })).sort((a,b) => a.side-b.side || String(a.id).localeCompare(String(b.id)));
  const ball = game.ball;
  return {
    score: attackTeam === 0 ? game.score.slice() : [game.score[1], game.score[0]],
    ball: {x:+mirrorX(ball.x).toFixed(6), y:+ball.y.toFixed(6), z:+ball.z.toFixed(6),
      vx:+(attackTeam === 0 ? ball.vx : -ball.vx).toFixed(6), vy:+ball.vy.toFixed(6),
      owner:ball.owner ? {side:ball.owner.t===attackTeam?0:1,id:ball.owner.src.id} : null,
      shotId:ball.shot?.id || null, age:+ball.age.toFixed(6)},
    players,
  };
}

async function runDirection({ENGINE, DATA, seed, attackTeam, arm, shotId}) {
  Math.random = seeded(seed);
  const roster = DATA.rosterFor(0);
  const options = {...DATA.DEFAULT_OPTIONS, halfSeconds:60, difficulty:2, weather:'Clear',
    terrain:'Grass', condition:'Good', weatherSeed:seed};
  const rosters = [0,1].map(() => roster.map(p => ({...p})));
  const input = {state:[{},{}], poll(){}, just(){return false;}, released(){return false;},
    tapDuration(){return 0;}, canceled(){return false;}};
  const game = new ENGINE.GameEngine(options, input);
  game.init({home:0, away:0, mode:'quick', humans:0, rosters, options});
  game.cpuLevel = () => 2;

  const trial = game.players.find(p => p.t===attackTeam && !p.keeper && ['MF','FW'].includes(p.src.role));
  assert.ok(trial, 'the opening shot player exists');
  const rowPlayer = game.rosters[trial.t].find(p => p.id===trial.src.id);
  if (arm==='super') {
    rowPlayer.shot=shotId; rowPlayer.shotName=DATA.SHOTS[shotId]?.name || shotId;
    rowPlayer.superShotLevel=1; rowPlayer.superAbility={type:'shoot',name:rowPlayer.shotName,level:1};
    trial.src=rowPlayer;
  }

  // init() has already placed team 0's kickoff taker 26 units from midfield.
  // The old match diagnostic then moved only the selected shooter, leaving that
  // player displaced in one attack direction. Restore every slot to the same
  // formation pose first; the paired scenarios then differ only by reflection.
  for (const p of game.players) {
    p.x=p.homeX; p.y=p.homeY; p.face=p.t===0?1:-1; p.dx=p.dy=0;
    p.moveVX=p.moveVY=0; p.aiTarget=null; p.action='idle'; p.actionTimer=0;
  }
  const field=ENGINE.WORLD.field, direction=attackTeam===0?1:-1;
  const goalX=direction>0?field.x+field.w:field.x;
  trial.x=goalX-direction*620;
  trial.y=(ENGINE.WORLD.goalTop+ENGINE.WORLD.goalBottom)/2;
  trial.face=direction; trial.dx=trial.dy=0; trial.cd=trial.specialCd=0;
  game.take(trial);
  assert.equal(game.shoot(trial,arm==='super'),true,'the scripted opening shot launches');
  const before=normalizedSnapshot(game,attackTeam,ENGINE);
  game.update(1/60);
  const after=normalizedSnapshot(game,attackTeam,ENGINE);
  return {before,after};
}

async function main() {
  const {ENGINE,DATA}=await loadRuntime();
  const originalRandom=Math.random;
  try {
    for (const arm of ['ordinary','super']) for (const seed of [8438158,8438177,9040201]) {
      const shotId='silverCarp';
      const left=await runDirection({ENGINE,DATA,seed,attackTeam:0,arm,shotId});
      const right=await runDirection({ENGINE,DATA,seed,attackTeam:1,arm,shotId});
      assert.deepEqual(right.before,left.before,`mirrored initial state ${arm}/${seed}`);
      assert.deepEqual(right.after,left.after,`mirrored first update ${arm}/${seed}`);
      const keeper=left.after.players.find(p => p.side===1 && p.keeper);
      assert.ok(keeper && Number.isFinite(keeper.x) && Number.isFinite(keeper.aiTarget?.x),
        `defending keeper target remains finite ${arm}/${seed}`);
    }
    console.log('Super Shot mirrored initial/keeper one-tick regression PASS: 6 paired scenarios');
  } finally {
    Math.random=originalRandom;
    if (savedWindow===undefined) delete global.window; else global.window=savedWindow;
    if (savedDocument===undefined) delete global.document; else global.document=savedDocument;
  }
}

main().catch(error => { console.error(error); process.exitCode=1; });
