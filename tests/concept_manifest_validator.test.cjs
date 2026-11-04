const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const validator = path.join(root, 'scripts', 'validate_concept_manifest.py');
const sourcePackage = path.join(root, 'assets', 'characters', 'concept_modular_v1');

function makeFixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'smf-concept-manifest-'));
  const pkg = path.join(temp, 'concept_modular_v1');
  fs.cpSync(sourcePackage, pkg, { recursive: true });
  const manifestPath = path.join(pkg, 'manifests', 'rig.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return { temp, manifestPath, manifest };
}

function run(manifestPath) {
  return spawnSync(process.env.SMF_PYTHON || 'python', ['-X', 'utf8', validator, manifestPath], {
    encoding: 'utf8', windowsHide: true,
  });
}

test('concept modular manifest validates all source layers and package paths', () => {
  const { temp, manifestPath } = makeFixture();
  try {
    const result = run(manifestPath);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /CONCEPT_MANIFEST_PASS .*\(8 layers\)/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('concept manifest rejects duplicate IDs and geometry outside its source canvas', () => {
  const { temp, manifestPath, manifest } = makeFixture();
  try {
    manifest.additionalLayers[0].id = manifest.runtimeLayer.id;
    manifest.additionalLayers[1].pivot = [999, 999];
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const result = run(manifestPath);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /duplicate id/);
    assert.match(result.stdout, /pivot must be a finite point within sourceCanvas/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('concept manifest rejects asset paths that escape the package', () => {
  const { temp, manifestPath, manifest } = makeFixture();
  try {
    manifest.runtimeLayer.asset = '../../../../outside.svg';
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    const result = run(manifestPath);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /asset path must stay inside the character package/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
