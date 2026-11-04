'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const engine=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const drive=engine.slice(engine.indexOf(' driveAI(p,dt){'),engine.indexOf('\n resolveMagicWallBall(',engine.indexOf(' driveAI(p,dt){')));
assert.ok(drive.length>0,'live AI driver is present');

test('Hide Ball gives opposing CPU only the saved last-known position',()=>{
 assert.match(engine,/hideBallLastKnown=\{x:p\.x,y:p\.y\}/,'Hide Ball records the carrier position once on activation');
 assert.match(drive,/const concealed=!!\(liveOwner&&liveOwner\.t!==t&&\(liveOwner\.hideBallTimer\|\|0\)>0\)/);
 assert.match(drive,/const b=concealed\?\{\.\.\.liveBall,owner:null,x:known\?\.x\?\?liveOwner\.x,y:known\?\.y\?\?liveOwner\.y,z:0,vx:0,vy:0,vz:0\}:liveBall/);
 assert.match(drive,/defensivePressers\(this\.players,t,owner\|\|b/,'pressing decisions also use the masked observation');
 assert.match(drive,/if\(!concealed&&this\.driveAiCombo\(p,dt,ai\)\)return/,'CPU combos do not read the hidden carrier');
});

test('same-team AI still sees its carrier and expiry or possession loss clears the observation',()=>{
 assert.match(engine,/if\(lost\|\|next===0\)\{p\.hideBallLastKnown=null;p\.hideBallReveal=/);
 assert.match(engine,/const concealed=!!\(liveOwner&&liveOwner\.t!==t/,'concealment applies to opponents only');
 assert.match(engine,/p\.hideBallTimer=\.65/,'the existing short conceal window remains bounded');
});
