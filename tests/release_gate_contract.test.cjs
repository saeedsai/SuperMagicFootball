const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflow = fs.readFileSync(
  path.join(__dirname, '../.github/workflows/full-regression-census.yml'), 'utf8'
);
const job = (name) => {
  const match = workflow.match(new RegExp('^  ' + name + ':\\n([\\s\\S]*?)(?=^  [a-z][a-z-]*:\\n|$(?![\\s\\S]))', 'm'));
  assert.ok(match, 'missing job ' + name);
  return match[1];
};

test('release promotion depends on complete Node, browser, preflight and HTTP smoke', () => {
  const promotion = job('promote-dev-to-main');
  assert.match(promotion, /needs:\s*\[preflight, node-regression, browser-regression, preview-smoke\]/);
  assert.match(promotion, /github\.event_name == 'push' && github\.ref == 'refs\/heads\/dev'/);
  assert.match(workflow, /shard:\s*\[0, 1, 2, 3\]/);
  assert.match(job('preview-smoke'), /PREVIEW_SMOKE_PASS/);
  assert.match(job('preview-smoke'), /simulated-touch/);
  assert.match(job('preview-smoke'), /pageerror/);
});

test('promotion checks exact head and ancestry and never force pushes', () => {
  const promotion = job('promote-dev-to-main');
  assert.match(promotion, /current_dev.*CERTIFIED_SHA/);
  assert.match(promotion, /main_sha\.\.\.\$CERTIFIED_SHA/);
  assert.match(promotion, /status.*ahead/);
  assert.match(promotion, /-F force=false/);
  assert.doesNotMatch(promotion, /-F force=true|--force\b/);
  assert.match(promotion, /gh workflow run full-regression-census\.yml.*--ref main/);
  assert.match(promotion, /contents: write/);
  assert.match(promotion, /actions: write/);
});

test('hosted check runs for dispatched main and compares exact deployed bytes', () => {
  const hosted = job('hosted-pages-smoke');
  assert.match(hosted, /workflow_dispatch/);
  assert.match(hosted, /refs\/heads\/main/);
  assert.match(hosted, /actions\/checkout@v4/);
  assert.match(hosted, /hashlib\.sha256/);
  assert.match(hosted, /actual==expected/);
  for (const file of ['index.html', 'src/main.js', 'style.css']) {
    assert.ok(hosted.includes(file), 'missing hosted file: ' + file);
  }
});

test('write permission is scoped to promotion, never QA or browser tests', () => {
  assert.match(workflow, /^permissions:\n  contents: read/m);
  for (const name of ['preflight', 'node-regression', 'browser-regression', 'preview-smoke', 'hosted-pages-smoke']) {
    assert.doesNotMatch(job(name), /contents: write|actions: write/);
  }
});

test('new commits cancel only obsolete same-branch census, never bypass required QA',()=>{
 assert.match(workflow,/group: full-regression-\$\{\{ github\.ref \}\}/);
 assert.match(workflow,/cancel-in-progress: true/);
 const release=job('promote-dev-to-main');
 assert.match(release,/needs:\s*\[preflight, node-regression, browser-regression, preview-smoke\]/);
 assert.match(release,/CERTIFIED_SHA/);
 assert.match(release,/-F force=false/);
});
