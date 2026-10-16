'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const memory = path.join(root, 'docs', 'memory');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const registry = JSON.parse(read('docs/memory/AGENTS_INDEX.json'));
const required = ['## Mission', '## Current checkpoint', '## Next smallest action', '## Ownership and exclusions', '## Evidence', '## Cleanup'];

test('one bounded shared memory and explicit entry points', () => {
  const shared = read('docs/memory/SHARED.md');
  assert.ok(Buffer.byteLength(shared) <= 6144, 'shared memory exceeds 6 KiB');
  assert.match(shared, /## Stable project facts/);
  assert.match(shared, /## Coordination and sources of truth/);
  assert.match(shared, /## Memory hygiene/);
  assert.match(read('AGENTS.md'), /docs\/memory\/SHARED\.md/);
  assert.match(read('README.md'), /docs\/memory\/README\.md/);
  assert.match(read('docs/agent_coordination/README.md'), /Lean-memory protocol/);
});

test('one unique, short per-chat file per indexed agent with no unregistered extras', () => {
  assert.equal(registry.schema, 'smf-chat-memory-index/1');
  assert.ok(registry.agents.length >= 9, 'missing known project chats');
  const ids = new Set(), indexedFiles = new Set();
  for (const a of registry.agents) {
    assert.match(a.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(a.path, `docs/memory/agents/${a.id}.md`);
    assert.ok(!ids.has(a.id), `duplicate agent ID ${a.id}`);
    ids.add(a.id);
    indexedFiles.add(path.basename(a.path));
    const content = read(a.path);
    assert.ok(Buffer.byteLength(content) <= 4096, `${a.id} exceeds 4 KiB`);
    assert.ok(content.includes(`**Agent ID:** \`${a.id}\``), `wrong identity for ${a.id}`);
    for (const section of required) assert.ok(content.includes(section), `${a.id}: missing ${section}`);
    assert.ok(!/\/agents\/[a-z0-9-]+\.md/.test(content), `${a.id}: cross-agent memory reference`);
  }
  const actual = fs.readdirSync(path.join(memory, 'agents')).filter(n => n.endsWith('.md')).sort();
  assert.deepEqual(actual, [...indexedFiles].sort());
});

test('memory policies distinguish actual ACL isolation from cooperative discipline', () => {
  const policy = read('docs/memory/README.md');
  const shared = read('docs/memory/SHARED.md');
  assert.match(policy, /cannot grant file-specific access/i);
  assert.match(policy, /Do not.*another agent/i);
  assert.match(shared, /Git history/);
});
