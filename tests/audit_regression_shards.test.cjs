/** Run Python cross-shard manifest QA contracts in the existing Node test census. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('cross-shard regression auditor rejects silent missing and duplicate coverage', () => {
  const root = path.resolve(__dirname, '..');
  const result = spawnSync('python3', ['-m', 'unittest', 'discover', '-s', 'tests',
    '-p', 'test_audit_regression_shards.py', '-v'], {
    cwd: root, encoding: 'utf8', timeout: 25000, maxBuffer: 1024 * 1024
  });
  assert.ifError(result.error || null);
  assert.equal(result.signal, null, 'cross-shard auditor test timed out');
  assert.equal(result.status, 0,
    `Python cross-shard tests failed:\n${result.stdout}\n${result.stderr}`);
  assert.match(result.stderr, /Ran 21 tests/);
  assert.match(result.stderr, /\bOK\b/);
});
