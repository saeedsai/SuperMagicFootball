'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
const settingsStart=ui.indexOf('function showSettingsSection(');
const settingsEnd=ui.indexOf('\nfunction controlHelpBindingsFor(',settingsStart);
assert.ok(settingsStart>=0&&settingsEnd>settingsStart,'Settings route renderer exists');
const settings=ui.slice(settingsStart,settingsEnd);
const inputStart=ui.indexOf("menu.addEventListener('input',e=>{if(e.target?.matches?.('input[id^=audio_]'))");
const inputEnd=ui.indexOf('\n',inputStart);
assert.ok(inputStart>=0&&inputEnd>inputStart,'delegated Settings input handler exists');
const inputHandler=ui.slice(inputStart,inputEnd);

test('UX-101 sound ranges expose percentage text and keep it synchronized',()=>{
 assert.match(settings,/aria-valuetext="\$\{audio\.settings\[k\]\}%"/);
 assert.match(settings,/aria-label="\$\{k\} volume"/);
 assert.match(inputHandler,/setAttribute\('aria-valuetext',value\)/);
 assert.match(inputHandler,/output\.textContent=value/);
});
