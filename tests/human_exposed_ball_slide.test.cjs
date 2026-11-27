'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

let ENGINE;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 ({ENGINE}=await import('../src/modules/engine.js'));
});

function runHumanSlide(team,action,exposed){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:1});
 game.weather='Clear';
 const dir=team===0?1:-1,x=1000,y=700;
 const defender=game.player(team,3),carrier=game.player(1-team,3);
 for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
 Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
 Object.assign(carrier,{x:x+dir*52,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0});
 const ballX=carrier.x+(exposed?-dir*17:dir*17),ballY=y+12;
 Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
  pass:false,shot:null,strike:null,ordinaryShot:false});
 game.slideContact=()=>{};
 game.command(defender,action);
 const targetX=exposed?ballX:carrier.x,targetY=exposed?ballY:carrier.y;
 const length=Math.hypot(targetX-x,targetY-y);
 return {actionState:defender.action,dx:defender.slideDX,dy:defender.slideDY,
  expectedX:(targetX-x)/length,expectedY:(targetY-y)/length};
}

test('human Pass and Shoot defensive slides contest an exposed live ball but retain body aim against shielding',()=>{
 for(const team of [0,1])for(const action of ['pass','shoot'])for(const exposed of [true,false]){
  const result=runHumanSlide(team,action,exposed);
  assert.equal(result.actionState,'slide',JSON.stringify({team,action,exposed,result}));
  assert.ok(Math.abs(result.dx-result.expectedX)<1e-9,JSON.stringify({team,action,exposed,result}));
  assert.ok(Math.abs(result.dy-result.expectedY)<1e-9,JSON.stringify({team,action,exposed,result}));
 }
});


function runHumanBallArcSlide(team,action,exposed){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:1});
 game.weather='Clear';
 const dir=team===0?1:-1,x=1000,y=700;
 const defender=game.player(team,3),carrier=game.player(1-team,3);
 for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
 Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
 Object.assign(carrier,{x:x+dir*30,y:y+120,z:0,down:false,stun:0,invuln:0,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 const ballX=carrier.x,ballY=carrier.y+(exposed?-10:10);
 Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
  pass:false,shot:null,strike:null,ordinaryShot:false});
 game.slideContact=()=>{};
 game.command(defender,action);
 const expectedX=exposed?ballX-x:dir,expectedY=exposed?ballY-y:0;
 const length=Math.hypot(expectedX,expectedY);
 const bodyDot=(dir*(carrier.x-x))/Math.hypot(carrier.x-x,carrier.y-y);
 const ballDot=(dir*(ballX-x))/Math.hypot(ballX-x,ballY-y);
 return {actionState:defender.action,dx:defender.slideDX,dy:defender.slideDY,
  expectedX:expectedX/length,expectedY:expectedY/length,bodyDot,ballDot};
}

test('Pass and Shoot slides can select an exposed ball inside the forward arc before the carrier body enters it',()=>{
 for(const team of [0,1])for(const action of ['pass','shoot']){
  const exposed=runHumanBallArcSlide(team,action,true);
  assert.ok(exposed.bodyDot<.25&&exposed.ballDot>.25,JSON.stringify({team,action,exposed}));
  assert.equal(exposed.actionState,'slide',JSON.stringify({team,action,exposed}));
  assert.ok(Math.abs(exposed.dx-exposed.expectedX)<1e-9,JSON.stringify({team,action,exposed}));
  assert.ok(Math.abs(exposed.dy-exposed.expectedY)<1e-9,JSON.stringify({team,action,exposed}));
  const shielded=runHumanBallArcSlide(team,action,false);
  assert.ok(shielded.bodyDot<.25&&shielded.ballDot<.25,JSON.stringify({team,action,shielded}));
  assert.equal(shielded.actionState,'slide',JSON.stringify({team,action,shielded}));
  assert.ok(Math.abs(shielded.dx-(team===0?1:-1))<1e-9,JSON.stringify({team,action,shielded}));
  assert.ok(Math.abs(shielded.dy)<1e-9,JSON.stringify({team,action,shielded}));
 }
});


function runHumanPokeBallArc(team,exposed,passLiveBall=true){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 game.weather='Clear';
 const dir=team===0?1:-1,x=1000,y=700;
 const defender=game.player(team,3),carrier=game.player(1-team,3);
 for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
 Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
 Object.assign(carrier,{x:x+dir*15,y:y+62,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0});
 const ballX=exposed?carrier.x+dir*2:carrier.x+dir*12;
 const ballY=exposed?carrier.y-12:carrier.y;
 Object.assign(game.ball,{owner:carrier,x:ballX,y:ballY,z:12,vx:0,vy:0,vz:0,
  pass:false,shot:null,strike:null,ordinaryShot:false});
 const sideRead=game.defensivePokeBallSideRead(defender,carrier,game.ball);
 const expectedX=ballX-x,expectedY=ballY-y,length=Math.hypot(expectedX,expectedY);
 const bodyDot=dir*(carrier.x-x)/Math.hypot(carrier.x-x,carrier.y-y);
 const ballDot=dir*(ballX-x)/Math.hypot(ballX-x,ballY-y);
 const originalRandom=Math.random;Math.random=()=>0;
 try{game.tackle(defender,false,passLiveBall?game.ball:null);}finally{Math.random=originalRandom;}
 return {released:game.ball.owner===null,vx:game.ball.vx,vy:game.ball.vy,
  expectedVx:expectedX/length*150,expectedVy:expectedY/length*150,
  dx:defender.dx,dy:defender.dy,sideRead,bodyDot,ballDot};
}

test('short PASS pokes can read an exposed ball entering the forward arc before the carrier body',()=>{
 for(const team of [0,1]){
  const exposed=runHumanPokeBallArc(team,true,true);
  assert.ok(exposed.bodyDot<.25&&exposed.ballDot>.25,JSON.stringify({team,exposed}));
  assert.ok(exposed.sideRead&&exposed.released,JSON.stringify({team,exposed}));
  assert.ok(Math.abs(exposed.vx-exposed.expectedVx)<1e-9,JSON.stringify({team,exposed}));
  assert.ok(Math.abs(exposed.vy-exposed.expectedVy)<1e-9,JSON.stringify({team,exposed}));
  const shielded=runHumanPokeBallArc(team,false,true);
  assert.ok(!shielded.sideRead&&!shielded.released,JSON.stringify({team,shielded}));
  assert.ok(Math.abs(shielded.dx-(team===0?1:-1))<1e-9&&Math.abs(shielded.dy)<1e-9,JSON.stringify({team,shielded}));
  const missingBall=runHumanPokeBallArc(team,true,false);
  assert.ok(missingBall.sideRead&&!missingBall.released,JSON.stringify({team,missingBall}));
  assert.ok(Math.abs(missingBall.dx-(team===0?1:-1))<1e-9&&Math.abs(missingBall.dy)<1e-9,JSON.stringify({team,missingBall}));
 }
});

test('held PASS release and close chase short pokes forward the current live ball',()=>{
 const source=fs.readFileSync('src/modules/engine.js','utf8');
 assert.match(source,/else this\.tackle\(p,false,this\.ball\)/);
 assert.match(source,/this\.tackle\(p,false,this\.ball\);p\.chase=0/);
});


function runHumanBallFirstPoke(team,profile){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 game.weather='Clear';
 const dir=team===0?1:-1,x=1000,y=700;
 const defender=game.player(team,3),carrier=game.player(1-team,3);
 for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
 const carrierY=y+(profile==='outside'?84:82);
 const ballY=carrierY+(profile==='shielded'?36:-36);
 Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,dx:dir,dy:0,face:dir});
 Object.assign(carrier,{x:x+dir*15,y:carrierY,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 const before={x:carrier.x,y:carrier.y};
 Object.assign(game.ball,{owner:carrier,x:carrier.x,y:ballY,z:12,vx:0,vy:0,vz:0,pass:true,passTeam:carrier.t,passTarget:carrier.src.id,shot:null,strike:null,ordinaryShot:false});
 const sideRead=game.defensivePokeBallSideRead(defender,carrier,game.ball);
 const expectedX=game.ball.x-x,expectedY=game.ball.y-y,length=Math.hypot(expectedX,expectedY);
 const expectedVx=expectedX/length*150,expectedVy=expectedY/length*150;
 const originalRandom=Math.random;Math.random=()=>0;
 try{game.tackle(defender,false,game.ball);}finally{Math.random=originalRandom;}
 return {profile,sideRead,released:game.ball.owner===null,ownerRetained:game.ball.owner===carrier,
  bodyAfter:Math.hypot(defender.x-carrier.x,defender.y-carrier.y),ballAfter:Math.hypot(defender.x-game.ball.x,defender.y-game.ball.y),
  carrierStun:carrier.stun,carrierX:carrier.x,carrierY:carrier.y,beforeCarrierX:before.x,beforeCarrierY:before.y,
  ballZ:game.ball.z,ballVz:game.ball.vz,canCollect:game.ball.canCollect,pass:game.ball.pass,passTeam:game.ball.passTeam,passTarget:game.ball.passTarget,
  vx:game.ball.vx,vy:game.ball.vy,expectedVx,expectedVy,defenderAction:defender.action};
}
test('an exposed low ball can be poked cleanly when the carrier body remains outside tackle contact',()=>{
 for(const team of [0,1]){
  const inside=runHumanBallFirstPoke(team,'inside');
  assert.ok(inside.sideRead&&inside.bodyAfter>62&&inside.ballAfter<=34,JSON.stringify({team,inside}));
  assert.ok(inside.released&&!inside.ownerRetained,JSON.stringify({team,inside}));
  assert.equal(inside.carrierStun,0,JSON.stringify({team,inside}));
  assert.equal(inside.carrierX,inside.beforeCarrierX,JSON.stringify({team,inside}));
  assert.equal(inside.carrierY,inside.beforeCarrierY,JSON.stringify({team,inside}));
  assert.equal(inside.ballZ,12,JSON.stringify({team,inside}));
  assert.equal(inside.ballVz,0,JSON.stringify({team,inside}));
  assert.equal(inside.canCollect,.15,JSON.stringify({team,inside}));
  assert.equal(inside.pass,false,JSON.stringify({team,inside}));
  assert.equal(inside.passTeam,null,JSON.stringify({team,inside}));
  assert.equal(inside.passTarget,null,JSON.stringify({team,inside}));
  assert.equal(inside.defenderAction,'punch',JSON.stringify({team,inside}));
  assert.ok(Math.abs(inside.vx-inside.expectedVx)<1e-9&&Math.abs(inside.vy-inside.expectedVy)<1e-9,JSON.stringify({team,inside}));
  const outside=runHumanBallFirstPoke(team,'outside');
  assert.ok(outside.sideRead&&outside.bodyAfter>62&&outside.ballAfter>34,JSON.stringify({team,outside}));
  assert.ok(!outside.released&&outside.ownerRetained&&outside.carrierStun===0,JSON.stringify({team,outside}));
  const shielded=runHumanBallFirstPoke(team,'shielded');
  assert.ok(!shielded.sideRead&&!shielded.released&&shielded.ownerRetained,JSON.stringify({team,shielded}));
  assert.equal(shielded.carrierStun,0,JSON.stringify({team,shielded}));
 }
});


function runHumanSlideBallContact(team,action,profile){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:1});
 game.matchState='paused';game.weather='Clear';game.events=[];
 const dir=team===0?1:-1,x=1000,y=700;
 const defender=game.player(team,3),carrier=game.player(1-team,3);
 for(const q of game.players)if(q!==defender&&q!==carrier){q.down=true;q.stun=1;}
 const bodyGap=profile==='body'?60:86;
 const ballOffset=profile==='shielded'?dir*36:profile==='body'?-dir*20:-dir*36;
 Object.assign(defender,{x,y,z:0,down:false,stun:0,invuln:0,cd:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,dx:dir,dy:0,face:dir,sprintCharge:0,dashTimer:0});
 Object.assign(carrier,{x:x+dir*bodyGap,y,z:0,down:false,stun:0,invuln:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0});
 const ballX=carrier.x+ballOffset;
 Object.assign(game.ball,{owner:carrier,x:ballX,y,z:12,vx:0,vy:0,vz:0,
  pass:true,passTeam:carrier.t,passTarget:carrier.src.id,shot:null,strike:null,ordinaryShot:false});
 const before={x:carrier.x,y:carrier.y};
 const originalRandom=Math.random;Math.random=()=>0;
 let started=false,contact=false;
 try{
  if(profile==='missing')game.tackle(defender,true,null);
  else game.command(defender,action);
  started=defender.action==='slide';
  if(profile==='inside'){defender.x+=dir*20;contact=game.slideContact(defender);}
  else if(profile==='outside'){defender.x+=dir*15;contact=game.slideContact(defender);}
  else if(profile==='shielded'||profile==='missing'){defender.x+=dir*20;contact=game.slideContact(defender);}
  else if(profile==='body')contact=game.events.some(e=>e.type==='tackleHit');
 }finally{Math.random=originalRandom;}
 return {started,contact,ownerRetained:game.ball.owner===carrier,carrierStun:carrier.stun,
  carrierAction:carrier.action,carrierX:carrier.x,carrierY:carrier.y,beforeX:before.x,beforeY:before.y,
  ballOwner:game.ball.owner,ballZ:game.ball.z,ballVz:game.ball.vz,canCollect:game.ball.canCollect,
  pass:game.ball.pass,passTeam:game.ball.passTeam,passTarget:game.ball.passTarget,
  slideTimer:defender.slideTimer,slideRemaining:defender.slideRemaining,
  ballTouches:game.events.filter(e=>e.type==='tackleBallTouch').length,
  bodyHits:game.events.filter(e=>e.type==='tackleHit').length};
}

test('human Pass/Shoot slides can nick a validated exposed ball without body-checking the carrier',()=>{
 for(const team of [0,1])for(const action of ['pass','shoot']){
  const inside=runHumanSlideBallContact(team,action,'inside');
  assert.ok(inside.started&&inside.contact,JSON.stringify({team,action,inside}));
  assert.equal(inside.ownerRetained,false,JSON.stringify({team,action,inside}));
  assert.equal(inside.carrierStun,0,JSON.stringify({team,action,inside}));
  assert.equal(inside.carrierX,inside.beforeX,JSON.stringify({team,action,inside}));
  assert.equal(inside.carrierY,inside.beforeY,JSON.stringify({team,action,inside}));
  assert.equal(inside.ballZ,12,JSON.stringify({team,action,inside}));
  assert.equal(inside.ballVz,0,JSON.stringify({team,action,inside}));
  assert.equal(inside.canCollect,.15,JSON.stringify({team,action,inside}));
  assert.equal(inside.pass,false,JSON.stringify({team,action,inside}));
  assert.equal(inside.passTeam,null,JSON.stringify({team,action,inside}));
  assert.equal(inside.passTarget,null,JSON.stringify({team,action,inside}));
  assert.equal(inside.ballTouches,1,JSON.stringify({team,action,inside}));
  assert.equal(inside.bodyHits,0,JSON.stringify({team,action,inside}));
  assert.equal(inside.slideTimer,0,JSON.stringify({team,action,inside}));
  assert.equal(inside.slideRemaining,0,JSON.stringify({team,action,inside}));
  for(const profile of ['outside','shielded','missing']){
   const miss=runHumanSlideBallContact(team,action,profile);
   assert.ok(miss.started&&!miss.contact&&miss.ownerRetained,JSON.stringify({team,action,profile,miss}));
   assert.equal(miss.carrierStun,0,JSON.stringify({team,action,profile,miss}));
   assert.equal(miss.ballTouches,0,JSON.stringify({team,action,profile,miss}));
   assert.ok(miss.slideTimer>0,JSON.stringify({team,action,profile,miss}));
  }
  const body=runHumanSlideBallContact(team,action,'body');
  assert.ok(body.started&&body.bodyHits===1,JSON.stringify({team,action,body}));
  assert.ok(body.carrierStun>0&&body.carrierAction==='hurt',JSON.stringify({team,action,body}));
  assert.equal(body.ballTouches,0,JSON.stringify({team,action,body}));
 }
});
