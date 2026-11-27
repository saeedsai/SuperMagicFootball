'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

let ENGINE;
test.before(async()=>{
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 ({ENGINE}=await import('../src/modules/engine.js'));
});

function runFeint(team,inputY,byAI=false){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:byAI?0:1});
 const player=game.player(team,3),rival=game.player(1-team,3);
 for(const q of game.players)if(q!==player&&q!==rival){q.down=true;q.stun=1;}
 player.src={...player.src,dribbleType:'rainbow',dribbling:96,agility:96};
 Object.assign(player,{x:1000,y:700,z:0,face:team===0?1:-1,dx:0,dy:inputY,
  down:false,stun:0,cd:0,trickCd:0,dribbleCooldown:0,fatigue:0,breath:100});
 Object.assign(rival,{x:1000,y:780,z:0,down:false,stun:0,invuln:0,cd:0,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0});
 game.ball.owner=player;game.ball.x=player.x;game.ball.y=player.y;game.ball.z=0;
 const originalRandom=Math.random;Math.random=()=>0;
 let performed=false;
 try{performed=game.tryDribbleTrick(player,byAI);}finally{Math.random=originalRandom;}
 return {performed,dx:player.x-1000,dy:player.y-700,
  trick:game.events.filter(e=>e.type==='dribbleTrick').at(-1)?.style};
}

test('human vertical stick direction chooses the Dribble feint exit for both teams',()=>{
 for(const team of [0,1]){
  const down=runFeint(team,1),up=runFeint(team,-1),neutral=runFeint(team,0);
  assert.equal(down.performed,true);assert.equal(up.performed,true);assert.equal(neutral.performed,true);
  assert.equal(down.trick,'rainbow');assert.equal(up.trick,'rainbow');
  assert.ok(down.dy>0,JSON.stringify({team,down}));
  assert.ok(up.dy<0,JSON.stringify({team,up}));
  assert.ok(neutral.dy<0,JSON.stringify({team,neutral}));
 }
});

test('CPU Dribble feints retain the defender-aware automatic exit despite vertical input',()=>{
 for(const team of [0,1]){
  const cpu=runFeint(team,1,true);
  assert.equal(cpu.performed,true);
  assert.ok(cpu.dy<0,JSON.stringify({team,cpu}));
 }
});
