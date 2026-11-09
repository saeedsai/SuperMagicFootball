'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('PROD-MAIN-ONLY-01: Render production service Blueprints always deploy from main', () => {
  for (const filename of ['render.yaml', 'render.online.yaml']) {
    const source = read(filename);
    assert.match(source, /^    branch: main\s*$/m, `${filename} must select main`);
    assert.doesNotMatch(source, /^    branch: dev\s*$/m, `${filename} must never select dev`);
    assert.match(source, /^    name: supermagicfootball-/m,
      `${filename} must still describe the expected game service`);
  }
});

test('PROD-MAIN-ONLY-01: hosted Pages smoke tests run against main rather than dev', () => {
  for (const filename of [
    '.github/workflows/verify-pages-playable.yml',
    '.github/workflows/concept-hero-live-smoke.yml',
    '.github/workflows/concept-modular-live-smoke.yml'
  ]) {
    const source = read(filename);
    assert.match(source, /^    branches: \[main\]\s*$/m, `${filename} must follow main`);
    assert.doesNotMatch(source, /^    branches: \[dev\]\s*$/m, `${filename} must not track dev`);
  }
});

test('PROD-MAIN-ONLY-01: dev stays the QA source, promotion and hosted byte check stay main-only', () => {
  const workflow = read('.github/workflows/full-regression-census.yml');
  assert.match(workflow, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/dev'/,
    'promotion may only be initiated from a dev push');
  assert.match(workflow, /needs: \[preflight, node-regression, browser-regression, preview-smoke\]/,
    'promotion must retain all mandatory QA dependencies');
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/,
    'hosted Pages byte verification must run only on main');
  assert.match(workflow, /gh workflow run full-regression-census\.yml --repo "\$GH_REPO" --ref main/,
    'successful promotion must explicitly start main verification');
  const pages = read('GITHUB_PAGES_SETUP.md');
  assert.match(pages, /Branch = main/, 'Pages publication source must remain main');
});
