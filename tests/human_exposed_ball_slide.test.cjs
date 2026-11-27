'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

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
