/** Every dev/main push must trigger the full census, regardless of changed paths. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/full-regression-census.yml'),'utf8');
const push=workflow.split(/^  push:\s*$/m)[1]?.split(/^  pull_request:|^  workflow_dispatch:/m)[0];
assert.ok(push,'full regression push configuration must exist');

test('dev and main push always trigger full census, without paths or paths-ignore',()=>{
 assert.match(push,/^    branches:\s*\[dev,\s*main\]\s*$/m);
 assert.doesNotMatch(push,/^    paths(?:-ignore)?:/m);
});
test('national roster, club roster, QA and docs changes are not excluded',()=>{
 assert.doesNotMatch(push,/^    (?:paths|tags|branches-ignore):/m);
 assert.match(workflow,/^  node-regression:/m);
 assert.match(workflow,/^  browser-regression:/m);
});
test('full census retains manual and pull request triggers',()=>{
 assert.match(workflow,/^  workflow_dispatch:\s*$/m);
 assert.match(workflow,/^  pull_request:\s*$/m);
});
