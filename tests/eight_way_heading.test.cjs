'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadVisualfeel() {
  const filename = path.join(__dirname, '../src/modules/visualfeel.js');
  const source = fs.readFileSync(filename, 'utf8')
    .replace(/^import\s+.*;\s*$/gm, '')
    .replace(/^export\s+\{[^}]+\};?\s*$/gm, '');
  const sandbox = {
    GAME_ASSETS: { mechanics: { ballModels: [{ id: 'classic' }] } },
  };
  vm.runInNewContext(source + '\nthis.result = VISUALFEEL;', sandbox, { filename });
  return sandbox.result;
}

const visual = loadVisualfeel();

test('eight independent compass headings follow world movement', () => {
  const cases = [
    [0, -1, 'N'], [1, -1, 'NE'], [1, 0, 'E'], [1, 1, 'SE'],
    [0, 1, 'S'], [-1, 1, 'SW'], [-1, 0, 'W'], [-1, -1, 'NW'],
  ];
  for (const [dx, dy, expected] of cases) {
    assert.equal(visual.artHeading(dx, dy), expected, `direction (${dx},${dy})`);
  }
  assert.equal(new Set(cases.map(([dx, dy]) => visual.artHeading(dx, dy))).size, 8);
});

test('idle facing remains deterministic without new player state', () => {
  assert.equal(visual.artHeading(0, 0, 1), 'E');
  assert.equal(visual.artHeading(0, 0, -1), 'W');
  assert.equal(visual.artHeading(NaN, NaN, -1), 'W');
});

test('existing five-kind rendering contract is not altered', () => {
  const cases = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1]];
  for (const [dx, dy] of cases) {
    const before = visual.facingView(dx, dy);
    visual.artHeading(dx, dy);
    assert.deepEqual(visual.facingView(dx, dy), before);
    assert.ok(['side', 'front', 'back', 'quarterFront', 'quarterBack'].includes(before.kind));
  }
});
