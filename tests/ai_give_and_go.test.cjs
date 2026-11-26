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
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(name,t,x,y,extra={})=>({
 name,t,keeper:false,x,y,stun:0,z:0,moveVX:0,moveVY:0,action:'idle',...extra
});

test('AI creates a bounded forward-diagonal return lane in both attacking directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const passer=player('passer',team,team===0?620:380,300);
  const receiver=player('receiver',team,passer.x+dir*160,300);
  const result=AI.attackingGiveAndGoRun([passer,receiver],team,passer,receiver,bounds);
  assert.ok(result);
  assert.ok(dir*(result.target.x-receiver.x)>=70);
  assert.ok(Math.abs(result.target.y-receiver.y)>=60);
  assert.ok(result.target.x>=bounds.xMin&&result.target.x<=bounds.xMax);
  assert.ok(result.target.y>=bounds.yMin&&result.target.y<=bounds.yMax);
 }
});

test('AI chooses the open return side when a defender blocks the first diagonal lane',async()=>{
 const {AI}=await loadModules();
 const passer=player('passer',0,620,300);
 const receiver=player('receiver',0,780,300);
 const blocker=player('blocker',1,846,248);
 const result=AI.attackingGiveAndGoRun([passer,receiver,blocker],0,passer,receiver,bounds);
 assert.ok(result);
 assert.ok(result.target.y>receiver.y,'the blocked upper lane must yield to the open lower lane');
});

test('AI declines the give-and-go when both return lanes are blocked or the receiver is unavailable',async()=>{
 const {AI}=await loadModules();
 const passer=player('passer',0,620,300);
 const receiver=player('receiver',0,780,300);
 const upper=player('upper-blocker',1,846,248);
 const lower=player('lower-blocker',1,846,352);
 assert.equal(AI.attackingGiveAndGoRun([passer,receiver,upper,lower],0,passer,receiver,bounds),null);
 const downed=player('downed',0,780,300,{down:true});
 assert.equal(AI.attackingGiveAndGoRun([passer,downed],0,passer,downed,bounds),null);
 assert.equal(AI.attackingGiveAndGoRun([passer,receiver],0,passer,receiver,null),null);
});

test('a passer reserved for the return run is not selected as a generic support runner',async()=>{
 const {AI}=await loadModules();
 const passer=player('passer',0,620,300,{aiGiveAndGoRun:{receiverId:'receiver',target:{x:912,y:404},expires:2}});
 const receiver=player('receiver',0,780,300);
 assert.equal(AI.attackingSupportRun([passer,receiver],0,receiver,null,bounds),null);
});

test('engine stores the runtime return intent and moves the passer only after the receiver controls the pass',async()=>{
 const {AI,ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const passer=game.players.find(p=>p.t===0&&p.i===3);
 const receiver=game.players.find(p=>p.t===0&&p.i===4);
 const field=ENGINE.WORLD.field;
 const matchBounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
 const goalY=(ENGINE.WORLD.goalTop+ENGINE.WORLD.goalBottom)/2;
 const goalX=field.x+field.w;
 for(const q of game.players){
  if(q===passer||q===receiver)continue;
  q.x=field.x+field.w*.12;
  q.y=field.y+field.h*.5+((q.i%5)-2)*75;
 }
 passer.x=goalX-430;passer.y=goalY;passer.dx=1;passer.dy=0;
 receiver.x=goalX-220;receiver.y=goalY+12;receiver.moveVX=80;receiver.moveVY=0;
 game.ball.owner=passer;
 const returnRun=AI.attackingGiveAndGoRun(game.players,0,passer,receiver,matchBounds);
 assert.ok(returnRun);
 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  assert.equal(game.pass(passer,false,false,{
   preferredTarget:receiver,supportRun:true,goalmouth:true,
   preferredPoint:{x:receiver.x+10,y:receiver.y},giveAndGoRun:returnRun
  }),true);
 }finally{Math.random=originalRandom;}
 assert.equal(passer.aiGiveAndGoRun.receiverId,receiver.src.id);
 assert.deepEqual(passer.aiGiveAndGoRun.target,returnRun.target);
 assert.equal(passer.src.aiGiveAndGoRun,undefined,'the intent must remain runtime-only');
 game.ball.owner=receiver;game.ball.passTarget=null;game.clock+=.25;
 passer.aiTimer=1;passer.aiTarget={x:passer.homeX,y:passer.homeY};passer.aiDetour=null;
 game.driveAI(passer,.016);
 assert.deepEqual(passer.aiTarget,returnRun.target);
 const opponent=game.players.find(p=>p.t===1&&!p.keeper);
 game.ball.owner=opponent;
 game.driveAI(passer,.016);
 assert.equal(passer.aiGiveAndGoRun,null,'interception clears the return run');
});

 
 test('AI offers the safe forward-diagonal return pass after the reserved runner reaches its lane in both directions',async()=>{
  const {AI}=await loadModules();
  for(const team of [0,1]){
   const dir=team===0?1:-1;
   const carrier=player('receiver',team,team===0?760:240,300);
   carrier.src={id:'receiver-'+team};
   const target={x:carrier.x+dir*132,y:carrier.y+104};
   const runner=player('passer',team,target.x,target.y);
   runner.src={id:'passer-'+team};
   runner.aiGiveAndGoRun={receiverId:carrier.src.id,target,expires:2};
   const result=AI.attackingGiveAndGoReturnPass([carrier,runner],team,carrier,bounds,1);
   assert.ok(result,'team '+team+' should recognize its arrived return runner');
   assert.equal(result.runner,runner);
   assert.ok(dir*(result.target.x-carrier.x)>100);
   assert.ok(Math.abs(result.target.y-runner.y)<=18);
  }
 });
 
 test('AI waits for the runner and rejects expired or defender-blocked return lanes',async()=>{
  const {AI}=await loadModules();
  const carrier=player('receiver',0,760,300);carrier.src={id:'receiver'};
  const target={x:892,y:404};
  const runner=player('passer',0,target.x-150,target.y);runner.src={id:'passer'};
  runner.aiGiveAndGoRun={receiverId:carrier.src.id,target,expires:2};
  assert.equal(AI.attackingGiveAndGoReturnPass([carrier,runner],0,carrier,bounds,1),null,
   'the passer must reach the reserved lane before the return option appears');
  runner.x=target.x;runner.y=target.y;
  assert.equal(AI.attackingGiveAndGoReturnPass([carrier,runner],0,carrier,bounds,3),null,
   'an expired runtime intent cannot trigger a return pass');
  runner.aiGiveAndGoRun.expires=4;
  const blocker=player('blocker',1,target.x,target.y);
  assert.equal(AI.attackingGiveAndGoReturnPass([carrier,runner,blocker],0,carrier,bounds,1),null,
   'a defender occupying the return reception point blocks the pass');
 });
 
 test('engine returns the ball to the arrived give-and-go passer with the existing low pass',async()=>{
  const {ENGINE}=await loadModules();
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const passer=game.players.find(p=>p.t===0&&p.i===3);
  const receiver=game.players.find(p=>p.t===0&&p.i===4);
  const field=ENGINE.WORLD.field;
  const goalX=field.x+field.w,goalY=(ENGINE.WORLD.goalTop+ENGINE.WORLD.goalBottom)/2;
  for(const q of game.players){
   if(q===passer||q===receiver)continue;
   q.down=true;q.stun=0;q.x=field.x+100;q.y=goalY+((q.i%5)-2)*90;
  }
  receiver.down=false;receiver.stun=0;receiver.z=0;receiver.action='idle';
  receiver.aiAssistTarget=null;receiver.x=goalX-850;receiver.y=goalY;receiver.cd=0;receiver.aiTimer=0;receiver.aiTarget=null;
  passer.down=false;passer.stun=0;passer.z=0;passer.action='idle';passer.aiAssistTarget=null;
  const target={x:receiver.x+132,y:receiver.y+104};
  passer.x=target.x;passer.y=target.y;passer.moveVX=0;passer.moveVY=0;
  game.clock=1;
  passer.aiGiveAndGoRun={receiverId:receiver.src.id,target,expires:game.clock+1.75};
  game.ball.owner=receiver;game.ball.attacker=0;game.ball.passTarget=null;
  const originalRandom=Math.random;
  try{Math.random=()=>.01;game.driveAI(receiver,.016);}
  finally{Math.random=originalRandom;}
  assert.equal(game.ball.passTarget,passer.src.id,'the receiver must release the return pass to the original passer');
  assert.equal(game.ball.owner,null,'the return pass must enter the existing live ball-flight system');
  assert.equal(receiver.aiGiveAndGoRun,undefined,'the receiver must not create a nested runtime intent');
 });

test('give-and-go return arrival accounts for an Agility-limited marker turn in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('receiver-'+team,team,team===0?760:240,300);
  carrier.src={id:'receiver-'+team};
  const target={x:carrier.x+dir*132,y:404};
  const runner=player('passer-'+team,team,target.x,target.y);
  runner.src={id:'passer-'+team};
  runner.aiGiveAndGoRun={receiverId:carrier.src.id,target,expires:2};
  const gap=Math.hypot(62,90);
  const marker=player('marker-'+team,1-team,target.x-dir*62,target.y+90,{
   moveVX:dir*600,moveVY:0,dx:dir*62/gap,dy:-90/gap,src:{agility:100}
  });
  const players=[carrier,runner,marker];
  assert.equal(AI.attackingGiveAndGoReturnPass(players,team,carrier,bounds,1),null,
   'a high-Agility marker turning into the return pocket closes team '+team);
  marker.src.agility=1;
  const low=AI.attackingGiveAndGoReturnPass(players,team,carrier,bounds,1);
  assert.equal(low?.runner,runner,
   'a low-Agility marker retaining momentum does not falsely close team '+team);
  marker.dx=NaN;marker.dy=Infinity;marker.src.agility=100;
  const invalidHigh=AI.attackingGiveAndGoReturnPass(players,team,carrier,bounds,1);
  marker.src.agility=1;
  const invalidLow=AI.attackingGiveAndGoReturnPass(players,team,carrier,bounds,1);
  assert.deepEqual(invalidHigh,invalidLow,
   'invalid input preserves the same bounded linear fallback on team '+team);
 }
});
