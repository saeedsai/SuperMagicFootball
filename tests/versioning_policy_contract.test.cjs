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
 assert.match(release,/version:'\d+\.\d+\.\d+\.\d+'/);
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
 assert.match(build,/'render','release','ability-icons','ui'/);
 assert.match(sw,/'render','release','ability-icons','ui'/);
 assert.match(sw,/release-090220-v1/);
 assert.match(build,/'shotpaths','magic-hazards','engine'/,'QA fixture must include new hazard module');
 assert.match(sw,/'shotpaths','magic-hazards','engine'/,'offline precache must include new hazard module');
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
 assert.ok(read('docs/VERSIONING_POLICY.md').includes(JSON.parse(read('package.json')).version),'release policy must identify current candidate');
});

test('every game release must update README version, dated summary and playable link',()=>{
 const pkg=JSON.parse(read('package.json')),release=read('src/modules/release.js'),readme=read('README.md');
 const version=pkg.version;
 assert.match(version,/^\d+\.\d+\.\d+\.\d+$/);
 assert.ok(release.includes("version:'"+version+"'"),'About release must match package');
 assert.ok(readme.includes('**'+version+' release (') || readme.includes('**'+version+' release candidate ('),'README release banner must match package or explicitly identify an uncertified candidate');
 assert.ok(readme.includes('# Supermagic Football · v'+version+' ·'),'README heading must match package');
 const banner=readme.split('\n').find(line=>(line.startsWith('> **'+version+' release (') || line.startsWith('> **'+version+' release candidate (')));
 assert.ok(banner&&banner.length>130,'README must summarize shipped changes');
 assert.ok(readme.includes('https://saeedsai.github.io/SuperMagicFootball/'),'README live link missing');
 assert.match(read('AGENTS.md'),/Mandatory README release gate/);
 assert.match(read('docs/VERSIONING_POLICY.md'),/Mandatory README changelog/);
 assert.match(read('docs/memory/SHARED.md'),/Every player-facing game update must also update root/);
});

// Parse the actual shipped ES modules in CI, not just regex-extracted snippets.
// This catches malformed release metadata before Playwright startup smoke.
test('every shipped JavaScript module parses before browser startup',()=>{
 const {spawnSync}=require('node:child_process');
 const modules=fs.readdirSync(path.join(root,'src/modules')).filter(name=>name.endsWith('.js')).map(name=>'src/modules/'+name);
 for(const file of ['src/main.js','src/assets.js','sw.js',...modules]){
  const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,file+': '+(result.stderr||result.error||'syntax check failed'));
 }
});

test('each player-facing candidate rotates offline shell and retains About-only release notes',()=>{
 const pkg=JSON.parse(read('package.json')),sw=read('sw.js'),release=read('src/modules/release.js');
 assert.ok(sw.startsWith('// '+pkg.version+' modular offline shell'),'service-worker release header must track candidate');
 assert.match(sw,/const CACHE='smf-[^']+'/,'offline cache key must be explicit and nonempty');
 assert.match(release,/notes:Object\.freeze\(\[/,'About notes must be immutable');
 assert.ok(release.includes("version:'"+pkg.version+"'"),'About candidate and package must agree');
});

test('player-facing candidate rotates the offline cache to the current four-field version',()=>{
 const version=JSON.parse(read('package.json')).version;
 const sw=read('sw.js');
 assert.ok(sw.startsWith('// '+version+' modular offline shell'),'service worker comment must match candidate');
 const cacheVersion=version.replace(/\./g,'');
 assert.ok(sw.includes('-'+cacheVersion+"';"),'service worker cache must end with the current version token');
 assert.match(read('src/modules/release.js'),/notes:Object\.freeze\(\[/);
});

test('team-fair Magic Trap gameplay change is reflected in About, README and rotated offline cache',()=>{
 const version=JSON.parse(read('package.json')).version;
 const release=read('src/modules/release.js'),readme=read('README.md'),sw=read('sw.js');
 assert.match(release,/each team can retain up to six Banana Peels and six Ice Patches/);
 assert.match(readme,/independent six-trap quotas for each team/);
 assert.ok(readme.startsWith('> **'+version+' release candidate'),'README first banner must describe current candidate');
 assert.ok(readme.includes('v'+version),'README project heading must track current version');
 assert.ok(sw.includes('-'+version.replace(/\\./g,'')+"';"),'offline cache must rotate for this candidate');
});
