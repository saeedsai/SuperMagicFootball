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
 assert.doesNotMatch(html,/<img[^>]+src=/);
});
