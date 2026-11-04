'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const art=fs.readFileSync('src/modules/characterart.js','utf8');
const render=fs.readFileSync('src/modules/render.js','utf8');
const arm=art.slice(art.indexOf(' function arm('),art.indexOf(' function drawMaceSweep('));
const player=render.slice(render.indexOf('drawPlayer(ctx,p,game){'),render.indexOf('\n drawBall(',render.indexOf('drawPlayer(ctx,p,game){')));
const telegraph=player.slice(player.indexOf('if(!p.preview&&p.spinBumperPending){'),player.indexOf('if(!p.preview&&p.maceSweepPending){'));

test('ART-102 Spin Bumper widens both character arms through its existing .42-second tell',()=>{
 assert.match(arm,/const bumperPhase=Number\.isFinite\(opt\.spinBumperPhase\)\?clamp\(opt\.spinBumperPhase,0,1\):null/);
 assert.match(arm,/bumperPhase!==null[\s\S]*?\[sh\+sign\*\(11\+bumperPhase\*8\)/,'both arm signs use a progressing brace');
 assert.match(arm,/\[elbow\[0\]\+sign\*\(8\+bumperPhase\*7\),-30-bumperPhase\*18\]/);
 assert.match(player,/const spinBumperPhase=p\.action==='defenceSuper'&&p\.spinBumperPending[\s\S]*?\?clamp\(1-\(Number\(p\.spinBumperPending\.remaining\)\|\|0\)\/\.42,0,1\):undefined/);
 assert.match(player,/spinBumperPhase,hurt:isHurt/);
 assert.doesNotMatch(arm,/p\.[\w.]+\s*=|velocity|hitbox|physics/i,'brace remains visual-only');
});

test('Spin Bumper telegraph shows timer-linked progress while reduced-flash freezes orbit',()=>{
 assert.match(telegraph,/const reduced=!!game\.options\?\.reducedFlash,remaining=Math\.max\(0,Math\.min\(1,p\.spinBumperPending\.remaining\/\.42\)\),progress=1-remaining/);
 assert.match(telegraph,/ctx\.arc\(0,3,124,-PI\/2,-PI\/2\+progress\*PI\*2\)/,'outer arc follows the existing warning timer');
 assert.match(telegraph,/const spin=reduced\?0:progress\*PI\*2/,'reduced-flash mode freezes the rotating orbit');
 assert.doesNotMatch(telegraph,/p\.[\w.]+\s*=|velocity|hitbox|physics/i,'telegraph remains render-only');
});
