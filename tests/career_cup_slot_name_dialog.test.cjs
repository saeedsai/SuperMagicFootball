'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const ui=fs.readFileSync('src/modules/ui.js','utf8');
const css=fs.readFileSync('style.css','utf8');

test('Career save, Career rename, and Cup save open the shared in-game name dialog',()=>{
 assert.match(ui,/careerSlotSave_[\s\S]*?showSlotNameDialog\('career','save'/);
 assert.match(ui,/careerSlotRename_[\s\S]*?showSlotNameDialog\('career','rename'/);
 assert.match(ui,/cupSlotSave_[\s\S]*?showSlotNameDialog\('cup','save'/);
 assert.doesNotMatch(ui,/prompt\('Career save name:|prompt\('Rename Career slot|prompt\('Cup save name:/);
});

test('slot-name dialog labels the input, announces errors, caps names, and exposes overwrite intent',()=>{
 assert.match(ui,/role="dialog" aria-modal="true" aria-labelledby="slotNameTitle" aria-describedby="slotNameDescription"/);
 assert.match(ui,/<label class="fieldLabel" for="slotNameInput">/);
 assert.match(ui,/id="slotNameInput"[^>]*maxlength="60" required/);
 assert.match(ui,/id="slotNameError" role="alert" aria-live="assertive"/);
 assert.match(ui,/Saving will replace the existing/);
 assert.match(ui,/REPLACE AND SAVE/);
 assert.match(css,/\.saveSlotNameDialog input:focus-visible\{outline:3px solid #5fe7f0/);
});

test('submit and cancellation keep saves separate and restore focus to the originating slot action',()=>{
 assert.match(ui,/menu\.addEventListener\('submit',[\s\S]*?form\.dataset\.slotAction/);
 assert.match(ui,/Enter a name for this save before continuing/);
 assert.match(ui,/careerSlots\.save\(n,career,name\)/);
 assert.match(ui,/careerSlots\.rename\(n,name\)/);
 assert.match(ui,/cupSlots\.save\(n,continentalRun,name\)/);
 assert.match(ui,/slotNameCancel_\(career\|cup\)_\(save\|rename\)_/);
 assert.match(ui,/menu\.addEventListener\('keydown',[\s\S]*?screen!=='SAVE SLOT NAME'/);
 assert.match(ui,/returnFromSlotName\(kind,n,focusAction\)/);
});
