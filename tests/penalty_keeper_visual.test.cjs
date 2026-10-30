'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/modules/artpose.js','utf8').replace(/export \{ARTPOSE\};?\s*$/,'');
const ARTPOSE=vm.runInNewContext(source+'\nARTPOSE',{});
const pose=(b,c,y=720)=>ARTPOSE.penaltyKeeperVisual({diveBoost:b,diveCooldown:c,saveY:y},720);
test('human penalty JUMP has bounded directional dive animation',()=>{
 assert.equal(pose(.38,.8,760).action,'keeperDive');assert.equal(pose(.38,.8).diveElapsed,0);
 assert(Math.abs(pose(.19,.61).diveElapsed-.3)<1e-8);
 assert.equal(pose(.19,.61,680).diveDy,-1);assert.equal(pose(.19,.61,760).diveDy,1);
});
test('recovery settles and malformed state never triggers fake dive',()=>{
 assert.equal(pose(0,.42).action,'keeperRecover');assert(Math.abs(pose(0,.42).actionTimer-.34)<1e-8);
 assert.equal(pose(0,.25).action,'keeperRecover');assert.equal(pose(0,.08).action,'idle');
 for(const pk of [{},{diveBoost:NaN,diveCooldown:Infinity,saveY:NaN},{diveBoost:-1,diveCooldown:-1}]){
  const v=ARTPOSE.penaltyKeeperVisual(pk,720);assert.equal(v.action,'idle');
  assert(Object.values(v).every(x=>typeof x!=='number'||Number.isFinite(x)));
 }
});
test('real penalty renderer animates the defending side without mutating shootout state',()=>{
 const render=fs.readFileSync('src/modules/render.js','utf8');
 const found=render.match(/ drawPenaltyPlayers\(ctx,g\)\{[\s\S]*?\n \}\n drawBall\(/);
 assert.ok(found,'real renderer method present');
 const method=found[0].slice(1,found[0].lastIndexOf('\n drawBall('));
 const renderer=vm.runInNewContext('({'+method+'})',{WORLD:{goalTop:530,goalBottom:910},F:{x:100,w:2200},ARTPOSE,PI:Math.PI,ellipse(){}});
 const draws=[];renderer.drawPlayer=(_ctx,p)=>draws.push(p);renderer.drawSoccerBall=()=>{};renderer.time=1;
 for(const turn of [0,1]){
  draws.length=0;
  const g={pk:{turn,shotTimer:.2,shotMax:.8,ballX:1600,ballY:720,startX:1600,startY:720,shotTargetY:760,aim:720,saveY:680,diveBoost:.19,diveCooldown:.61},options:{},player(t,i){return {t,i,src:{id:t+':'+i}}}};
  const before=JSON.stringify(g.pk);
  renderer.drawPenaltyPlayers({beginPath(){},arc(){},stroke(){}},g);
  assert.equal(JSON.stringify(g.pk),before);
  assert.equal(draws[0].t,turn);assert.equal(draws[1].t,1-turn);
  assert.equal(draws[1].action,'keeperDive');assert.equal(draws[1].diveDy,-1);
  assert.equal(draws[1].dx,0);assert.equal(draws[1].dy,0);assert.equal(draws[1].visualFacing.kind,'side');
 }
});
