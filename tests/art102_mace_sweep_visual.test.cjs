'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const art=fs.readFileSync('src/modules/characterart.js','utf8');
const render=fs.readFileSync('src/modules/render.js','utf8');
const painter=art.slice(art.indexOf(' function drawMaceSweep('),art.indexOf(' function jersey(',art.indexOf(' function drawMaceSweep(')));
const player=render.slice(render.indexOf('drawPlayer(ctx,p,game){'),render.indexOf('\n drawBall(',render.indexOf('drawPlayer(ctx,p,game){')));

test('ART-102 Mace Sweep passes its live .24-second action phase to the eight-view player painter',()=>{
 assert.ok(painter.length>0,'independent Mace Sweep painter exists');
 assert.match(painter,/const t=clamp\(phase,0,1\),angle=direction\*\(-1\.05\+2\.1\*t\)/);
 assert.match(painter,/c\.save\(\);c\.translate\(x,y-2\);c\.rotate\(angle\)/,'weapon is attached to its rendered wrist');
 assert.match(painter,/fill\(c,path=>[\s\S]*col\.gold/,'mace head uses team-trim gold');
 assert.match(art,/drawMaceSweep\(c,hand\[0\],hand\[1\],opt\.defenceSweepPhase,opt\.defenceSweepDirection\|\|1,col\)/);
 assert.match(player,/const maceSweepPhase=p\.action==='defenceSuper'&&p\.maceSweepPending[\s\S]*?\?clamp\(1-\(Number\(p\.maceSweepPending\.remaining\)\|\|0\)\/\.24,0,1\):undefined/);
 assert.match(player,/defenceSweepPhase:maceSweepPhase,defenceSweepDirection:/);
 assert.doesNotMatch(painter,/p\.[\w.]+\s*=|velocity|hitbox|physics/i,'paint-only cue does not mutate gameplay');
});
