'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const mechanics=JSON.parse(fs.readFileSync('data/mechanics/gameplay.json','utf8'));
const source=fs.readFileSync('src/modules/engine.js','utf8').replace(/\r\n/g,'\n');
const renderSource=fs.readFileSync('src/modules/render.js','utf8').replace(/\r\n/g,'\n');
const WORLD=mechanics.world,F=WORLD.field;
const begin=source.indexOf(' startPK(afterDraw=false'),end=source.indexOf('\n reactToMagicWall(',begin);
assert.ok(begin>=0&&end>begin,'extract penalty lifecycle');
const body=source.slice(begin,end).replace('\n updatePK(dt){',',\n updatePK(dt){');
const methods=vm.runInNewContext('({'+body+'})',{
 WORLD,F,clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),randomBetween:(a,b)=>(a+b)/2,
 aiTuning:()=>({id:2,keeperRead:.5}),stat:()=>75
});
function game(){
 const players=[0,1].flatMap(t=>Array.from({length:6},(_,i)=>({t,i,keeper:i===0,src:{id:`${t}-${i}`,name:`P${t}-${i}`,shootAccuracy:80}})));
 const g={matchState:'play',humans:1,score:[0,0],players,ball:{owner:null,x:0,y:0,z:0,vx:0,vy:0,vz:0},
  rosters:[players.filter(p=>p.t===0).map(p=>p.src),players.filter(p=>p.t===1).map(p=>p.src)],teamPlans:[{penalty:3},{penalty:4}],
  input:{poll(){},state:[{},{}],just:()=>false},inControl:()=>false,player(t,i){return players.find(p=>p.t===t&&p.i===i)},
  take(p){this.ball.owner=p},_closeShotAudits(){},cancelPendingAbilityActions(){},onGoalMorale(){},getTeam:t=>({name:`Team ${t}`}),burst(){},emit(){},...methods};
 return g;
}

test('in-match penalties start on each fouled side attacking goal while shootouts retain their legacy end',()=>{
 for(const team of [0,1]){
  const g=game();g.startPK(false,team);
  const sign=team===0?1:-1,goal=team===0?F.x+F.w:F.x,spot=team===0?F.x+F.w*.76:F.x+F.w*.24;
  assert.equal(g.pk.attackSign,sign);assert.equal(g.pk.goalX,goal);assert.equal(g.pk.spotX,spot);
  assert.equal(g.pk.ballX,spot);assert.equal(g.pk.turn,team);
  g.pk.ready=0;g.pk.timer=8;g.updatePK(.04);assert.equal(Math.sign(g.pk.ballX-spot),sign,'CPU taker advances toward the goal');
  g.pk.startX=spot;g.pk.ballX=spot;g.pk.shotTimer=.4;g.pk.shotMax=.8;g.updatePK(.04);
  assert.equal(Math.sign(g.pk.ballX-spot),sign,'shot travels toward the goal');
 }
 const g=game();g.startPK(false);
 assert.equal(g.pk.attackSign,1);assert.equal(g.pk.spotX,F.x+F.w*.76);assert.equal(g.pk.goalX,F.x+F.w);
});

test('penalty renderer mirrors kicker, goalkeeper, and aim marker with the match side',()=>{
 const renderBegin=renderSource.indexOf(' drawPenaltyPlayers(ctx,g){'),renderEnd=renderSource.indexOf('\n drawHideBallCue(',renderBegin);
 assert.ok(renderBegin>=0&&renderEnd>renderBegin,'extract penalty renderer');
 const markerCapture={};
 const draw=vm.runInNewContext('({'+renderSource.slice(renderBegin,renderEnd)+'})',{
  F,WORLD,PI:Math.PI,ARTPOSE:{penaltyKeeperVisual:()=>({})},ellipse(_ctx,x){markerCapture.x=x;}
 }).drawPenaltyPlayers;
 for(const team of [0,1]){
  const sign=team===0?1:-1,goal=team===0?F.x+F.w:F.x,spot=team===0?F.x+F.w*.76:F.x+F.w*.24,drawn=[],renderer={time:0,
   drawPlayer(_ctx,p){drawn.push(p)},drawSoccerBall(_ctx,x,y){this.ball={x,y}}};
  const g={pk:{inMatchTeam:team,turn:team,attackSign:sign,goalX:goal,spotX:spot,ballX:spot,ballY:(WORLD.goalTop+WORLD.goalBottom)/2,saveY:(WORLD.goalTop+WORLD.goalBottom)/2,aim:(WORLD.goalTop+WORLD.goalBottom)/2,shotTimer:0},
   teamPlans:[{penalty:3},{penalty:4}],player(t,i){return{t,i,x:0,y:0,src:{id:`${t}-${i}`}}},options:{}};
  const ctx={beginPath(){},arc(){},stroke(){},set strokeStyle(_v){},set lineWidth(_v){}};
  draw.call(renderer,ctx,g);
  assert.equal(drawn.length,2);assert.equal(drawn[0].face,sign);assert.equal(drawn[0].x,spot-sign*72);
  assert.equal(drawn[1].x,goal-sign*30);assert.equal(drawn[1].face,-sign);
  assert.equal(renderer.ball.x,spot);assert.equal(markerCapture.x,goal-sign*12);
 }
});
