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
  assert.match(hosted, /local_release=Path\('src\/modules\/release\.js'\)\.read_bytes\(\)/);
  assert.match(hosted, /matched=re\.search/);
  assert.match(hosted, /matched\.group\(0\) in results/);
  assert.doesNotMatch(hosted, /Hosted About release version is not 0\.9\.1\.0/);
  for (const file of ['index.html', 'src/main.js', 'style.css', 'src/modules/ui.js', 'src/modules/release.js']) {
    assert.ok(hosted.includes(file), 'missing hosted file: ' + file);
  }
});

test('write permission is scoped to promotion, never QA or browser tests', () => {
  assert.match(workflow, /^permissions:\n  contents: read/m);
  for (const name of ['preflight', 'node-regression', 'browser-regression', 'preview-smoke', 'hosted-pages-smoke']) {
    assert.doesNotMatch(job(name), /contents: write|actions: write/);
  }
});

test('full census has no stale workflow lock, while promotion requires exact-head green QA',()=>{
 assert.doesNotMatch(workflow,/^concurrency:/m,'no workflow-level lock can indefinitely hold exact-head runs');
 assert.doesNotMatch(workflow,/cancel-in-progress: true/,'frequent dev commits cannot cancel running full QA');
 const release=job('promote-dev-to-main');
 assert.match(release,/needs:\s*\[preflight, node-regression, browser-regression, preview-smoke\]/);
 assert.match(release,/CERTIFIED_SHA/);
 assert.match(release,/-F force=false/);
});
