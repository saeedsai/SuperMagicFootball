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

test('CPU first-touch escape angle scales with Dribbling while neutral and invalid ratings preserve the baseline',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=team===0?500:1500,y=300;
  const targetFor=(name,dribbling,mode='rating')=>{
   const src=mode==='missing'?{id:name}:{id:name,dribbling};
   const carrier=player(name,team,x,y,{src});
   const marker=player('marker-'+team,1-team,x+dir*55,y,{moveVX:-dir*35});
   const target=AI.attackingFirstTouchEscape([carrier,marker],team,carrier,bounds);
   return {carrier,target};
  };
  const low=targetFor('low-'+team,1),neutral=targetFor('neutral-'+team,50),
   high=targetFor('high-'+team,100),missing=targetFor('missing-'+team,undefined,'missing'),
   invalid=targetFor('invalid-'+team,'elite');
  for(const row of [low,neutral,high,missing,invalid])assert.ok(row.target,JSON.stringify({team,row}));
  assert.deepEqual(missing.target,neutral.target,'missing Dribbling must preserve neutral first-touch geometry');
  assert.deepEqual(invalid.target,neutral.target,'invalid Dribbling must fail safely to neutral geometry');
  const metrics=row=>({forward:dir*(row.target.x-row.carrier.x),lateral:Math.abs(row.target.y-row.carrier.y)});
  const l=metrics(low),n=metrics(neutral),h=metrics(high);
  assert.ok(l.forward>n.forward&&n.forward>h.forward,JSON.stringify({team,l,n,h}));
  assert.ok(l.lateral<n.lateral&&n.lateral<h.lateral,JSON.stringify({team,l,n,h}));
  assert.ok(l.forward>=35&&h.forward>=35&&h.lateral<=90,JSON.stringify({team,l,n,h}));
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


function prepareInterceptGame(ENGINE,{team=0,humans=0,markerSide='front',height=8,speed=600,targeted=true,dribbling=undefined}={}){
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
 const originalDribbling=interceptor.src.dribbling;
 if(dribbling!==undefined)interceptor.src.dribbling=dribbling;
 game.take(interceptor);
 if(dribbling!==undefined)interceptor.src.dribbling=originalDribbling;
 return {game,interceptor,passer,intended,marker,dir,x,y};
}

test('CPU interception of a pressured targeted low through-ball takes a safe first touch on both sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const s=prepareInterceptGame(ENGINE,{team});
  const target=s.interceptor.aiFirstTouchTarget;
  assert.equal(s.interceptor.firstTouchControlTimer,s.interceptor.firstTouchControlDuration);
  assert(s.interceptor.firstTouchControlDuration>=.18&&s.interceptor.firstTouchControlDuration<=.30);
  assert(Math.abs(s.interceptor.firstTouchOutletReadTimer-(s.interceptor.firstTouchControlDuration+.68))<1e-9);
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

test('actual CPU interception first-touch route reflects Dribbling skill on both attacking sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const sample=rating=>{
   const s=prepareInterceptGame(ENGINE,{team,dribbling:rating});
   const target=s.interceptor.aiFirstTouchTarget;
   assert.ok(target,JSON.stringify({team,rating,target}));
   return {forward:s.dir*(target.x-s.x),lateral:Math.abs(target.y-s.y)};
  };
  const low=sample(1),neutral=sample(50),high=sample(100);
  assert.ok(low.forward>neutral.forward&&neutral.forward>high.forward,JSON.stringify({team,low,neutral,high}));
  assert.ok(low.lateral<neutral.lateral&&neutral.lateral<high.lateral,JSON.stringify({team,low,neutral,high}));
  assert.ok(Math.abs(neutral.forward-72)<1&&Math.abs(neutral.lateral-78)<1,JSON.stringify({team,neutral}));
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
  const safe=player('safe-outlet-'+team,team,carrier.x+dir*280,carrier.y+160,{moveVX:dir*20,firstTouchControlTimer:0});
  const blocked=player('blocked-outlet-'+team,team,carrier.x+dir*280,carrier.y-160,{moveVX:dir*20,firstTouchControlTimer:0});
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

test('CPU interception uses the safe post-touch outlet after its skill-and-pace-scaled control touch',async()=>{
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
    'no pass is allowed before the scaled first-touch window completes');
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


test('CPU first-touch outlet skips a teammate still settling their own control touch',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=team===0?500:1500,y=300;
  const carrier=player('settling-carrier-'+team,team,x,y,{firstTouchControlTimer:0,firstTouchPressure:.42});
  const marker=player('settling-marker-'+team,1-team,x+dir*55,y-78);
  const settling=player('still-settling-'+team,team,x+dir*300,y+160,{moveVX:dir*20,firstTouchControlTimer:.18});
  const ready=player('ready-outlet-'+team,team,x+dir*260,y+190,{moveVX:dir*20,firstTouchControlTimer:0});
  assert.equal(AI.attackingFirstTouchOutlet([carrier,marker,settling],team,carrier,bounds),null,
   'a teammate with an active first-touch control timer is not a safe outlet');
  const outlet=AI.attackingFirstTouchOutlet([carrier,marker,settling,ready],team,carrier,bounds);
  assert.equal(outlet?.runner,ready,JSON.stringify({team,selected:outlet?.runner?.name}));
 }
});

test('actual CPU interception passes to the next ready outlet when its preferred teammate is still settling',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const s=prepareInterceptGame(ENGINE,{team}),{game,interceptor,dir,x,y}=s;
  const preferred=game.player(team,4),blocked=game.player(team,5),alternate=game.player(team,2);
  Object.assign(preferred,{x:x+dir*280,y:y+160,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   moveVX:dir*20,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:.18});
  Object.assign(blocked,{x:x+dir*280,y:y-160,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   moveVX:dir*20,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0});
  Object.assign(alternate,{x:x+dir*260,y:y+190,z:0,down:false,stun:0,action:'idle',actionTimer:0,
   moveVX:dir*20,moveVY:0,aiAssistTarget:null,aiGiveAndGoRun:null,firstTouchControlTimer:0});
  Object.assign(s.intended,{x:x+dir*145,y:y-84,z:0,down:false,stun:0,action:'idle',actionTimer:0});
  interceptor.firstTouchControlTimer=0;interceptor.firstTouchPressure=.8;
  interceptor.firstTouchOutletReadTimer=.68;interceptor.aiFirstTouchOutletUntil=game.clock+.92;
  interceptor.aiFirstTouchTarget=null;interceptor.aiAssistTarget=null;interceptor.aiGiveAndGoRun=null;
  interceptor.aiTimer=0;interceptor.aiTarget=null;
  const originalRandom=Math.random;
  try{
   Math.random=()=>0;game.clock=10.25;
   const start=game.events.length;game.driveAI(interceptor,.016);
   const intent=game.events.slice(start).find(event=>event.type==='passIntent');
   assert.equal(intent?.target,alternate.src.id,JSON.stringify({team,intent,preferred:preferred.src.id,alternate:alternate.src.id}));
   assert.equal(game.ball.owner,null,'the selected ready teammate receives the actual pass');
  }finally{Math.random=originalRandom;}
 }
});


test('CPU first-touch escape avoids a live slide sweep across the direct and lower lanes on both sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=team===0?500:1500,y=300;
  const carrier=player('slide-carrier-'+team,team,x,y);
  const slider=player('sweeping-slide-'+team,1-team,x+dir*80,y,{
   action:'slide',actionTimer:.24,slideTimer:.24,slideRemaining:30,slideSpeed:500,
   slideDX:-dir*.35,slideDY:.936657
  });
  const target=AI.attackingFirstTouchEscape([carrier,slider],team,carrier,bounds);
  assert.ok(target,JSON.stringify({team,target,slider}));
  assert.ok(target.y<carrier.y,'the CPU should escape above the active sweep');
  assert.ok(dir*(target.x-carrier.x)>=35);
 }
});

test('CPU first-touch escape does not treat a retreating or invalid active slide as a reachable sweep',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=team===0?500:1500,y=300;
  const carrier=player('slide-carrier-'+team,team,x,y);
  const slider=player('retreating-slide-'+team,1-team,x+dir*80,y,{
   action:'slide',actionTimer:.24,slideTimer:.24,slideRemaining:30,slideSpeed:500,
   slideDX:dir,slideDY:0
  });
  assert.equal(AI.attackingFirstTouchEscape([carrier,slider],team,carrier,bounds),null,
   'a slide moving away from the receiver must not create a false escape');
  slider.slideDX=0;slider.slideDY=0;
  assert.equal(AI.attackingFirstTouchEscape([carrier,slider],team,carrier,bounds),null,
   'a zero-direction slide has no valid swept lane');
 }
});

test('actual CPU interception first touch chooses the open side of an active slide sweep',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const dir=team===0?1:-1,field=ENGINE.WORLD.field;
  const x=field.x+field.w*.5,y=field.y+field.h*.5;
  const interceptor=game.player(team,3),passer=game.player(1-team,3),
   intended=game.player(1-team,4),slider=game.player(1-team,2);
  const keep=new Set([interceptor,passer,intended,slider]);
  for(const q of game.players)if(!keep.has(q)){
   q.down=true;q.stun=0;q.z=0;q.action='idle';q.actionTimer=0;
  }
  Object.assign(interceptor,{x,y,face:dir,down:false,stun:0,z:0,action:'idle',actionTimer:0,
   moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,firstTouchControlTimer:0,firstTouchPressure:0});
  Object.assign(passer,{x:x+dir*240,y:y+300,down:true,stun:0,z:0,action:'idle',actionTimer:0});
  Object.assign(intended,{x:x-dir*210,y:y+300,down:true,stun:0,z:0,action:'idle',actionTimer:0});
  Object.assign(slider,{x:x+dir*80,y,down:false,stun:0,z:0,action:'slide',actionTimer:.24,
   slideTimer:.24,slideRemaining:30,slideSpeed:500,slideDX:-dir*.35,slideDY:.936657,
   moveVX:0,moveVY:0});
  Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:1-team,
   passTarget:intended.src.id,attacker:1-team,lastTouchTeam:1-team,
   x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,shot:null,strike:null,ordinaryShot:false,canCollect:0});
  game.clock=10;game.take(interceptor);
  const expected=interceptor.aiFirstTouchTarget&&{x:interceptor.aiFirstTouchTarget.x,y:interceptor.aiFirstTouchTarget.y};
  assert.ok(interceptor.firstTouchControlTimer>0&&interceptor.firstTouchPressure>0,
   JSON.stringify({team,pressure:interceptor.firstTouchPressure,timer:interceptor.firstTouchControlTimer}));
  assert.ok(expected&&expected.y<y,JSON.stringify({team,expected,slider}));
  const start=game.events.length;
  game.driveAI(interceptor,.016);
  assert.equal(game.ball.owner,interceptor);
  assert.ok(Math.abs(interceptor.aiTarget.x-expected.x)<1&&Math.abs(interceptor.aiTarget.y-expected.y)<1,
   JSON.stringify({team,expected,actual:interceptor.aiTarget}));
  assert.deepEqual(game.events.slice(start).filter(event=>['passIntent','shotRelease','dribbleTrick'].includes(event.type)),[]);
 }
});
