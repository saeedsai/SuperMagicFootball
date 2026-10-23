'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),engine=fs.readFileSync(path.join(root,'src/modules/engine.js'),'utf8'),ui=fs.readFileSync(path.join(root,'src/modules/ui.js'),'utf8');
test('held DRIBBLE activates Magic Trick only after one second with possession and without button conflicts',()=>{
 assert.match(engine,/s\.dribble&&!s\.jump&&!s\.shoot&&!s\.pass&&this\.ball\.owner===p/);
 assert.match(engine,/p\.dribbleHold>=1&&!p\.magicHoldLatched/);
 assert.match(engine,/p\.magicHoldLatched=true;\s*this\.tryMagicTrick\(p\)/);
 assert.match(engine,/if\(!s\.dribble\|\|this\.ball\.owner!==p\)p\.magicHoldLatched=false/);
});
test('Trick remains separate from normal dribble and aerial actions',()=>{
 assert.match(engine,/const dribbleDown=this\.input\.just\(p\.t,'dribble'\)/);
 assert.match(engine,/this\.tryBicycleShot\(p\)/);
 assert.match(engine,/const id=p\?\.src\?\.magicTrick/);
});
test('Magic Trick has eight named abilities and bounded cooldown, stamina and counterplay',()=>{
 for(const id of ['banana','ice','bat','fireball','freeze','scream','hideBall','teleport'])assert.ok(engine.includes("'"+id+"'"));
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.match(engine,/const countered=/);
 assert.match(engine,/p\.fatigue=Math\.min\(1,p\.fatigue\+\.035\)/);
 assert.match(engine,/this\.emit\('magicTrick'/);
});
test('Controls and Player Studio document holding Dribble for one second',()=>{
 assert.match(ui,/Hold DRIBBLE for 1 second/);
 assert.match(ui,/hold DRIBBLE for 1 second/);
});
