'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const ui=fs.readFileSync('src/modules/ui.js','utf8');
const html=fs.readFileSync('index.html','utf8');
test('kickoff countdown freezes simulation for three actual seconds of update ticks',()=>{
 const start=engine.indexOf('update(dt){');
 const end=engine.indexOf('this.input.poll(',start);
 assert(start>=0&&end>start);
 const head=engine.slice(start,end);
 const tick=vm.runInNewContext('('+head.replace(/^update\(dt\)\{/,'function(dt){')+'})');
 for(const fps of [30,60,120]){
  const g={matchState:'play',kickoffCountdown:3,clock:0,score:[0,0],half:1};
  for(let i=0;i<3*fps+2;i++)tick.call(g,1/fps);
  assert.equal(g.kickoffCountdown,0,'countdown reaches zero at '+fps+' FPS');
  assert.equal(g.clock,0,'countdown must not advance clock');
  assert.equal(g.matchState,'play','countdown must not end the active half');
 }
});
test('initialization and second-half transition enable countdown only for UI-started games',()=>{
 assert.match(engine,/this\.kickoffCountdown=options\.showKickoffCountdown===true\?3:0/);
 assert.match(engine,/this\.resetKickoff\(1\);this\.kickoffCountdown=this\.options\?\.showKickoffCountdown===true\?3:0;this\.matchState='paused'/);
 assert.match(ui,/arcadeShotPlayerId,showKickoffCountdown:true/);
 assert.match(html,/id="matchCountdown"/);
 assert.match(ui,/MATCH STARTS IN/);
 assert.match(ui,/SECOND HALF STARTS IN/);
});
test('continuous play handles endline misses without a restart or foul',()=>{
 const ball=engine.slice(engine.indexOf(' // Scoring: ball must cross'),engine.indexOf(' if(b.canCollect>0)return;',engine.indexOf(' // Scoring: ball must cross')));
 const slide=engine.slice(engine.indexOf(' slideContact(p){'),engine.indexOf(' tackle(p,slide=false){'));
 assert.match(ball,/if\(b\.y>WORLD\.goalTop&&b\.y<WORLD\.goalBottom&&b\.z<125\)\{scoring\(/);
 assert.match(ball,/b\.vx\*=-\.72/);
 assert.doesNotMatch(ball,/handleEndlineRestart\(\)/);
 assert.doesNotMatch(slide,/this\.emit\('foul'|startFreeKick|startPK/);
 for(const name of ['GOAL KICK','FREE KICK','CORNER KICK'])assert.doesNotMatch(engine,new RegExp("message:'"+name+"'"));
 assert.equal((html.match(/data-act="(pass|shoot|dribble|jump)"/g)||[]).length,4);
});
