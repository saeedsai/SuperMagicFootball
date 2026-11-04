'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('style.css','utf8').replace(/\r\n/g,'\n');

test('UX-101 form placeholders use readable light text on the dark theme',()=>{
 assert.match(css,/input::placeholder\s*,\s*textarea::placeholder\s*\{\s*color:\s*#b4d5eb;\s*opacity:\s*1\s*\}/);
});

test('UX-102 forced-colors placeholders follow the user system text color',()=>{
 assert.match(css,/\.menu input::placeholder,\.menu textarea::placeholder\s*\{color:CanvasText!important;opacity:1\}/);
});
