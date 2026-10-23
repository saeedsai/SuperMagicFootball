'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('concept-royals-visual-qa.html','utf8');
test('renderer QA page loads real game character module and renders 12 × 5 views',()=>{
 assert.match(html,/import \{CONCEPT_HERO\} from '\.\/src\/modules\/concepthero\.js'/);
 assert.match(html,/CONCEPT_HERO\.draw\(ctx,p,\{kind:views\[j\]\},\{run\}\)/);
 assert.match(html,/for\(let i=0;i<12;i\+\+\)/);
 assert.match(html,/for\(let j=0;j<5;j\+\+\)/);
 assert.match(html,/\['front','quarterFront','side','quarterBack','back'\]/);
 assert.match(html,/canvas\.toDataURL\('image\/png'\)/);
 assert.match(html,/mode==='running'/);
 assert.match(html,/mode==='timeline'/);
 assert.match(html,/for\\(let frame=0;frame<5;frame\\+\\+\\)/);
 assert.match(html,/document\\.getElementById\\('timeline'\\)/);
 assert.doesNotMatch(html,/<img[^>]+src=/);
});

test('real Chromium screenshot workflow captures all 12 × 5 directions and 300 run poses',()=>{
 const script=fs.readFileSync('tests/concept_royals_sheet_browser_qa.py','utf8');
 const workflow=fs.readFileSync('.github/workflows/concept-hero-qa.yml','utf8');
 assert.match(script,/page\.locator\('#sheet'\)\.screenshot/);
 assert.match(script,/range\(12\)/);
 assert.match(script,/range\(5\)/);
 assert.match(script,/running_samples': 300/);
 assert.match(script,/ImageChops\.difference/);
 assert.match(workflow,/python3 tests\/concept_royals_sheet_browser_qa\.py/);
 assert.match(workflow,/concept-hero-playable-screenshots/);
});
