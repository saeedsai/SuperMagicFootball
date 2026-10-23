const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const spec = JSON.parse(readFileSync(require('node:path').join(__dirname, '../docs/concept_character_pipeline/CONCEPT_ROYALS_OWNER_REFERENCE_20261023.json'), 'utf8'));
test('Concept Royals reference contains exactly twelve unique player identities', () => {
  assert.equal(spec.players.length, 12);
  assert.deepEqual(spec.players.map(p => p.number), Array.from({length:12}, (_,i)=>i+1));
  assert.equal(new Set(spec.players.map(p=>p.name)).size,12);
  assert.equal(new Set(spec.players.map(p=>p.hair)).size,12);
  for (const p of spec.players) for (const key of ['name','hair','skin','details']) assert.ok(typeof p[key] === 'string' && p[key].trim(), `${p.number}: ${key}`);
});
test('Concept Royals art contract requires directional and animation QA', () => {
  assert.deepEqual(spec.requirements.directions, ['front','front-quarter','side','back-quarter','back']);
  for (const action of ['idle','run','jump','shoot','tackle','super-shot','super-defense','trick']) assert.ok(spec.requirements.animations.includes(action));
  assert.match(spec.status,/NOT integrated/i);
});
