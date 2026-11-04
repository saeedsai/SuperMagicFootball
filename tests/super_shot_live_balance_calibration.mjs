/**
 * Deterministic A/B calibration for the temporary Arcade Super Shot against
 * active CPU defenders and keeper. This is a scenario sample, not a human
 * win-rate or whole-match balance claim.
 *
 * Run manually with: node tests/super_shot_live_balance_calibration.mjs
 */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const REPORT = new URL('../docs/SUPER_SHOT_LIVE_BALANCE_CALIBRATION_20261103.json', import.meta.url);
const SHOT_ID = 'silverCarp';
const DIFFICULTIES = [0, 1, 2, 3, 4];
const RATES = [30, 60, 120];
const SIDES = [0, 1];
const ARMS = ['ordinary', 'arcadeSuper'];
const SEEDS = [0, 1, 2];
const MAX_SECONDS = 2.5;
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
const FIELD = ENGINE.WORLD.field;
const MID_Y = (ENGINE.WORLD.goalTop + ENGINE.WORLD.goalBottom) / 2;
const QUIET_INPUT = {
  state: [{}, {}],
  poll() {},
  just() { return false; },
  released() { return false; },
  tapDuration() { return 0; },
  canceled() { return false; }
};
const originalRandom = Math.random;
const sourceRoster = DATA.rosterFor(0);
const sourceSnapshot = JSON.stringify(sourceRoster);
let storageWrites = 0;
const previousStorage = globalThis.localStorage;
globalThis.localStorage = {
  getItem() { return null; },
  setItem() { storageWrites++; },
  removeItem() { storageWrites++; },
  clear() { storageWrites++; }
};

function seeded(seed) {
  let state = seed >>> 0;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
}

function makeRosters() {
  // Both sides use isolated copies of one existing roster so mirror checks
  // exercise field direction rather than player-stat/identity differences.
  return [0, 1].map(() => sourceRoster.map(player => ({...player})));
}

function chooseAttacker(game, team) {
  return game.players.find(player => player.t === team && !player.keeper &&
    ['MF', 'FW'].includes(player.src.role) && player.src.superAbility?.type !== 'defense');
}

function applyTemporaryTrialToMatchCopy(game, player, shotId) {
  const shot = DATA.SHOTS[shotId];
  assert.ok(shot, `known Arcade Shot Trial id: ${shotId}`);
  const copy = game.rosters[player.t].find(row => row.id === player.src.id);
  assert.ok(copy, 'trial source exists only in the isolated match roster');
  assert.ok(!copy.superAbility || copy.superAbility.type === 'shoot', 'trial never overwrites a defense specialization');
  Object.assign(copy, {
    shot: shotId,
    shotName: shot.name || shotId,
    superShotLevel: 1,
    superAbility: {type: 'shoot', name: shot.name || shotId, level: 1}
  });
  player.src = copy;
}

function snapshotMatchSources(game) {
  return JSON.stringify(game.rosters.map(rows => rows.map(row => ({...row}))));
}

function runScenario({difficulty, fps, team, arm, seedIndex}) {
  const seed = 0x75b100 + difficulty * 1009 + fps * 37 + seedIndex * 19;
  Math.random = seeded(seed);
  const options = {
    ...DATA.DEFAULT_OPTIONS,
    difficulty,
    weather: 'Clear',
    terrain: 'Grass',
    condition: 'Good',
    weatherSeed: seed,
    ...(arm === 'arcadeSuper' && team === 0
      ? {arcadeShotId: SHOT_ID, arcadeShotPlayerId: null}
      : {})
  };
  const rosters = makeRosters();
  const game = new ENGINE.GameEngine(options, QUIET_INPUT);
  game.init({home: 0, away: 0, mode: 'quick', humans: 0, rosters, options});
  // Engine solo mode intentionally exposes selectable difficulty only to the
  // away CPU. This matrix drives both mirrored sides, so apply the requested
  // difficulty uniformly to CPU policy lookups in this test fixture.
  game.cpuLevel = () => difficulty;
  const attacker = chooseAttacker(game, team);
  assert.ok(attacker, `starting outfield trial player exists (team ${team})`);

  // The production trial option is intentionally home-side only. For the
  // mirror half, apply that same additive loadout to the isolated away match
  // copy, never to a shared/source roster or save.
  if (arm === 'arcadeSuper' && team === 1) applyTemporaryTrialToMatchCopy(game, attacker, SHOT_ID);
  if (arm === 'arcadeSuper' && team === 0) {
    // Reinitialize with the discovered starter ID so the actual trial path
    // performs the grant rather than a test-only helper.
    const playerId = attacker.src.id;
    const trialOptions = {...options, arcadeShotId: SHOT_ID, arcadeShotPlayerId: playerId};
    game.init({home: 0, away: 0, mode: 'quick', humans: 0, rosters: makeRosters(), options: trialOptions});
  }
  game.cpuLevel = () => difficulty;
  const liveAttacker = chooseAttacker(game, team);
  assert.ok(liveAttacker);
  const abilityBefore = JSON.stringify(game.rosters.map(rows => rows.map(row => ({...row}))));

  const direction = team === 0 ? 1 : -1;
  const goalX = direction > 0 ? FIELD.x + FIELD.w : FIELD.x;
  liveAttacker.x = goalX - direction * 620;
  liveAttacker.y = MID_Y;
  liveAttacker.face = direction;
  liveAttacker.dx = liveAttacker.dy = 0;
  liveAttacker.cd = liveAttacker.specialCd = 0;
  liveAttacker.fatigue = 0.18;
  game.fatigueLedger[team][liveAttacker.src.id] = liveAttacker.fatigue;

  const opponent = 1 - team;
  const cpuKeeper = game.player(opponent, 0);
  assert.ok(cpuKeeper?.keeper);
  cpuKeeper.x = goalX - direction * 48;
  cpuKeeper.y = MID_Y;
  cpuKeeper.fatigue = 0;
  cpuKeeper.diveCooldown = cpuKeeper.diveIntentCooldown = 0;
  const defenders = game.players.filter(player => player.t === opponent && !player.keeper);
  assert.ok(defenders.length >= 3);
  defenders[0].x = goalX - direction * 278;
  defenders[0].y = MID_Y;
  defenders[1].x = goalX - direction * 390;
  defenders[1].y = MID_Y - 125;
  defenders[2].x = goalX - direction * 495;
  defenders[2].y = MID_Y + 130;
  for (const player of defenders) player.stun = player.invuln = 0;

  game.take(liveAttacker);
  const events = [];
  game.onEvent = event => events.push(event);
  const startScore = game.score.slice();
  const sourceRowsBefore = sourceSnapshot;
  const shooterFatigueBefore = liveAttacker.fatigue;
  const oppositionPositions = game.players.filter(player => player.t === opponent)
    .map(player => ({player, lastX: player.x, lastY: player.y}));
  const opponentFatigueBefore = oppositionPositions.reduce((sum, row) => sum + (row.player.fatigue || 0), 0);
  assert.equal(game.cpuLevel(cpuKeeper), difficulty, 'active opposing CPU uses selected difficulty');
  if (arm === 'arcadeSuper') {
    assert.equal(liveAttacker.src.shot, SHOT_ID, 'temporary match-copy carries the selected Super Shot');
    assert.equal(liveAttacker.src.superAbility?.type, 'shoot');
  }

  const began = game.shoot(liveAttacker, arm === 'arcadeSuper');
  assert.equal(began, true, `${arm} shot begins through GameEngine.shoot`);
  if (arm === 'arcadeSuper') assert.equal(game.ball.shot?.id, SHOT_ID);
  else assert.equal(game.ball.shot, null, 'control arm uses an ordinary shot');

  const maxFrames = Math.ceil(MAX_SECONDS * fps);
  let defenderMovement = 0, keeperMovement = 0, maxStun = 0, maxKnockdown = 0;
  let outcome = 'unresolved';
  for (let frame = 0; frame < maxFrames; frame++) {
    game.update(1 / fps);
    for (const row of oppositionPositions) {
      const {player} = row;
      const moved = Math.hypot(player.x - row.lastX, player.y - row.lastY);
      row.lastX = player.x;row.lastY = player.y;
      if (player.keeper) keeperMovement += moved;
      else defenderMovement += moved;
      maxStun = Math.max(maxStun, player.stun || 0, player.shotImpactConfusedTimer || 0);
      maxKnockdown = Math.max(maxKnockdown, player.shotImpactKnockdownPending || 0,
        player.shotImpactKnockdownTimer || 0);
    }
    assert.ok(game.players.every(player => [player.x, player.y, player.fatigue, player.stun].every(Number.isFinite)));
    assert.ok([game.ball.x, game.ball.y, game.ball.z, game.ball.vx, game.ball.vy].every(Number.isFinite));
    if (game.score[team] > startScore[team]) { outcome = 'goal'; break; }
    if (events.some(event => event.type === 'save' && event.player?.t === opponent)) { outcome = 'save'; break; }
    if (game.ball.owner?.t === opponent) { outcome = 'interception'; break; }
    if (events.some(event => event.type === 'shotImpact' && event.team === opponent)) {
      // Continue briefly so the impact's stun/knockdown transition is sampled.
      if (frame >= Math.ceil(.35 * fps)) { outcome = 'playerImpact'; break; }
    }
  }
  if (outcome === 'unresolved') outcome = 'wideOrRebound';

  const shotImpacts = events.filter(event => event.type === 'shotImpact' && event.team === opponent).length;
  const result = {
    difficulty, fps, attackTeam: team, arm, seed, seedIndex,
    outcome,
    score: game.score.slice(),
    shotImpacts,
    launches: events.filter(event => event.type === 'shotImpactLaunch' && event.team === opponent).length,
    defenderMovement: Number(defenderMovement.toFixed(3)),
    keeperMovement: Number(keeperMovement.toFixed(3)),
    shooterFatigueSpent: Number((liveAttacker.fatigue - shooterFatigueBefore).toFixed(6)),
    opponentFatigueSpent: Number((oppositionPositions.reduce((sum, row) => sum + row.player.fatigue, 0) - opponentFatigueBefore).toFixed(6)),
    maxOpponentStunSeconds: Number(maxStun.toFixed(4)),
    maxOpponentKnockdownSeconds: Number(maxKnockdown.toFixed(4)),
    cpuDifficultyConfirmed: game.cpuLevel(cpuKeeper),
    finite: true
  };
  assert.equal(game.score[0] + game.score[1], startScore[0] + startScore[1] + (outcome === 'goal' ? 1 : 0));
  assert.equal(JSON.stringify(game.rosters.map(rows => rows.map(row => ({...row})))), abilityBefore,
    'runtime must not mutate the match roster after scenario start');
  assert.equal(JSON.stringify(sourceRoster), sourceRowsBefore, 'shared source roster remains unchanged');
  assert.ok(result.defenderMovement > 0, 'field defenders actively move during the trial');
  assert.ok(result.keeperMovement > 0, 'keeper actively moves during the trial');
  return result;
}

const trials = [];
try {
  for (const difficulty of DIFFICULTIES) for (const fps of RATES) for (const team of SIDES)
    for (const arm of ARMS) for (const seedIndex of SEEDS)
      trials.push(runScenario({difficulty, fps, team, arm, seedIndex}));
} finally {
  Math.random = originalRandom;
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
  if (previousDocument === undefined) delete globalThis.document;
  else globalThis.document = previousDocument;
}

assert.equal(trials.length, DIFFICULTIES.length * RATES.length * SIDES.length * ARMS.length * SEEDS.length);
assert.equal(storageWrites, 0, 'calibration never writes browser storage or save data');

function key(row) { return `${row.difficulty}:${row.fps}:${row.arm}:${row.seedIndex}`; }
const trialLookup = new Map(trials.map(row => [`${key(row)}:${row.attackTeam}`, row]));
for (const difficulty of DIFFICULTIES) for (const fps of RATES) for (const arm of ARMS) for (const seedIndex of SEEDS) {
  const right = trialLookup.get(`${difficulty}:${fps}:${arm}:${seedIndex}:0`);
  const left = trialLookup.get(`${difficulty}:${fps}:${arm}:${seedIndex}:1`);
  assert.equal(left.outcome, right.outcome, `mirrored outcome parity ${key(right)}: ${right.outcome}/${left.outcome}`);
  assert.equal(left.shotImpacts, right.shotImpacts, `mirrored impact parity ${key(right)}`);
  const defenderTravelDelta = Math.abs(left.defenderMovement - right.defenderMovement);
  const keeperTravelDelta = Math.abs(left.keeperMovement - right.keeperMovement);
  assert.ok(defenderTravelDelta <= Math.max(40, Math.max(left.defenderMovement, right.defenderMovement) * .05),
    `mirrored defender travel remains within 5%/40 units ${key(right)}: ${left.defenderMovement}/${right.defenderMovement}`);
  assert.ok(keeperTravelDelta <= Math.max(40, Math.max(left.keeperMovement, right.keeperMovement) * .05),
    `mirrored keeper travel remains within 5%/40 units ${key(right)}: ${left.keeperMovement}/${right.keeperMovement}`);
}

const fpsGroups = new Map();
for (const row of trials) {
  const key = `${row.difficulty}:${row.attackTeam}:${row.arm}`;
  if (!fpsGroups.has(key)) fpsGroups.set(key, []);
  fpsGroups.get(key).push(row);
}
for (const [key, group] of fpsGroups) {
  assert.equal(group.length, RATES.length * SEEDS.length, `complete rate/seed matrix ${key}`);
  for (const fps of RATES) assert.equal(group.filter(row => row.fps === fps).length, SEEDS.length,
    `all three seeds run at ${fps} Hz for ${key}`);
  assert.ok(group.every(row => Number.isFinite(row.defenderMovement) && Number.isFinite(row.keeperMovement) &&
    Number.isFinite(row.shooterFatigueSpent) && Number.isFinite(row.opponentFatigueSpent)),
  `all diagnostic metrics are finite ${key}`);
}

function buildFpsOutcomeCounts() {
  const output = {};
  const categories = ['goal', 'save', 'interception', 'playerImpact', 'wideOrRebound'];
  for (const difficulty of DIFFICULTIES) {
    output[difficulty] = {};
    for (const team of SIDES) {
      output[difficulty][team] = {};
      for (const arm of ARMS) {
        output[difficulty][team][arm] = {};
        for (const fps of RATES) {
          output[difficulty][team][arm][fps] = Object.fromEntries(categories.map(outcome =>
            [outcome, trials.filter(row => row.difficulty === difficulty && row.attackTeam === team &&
              row.arm === arm && row.fps === fps && row.outcome === outcome).length]));
        }
      }
    }
  }
  return output;
}

const summary = {
  candidate: '0.12.79.0 local source tree',
  shotId: SHOT_ID,
  scenarioCount: trials.length,
  matrix: {difficulties: DIFFICULTIES, frameRates: RATES, attackTeams: SIDES, arms: ARMS, seeds: SEEDS},
  persistentWrites: storageWrites,
  ordinaryAndSuperAreBothTestedAgainstLiveCpu: true,
  aggregate: Object.fromEntries(ARMS.map(arm => [arm, Object.fromEntries(
    ['goal', 'save', 'interception', 'playerImpact', 'wideOrRebound'].map(outcome =>
      [outcome, trials.filter(row => row.arm === arm && row.outcome === outcome).length])
  )])),
  fpsOutcomeCounts: buildFpsOutcomeCounts(),
  notes: [
    'Scripted, seeded scenarios; not human win-rate or whole-match statistics.',
    'The ordinary-shot control is not required to be weaker or less accurate in every seed.',
    'The Super Shot is the temporary Silver Carp Arcade Trial applied only to an in-memory match roster.',
    'Mirrored outcomes match exactly for each paired seed, team direction, difficulty, shot arm and frame rate.',
    'All 30/60/120 Hz cells run three paired seeds; frame-rate outcome counts are reported, not required to match, because active CPU reaction scheduling can change with integration steps.',
    'CPU movement is recorded diagnostically; movement traces are not required to match frame-for-frame.',
    'Test fixture fixes both CPU teams to the requested difficulty so side mirroring is comparable.'
  ],
  trials
};
writeFileSync(REPORT, JSON.stringify(summary, null, 2) + '\n');
console.log(`PASS Super Shot live balance matrix (${trials.length} scenarios; zero persistent writes)`);
console.log(JSON.stringify(summary.aggregate));
