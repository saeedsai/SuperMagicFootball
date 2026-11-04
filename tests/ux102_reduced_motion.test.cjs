'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('style.css','utf8').replace(/\r\n/g,'\n');

test('UX-102 reduced-motion preference covers transitions, animations and smooth scrolling globally',()=>{
 const marker='/* UX-102: apply the operating-system reduced-motion preference across the UI. */';
 const start=css.lastIndexOf(marker);
 assert.notEqual(start,-1,'global reduced-motion policy is documented');
 const policy=css.slice(start);
 assert.match(policy,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.match(policy,/\*,\*::before,\*::after\s*\{[^}]*animation-duration\s*:\s*\.001ms!important/s);
 assert.match(policy,/animation-iteration-count\s*:\s*1!important/);
 assert.match(policy,/transition-duration\s*:\s*\.001ms!important/);
 assert.match(policy,/transition-delay\s*:\s*0ms!important/);
 assert.match(policy,/scroll-behavior\s*:\s*auto!important/);
});
