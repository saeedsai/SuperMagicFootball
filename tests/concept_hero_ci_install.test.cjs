'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const workflow=fs.readFileSync(path.resolve(__dirname,'../.github/workflows/concept-hero-qa.yml'),'utf8');
test('ART-CI-001 Concept Hero uses Playwright-managed Chromium, not snapcraft',()=>{
 assert.match(workflow,/python3 -m playwright install --with-deps chromium/);
 assert.match(workflow,/sudo ln -sf "\$browser_path" \/usr\/bin\/chromium/);
 assert.doesNotMatch(workflow,/apt-get install -y chromium(?:\s|$)/);
});
