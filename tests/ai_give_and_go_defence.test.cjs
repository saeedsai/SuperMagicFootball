'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,z:0,stun:0,down:false,
 moveVX:0,moveVY:0,action:'idle',actionTimer:0,src:{id:name},...extra});
function fixture(team){
 const attackingTeam=1-team,dir=attackingTeam===0?1:-1;
 const carrier=player('receiver-'+team,attackingTeam,attackingTeam===0?620:380,300);
 const target={x:carrier.x+dir*132,y:carrier.y+104};
 const runner=player('passer-'+team,attackingTeam,target.x,target.y);
 runner.aiGiveAndGoRun={receiverId:carrier.src.id,target,expires:2};
 return {carrier,runner,target,players:[carrier,runner]};
}
test('second defender screens an active give-and-go return lane in both attacking directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(team),point=AI.defensiveGiveAndGoCoverTarget(team,f.carrier,f.players,bounds,1);
  assert.ok(point,JSON.stringify({team,point}));
  const dir=f.carrier.t===0?1:-1;
  assert.ok(dir*(point.x-f.carrier.x)>40,'cover must advance into the return corridor');
  assert.ok(Math.abs(point.y-f.carrier.y)>20,'cover must screen the diagonal lane');
  assert.ok(point.x>=bounds.xMin&&point.x<=bounds.xMax);
  assert.ok(point.y>=bounds.yMin&&point.y<=bounds.yMax);
  assert.ok(Math.abs(point.x-(f.carrier.x+(f.target.x-f.carrier.x)*.56))<1);
 }
});
test('return-lane cover follows a short carrier movement lead and expires cleanly',async()=>{
 const {AI}=await loadModules(),f=fixture(0);
 f.carrier.moveVX=120;f.carrier.moveVY=-60;
 const point=AI.defensiveGiveAndGoCoverTarget(0,f.carrier,f.players,bounds,1);
 assert.ok(point);
 const start={x:f.carrier.x+9.6,y:f.carrier.y-4.8};
 assert.ok(Math.abs(point.x-(start.x+(f.target.x-start.x)*.56))<1);
 assert.ok(Math.abs(point.y-(start.y+(f.target.y-start.y)*.56))<1);
 assert.equal(AI.defensiveGiveAndGoCoverTarget(0,f.carrier,f.players,bounds,2.01),null);
});
test('cover ignores mismatched receivers, unavailable runners and invalid return lanes',async()=>{
 const {AI}=await loadModules(),f=fixture(0);
 const run=()=>AI.defensiveGiveAndGoCoverTarget(0,f.carrier,f.players,bounds,1);
 f.runner.aiGiveAndGoRun.receiverId='another-receiver';assert.equal(run(),null);
 f.runner.aiGiveAndGoRun.receiverId=f.carrier.src.id;f.runner.down=true;assert.equal(run(),null);
 f.runner.down=false;f.runner.aiGiveAndGoRun.target={x:f.carrier.x+120,y:f.carrier.y};
 assert.equal(run(),null,'a target behind the attacking direction is not a return pass');
 f.carrier.x=500;f.runner.aiGiveAndGoRun.target={x:120,y:f.carrier.y};
 assert.equal(run(),null,'an implausibly long return lane is ignored');
});
test('engine assigns the second defender to the return screen while the primary still presses',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const attackingTeam of [0,1]){
  const defendingTeam=1-attackingTeam,dir=attackingTeam===0?1:-1;
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});
  const carrier=game.player(attackingTeam,3),runner=game.player(attackingTeam,4);
  const primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
  const field=ENGINE.WORLD.field,boundsNow={xMin:field.x+24,xMax:field.x+field.w-24,
   yMin:field.y+24,yMax:field.y+field.h-24};
  const x=field.x+field.w*.52,y=field.y+field.h*.5;
  const target={x:x+dir*132,y:y+104};
  Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
  Object.assign(runner,{x:target.x,y:target.y,down:false,stun:0,z:0,action:'idle',
   actionTimer:0,moveVX:0,moveVY:0,aiAssistTarget:null,
   aiGiveAndGoRun:{receiverId:carrier.src.id,target,expires:2}});
  for(const p of game.players){
   if(p===carrier||p===runner||p===primary||p===support||p.keeper)continue;
   p.down=true;p.stun=0;p.z=0;
  }
  Object.assign(primary,{x:x+dir*28,y,down:false,stun:0,z:0,action:'idle',
   actionTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
  Object.assign(support,{x:x+dir*82,y:y+25,down:false,stun:0,z:0,action:'idle',
   actionTimer:0,aiAssistTarget:null,aiTimer:0,aiTarget:null});
  game.ball.owner=carrier;game.ball.attacker=attackingTeam;game.ball.x=x;game.ball.y=y;
  game.clock=1;
  const expected=AI.defensiveGiveAndGoCoverTarget(defendingTeam,carrier,game.players,boundsNow,game.clock);
  assert.ok(expected);
  game.driveAI(support,.016);
  assert.ok(Math.abs(support.aiTarget.x-expected.x)<1);
  assert.ok(Math.abs(support.aiTarget.y-expected.y)<1);
  game.driveAI(primary,.016);
  assert.ok(Math.hypot(primary.aiTarget.x-carrier.x,primary.aiTarget.y-carrier.y)<40,
   'primary presser must keep closing the carrier');
 }
});
