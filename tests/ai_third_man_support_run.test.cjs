'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const bounds={xMin:24,xMax:976,yMin:24,yMax:576};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,homeY:y,stun:0,down:false,z:0,
 action:'run',actionTimer:0,moveVX:0,moveVY:0,...extra});
function fixture(team){
 const dir=team===0?1:-1,carrier=player('carrier',team,team===0?400:600,300);
 const primary=player('primary',team,carrier.x+dir*45,188,{homeY:188});
 const third=player('third',team,carrier.x+dir*20,300,{homeY:300});
 return {carrier,primary,third,dir,primaryRun:{runner:primary,target:{x:carrier.x+dir*160,y:188}}};
}
test('third-man support run uses a bounded complementary lane in both attack directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const {carrier,third,dir,primaryRun}=fixture(team);
  const result=AI.attackingThirdManRun([carrier,primaryRun.runner,third],team,carrier,primaryRun,null,bounds);
  assert.equal(result?.runner,third);
  assert.ok(dir*(result.target.x-carrier.x)>=200);
  assert.ok(result.target.y>carrier.y+120,'third runner uses the lane opposite the primary upper-side run');
  assert.ok(Math.hypot(result.target.x-primaryRun.target.x,result.target.y-primaryRun.target.y)>=130);
  assert.ok(result.target.x>=bounds.xMin&&result.target.x<=bounds.xMax);
  assert.ok(result.target.y>=bounds.yMin&&result.target.y<=bounds.yMax);
 }
});
test('third-man run requires a live primary run and valid bounded inputs',async()=>{
 const {AI}=await loadModules(),{carrier,primary,third,primaryRun}=fixture(0);
 assert.equal(AI.attackingThirdManRun([carrier,primary,third],0,carrier,null,null,bounds),null);
 assert.equal(AI.attackingThirdManRun([carrier,primary,third],0,carrier,{runner:primary,target:{x:NaN,y:188}},null,bounds),null);
 assert.equal(AI.attackingThirdManRun([carrier,primary,third],0,carrier,primaryRun,null,null),null);
 assert.equal(AI.attackingThirdManRun([carrier,primary,third],1,carrier,primaryRun,null,bounds),null);
});
test('human, keeper, recovering, downed, airborne, assisted and give-and-go players are not selected',async()=>{
 const {AI}=await loadModules(),{carrier,primary,third,primaryRun}=fixture(0);
 const human=player('human',0,430,300),keeper=player('keeper',0,440,300,{keeper:true});
 const unavailable=[
  player('stunned',0,435,300,{stun:.2}),player('down',0,436,300,{down:true}),
  player('sliding',0,437,300,{slideTimer:.2}),player('knocked',0,438,300,{shotImpactKnockdownTimer:.2}),
  player('rising',0,439,300,{shotImpactRiseTimer:.2}),player('airborne',0,441,300,{z:30}),
  player('assisted',0,442,300,{aiAssistTarget:{expires:5}}),
  player('one-two',0,443,300,{aiGiveAndGoRun:{expires:5,receiverId:'carrier'}})
 ];
 const available=player('available',0,280,300);
 const result=AI.attackingThirdManRun([carrier,primary,third,human,keeper,...unavailable,available],0,carrier,primaryRun,human,bounds);
 assert.equal(result?.runner,third,'the closest eligible third player wins before the farther fallback');
 const withoutThird=AI.attackingThirdManRun([carrier,primary,human,keeper,...unavailable,available],0,carrier,primaryRun,human,bounds);
 assert.equal(withoutThird?.runner,available);
});
test('third-man run yields to a defender in its corridor or collection pocket',async()=>{
 const {AI}=await loadModules(),{carrier,primary,third,primaryRun}=fixture(0);
 const target={x:carrier.x+245,y:carrier.y+176};
 const blocker=player('blocker',1,target.x,target.y);
 assert.equal(AI.attackingThirdManRun([carrier,primary,third,blocker],0,carrier,primaryRun,null,bounds),null);
 blocker.x=(third.x+target.x)/2;blocker.y=(third.y+target.y)/2;
 assert.equal(AI.attackingThirdManRun([carrier,primary,third,blocker],0,carrier,primaryRun,null,bounds),null);
});
test('third-man run avoids a teammate already occupying its arrival pocket',async()=>{
 const {AI}=await loadModules(),{carrier,primary,third,primaryRun}=fixture(0);
 const crowd=player('crowd',0,carrier.x+245,carrier.y+176,{aiAssistTarget:{expires:5}});
 assert.equal(AI.attackingThirdManRun([carrier,primary,third,crowd],0,carrier,primaryRun,null,bounds),null);
});
test('driveAI moves the second CPU runner into the selected complementary lane',async()=>{
 const {AI,ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});
 const field=ENGINE.WORLD.field,dir=1,x=field.x+field.w*.5,y=field.y+field.h*.5;
 const carrier=game.player(0,3),primary=game.player(0,4),third=game.player(0,5);
 for(const p of game.players)if(p!==carrier&&p!==primary&&p!==third&&!p.keeper){
  p.down=true;p.stun=1;p.z=0;p.action='idle';p.actionTimer=0;
 }
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0});
 Object.assign(primary,{x:x+dir*40,y:y-110,homeY:y-112,down:false,stun:0,z:0,action:'run',actionTimer:0});
 Object.assign(third,{x:x+dir*20,y,homeY:y,down:false,stun:0,z:0,action:'run',actionTimer:0,
  aiTimer:1,aiTarget:{x:x+dir*20,y}});
 Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false});
 game.clock=5;
 const fieldBounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
 const support=AI.attackingSupportRun(game.players,0,carrier,null,fieldBounds);
 const thirdRun=AI.attackingThirdManRun(game.players,0,carrier,support,null,fieldBounds);
 assert.equal(support?.runner,primary);
 assert.equal(thirdRun?.runner,third);
 game.driveAI(third,.016);
 assert.deepEqual(third.aiTarget,{x:thirdRun.target.x,y:thirdRun.target.y});
});
test('driveAI preserves the ordinary fallback when no eligible third runner exists',async()=>{
 const {AI,ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});
 const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
 const carrier=game.player(0,3),primary=game.player(0,4);
 for(const p of game.players)if(p!==carrier&&p!==primary&&!p.keeper){
  p.down=true;p.stun=1;p.z=0;p.action='idle';p.actionTimer=0;
 }
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,cd:1,action:'idle',actionTimer:0,
  aiTimer:1,aiTarget:{x,y}});
 Object.assign(primary,{x:x+40,y:y-110,homeY:y-112,down:false,stun:0,z:0,action:'run',actionTimer:0});
 Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false});
 game.clock=5;
 const fieldBounds={xMin:field.x+24,xMax:field.x+field.w-24,yMin:field.y+24,yMax:field.y+field.h-24};
 const support=AI.attackingSupportRun(game.players,0,carrier,null,fieldBounds);
 assert.equal(support?.runner,primary);
 assert.equal(AI.attackingThirdManRun(game.players,0,carrier,support,null,fieldBounds),null);
 assert.doesNotThrow(()=>game.driveAI(carrier,.016));
});

test('driveAI offers the third-man run as a fallback support-pass/through-ball outlet',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 assert.match(source,/attackingThirdManRun\(this\.players,t,owner,supportRun/);
 assert.match(source,/attackingThroughBall\(this\.players,t,owner,thirdManRun\)/);
 assert.match(source,/attackingSupportPass\(this\.players,t,owner,thirdManRun\)/);
 assert.match(source,/thirdManRun\?\.runner===p/);
});
