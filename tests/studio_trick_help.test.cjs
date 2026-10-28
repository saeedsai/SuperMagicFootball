'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ui=fs.readFileSync(require('node:path').join(__dirname,'../src/modules/ui.js'),'utf8');
test('STUDIO-TRICK-HELP-01 selected Magic Trick explains existing DRIBBLE hold activation',()=>{
 assert.match(ui,/const instructions=' In a match, carry the ball and hold DRIBBLE for 1 second/);
 assert.match(ui,/Equipped Trick: '\+guide\+instructions/);
 assert.match(ui,/Preview only: '\+guide\+instructions/);
 assert.match(ui,/opposing SHOOT-slide can clear it/);
 assert.match(ui,/strong defender approaching and facing the carrier can counter/);
});
