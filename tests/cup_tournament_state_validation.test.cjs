const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {fileURLToPath} = require('node:url');

async function modularTournamentApi() {
  const previousFetch = globalThis.fetch;
  try {
    globalThis.fetch = async url => ({ok: true, json: async () => JSON.parse(fs.readFileSync(fileURLToPath(url), 'utf8'))});
    await (await import('../src/assets.js')).loadAssets();
    return await import('../src/modules/tournaments.js');
  } finally {
    if (previousFetch === undefined) delete globalThis.fetch;
    else globalThis.fetch = previousFetch;
  }
}

test('Cup restore validation rejects malformed active schedules and standings', async () => {
  const [{TEAMS, SHOTS}, {installExpansion}, {CONTINENTS, installContinentalClubs}, api, {CUP_SLOTS}] = await Promise.all([
    import('../src/data.js'), import('../src/expanded.js'), import('../src/continental.js'), import('../src/tournaments.js'), import('../src/modules/cup_slots.js')
  ]);
  const {TOURNAMENTS} = await modularTournamentApi();
  const validators = [api.validateTournament, TOURNAMENTS.validateTournament, CUP_SLOTS.validTournament];
  const bundledSource = fs.readFileSync(path.join(__dirname, '../src/modules/tournaments.js'), 'utf8');
  assert.match(bundledSource, /if\(!Array\.isArray\(t\.rounds\)\|\|!Number\.isInteger\(t\.roundIdx\)\|\|t\.roundIdx<0\|\|t\.roundIdx>=t\.rounds\.length\)return false;/);
  assert.match(bundledSource, /const bracket=t\.knockout;if\(!bracket\|\|!Array\.isArray\(bracket\.matches\)\|\|!Array\.isArray\(bracket\.byes\)/);
  installExpansion(TEAMS, SHOTS);
  const mapping = installContinentalClubs(TEAMS, SHOTS);
  const league = api.createTournament('UEFA', mapping.UEFA[0], TEAMS, mapping);
  assert.ok(validators.every(validate => validate(league, TEAMS)));
  api.tournamentAdvance(league, TEAMS, [1, 0]);
  assert.ok(validators.every(validate => validate(league, TEAMS)), 'a normally advanced league save remains valid');

  const badRoundCursor = structuredClone(league);
  badRoundCursor.roundIdx = badRoundCursor.rounds.length;
  assert.ok(validators.every(validate => !validate(badRoundCursor, TEAMS)));

  const badPair = structuredClone(league);
  badPair.rounds[0][0] = [badPair.club];
  assert.ok(validators.every(validate => !validate(badPair, TEAMS)));

  for (const malformedRounds of [[null], [[], null]]) {
    const badRoundShape = structuredClone(league);
    badRoundShape.rounds = malformedRounds;
    assert.ok(validators.every(validate => validate(badRoundShape, TEAMS) === false),
      `malformed round containers are rejected without throwing: ${JSON.stringify(malformedRounds)}`);
  }

  const duplicatePairing = structuredClone(league);
  duplicatePairing.rounds[0].push(duplicatePairing.rounds[0][0]);
  assert.ok(validators.every(validate => !validate(duplicatePairing, TEAMS)));

  const badTable = structuredClone(league);
  badTable.table[badTable.club].pts = 99;
  assert.ok(validators.every(validate => !validate(badTable, TEAMS)));

  const knockoutComp = CONTINENTS.find(comp => comp.format === 'knockout');
  const knockout = api.createTournament(knockoutComp.id, mapping[knockoutComp.id][0], TEAMS, mapping);
  assert.ok(validators.every(validate => validate(knockout, TEAMS)));
  const fixture = api.tournamentCurrent(knockout);
  api.tournamentAdvance(knockout, TEAMS, fixture.bye ? null : [1, 0], 0);
  if (knockout.phase === 'knockout') assert.ok(validators.every(validate => validate(knockout, TEAMS)), 'a normally advanced knockout save remains valid');
  const missingBracket = structuredClone(knockout);
  delete missingBracket.knockout.matches;
  assert.ok(validators.every(validate => !validate(missingBracket, TEAMS)));

  const duplicateSurvivor = structuredClone(knockout);
  duplicateSurvivor.knockout.byes.push(duplicateSurvivor.knockout.matches[0][0]);
  assert.ok(validators.every(validate => !validate(duplicateSurvivor, TEAMS)));

  const unknownSurvivor = structuredClone(knockout);
  unknownSurvivor.knockout.matches[0][0] = Number.MAX_SAFE_INTEGER;
  assert.ok(validators.every(validate => !validate(unknownSurvivor, TEAMS)));
});

test('active league rounds reject a missing non-player fixture but allow an odd-group bye and empty legacy schedule', async () => {
  const [{TEAMS, SHOTS}, {installExpansion}, {installContinentalClubs}, api, {CUP_SLOTS}] = await Promise.all([
    import('../src/data.js'), import('../src/expanded.js'), import('../src/continental.js'), import('../src/tournaments.js'), import('../src/modules/cup_slots.js')
  ]);
  const {TOURNAMENTS} = await modularTournamentApi();
  installExpansion(TEAMS, SHOTS);
  const mapping = installContinentalClubs(TEAMS, SHOTS);
  const complete = api.createTournament('UEFA', mapping.UEFA[0], TEAMS, mapping);
  assert.ok(complete.rounds[0].length > 1, 'fixture includes independent simulated matches');
  const missing = structuredClone(complete);
  const nonPlayerFixture = missing.rounds[0].findIndex(pair => !pair.includes(missing.club));
  assert.notEqual(nonPlayerFixture, -1, 'fixture to remove is not the selected club match');
  missing.rounds[0].splice(nonPlayerFixture, 1);
  assert.equal(api.validateTournament(missing, TEAMS), false, 'runtime validator rejects omitted round match');
  assert.equal(TOURNAMENTS.validateTournament(missing, TEAMS), false, 'modular validator rejects omitted round match');
  assert.equal(CUP_SLOTS.validTournament(missing), false, 'slot validator rejects omitted round match');

  const oddParticipants = [mapping.UEFA[0], ...mapping.UEFA.slice(1, 5)];
  const odd = {
    id: 'cup_UEFA', compId: 'UEFA', club: oddParticipants[0], participants: oddParticipants,
    phase: 'league', roundIdx: 0, history: [], groups: [oddParticipants.slice()],
    rounds: [[[oddParticipants[0], oddParticipants[1]], [oddParticipants[2], oddParticipants[3]]]],
    table: Object.fromEntries(oddParticipants.map(id => [id, {p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0}])),
    earned: 0, winner: null, knockout: null
  };
  assert.equal(api.validateTournament(odd, TEAMS), true, 'an odd group may have one bye');
  assert.equal(TOURNAMENTS.validateTournament(odd, TEAMS), true, 'modular validator allows an odd-group bye');
  assert.equal(CUP_SLOTS.validTournament(odd), true, 'slot validator preserves valid odd-group bye');
  odd.rounds[0].pop();
  assert.equal(api.validateTournament(odd, TEAMS), false, 'two missing participants are not a bye');
  assert.equal(TOURNAMENTS.validateTournament(odd, TEAMS), false, 'modular validator rejects incomplete odd group');
  assert.equal(CUP_SLOTS.validTournament(odd), false, 'slot validator rejects incomplete odd group');

  const legacyPlaceholder = {
    id: 'cup_UEFA', compId: 'UEFA', club: oddParticipants[0], participants: oddParticipants,
    phase: 'league', roundIdx: 0, history: [], groups: [], rounds: [],
    table: Object.fromEntries(oddParticipants.map(id => [id, {}])), earned: 0, winner: null, knockout: null
  };
  assert.equal(CUP_SLOTS.validTournament(legacyPlaceholder), true, 'empty legacy schedules remain compatible');
  assert.equal(CUP_SLOTS.validTournament({...legacyPlaceholder, rounds: [[]]}), true,
    'a legacy sentinel containing one empty round remains compatible');
});
