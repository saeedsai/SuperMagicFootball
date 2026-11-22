'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadEngine(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();const {ENGINE}=await import('../src/modules/engine.js');return ENGINE;}
function prepareEngine(ENGINE,defendingTeam){
 const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
 const field=ENGINE.WORLD.field,x=field.x+field.w*.52,y=field.y+field.h*.5;
 const carrier=game.player(attackingTeam,3),runner=game.player(attackingTeam,4);
 const primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
 const passer=game.player(defendingTeam,2),intended=game.player(defendingTeam,5);
 const keep=new Set([carrier,runner,primary,support,passer,intended]);
 for(const q of game.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=0;q.z=0;}
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,aiGiveAndGoRun:null,cd:0,trickCd:1});
 Object.assign(runner,{x:x+dir*300,y:y+160,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:dir*24,moveVY:0,aiTimer:0,aiTarget:null});
 Object.assign(primary,{x:x+dir*55,y:y-78,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
 Object.assign(support,{x:x-dir*150,y:y+20,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
 Object.assign(passer,{x:x-dir*300,y:y-300,down:true,stun:0,z:0});
 Object.assign(intended,{x:x-dir*200,y:y+300,down:true,stun:0,z:0});
 Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:defendingTeam,passTarget:intended.src.id,attacker:defendingTeam,lastTouchTeam:defendingTeam,x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});
 game.clock=10;game.take(carrier);
 return {game,carrier,runner,primary,support,field};
}
test('CPU retains a pressured first touch when no safe outlet exists, then resumes ordinary passing after the read window',async()=>{
 const ENGINE=await loadEngine(),originalRandom=Math.random;
 try{
  Math.random=()=>0;
  for(const defendingTeam of [0,1]){
   const f=prepareEngine(ENGINE,defendingTeam),{game,carrier,runner}=f;
   const x=carrier.x,y=carrier.y;runner.down=true;
   carrier.firstTouchControlTimer=0;carrier.firstTouchPressure=.8;carrier.firstTouchOutletReadTimer=.92;
   carrier.aiFirstTouchTarget=null;carrier.aiFirstTouchOutletUntil=game.clock+.92;
   carrier.aiAssistTarget=null;carrier.aiGiveAndGoRun=null;carrier.aiTimer=0;carrier.aiTarget=null;
   carrier.cd=0;carrier.trickCd=1;
   const expiry=carrier.aiFirstTouchOutletUntil,calls=[],originalPass=game.pass;
   game.pass=function(...args){calls.push(args);return false;};
   try{
    game.driveAI(carrier,.016);
    assert.equal(calls.length,0,'closed first-touch outlets must not trigger a generic pass on team '+defendingTeam);
    assert.equal(game.ball.owner,carrier,'CPU must retain possession on team '+defendingTeam);
    assert.ok(Math.hypot(carrier.moveVX||0,carrier.moveVY||0)>0,'existing carry escape should keep the CPU moving away from pressure on team '+defendingTeam);
    carrier.x=x;carrier.y=y;carrier.moveVX=0;carrier.moveVY=0;carrier.aiTimer=0;carrier.aiTarget=null;carrier.cd=0;carrier.trickCd=1;
    game.clock=expiry+.02;game.driveAI(carrier,.016);
    assert.equal(calls.length,1,'ordinary pass decisions resume after the bounded read window on team '+defendingTeam);
   }finally{game.pass=originalPass;}
  }
 }finally{Math.random=originalRandom;}
});
