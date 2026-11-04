'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('src/modules/render.js','utf8');
const start=source.indexOf(' drawPlayer(ctx,p,game){');
const end=source.indexOf('\n drawPenaltyPlayers(ctx,g)',start);
const drawPlayer=source.slice(start,end);

test('airborne player shadow softens and broadens from a stable grounded baseline',()=>{
 assert.match(drawPlayer,/const lift=clamp\(\(Math\.max\(0,Number\(p\.z\)\|\|0\)\+Math\.max\(0,Number\(p\.rideVisualZ\)\|\|0\)\)\/240,0,1\)/);
 assert.match(drawPlayer,/ctx\.globalAlpha=1-lift\*\.46/);
 assert.match(drawPlayer,/ellipse\(ctx,0,3,29\+lift\*16,10\+lift\*3,'#071d2a78'\)/);
 assert.match(drawPlayer,/ctx\.save\(\);ctx\.globalAlpha=1-lift\*\.46;[\s\S]*?ctx\.restore\(\)/);
 assert.match(drawPlayer,/const lift=[\s\S]*?ellipse\(ctx,0,3,29\+lift\*16/);
});
