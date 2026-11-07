const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Breath development ledger uses real Markdown paragraphs, not literal escaped newlines', () => {
  const ledger = fs.readFileSync(path.join(__dirname, '../docs/MASTER_BACKLOG.md'), 'utf8');
  const entries = ledger.split(/\r?\n\r?\n/);
  for (const id of ['BREATH-BOUNDARY-OWNER-REGRESSION-02', 'BREATH-FRAME-SELECTION-REGRESSION-01']) {
    const matches = entries.filter(entry => entry.includes(id));
    assert.equal(matches.length, 1, `expected exactly one paragraph for ${id}`);
    const entry = matches[0];
    assert.match(entry, /^> \*\*7 November 2026 — BREATH-/);
    assert.equal(entry.includes(String.raw`\n\n`), false, `${id} must not embed escaped paragraph separators`);
    assert.equal(entry.includes(String.raw`\n`), false, `${id} must use real line breaks`);
  }
});
