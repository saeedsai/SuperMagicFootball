const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Breath development ledger uses real Markdown paragraphs, not literal escaped newlines', () => {
  const ledger = fs.readFileSync(path.join(__dirname, '../docs/MASTER_BACKLOG.md'), 'utf8');
  for (const id of ['BREATH-BOUNDARY-OWNER-REGRESSION-02', 'BREATH-FRAME-SELECTION-REGRESSION-01']) {
    const position = ledger.indexOf(id);
    assert.ok(position >= 0, `missing ledger entry ${id}`);
    const entry = ledger.slice(position, ledger.indexOf('\n\n', position));
    assert.equal(entry.includes(String.raw`\n\n`), false, `${id} must not embed escaped paragraph separators`);
  }
});
