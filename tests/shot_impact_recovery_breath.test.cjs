'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('src/modules/render.js','utf8');
const start=source.indexOf('drawPlayer(ctx,p,game){');
const end=source.indexOf('\n drawPenaltyPlayers(',start);
const drawPlayer=source.slice(start,end);

test('downed breathing is a bounded visual transform driven only by the existing knockdown pose',()=>{
 assert.match(drawPlayer,/const downedBreath=knockdownPose\*Math\.sin\(knockdownTimer\*6\.4\)\*\(reducedFlash\?\.5:1\)/);
 assert.match(drawPlayer,/if\(knockdownPose>0\)\{ctx\.translate\(0,-\.8\*downedBreath\);ctx\.scale\(1,1\+\.012\*downedBreath\);\}/);
 assert.match(drawPlayer,/shotImpactKnockdownTimer/);
 assert.doesNotMatch(drawPlayer,/shotImpactKnockdownTimer\s*[-+*/]?=/,'renderer must not write the gameplay timer');
 assert.doesNotMatch(drawPlayer,/p\.(?:x|y|z|vx|vy|vz)\s*[-+*/]?=/,'renderer must not mutate player physics');
});
