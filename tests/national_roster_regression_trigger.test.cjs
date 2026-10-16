/** Ensure national source-only and scoped QA edits trigger complete Node + Chromium census. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/full-regression-census.yml'),'utf8');
const push=workflow.split(/^  push:\s*$/m)[1]?.split(/^  workflow_dispatch:/m)[0];
assert.ok(push,'full regression push configuration must exist');
const pathBlock=push.split(/^    paths:\s*$/m)[1];
assert.ok(pathBlock,'push.paths must not disappear');
const patterns=[...pathBlock.matchAll(/^      - '([^']+)'\s*$/gm)].map(m=>m[1]);
const escape=s=>s.replace(/[|\\{}()[\]^$+?.]/g,'\\$&');
const match=(glob,p)=>new RegExp('^'+glob.split('*').map(escape).join('[^/]*')+'$').test(p);
const shouldTrigger=p=>patterns.some(glob=>match(glob,p));

test('changing national roster source alone runs full regression census on dev and main',()=>{
 assert.match(push,/branches:\s*\[dev,\s*main\]/);
 assert.ok(shouldTrigger('data/players/national26.json'),'source edits must run full regression');
 assert.ok(shouldTrigger('.github/workflows/full-regression-census.yml'),'workflow edits remain covered');
 assert.ok(shouldTrigger('data/players/club26.json'),'existing club roster trigger preserved');
});
test('Spain metadata and future national QA scripts trigger Node and Chromium census',()=>{
 for(const file of [
  'tests/spain_national_metadata_20261016.test.cjs',
  'tests/spain_national_metadata_browser_qa.py',
  'tests/spain_goalkeeper_metadata_20261016.test.cjs',
  'tests/spain_goalkeeper_metadata_browser_qa.py',
  'tests/national_roster_regression_trigger.test.cjs',
  'tests/argentina_national_squad.test.cjs',
  'tests/argentina_national_squad_browser_qa.py',
 ]) assert.ok(shouldTrigger(file),'missing census path trigger: '+file);
});
test('national QA path additions leave unrelated docs out of heavy regression',()=>{
 assert.ok(!shouldTrigger('docs/NATIONAL_SPAIN_METADATA_20261016.md'));
 assert.ok(!shouldTrigger('data/players/legends.json'));
 assert.ok(!patterns.some(p=>p.startsWith('!')),'no exclude pattern should cancel national triggers');
 assert.equal(patterns.length,new Set(patterns).size,'duplicate paths hide maintenance issues');
});
