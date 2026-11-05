'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/modules/characterart.js','utf8').replace(/export \{CHARACTER_ART\};?\s*$/,'');
const CHARACTER_ART=vm.runInNewContext(source+'\nCHARACTER_ART',{});

test('idle blink is a short deterministic cycle staggered by player index',()=>{
 const blink=CHARACTER_ART.idleBlink;
 assert.equal(blink(0,0),false);
 assert.equal(blink(.10,0),true);
 assert.equal(blink(.20,0),false);
 assert.equal(blink(.10,0),blink(.10,0),'same clock and player produce same eyelid state');
 assert.equal(blink(.10,1),false,'nearby players do not blink in lockstep');
 assert.equal(blink(3.67,1),true,'the second player receives a deterministic phase offset');
 assert.equal(blink(-1,0),false);
 assert.equal(blink(NaN,0),false);
 assert.equal(blink(Infinity,0),false);
});

test('normal blinking is only enabled for stationary idle faces, never hurt poses',()=>{
 const source=fs.readFileSync('src/modules/characterart.js','utf8');
 assert.match(source,/const blink=idleBreath&&!opt\.hurt&&idleBlink\(opt\.time,p\.i\)/);
 assert.match(source,/const shut=!!opt\.hurt\|\|!!opt\.cry\|\|!!opt\.blink/);
 assert.match(source,/face\(c,k,av,colors\.skin,colors\.hair,\{[^}]*\bblink\b/);
 assert.match(source,/face\(c,k,av,colors\.skin,colors\.hair,\{[^}]*\bgazeX:gaze\.x\b/);
 assert.match(source,/face\(c,k,av,colors\.skin,colors\.hair,\{[^}]*\bgazeY:gaze\.y\b/);
});
