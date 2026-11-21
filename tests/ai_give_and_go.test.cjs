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
