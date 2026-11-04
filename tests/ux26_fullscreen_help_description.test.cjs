'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('UX26 fullscreen help exposes its changing guidance as the modal description',()=>{
 const html=fs.readFileSync('index.html','utf8');
 assert.match(html,/<div id="fullscreenHelp"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="fullscreenHelpTitle"[^>]*aria-describedby="fullscreenHelpText"/,
  'screen readers must receive the fullscreen guidance when modal focus moves to its close button');
 assert.match(html,/<p id="fullscreenHelpText">[^<]+<\/p>/,
  'the described element must be the visible guidance text');
 const ui=fs.readFileSync('src/modules/ui.js','utf8');
 assert.match(ui,/function fullscreenHelp\(message\)\{[\s\S]*?\$\('fullscreenHelpText'\)\.textContent=message/,
  'each browser-specific explanation updates the element linked as the dialog description');
});
