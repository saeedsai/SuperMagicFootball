/**
 * Deterministic regulation-length diagnostic for existing Super Shot families.
 * This is engine simulation evidence, not human playtest or release balance approval.
 * Run manually with: node tests/super_shot_whole_match_balance_diagnostic.mjs
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPORT = new URL('../docs/SUPER_SHOT_WHOLE_MATCH_BALANCE_20261103.json', import.meta.url);
const SHOT_IDS = ['silverCarp', 'dice', 'bird'];
const DIFFICULTIES = [0, 2, 4];
// The companion short-window calibration already covers 30/60/120 Hz.
// Keep this expensive whole-match matrix at 60 Hz and cross-reference those rate checks.
const RATES = [60];
const SIDES = [0, 1];
const ARMS = ['baseline', 'arcadeSuper'];
const SEEDS = [0, 1, 2];
const HALF_SECONDS = 60;
const MAX_MATCH_SECONDS = HALF_SECONDS * 2 + 24;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GENERATED_GAME = path.join(HERE, '.generated', 'game.js');
const previousWindow = globalThis.window;
const previousDocument = globalThis.document;
globalThis.window = {addEventListener() {}};
globalThis.document = {addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; }};
let runtimePromise;
async function runtime() {
  if (!runtimePromise) {
    let bundle = readFileSync(GENERATED_GAME, 'utf8');
    const ui = bundle.indexOf('// Supermagic Football v0.8.25.30 | UI |');
    if (ui >= 0) bundle = bundle.slice(0, ui);
    bundle += '\nexport {ENGINE,DATA};';
    runtimePromise = import('data:text/javascript;base64,' + Buffer.from(bundle).toString('base64'));
  }
  return runtimePromise;
}
const {ENGINE, DATA} = await runtime();
const QUIET_INPUT = {
  state: [{}, {}], poll() {}, just() { return false; }, released() { return false; },
  tapDuration() { return 0; }, canceled() { return false; }
};
const originalRandom = Math.random;
const previousStorage = globalThis.localStorage;
let storageWrites = 0;
globalThis.localStorage = {
  getItem() { return null; }, setItem() { storageWrites++; },
  removeItem() { storageWrites++; }, clear() { storageWrites++; }
};
const sourceRoster = DATA.rosterFor(0);
const sourceSnapshot = JSON.stringify(sourceRoster);

function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}
function copiedRosters() {
  return [0, 1].map(() => sourceRoster.map(player => ({...player})));
}
function chooseAttacker(game, team) {
  return game.players.find(p => p.t === team && !p.keeper && ['MF', 'FW'].includes(p.src.role));
}
function equipTestArm(game, player, arm, shotId) {
  const row = game.rosters[player.t].find(p => p.id === player.src.id);
  assert.ok(row, 'selected starter exists in isolated match roster');
  if (arm === 'arcadeSuper') {
    row.shot = shotId;
    row.shotName = DATA.SHOTS[shotId]?.name || shotId;
    row.superShotLevel = 1;
    row.superAbility = {type: 'shoot', name: row.shotName, level: 1};
  } else if (row.superAbility?.type === 'shoot') {
    delete row.superAbility;
    delete row.shot;
    delete row.shotName;
    delete row.superShotLevel;
  }
  player.src = row;
}

function runMatch({shotId, difficulty, fps, team, arm, seedIndex}) {
  // Do not include team in the seed: paired rows then test true field-direction mirroring.
  const seed = 0x80b100 + SHOT_IDS.indexOf(shotId) * 10007 + difficulty * 1009 + fps * 37 + seedIndex * 19;
  Math.random = seeded(seed);
  const options = {
    ...DATA.DEFAULT_OPTIONS, halfSeconds: HALF_SECONDS, difficulty,
    weather: 'Clear', terrain: 'Grass', condition: 'Good', weatherSeed: seed
  };
  const rosters = copiedRosters();
  const game = new ENGINE.GameEngine(options, QUIET_INPUT);
  game.init({home: 0, away: 0, mode: 'quick', humans: 0, rosters, options});
  // The engine's solo mode ordinarily applies the selected difficulty to the away CPU only.
  game.cpuLevel = () => difficulty;
  const trial = chooseAttacker(game, team);
  assert.ok(trial, `MF/FW exists for team ${team}`);
  equipTestArm(game, trial, arm, shotId);
  // init() leaves Team 0's kickoff taker 26 world units off the formation
  // home position. Restore every player to its assigned formation pose before
  // relocating the trial shooter, otherwise the mirrored Team 1-attack run
  // leaves that old kickoff taker stranded at midfield and is not a mirrored
  // starting state.
  for (const player of game.players) {
    player.x = player.homeX;
    player.y = player.homeY;
    player.face = player.t === 0 ? 1 : -1;
    player.dx = player.dy = player.moveVX = player.moveVY = 0;
    player.aiTarget = null;
    player.action = 'idle';
    player.actionTimer = 0;
  }
  const rosterBefore = JSON.stringify(game.rosters);
  const events = [];
  const selectedPlayerId = trial.src.id;
  game.onEvent = event => events.push({type: event.type, team: event.team, kind: event.kind,
    playerId: event.player?.src?.id || null, penalty: !!event.penalty,
    shotId: game.ball?.shot?.id || null, saveType: event.saveType || null});
  const initialFatigue = game.players.map(p => p.fatigue || 0);
  const possessionFrames = [0, 0];
  // Guarantee the selected control/treatment is exercised, then let both CPUs play
  // the remainder of regulation normally. Only this isolated match copy is changed.
  const direction = team === 0 ? 1 : -1;
  const field = ENGINE.WORLD.field;
  const goalX = direction > 0 ? field.x + field.w : field.x;
  trial.x = goalX - direction * 620;
  trial.y = (ENGINE.WORLD.goalTop + ENGINE.WORLD.goalBottom) / 2;
  trial.face = direction;
  trial.dx = trial.dy = 0;
  trial.cd = trial.specialCd = 0;
  game.take(trial);
  assert.equal(game.ball.owner, trial, 'test attacker receives ball for paired opening shot');
  assert.equal(game.shoot(trial, arm === 'arcadeSuper'), true, 'actual engine launches the paired control/treatment shot');
  assert.equal(game.ball.shot?.id || null, arm === 'arcadeSuper' ? shotId : null, 'opening shot follows requested arm');
  const stepSeconds = Math.min(.034, 1 / fps);
  const maxFrames = Math.ceil(MAX_MATCH_SECONDS / stepSeconds);
  let frames = 0, penaltyFrames = 0;
  const maxPenaltyFrames = Math.ceil(20 / stepSeconds);
  while (frames < maxFrames && game.matchState !== 'finished') {
    if (game.matchState === 'paused' && game.half === 2) game.matchState = 'play';
    if (game.matchState === 'penalty') {
      if (game.pk?.afterDraw) break; // Regulation ended tied; exclude the post-match shootout.
      assert.ok(penaltyFrames < maxPenaltyFrames, 'in-match penalty interruptions remain bounded');
      game.updatePK(stepSeconds); // Resolve in-match penalty interruptions through the real engine path.
      penaltyFrames++;
      continue;
    }
    if (game.matchState !== 'play') {
      if (game.pk) break; // Record regulation only; shootouts have separate rules/input.
      throw new Error(`unexpected match state ${game.matchState} at half ${game.half}`);
    }
    const holderTeam = game.ball.owner?.t;
    if (holderTeam === 0 || holderTeam === 1) possessionFrames[holderTeam] += stepSeconds;
    game.update(1 / fps);
    frames++;
    assert.ok(game.players.every(p => [p.x, p.y, p.fatigue, p.stun].every(Number.isFinite)), 'finite player state');
    assert.ok([game.ball.x, game.ball.y, game.ball.z, game.ball.vx, game.ball.vy].every(Number.isFinite), 'finite ball state');
  }
  const completedRegulation = (game.half === 2 && game.matchState === 'penalty' && !!game.pk?.afterDraw) || game.matchState === 'finished';
  const goals = events.filter(e => e.type === 'goal').length;
  const shots = events.filter(e => e.type === 'kick' && ['shot', 'superShot'].includes(e.kind));
  const superShotKicks = events.filter(e => e.type === 'kick' && e.kind === 'superShot').length;
  const ordinaryKicks = events.filter(e => e.type === 'kick' && e.kind === 'shot').length;
  const result = {
    shotId, difficulty, fps, attackTeam: team, arm, seed, seedIndex,
    regulationCompleted: completedRegulation,
    simulatedSeconds: Number((Math.min(game.clock, HALF_SECONDS) + (game.half >= 2 ? game.clock : 0)).toFixed(3)),
    frames,
    score: game.score.slice(), goals,
    ordinaryShots: ordinaryKicks,
    superShots: superShotKicks,
    selectedShotLaunches: shots.filter(e => e.kind === 'superShot' && e.shotId === shotId && e.playerId === selectedPlayerId).length,
    keeperSaves: events.filter(e => e.type === 'save').length,
    playerContacts: events.filter(e => e.type === 'shotImpact').length,
    playerKnockdowns: events.filter(e => e.type === 'shotImpactLaunch').length,
    possessionSeconds: possessionFrames.map(n => Number(n.toFixed(3))),
    fatigueSpent: [0, 1].map(t => Number(game.players.filter(p => p.t === t)
      .reduce((sum, p, i) => sum + Math.max(0, p.fatigue - initialFatigue.find((_, index) => index === game.players.indexOf(p))), 0).toFixed(6))),
    events: events.length,
    finite: true
  };
  // At regulation draw the live engine enters its separate penalty phase, which is deliberately excluded.
  assert.ok(result.regulationCompleted, `regulation completes within bound (${shotId}/${difficulty}/${fps}/${team}/${arm}/${seedIndex}); state=${game.matchState}, half=${game.half}, clock=${game.clock}`);
  assert.ok(arm === 'arcadeSuper' ? result.selectedShotLaunches >= 1 : result.selectedShotLaunches === 0,
    'trial player launches the selected shot in treatment and not in baseline');
  assert.equal(JSON.stringify(game.rosters), rosterBefore, 'simulation does not mutate match roster source rows');
  return result;
}

const trials = [];
try {
  for (const shotId of SHOT_IDS) for (const difficulty of DIFFICULTIES) for (const fps of RATES)
    for (const team of SIDES) for (const arm of ARMS) for (const seedIndex of SEEDS)
      trials.push(runMatch({shotId, difficulty, fps, team, arm, seedIndex}));
} finally {
  Math.random = originalRandom;
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
  if (previousDocument === undefined) delete globalThis.document;
  else globalThis.document = previousDocument;
}

assert.equal(trials.length, SHOT_IDS.length * DIFFICULTIES.length * RATES.length * SIDES.length * ARMS.length * SEEDS.length);
assert.equal(storageWrites, 0, 'diagnostic makes no persistent writes');
assert.equal(JSON.stringify(sourceRoster), sourceSnapshot, 'canonical source roster remains unchanged');
const mirrorChecks = [];
for (const shotId of SHOT_IDS) for (const difficulty of DIFFICULTIES) for (const fps of RATES)
  for (const arm of ARMS) for (const seedIndex of SEEDS) {
    const pair = trials.filter(r => r.shotId === shotId && r.difficulty === difficulty && r.fps === fps && r.arm === arm && r.seedIndex === seedIndex);
    assert.equal(pair.length, 2, `both attack directions completed ${shotId}/${difficulty}/${fps}/${arm}/${seedIndex}`);
    const matches = pair[0].score[0] === pair[1].score[1] && pair[0].score[1] === pair[1].score[0];
    mirrorChecks.push({shotId, difficulty, fps, arm, seedIndex, matches,
      team0Score: pair[0].score, team1Score: pair[1].score,
      regulationGoalDelta: pair[0].goals - pair[1].goals,
      selectedShotLaunchDelta: pair[0].selectedShotLaunches - pair[1].selectedShotLaunches,
      keeperSaveDelta: pair[0].keeperSaves - pair[1].keeperSaves,
      playerContactDelta: pair[0].playerContacts - pair[1].playerContacts,
      possessionSecondsDelta: pair[0].possessionSeconds.map((value, index) => Number((value - pair[1].possessionSeconds[1 - index]).toFixed(3))),
      fatigueSpentDelta: pair[0].fatigueSpent.map((value, index) => Number((value - pair[1].fatigueSpent[1 - index]).toFixed(6)))});
  }

const categories = ['ordinary', 'super'];
const aggregate = {};
for (const shotId of SHOT_IDS) {
  aggregate[shotId] = {};
  for (const category of categories) {
    const rows = trials.filter(r => r.shotId === shotId && (category === 'super' ? r.arm === 'arcadeSuper' : r.arm === 'baseline'));
    aggregate[shotId][category] = {
      matches: rows.length,
      regulationGoals: rows.reduce((sum, r) => sum + r.goals, 0),
      goalsPerMatch: Number((rows.reduce((sum, r) => sum + r.goals, 0) / rows.length).toFixed(4)),
      ordinaryShots: rows.reduce((sum, r) => sum + r.ordinaryShots, 0),
      superShots: rows.reduce((sum, r) => sum + r.superShots, 0),
      selectedShotLaunches: rows.reduce((sum, r) => sum + r.selectedShotLaunches, 0),
      keeperSaves: rows.reduce((sum, r) => sum + r.keeperSaves, 0),
      playerContacts: rows.reduce((sum, r) => sum + r.playerContacts, 0),
      playerKnockdowns: rows.reduce((sum, r) => sum + r.playerKnockdowns, 0),
      possessionSeconds: [0, 1].map(t => Number((rows.reduce((sum, r) => sum + r.possessionSeconds[t], 0) / rows.length).toFixed(2))),
      meanFatigueSpent: [0, 1].map(t => Number((rows.reduce((sum, r) => sum + r.fatigueSpent[t], 0) / rows.length).toFixed(5)))
    };
  }
}
const summary = {
  date: '2026-11-03',
  candidate: '0.12.81.0 local source tree',
  scope: 'Deterministic GameEngine regulation diagnostic with mirrored formation-start setup; simulation-only, not human balance approval.',
  scenarioCount: trials.length,
  matrix: {shotIds: SHOT_IDS, difficulties: DIFFICULTIES, frameRates: RATES, attackTeams: SIDES, arms: ARMS, seeds: SEEDS,
    halfSeconds: HALF_SECONDS, regulationSeconds: HALF_SECONDS * 2},
  persistentWrites: storageWrites,
  allRegulationMatchesCompleted: trials.every(r => r.regulationCompleted),
  mirrorCheckCount: mirrorChecks.length,
  mirroredScoreMatchCount: mirrorChecks.filter(row => row.matches).length,
  mirroredScoreMismatchCount: mirrorChecks.filter(row => !row.matches).length,
  mirrorChecks,
  aggregate,
  results: trials,
  limitations: [
    'Both teams use isolated copies of the same Japan roster; this is not broad roster coverage.',
    'Only Silver Carp, Dice and Bird represent underground, arcing/rotating, and evasive families; conclusions do not generalize to all 32 shots.',
    'Three CPU difficulties are sampled (Easy, Normal, Expert); Star is used only for selected Super Shot equipping and is not a human opponent.',
    'A paired opening shot is scripted through GameEngine.shoot so each trial actually uses its treatment; all players are restored to formation home positions before the shot so both attack directions begin from reflected match setups; the remainder of each regulation match is active CPU-versus-CPU play.',
    'Whole-match runs use 60 Hz; the companion short-window calibration covers 30/60/120 Hz but is not full-match evidence.',
    'Each half is compressed to 60 simulated seconds instead of the shipping 120-second default; simulation runs at accelerated wall-clock speed.',
    'The baseline clears the selected player’s pre-existing shooting ability in its match copy only; other roster players retain normal loadouts.',
    'The diagnostic does not exercise human controls, physical devices, accessibility preferences, online latency, or owner fun/visual review.',
    'Tied regulation matches stop at the penalty phase; penalty outcomes are excluded. No gameplay tuning is applied from these observations.'
  ]
};
writeFileSync(REPORT, JSON.stringify(summary, null, 2) + '\n');
console.log(`Super Shot regulation diagnostic PASS: ${trials.length} seeded matches; ${summary.mirroredScoreMismatchCount}/${summary.mirrorCheckCount} score mirror mismatches; ${JSON.stringify(Object.fromEntries(SHOT_IDS.map(id => [id, aggregate[id]])))}`);
