'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('style.css','utf8').replace(/\r\n/g,'\n');

test('UX-101 future navigation choices retain a readable dark hover and keyboard-focus surface',()=>{
 const hover=css.match(/\.navChoice\.navLater:hover,\.navChoice\.navLater:focus-visible\s*\{([^}]*)\}/);
 assert.ok(hover,'later-choice hover/focus contrast rule exists');
 assert.match(hover[1],/background:\s*linear-gradient\(145deg,#1e3649,#152d40\)/);
 assert.match(hover[1],/opacity:\s*1/);
});
