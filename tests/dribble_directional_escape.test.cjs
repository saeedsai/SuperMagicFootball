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
  const cpu=runFeint(team,1,true),face=team===0?1:-1;
  const lateralProjection=cpu.dx*(-Math.SQRT1_2)+cpu.dy*(face*Math.SQRT1_2);
  assert.equal(cpu.performed,true);
  assert.ok(lateralProjection*(team===0?-1:1)>0,JSON.stringify({team,cpu,lateralProjection}));
 }
});


function runSecondMarkerFeint(team,mode){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:1});
 const player=game.player(team,3),rival=game.player(1-team,3),second=game.player(1-team,4);
 for(const q of game.players)if(q!==player&&q!==rival&&q!==second){q.down=true;q.stun=1;}
 const face=team===0?1:-1;
 player.src={...player.src,dribbleType:'rainbow',dribbling:96,agility:96};
 Object.assign(player,{x:1000,y:700,z:0,face,dx:0,dy:1,down:false,stun:0,cd:0,
  trickCd:0,dribbleCooldown:0,fatigue:0,breath:100});
 rival.src={...rival.src,defence:50,aggression:50};
 Object.assign(rival,{x:1000,y:735,z:0,down:false,stun:0,invuln:0,cd:0,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0,vx:0,vy:0});
 Object.assign(second,{x:1000+face*40,y:700,z:0,down:mode==='downed',stun:0,invuln:0,cd:0,
  action:mode==='recovering'?'hurt':'idle',actionTimer:mode==='recovering'?.2:0,
  moveVX:0,moveVY:mode==='closing'||mode==='downed'?240:mode==='retreating'?-240:0,vx:0,vy:0});
 game.ball.owner=player;game.ball.x=player.x;game.ball.y=player.y;game.ball.z=0;
 const originalRandom=Math.random;Math.random=()=>.84;
 let performed=false;
 try{performed=game.tryDribbleTrick(player,false);}finally{Math.random=originalRandom;}
 return {performed,dy:player.y-700,guard:player.trickGuard,owner:game.ball.owner===player,
  event:game.events.filter(e=>e.type==='dribbleTrick').at(-1)?.success};
}

test('HUMAN-DRIBBLE-SECOND-MARKER-READ-01: a closing second defender can counter the requested feint lane',()=>{
 for(const team of [0,1]){
  const closing=runSecondMarkerFeint(team,'closing');
  const retreating=runSecondMarkerFeint(team,'retreating');
  const stationary=runSecondMarkerFeint(team,'stationary');
  const downed=runSecondMarkerFeint(team,'downed');
  const recovering=runSecondMarkerFeint(team,'recovering');
  assert.equal(closing.performed,true);
  assert.equal(closing.event,false,JSON.stringify({team,closing}));
  assert.equal(closing.guard,0);
  assert.equal(retreating.event,true,JSON.stringify({team,retreating}));
  assert.ok(retreating.guard>0);
  assert.ok(closing.dy>0&&closing.dy<retreating.dy*.3,JSON.stringify({team,closing,retreating}));
  for(const [mode,result] of [['stationary',stationary],['downed',downed],['recovering',recovering]]){
   assert.equal(result.event,true,JSON.stringify({team,mode,result}));
   assert.ok(result.guard>0,JSON.stringify({team,mode,result}));
  }
 }
});


function runPrimaryMarkerFeint(team,mode,byAI=false){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:byAI?0:1});
 const player=game.player(team,3),rival=game.player(1-team,3),face=team===0?1:-1;
 for(const q of game.players)if(q!==player&&q!==rival){q.down=true;q.stun=1;}
 player.src={...player.src,dribbleType:'rainbow',dribbling:96,agility:96};
 Object.assign(player,{x:1000,y:700,z:0,face,dx:0,dy:1,down:false,stun:0,cd:0,
  trickCd:0,dribbleCooldown:0,fatigue:0,breath:100});
 rival.src={...rival.src,defence:50,aggression:50,agility:50};
 const closing=mode==='closing'||mode==='downed'||mode==='recovering';
 Object.assign(rival,{x:1000+face*40,y:760,z:0,down:mode==='downed',stun:0,invuln:0,cd:0,
  face:-face,action:mode==='recovering'?'hurt':'idle',actionTimer:mode==='recovering'?.2:0,
  moveVX:0,moveVY:closing?-240:mode==='retreating'?240:0,
  vx:0,vy:closing?-240:mode==='retreating'?240:0});
 game.ball.owner=player;game.ball.x=player.x;game.ball.y=player.y;game.ball.z=0;
 const originalRandom=Math.random;Math.random=()=>.80;
 let performed=false;
 try{performed=game.tryDribbleTrick(player,byAI);}finally{Math.random=originalRandom;}
 return {performed,dy:player.y-700,guard:player.trickGuard,owner:game.ball.owner===player,
  event:game.events.filter(e=>e.type==='dribbleTrick').at(-1)?.success};
}

test('HUMAN-DRIBBLE-PRIMARY-MARKER-LANE-READ-01: nearest defender counters only while actively closing the selected feint lane',()=>{
 for(const team of [0,1]){
  const closing=runPrimaryMarkerFeint(team,'closing');
  const retreating=runPrimaryMarkerFeint(team,'retreating');
  const stationary=runPrimaryMarkerFeint(team,'stationary');
  const downed=runPrimaryMarkerFeint(team,'downed');
  const recovering=runPrimaryMarkerFeint(team,'recovering');
  const cpu=runPrimaryMarkerFeint(team,'closing',true);
  assert.equal(closing.performed,true);
  assert.equal(closing.event,false,JSON.stringify({team,closing}));
  assert.equal(closing.guard,0);
  assert.ok(closing.dy>0&&closing.dy<retreating.dy*.3,JSON.stringify({team,closing,retreating}));
  for(const [mode,result] of [['retreating',retreating],['stationary',stationary],
   ['downed',downed],['recovering',recovering],['CPU',cpu]]){
   assert.equal(result.event,true,JSON.stringify({team,mode,result}));
   assert.ok(result.guard>0,JSON.stringify({team,mode,result}));
  }
 }
});
