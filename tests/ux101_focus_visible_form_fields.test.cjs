'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const css=fs.readFileSync('style.css','utf8').replace(/\r\n/g,'\n');
const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');

test('UX-101 editable inputs and textareas receive the shared keyboard focus ring',()=>{
 assert.match(css,/input:focus-visible\s*,\s*textarea:focus-visible\s*\{[^}]*outline:\s*3px solid #5fe7f0;[^}]*outline-offset:\s*3px;/s);
});

test('UX-101 the shared focus ring covers the JSON roster editor without relying on the LAN-only rule',()=>{
 assert.match(ui,/<textarea id="jsonRoster"/);
 assert.match(css,/\.lanConnectionLab textarea:focus-visible\s*\{[^}]*outline:/s,'LAN retains its existing scoped focus rule');
 assert.match(css,/input:focus-visible\s*,\s*textarea:focus-visible\s*\{/s,'the shared form rule covers the roster editor');
});
