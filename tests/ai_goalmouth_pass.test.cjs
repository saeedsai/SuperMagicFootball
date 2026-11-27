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

test('AI finds a safe central square-pass receiver ahead of the carrier in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier',team,team===0?620:380,300);
  const runner=player('runner',team,carrier.x+dir*160,300,{moveVX:dir*600,moveVY:200});
  const result=AI.attackingGoalmouthPass([carrier,runner],team,carrier,bounds);
  assert.equal(result?.runner,runner);
  assert.equal(result.target.x,runner.x+dir*24,'receiver lead is capped at 24 world units');
  assert.equal(result.target.y,runner.y+24,'lateral lead is also bounded');
 }
});

test('AI prefers a less-marked central receiver over a slightly closer but crowded option',async()=>{
 const {AI}=await loadModules();
 const carrier=player('carrier',0,620,300);
 const marked=player('marked',0,790,300);
 const open=player('open',0,770,250);
 const marker=player('marker',1,790,380);
 const result=AI.attackingGoalmouthPass([carrier,marked,open,marker],0,carrier,bounds);
 assert.equal(result?.runner,open);
});

test('blocked passing corridors, crowded pockets and non-forward options keep the normal fallback',async()=>{
 const {AI}=await loadModules();
 const carrier=player('carrier',0,620,300),runner=player('runner',0,790,300);
 const blocker=player('blocker',1,705,300);
 assert.equal(AI.attackingGoalmouthPass([carrier,runner,blocker],0,carrier,bounds),null);
 const pocketMarker=player('pocket-marker',1,runner.x+30,runner.y);
 assert.equal(AI.attackingGoalmouthPass([carrier,runner,pocketMarker],0,carrier,bounds),null);
 const near=player('near',0,carrier.x+40,300);
 assert.equal(AI.attackingGoalmouthPass([carrier,near],0,carrier,bounds),null);
});

test('downed, stunned, sliding, recovering, airborne and keeper receivers are never selected',async()=>{
 const {AI}=await loadModules();
 const carrier=player('carrier',0,620,300);
 const unavailable=[
  player('down',0,790,300,{down:true}),
  player('stunned',0,790,300,{stun:.2}),
  player('sliding',0,790,300,{slideTimer:.2,action:'slide',actionTimer:.2}),
  player('recovering',0,790,300,{shotImpactRiseTimer:.2}),
  player('airborne',0,790,300,{z:40}),
  player('keeper',0,790,300,{keeper:true})
 ];
 assert.equal(AI.attackingGoalmouthPass([carrier,...unavailable],0,carrier,bounds),null);
 assert.equal(AI.attackingGoalmouthPass([carrier,player('runner',0,790,300)],0,carrier,null),null);
});

test('goal-mouth pass arrival accounts for a defender turning into the receiving pocket',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier',team,team===0?620:380,300);
  const runner=player('runner',team,carrier.x+dir*170,300);
  const marker=player('marker',1-team,runner.x-dir*20,350,{
   moveVX:0,moveVY:200,dx:0,dy:-1,src:{agility:95}
  });
  assert.equal(AI.attackingGoalmouthPass([carrier,runner,marker],team,carrier,bounds),null,
   'a high-Agility marker turning into the pocket closes the square pass on team '+team);
  marker.src.agility=1;
  const result=AI.attackingGoalmouthPass([carrier,runner,marker],team,carrier,bounds);
  assert.equal(result?.runner,runner,
   'a low-Agility marker cannot complete the same turn and the safe outlet remains on team '+team);
 }
});

test('engine sends the selected goalmouth outlet as an ordinary low pass intent',async()=>{
 const {ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.players.find(p=>p.t===0&&p.i===3);
 const runner=game.players.find(p=>p.t===0&&p.i===4);
 const goalY=(ENGINE.WORLD.goalTop+ENGINE.WORLD.goalBottom)/2;
 const goalX=ENGINE.WORLD.field.x+ENGINE.WORLD.field.w;
 carrier.x=goalX-430;carrier.y=goalY;carrier.dx=1;carrier.dy=0;
 runner.x=goalX-220;runner.y=goalY+12;runner.moveVX=80;runner.moveVY=0;
 game.ball.owner=carrier;
 const target={x:runner.x+10,y:runner.y};
 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  assert.equal(game.pass(carrier,false,false,{
   preferredTarget:runner,supportRun:true,goalmouth:true,preferredPoint:target
  }),true);
 }finally{Math.random=originalRandom;}
 assert.equal(game.ball.passTarget,runner.src.id);
 assert.equal(game.events.at(-1)?.mode,'goalmouth');
 assert.equal(game.events.at(-1)?.loft,'goalmouth');
});

test('goal-mouth square pass leads a receiver through live Agility-limited turns in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier',team,team===0?620:380,300);
  const high=player('high-agility',team,carrier.x+dir*160,300,{
   moveVX:0,moveVY:340,dx:dir,dy:0,src:{agility:100}
  });
  const low=player('low-agility',team,carrier.x+dir*160,300,{
   moveVX:0,moveVY:340,dx:dir,dy:0,src:{agility:1}
  });
  const highResult=AI.attackingGoalmouthPass([carrier,high],team,carrier,bounds);
  const lowResult=AI.attackingGoalmouthPass([carrier,low],team,carrier,bounds);
  assert.equal(highResult?.runner,high,'high-Agility receiver remains eligible on team '+team);
  assert.equal(lowResult?.runner,low,'low-Agility receiver remains eligible on team '+team);
  const highForward=(highResult.target.x-high.x)*dir;
  const lowForward=(lowResult.target.x-low.x)*dir;
  assert.ok(highForward>lowForward+8,
   'high Agility bends the square-pass lead farther toward goal on team '+team);
  assert.ok(highForward<=24&&lowForward<=24,'the short per-axis lead cap remains on team '+team);
  assert.ok(highResult.target.y-high.y<lowResult.target.y-low.y,
   'lower Agility retains more cross-lane momentum on team '+team);
 }
});

test('neutral and incomplete goalmouth receiver movement retain the exact bounded linear lead',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier',team,team===0?620:380,300);
  const neutral=player('neutral',team,carrier.x+dir*160,300,{
   moveVX:0,moveVY:340,dx:0,dy:0
  });
  const neutralResult=AI.attackingGoalmouthPass([carrier,neutral],team,carrier,bounds);
  assert.deepEqual(neutralResult?.target,{x:neutral.x,y:neutral.y+24},
   'neutral steering preserves the previous linear lead on team '+team);
  const incomplete=player('incomplete',team,carrier.x+dir*160,300,{
   moveVX:NaN,moveVY:340,vx:dir*100,vy:0,dx:dir,dy:0
  });
  const incompleteResult=AI.attackingGoalmouthPass([carrier,incomplete],team,carrier,bounds);
  assert.deepEqual(incompleteResult?.target,{x:incomplete.x+dir*12,y:incomplete.y+24},
   'an incomplete movement vector retains the legacy velocity fallback on team '+team);
 }
});

test('goal-mouth passing prefers the receiver already facing goal in both directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier',team,team===0?620:380,300);
  const turned=player('turned',team,carrier.x+dir*160,300,{face:-dir});
  const open=player('open',team,carrier.x+dir*160,300,{face:dir});
  const result=AI.attackingGoalmouthPass([carrier,turned,open],team,carrier,bounds);
  assert.equal(result?.runner,open,'team '+team+' should prefer the receiver facing its attacking goal');
 }
});

test('forward momentum overrides stale receiver facing and a sole safe outlet is retained',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier',team,team===0?620:380,300);
  const runner=player('runner',team,carrier.x+dir*160,300,{face:-dir,moveVX:dir*180});
  assert.equal(AI.attackingGoalmouthPass([carrier,runner],team,carrier,bounds)?.runner,runner,
   'a genuine forward run should override stale horizontal facing');
  const sole=player('sole',team,carrier.x+dir*160,300,{face:-dir});
  assert.equal(AI.attackingGoalmouthPass([carrier,sole],team,carrier,bounds)?.runner,sole,
   'orientation is a tie-breaker, not a safety rejection');
 }
});
