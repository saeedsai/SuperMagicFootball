'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = rel => fs.readFileSync(path.join(root,rel),'utf8');

test('every agent startup and shared memory mandate per-commit About revision', () => {
  for (const p of ['AGENTS.md','docs/memory/SHARED.md','docs/memory/README.md','docs/agent_coordination/README.md']) {
    const text = read(p);
    assert.match(text, /About/i, `${p}: missing About reference`);
    assert.match(text, /every commit|per-commit|Every Git commit/i, `${p}: missing all-commits rule`);
    assert.match(text, /VERSIONING_POLICY\.md/, `${p}: missing canonical policy link`);
  }
  assert.match(read('docs/README.md'), /VERSIONING_POLICY\.md/);
});

test('About retains GitHub dev SHA lookup on every visit and treats deployment separately', () => {
  const source=read('src/modules/ui.js');
  const start=source.indexOf('async function refreshAboutDevRevision(');
  const end=source.indexOf('function showHome(){',start);
  assert.ok(start>=0&&end>start,'About revision implementation was removed');
  const about=source.slice(start,end);
  assert.match(about,/api\.github\.com\/repos\/saeedsai\/SuperMagicFootball\/commits\/dev/);
  assert.match(about,/cache:\s*['"]no-store['"]/);
  assert.ok(about.includes('/^[a-f0-9]{40}$/i'), 'About must validate a full 40-character Git SHA');
  assert.match(about,/Latest GitHub development commit/);
  assert.match(about,/deployment can lag behind it/);
  assert.match(about,/GAME BUNDLE/);
  assert.ok(about.includes("link.textContent='v'+String(bundle)+'+dev.'+sha.slice(0,12)"), 'About must expose unique visible version for every dev commit');
  assert.match(about,/auto-versioned after every update/);
  assert.match(about,/not necessarily the deployed build/);
  assert.match(about,/if\(revision\)void refreshAboutDevRevision\(revision\)/);
  assert.match(about,/unavailable offline/);
});

test('per-commit revision is not incorrectly presented as the deployed game bundle', () => {
  const doc=read('docs/VERSIONING_POLICY.md');
  assert.match(doc,/every Git commit|every new commit|every commit/i);
  assert.match(doc,/Game bundle version/);
  assert.match(doc,/Per-commit development revision/);
  assert.match(doc,/offline/);
  assert.match(doc,/GitHub Pages/);
  assert.match(doc,/exact deployed bundle SHA/);
});
