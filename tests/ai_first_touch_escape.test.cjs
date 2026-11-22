'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([
  import('../src/modules/ai.js'),import('../src/modules/engine.js')
 ]);
 return {AI,ENGINE};
}
const bounds={xMin:0,xMax:2000,yMin:0,yMax:1000};
const player=(name,t,x,y,extra={})=>({
 name,t,keeper:false,x,y,z:0,stun:0,down:false,moveVX:0,moveVY:0,
 action:'idle',actionTimer:0,firstTouchControlTimer:.24,firstTouchPressure:1,
 src:{id:name},...extra
});

test('CPU first touch chooses a bounded forward escape lane on both attacking sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier-'+team,team,team===0?500:1500,300);
  const marker=player('marker-'+team,1-team,carrier.x+dir*55,300,{moveVX:-dir*35});
  const target=AI.attackingFirstTouchEscape([carrier,marker],team,carrier,bounds);
  assert.ok(target,JSON.stringify({team,target}));
  assert.ok(dir*(target.x-carrier.x)>=35);
  assert.ok(Math.abs(target.y-carrier.y)>=36);
  assert.ok(target.x>=bounds.xMin+24&&target.x<=bounds.xMax-24);
  assert.ok(target.y>=bounds.yMin+24&&target.y<=bounds.yMax-24);
 }
});

test('CPU first touch chooses the unblocked diagonal when a defender occupies the other side',async()=>{
 const {AI}=await loadModules();
 const carrier=player('carrier',0,500,300);
 const upper=player('upper-marker',1,550,250);
 const target=AI.attackingFirstTouchEscape([carrier,upper],0,carrier,bounds);
 assert.ok(target);
 assert.ok(target.y>carrier.y,'the lower diagonal is clearer than the occupied upper lane');
});

test('open space, rearward pressure and inactive defenders retain the ordinary first touch',async()=>{
 const {AI}=await loadModules();
 const carrier=player('carrier',0,500,300);
 assert.equal(AI.attackingFirstTouchEscape([carrier],0,carrier,bounds),null);
 const behind=player('behind',1,440,300);
 assert.equal(AI.attackingFirstTouchEscape([carrier,behind],0,carrier,bounds),null);
 for(const inactive of [
  player('down',1,550,300,{down:true}),
  player('stunned',1,550,300,{stun:.2}),
  player('airborne',1,550,300,{z:45}),
  player('recovering',1,550,300,{shotImpactRiseTimer:.2}),
  player('knocked',1,550,300,{shotImpactKnockdownTimer:.2})
 ])assert.equal(AI.attackingFirstTouchEscape([carrier,inactive],0,carrier,bounds),null,inactive.name);
 carrier.firstTouchControlTimer=0;
 assert.equal(AI.attackingFirstTouchEscape([carrier,player('near',1,550,300)],0,carrier,bounds),null);
});

function prepareGame(ENGINE,{humans=0,team=0}={}){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,humans,mode:'quick'});
 const receiver=game.player(team,3),passer=game.player(team,4),marker=game.player(1-team,3);
 const field=ENGINE.WORLD.field,dir=team===0?1:-1;
 const x=field.x+field.w*.5,y=field.y+field.h*.5;
 for(const q of game.players){
  if(q===receiver||q===passer||q===marker)continue;
  q.down=true;q.x=field.x+field.w*(team===0?.12:.88);q.y=field.y+field.h*.12+(q.i%4)*20;
 }
 Object.assign(receiver,{x,y,face:dir,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null});
 Object.assign(passer,{x:x-dir*150,y:y+120,down:true,stun:0,z:0});
 Object.assign(marker,{x:x+dir*55,y,down:false,stun:0,z:0,action:'idle',moveVX:-dir*30,moveVY:0});
 Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:team,
  passTarget:receiver.src.id,x,y,z:12,vx:420,vy:0,vz:0,shot:null,strike:null,attacker:team});
 game.take(receiver);
 return {game,receiver,passer,marker};
}

test('engine applies the escape to CPU receivers, then clears it on expiry or possession loss',async()=>{
 const {ENGINE}=await loadModules();
 for(const config of [{humans:0,team:0},{humans:1,team:1}]){
  const {game,receiver}=prepareGame(ENGINE,config);
  assert.ok(receiver.firstTouchControlTimer>0);
  assert.ok(receiver.aiFirstTouchTarget,'CPU receiver should receive a runtime escape target');
  assert.equal(receiver.src.aiFirstTouchTarget,undefined,'escape intent must not enter player/save data');
  const expected={...receiver.aiFirstTouchTarget};
  const originalRandom=Math.random;
  try{Math.random=()=>.99;game.driveAI(receiver,.016);}
  finally{Math.random=originalRandom;}
  assert.equal(receiver.aiTarget.x,expected.x);
  assert.equal(receiver.aiTarget.y,expected.y);
  game.ball.owner=null;game.clock=expected.expires+.01;receiver.firstTouchControlTimer=0;
  game.driveAI(receiver,.016);
  assert.equal(receiver.aiFirstTouchTarget,null);
 }
});

test('human-controlled receivers keep the existing directional first-touch behavior',async()=>{
 const {ENGINE}=await loadModules();
 const {game,receiver}=prepareGame(ENGINE,{humans:1,team:0});
 assert.ok(receiver.firstTouchControlTimer>0,'existing pressured first-touch cushion remains');
 assert.equal(receiver.aiFirstTouchTarget,null,'human input is never redirected by the AI escape');
 assert.equal(game.controlled[0],receiver.i,'normal human receiver selection remains intact');
});


function prepareInterceptGame(ENGINE,{team=0,humans=0,markerSide='front',height=8,speed=600,targeted=true}={}){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans});game.weather='Clear';game.magicHazards=[];game.magicWalls=[];game.supernova=null;
 const dir=team===0?1:-1;
 const interceptor=game.player(team,3),passer=game.player(1-team,3),
  intended=game.player(1-team,4),marker=game.player(1-team,5);
 const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
 const keep=new Set([interceptor,passer,intended,marker]);
 for(const q of game.players)if(!keep.has(q)){q.down=true;q.stun=0;q.z=0;}
 Object.assign(interceptor,{x,y,face:dir,z:0,down:false,stun:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,aiAssistTarget:null,aiDetour:null,aiGiveAndGoRun:null,comboActive:false,
  firstTouchControlTimer:0,firstTouchPressure:0});
 Object.assign(passer,{x:x+dir*240,y,down:false,stun:0,z:0,action:'idle',actionTimer:0});
 Object.assign(intended,{x:x-dir*210,y,down:false,stun:0,z:0,action:'idle',actionTimer:0});
 const markerX=markerSide==='front'?x+dir*55:x-dir*55;
 const markerY=markerSide==='front'?y-78:y;
 Object.assign(marker,{x:markerX,y:markerY,down:false,stun:0,z:0,action:'idle',actionTimer:0,
  moveVX:markerSide==='front'?-dir*35:0,moveVY:0});
 Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:1-team,
  passTarget:targeted?intended.src.id:null,attacker:1-team,lastTouchTeam:1-team,
  x,y,z:height,vx:-dir*speed,vy:0,vz:0,age:.18,shot:null,strike:null,
  ordinaryShot:false,canCollect:0});
 game.clock=10;
 game.take(interceptor);
 return {game,interceptor,passer,intended,marker,dir,x,y};
}

test('CPU interception of a pressured targeted low through-ball takes a safe first touch on both sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const s=prepareInterceptGame(ENGINE,{team});
  const target=s.interceptor.aiFirstTouchTarget;
  assert.equal(s.interceptor.firstTouchControlTimer,.24);
  assert.ok(s.interceptor.firstTouchPressure>0);
  assert.ok(target,JSON.stringify({team,target,pressure:s.interceptor.firstTouchPressure}));
  assert.ok(s.dir*(target.x-s.x)>=35,'first touch must move forward for the intercepting team');
  assert.ok(target.y>s.y,'upper marked diagonal must be rejected');
  assert.equal(s.interceptor.src.aiFirstTouchTarget,undefined,'intent must remain runtime-only');
  const eventStart=s.game.events.length;
  s.game.driveAI(s.interceptor,.016);
  assert.equal(s.game.ball.owner,s.interceptor,'CPU must keep possession through its bounded first touch');
  assert.deepEqual(s.game.events.slice(eventStart).filter(event=>['passIntent','shotRelease','dribbleTrick'].includes(event.type)),[],
   'CPU must not release or spend a trick before completing the first touch');
  assert.ok(Math.abs(s.interceptor.aiTarget.x-target.x)<1,JSON.stringify({team,target,actual:s.interceptor.aiTarget,owner:s.game.ball.owner===s.interceptor,clock:s.game.clock,expires:s.interceptor.aiFirstTouchTarget?.expires,timer:s.interceptor.firstTouchControlTimer,aiTimer:s.interceptor.aiTimer,assist:s.interceptor.aiAssistTarget}));
  assert.ok(Math.abs(s.interceptor.aiTarget.y-target.y)<1,JSON.stringify({team,target,actual:s.interceptor.aiTarget,owner:s.game.ball.owner===s.interceptor,clock:s.game.clock,expires:s.interceptor.aiFirstTouchTarget?.expires,timer:s.interceptor.firstTouchControlTimer,aiTimer:s.interceptor.aiTimer,assist:s.interceptor.aiAssistTarget}));
 }
});

test('interception first-touch escape stays CPU-only and rejects rear pressure, high, slow or untargeted passes',async()=>{
 const {ENGINE}=await loadModules();
 const human=prepareInterceptGame(ENGINE,{team:0,humans:1});
 assert.equal(human.interceptor.firstTouchControlTimer,0);
 assert.equal(human.interceptor.aiFirstTouchTarget,null);
 const rear=prepareInterceptGame(ENGINE,{team:0,markerSide:'behind'});
 assert.equal(rear.interceptor.firstTouchControlTimer,0);
 assert.equal(rear.interceptor.aiFirstTouchTarget,null);
 const high=prepareInterceptGame(ENGINE,{team:0,height:30});
 assert.equal(high.interceptor.firstTouchControlTimer,0);
 const slow=prepareInterceptGame(ENGINE,{team:0,speed:220});
 assert.equal(slow.interceptor.firstTouchControlTimer,0);
 const untargeted=prepareInterceptGame(ENGINE,{team:0,targeted:false});
 assert.equal(untargeted.interceptor.firstTouchControlTimer,0);
});


test('CPU first-touch outlet prefers an open forward teammate over a blocked lane on both sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('outlet-carrier-'+team,team,team===0?500:1500,300,
   {firstTouchControlTimer:0,firstTouchPressure:.42});
  const marker=player('outlet-marker-'+team,1-team,carrier.x+dir*55,carrier.y-78,{moveVX:-dir*35});
  const blocker=player('outlet-blocker-'+team,1-team,carrier.x+dir*145,carrier.y-84);
  const safe=player('safe-outlet-'+team,team,carrier.x+dir*280,carrier.y+160,{moveVX:dir*20});
  const blocked=player('blocked-outlet-'+team,team,carrier.x+dir*280,carrier.y-160,{moveVX:dir*20});
  const outlet=AI.attackingFirstTouchOutlet([carrier,marker,blocker,safe,blocked],team,carrier,bounds);
  assert.equal(outlet?.runner,safe,JSON.stringify({team,outlet:outlet?.runner?.name}));
  assert.ok(dir*(outlet.target.x-carrier.x)>200);
  assert.ok(outlet.target.y>carrier.y);
  assert.equal(AI.attackingFirstTouchOutlet([carrier,marker,blocker,blocked],team,carrier,bounds),null,
   'a blocked-only outlet must not be forced');
  carrier.firstTouchPressure=0;
  assert.equal(AI.attackingFirstTouchOutlet([carrier,marker,blocker,safe],team,carrier,bounds),null,
   'ordinary unpressured possession keeps normal decision ordering');
 }
});

test('CPU interception uses the safe post-touch outlet while preserving the 0.24-second control touch',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const s=prepareInterceptGame(ENGINE,{team}),{game,interceptor,dir,x,y}=s;
  const safe=game.player(team,4),blocked=game.player(team,5);
  Object.assign(safe,{x:x+dir*280,y:y+160,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   moveVX:dir*20,moveVY:0,aiAssistTarget:null});
  Object.assign(blocked,{x:x+dir*280,y:y-160,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   moveVX:dir*20,moveVY:0,aiAssistTarget:null});
  Object.assign(s.intended,{x:x+dir*145,y:y-84,z:0,down:false,stun:0,action:'idle',actionTimer:0});
  assert.ok(interceptor.aiFirstTouchOutletUntil>game.clock,'CPU interception should open a short outlet window');
  const originalRandom=Math.random;
  try{
   Math.random=()=>0;
   const firstStart=game.events.length;
   game.driveAI(interceptor,.016);
   assert.equal(game.ball.owner,interceptor,'the CPU must finish its settling touch before passing');
   assert.deepEqual(game.events.slice(firstStart).filter(e=>e.type==='passIntent'),[],
    'no pass is allowed inside the 0.24-second first-touch window');
   game.clock=10.25;interceptor.firstTouchControlTimer=0;interceptor.aiTimer=0;
   const outletStart=game.events.length;
   game.driveAI(interceptor,.016);
   const intent=game.events.slice(outletStart).find(e=>e.type==='passIntent');
   assert.equal(intent?.target,safe.src.id,JSON.stringify({team,intent,expected:safe.src.id}));
   assert.equal(game.ball.owner,null,'the chosen safe outlet receives a real pass');
   assert.equal(interceptor.aiFirstTouchOutletUntil,0,'the one-shot outlet preference clears after release');
  }finally{Math.random=originalRandom;}
 }
});
