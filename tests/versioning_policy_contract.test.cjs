'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('every startup protocol identifies bundled About version and internal commit audit',()=>{
 for(const p of ['AGENTS.md','docs/memory/SHARED.md','docs/memory/README.md','docs/agent_coordination/README.md']){
  const doc=read(p);
  assert.match(doc,/About/i,p+' missing About');
  assert.match(doc,/VERSIONING_POLICY\.md/,p+' missing canonical policy');
  assert.match(doc,/commit|SHA/i,p+' missing internal commit audit');
 }
 assert.match(read('docs/README.md'),/VERSIONING_POLICY\.md/);
});
test('the only player-visible version is a bundled 4-field About label, not remote dev HEAD',()=>{
 const ui=read('src/modules/ui.js'),release=read('src/modules/release.js');
 const start=ui.indexOf('function showAbout(){'),end=ui.indexOf('function showHome(){',start);
 assert.ok(start>0&&end>start);
 const about=ui.slice(start,end);
 assert.match(release,/version:'0\.9\.0\.0'/);
 assert.match(about,/RELEASE\.version/);
 assert.match(about,/aboutBundleVersion/);
 assert.match(about,/aboutReleaseNotes/);
 assert.doesNotMatch(about,/GitHub development commit|\+dev\.|aboutDevRevision|\bfetch\(/);
 assert.doesNotMatch(ui,/https:\/\/api\.github\.com\/repos\/saeedsai\/SuperMagicFootball\/commits/);
 assert.match(read('index.html'),/<title>SUPERMAGIC FOOTBALL · PLAY<\/title>/);
});
test('release module, offline cache and fixture have matching runtime wiring',()=>{
 const build=read('scripts/build.py'),sw=read('sw.js'),ui=read('src/modules/ui.js');
 assert.match(ui,/import \{RELEASE\} from "\.\/release\.js"/);
 assert.match(build,/'render','release','ui'/);
 assert.match(sw,/'render','release','ui'/);
 assert.match(sw,/release-0901-v1/);
 assert.match(ui,/version:RELEASE\.version,game/);
 assert.match(ui,/version:RELEASE\.version,exportedAt/);
});
test('internal exact SHA is preserved by GitHub release workflow, not displayed in About',()=>{
 const flow=read('.github/workflows/full-regression-census.yml');
 assert.match(flow,/CERTIFIED_SHA/);
 assert.match(flow,/current_dev.*CERTIFIED_SHA/);
 assert.match(flow,/hashlib\.sha256/);
 assert.match(read('docs/VERSIONING_POLICY.md'),/GitHub Pages/);
 assert.match(read('docs/VERSIONING_POLICY.md'),/internal/i);
 assert.match(read('docs/VERSIONING_POLICY.md'),/0\.9\.0\.0/);
});
