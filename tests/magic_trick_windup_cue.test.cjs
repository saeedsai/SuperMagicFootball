'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const render=fs.readFileSync('src/modules/render.js','utf8');
const start=render.indexOf('function drawMagicTrickWindupCue(');
const end=render.indexOf('\nfunction drawUndergroundShotTell',start);
assert.ok(start>=0&&end>start,'wind-up cue helper exists');
let tier='Gold';
const drawCue=vm.runInNewContext('('+render.slice(start,end)+')',{
 STATS:{verifiedRatingTierForPlayer:()=>tier},Math
});
function player(id='fireball'){
 return {t:0,x:100,y:100,z:0,breath:1,stun:0,down:false,keeper:false,preview:false,
  dribbleHold:.62,magicReadyAt:0,magicHoldLatched:false,lightningPending:null,
  src:{id:'carrier',magicTrick:id}};
}
function gameFor(p){
 return {clock:10,ball:{owner:p},players:[p],rideBall:null,
  input:{state:{[p.t]:{dribble:true,jump:false,shoot:false,pass:false}}}};
}
function context(){
 const stack=[],calls=[];
 return {calls,globalAlpha:1,save(){stack.push(this.globalAlpha);},
  restore(){this.globalAlpha=stack.pop()??1;},beginPath(){},ellipse(){calls.push(['ellipse']);},
  arc(...args){calls.push(['arc',...args]);},stroke(){},translate(){},scale(){},
  strokeText(text){calls.push(['strokeText',text,this.globalAlpha]);},
  fillText(text){calls.push(['fillText',text,this.globalAlpha]);}};
}
test('eligible held Magic Trick shows a steady progress cue from 0.62 seconds until the one-second trigger',()=>{
 const p=player(),g=gameFor(p);
 for(const hold of [.62,.80,.99]){
  p.dribbleHold=hold;const ctx=context();
  assert.equal(drawCue(ctx,p,g,false,1),true,'hold='+hold);
  assert.ok(ctx.calls.some(c=>c[0]==='strokeText'&&c[1]==='TRICK!'));
  assert.ok(ctx.calls.some(c=>c[0]==='ellipse'));
  const arc=ctx.calls.find(c=>c[0]==='arc');
  assert.ok(arc&&arc[5]>=-Math.PI/2,'progress arc follows held charge');
 }
 p.dribbleHold=1;
 assert.equal(drawCue(context(),p,g,false,1),false,'the cue ends when the engine trigger becomes eligible');
});
test('wind-up cue is hidden whenever the real trigger cannot proceed',()=>{
 const cases=[
  ['no possession',(p,g)=>{g.ball.owner=null;}],
  ['cooldown',(p)=>{p.magicReadyAt=11;}],
  ['insufficient Breath',(p)=>{p.breath=.79;}],
  ['released Dribble',(p,g)=>{g.input.state[0].dribble=false;}],
  ['Jump conflict',(p,g)=>{g.input.state[0].jump=true;}],
  ['Shoot conflict',(p,g)=>{g.input.state[0].shoot=true;}],
  ['Pass conflict',(p,g)=>{g.input.state[0].pass=true;}],
  ['already latched',(p)=>{p.magicHoldLatched=true;}],
  ['stunned',(p)=>{p.stun=.1;}],
  ['down',(p)=>{p.down=true;}],
  ['keeper',(p)=>{p.keeper=true;}],
  ['preview',(p)=>{p.preview=true;}],
  ['unknown trick',(p)=>{p.src.magicTrick='not-a-trick';}],
  ['Lightning already pending',(p)=>{p.src.magicTrick='lightning';p.lightningPending={remaining:.2};}],
  ['invalid clock',(p,g)=>{g.clock=NaN;}]
 ];
 for(const [name,setup] of cases){
  const p=player(),g=gameFor(p);setup(p,g);
  assert.equal(drawCue(context(),p,g,false,1),false,name);
 }
});
test('tier-gated tricks and Shoulder Ride only telegraph when their real prerequisites are met',()=>{
 const gated=player('spinBump'),g=gameFor(gated);tier='Bronze';
 assert.equal(drawCue(context(),gated,g,false,1),false,'ineligible tier');
 tier='Gold';assert.equal(drawCue(context(),gated,g,false,1),true,'eligible tier');
 const ride=player('shoulderRide'),rideGame=gameFor(ride);
 assert.equal(drawCue(context(),ride,rideGame,false,1),false,'no nearby partner');
 rideGame.players.push({t:0,x:150,y:100,z:0,stun:0,keeper:false,down:false,rideBallState:null});
 assert.equal(drawCue(context(),ride,rideGame,false,1),true,'valid nearby partner');
 rideGame.rideBall={};assert.equal(drawCue(context(),ride,rideGame,false,1),false,'already riding');
 tier='Gold';
});
test('reduced-flash keeps a steady dim cue and the production renderer draws it in world space',()=>{
 const p=player(),g=gameFor(p),ctx=context();
 assert.equal(drawCue(ctx,p,g,true,1),true);
 const label=ctx.calls.find(c=>c[0]==='strokeText'&&c[1]==='TRICK!');
 assert.equal(label[2],.68);
 const helper=render.slice(render.indexOf('function drawMagicTrickWindupCue('),render.indexOf('\nfunction drawUndergroundShotTell'));
 assert.doesNotMatch(helper,/Math\.sin|Math\.cos|requestAnimationFrame/);
 const drawStart=render.indexOf(' drawPlayer(ctx,p,game){');
 const drawEnd=render.indexOf(' drawPenaltyPlayers(ctx,g){',drawStart);
 assert.ok(drawStart>=0&&drawEnd>drawStart,'player renderer method exists');
 const playerDraw=render.slice(drawStart,drawEnd);
 const world=playerDraw.indexOf('ctx.translate(p.x,p.y-');
 const call=playerDraw.indexOf('drawMagicTrickWindupCue(ctx,p,game');
 assert.ok(world>=0&&call>world,'wind-up cue is painted after restoring character-local transforms');
});
