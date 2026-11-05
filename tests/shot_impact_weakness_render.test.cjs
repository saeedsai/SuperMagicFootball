'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('src/modules/render.js','utf8');

test('shot weakness cue is steady, reduced-flash safe, and excluded from stunned/downed/preview poses',()=>{
 const start=source.indexOf('function drawShotWeaknessCue('),end=source.indexOf('\nfunction drawUndergroundShotTell(',start);
 assert.ok(start>=0&&end>start,'renderer helper must exist');
 const helper=source.slice(start,end);
 assert.match(helper,/shotImpactWeaknessTimer/);
 assert.match(helper,/shotImpactWeakness/);
 assert.match(helper,/p\?\.preview\|\|p\?\.stun>0\|\|p\?\.down/);
 assert.match(helper,/shotImpactKnockdownPending>0/);
 assert.match(helper,/shotImpactKnockdownTimer>0/);
 assert.match(helper,/shotImpactRiseTimer>0/);
 assert.match(helper,/shotDown/);
 assert.match(helper,/shotGetUp/);
 assert.match(helper,/launched/);
 assert.match(helper,/reducedFlash\?\.58:\.76/);
 assert.doesNotMatch(helper,/Math\.sin|Math\.cos|this\.time|p\.[A-Za-z0-9_]+\s*=/,
  'cue uses no animation clock and never writes player state');
 assert.match(source,/if\(!p\.preview&&!\(p\.shotImpactConfusedTimer>0\)\)drawShotWeaknessCue\(ctx,p,!!game\.options\?\.reducedFlash\)/);
});
