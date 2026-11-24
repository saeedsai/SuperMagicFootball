'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
function outfielder(id,t,x,y,extra={}){
 return {t,keeper:false,x,y,z:0,stun:0,down:false,action:'idle',actionTimer:0,
  slideTimer:0,moveVX:0,moveVY:0,shotImpactKnockdownPending:0,
  shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,src:{id},...extra};
}
function fixture(ENGINE,team){
 const field=ENGINE.WORLD.field,dir=team===0?1:-1;
 const keeper={t:team,keeper:true,x:dir===1?field.x+66:field.x+field.w-66,
  y:field.y+field.h/2,z:0,stun:0,down:false,action:'idle',actionTimer:0,
  diveCooldown:0,diveIntentCooldown:0,diveIntentPending:false,fatigue:.1,
  src:{id:'cross-keeper-'+team,gkSkill:55,gkDiving:65}};
 const ball={owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,
  pass:true,passTarget:'cross-receiver-'+team,x:keeper.x-dir*8,y:keeper.y+5,z:70,
  vx:-dir*30,vy:0,vz:-20,age:.25,canCollect:0,shot:null,strike:null,
  ordinaryShot:false,power:0,trail:[]};
 const receiver=outfielder(ball.passTarget,1-team,ball.x+dir*52,ball.y);
 return {field,dir,keeper,ball,receiver,players:[keeper,receiver]};
}
test('contested descending high crosses trigger a mirrored punch decision at keeper contact',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team);f.receiver.x=f.ball.x+f.dir*90;f.receiver.moveVX=-f.dir*300;
  const decision=AI.keeperHighCrossPunchDecision(f.keeper,f.ball,f.players);
  assert.ok(decision,JSON.stringify({team,decision}));
  assert.ok(decision.nearestGap<60);
  assert.ok(decision.pressure>0);
 }
});
test('clean crosses and unavailable attackers remain catchable rather than forcing a punch',async()=>{
 const {AI,ENGINE}=await loadModules(),f=fixture(ENGINE,0);
 assert.equal(AI.keeperHighCrossPunchDecision(f.keeper,f.ball,[f.keeper]),null);
 for(const patch of [{down:true},{stun:.2},{z:28},{action:'shotDown'},
  {action:'hurt',actionTimer:.3},{action:'slide',actionTimer:.3},{slideTimer:.2}]){
  const opponent={...f.receiver,...patch};
  assert.equal(AI.keeperHighCrossPunchDecision(f.keeper,f.ball,[f.keeper,opponent]),null,
   'unavailable challenger must not force a punch: '+Object.keys(patch).join(','));
 }
});
test('keeper skill and a second arriving attacker change the punch decision without overriding pressure safety',async()=>{
 const {AI,ENGINE}=await loadModules(),f=fixture(ENGINE,0);
 f.receiver.x=f.ball.x+68;f.keeper.src.gkSkill=100;
 assert.equal(AI.keeperHighCrossPunchDecision(f.keeper,f.ball,f.players),null);
 f.keeper.src.gkSkill=20;
 assert.ok(AI.keeperHighCrossPunchDecision(f.keeper,f.ball,f.players));
 f.keeper.src.gkSkill=100;f.receiver.x=f.ball.x+74;
 const second=outfielder('second-cross-attacker',1,f.ball.x+82,f.ball.y+8);
 assert.ok(AI.keeperHighCrossPunchDecision(f.keeper,f.ball,[...f.players,second]));
});
test('high-cross punch decision rejects shots, low passes, stale, owned, rising and unavailable keeper states',async()=>{
 const {AI,ENGINE}=await loadModules(),f=fixture(ENGINE,0);
 const invalid=[{owner:{t:0}},{pass:false},{passTeam:0},{attacker:0},{lastTouchTeam:0},
  {passTarget:null},{z:25},{vz:80},{vz:-400},{age:2.5},{canCollect:.2},
  {shot:{behavior:'normal'}},{strike:{kind:'normal'}},{ordinaryShot:true}];
 for(const patch of invalid)
  assert.equal(AI.keeperHighCrossPunchDecision(f.keeper,{...f.ball,...patch},f.players),null);
 for(const patch of [{down:true},{stun:.2},{z:28},{diveCooldown:.2},
  {diveIntentPending:true},{action:'keeperRecover'}])
  assert.equal(AI.keeperHighCrossPunchDecision({...f.keeper,...patch},f.ball,f.players),null);
});
test('an already-airborne opponent contests only when its projected body overlaps the descending cross',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team);
  Object.assign(f.receiver,{x:f.ball.x+f.dir*90,moveVX:-f.dir*300,z:55,vz:0,jumpCount:1,action:'jump'});
  const reachable=AI.keeperHighCrossPunchDecision(f.keeper,f.ball,f.players);
  assert.ok(reachable,JSON.stringify({team,reachable,receiver:f.receiver,ball:f.ball}));
  const above={...f.receiver,z:170,vz:-200};
  assert.equal(AI.keeperHighCrossPunchDecision(f.keeper,f.ball,[f.keeper,above]),null,
   'an airborne opponent above the cross must not force a punch');
  const notJumping={...f.receiver,jumpCount:0};
  assert.equal(AI.keeperHighCrossPunchDecision(f.keeper,f.ball,[f.keeper,notJumping]),null,
   'a raised but non-jumping player must not be treated as an aerial challenger');
 }
});
test('real engine punches a contested cross away from either goal and shows the punch response',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const field=ENGINE.WORLD.field,dir=team===0?1:-1;
  const keeper=game.player(team,0),receiver=game.player(1-team,3);
  for(const q of game.players)if(q!==keeper&&q!==receiver)Object.assign(q,{down:true,stun:1});
  const keeperX=dir===1?field.x+66:field.x+field.w-66,keeperY=field.y+field.h/2;
  Object.assign(keeper,{x:keeperX,y:keeperY,z:0,stun:0,down:false,action:'idle',
   actionTimer:0,diveCooldown:0,diveIntentCooldown:0,diveIntentPending:false,keeperPunchFx:0,fatigue:.1});
  keeper.src={...keeper.src,gkSkill:55,gkDiving:65};
  const ballX=keeper.x-dir*8,ballY=keeper.y+5;
  Object.assign(receiver,{x:ballX+dir*90,y:ballY,z:0,stun:0,down:false,action:'idle',
   actionTimer:0,slideTimer:0,moveVX:-dir*300,moveVY:0});
  Object.assign(game.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,
   pass:true,passTarget:receiver.src.id,x:ballX,y:ballY,z:70,vx:-dir*30,vy:0,vz:-20,
   age:.25,canCollect:0,shot:null,strike:null,ordinaryShot:false,power:0,trail:[]});
  game.updateBall(.016);
  const punches=game.events.filter(event=>event.type==='keeperPunch');
  assert.equal(punches.length,1,JSON.stringify({team,punches,ball:game.ball}));
  assert.equal(game.ball.owner,null);assert.equal(game.ball.pass,false);
  assert.equal(game.ball.lastTouchTeam,team);assert.equal(game.ball.attacker,team);
  assert.ok(dir*game.ball.vx>0);assert.ok(game.ball.vz>0);
  assert.equal(keeper.action,'keeperDive');assert.ok(keeper.keeperPunchFx>0);assert.ok(keeper.diveCooldown>0);
  assert.equal(game.events.some(event=>event.type==='keeperCatch'),false);
 }
});

test('a real contested-cross punch lets its keeper chase a safe descending rebound on both sides',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const game=new ENGINE.GameEngine({halfSeconds:120});
  game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
  const field=ENGINE.WORLD.field,dir=team===0?1:-1;
  const keeper=game.player(team,0),receiver=game.player(1-team,3);
  for(const q of game.players)if(q!==keeper&&q!==receiver)Object.assign(q,{down:true,stun:1});
  Object.assign(keeper,{x:dir===1?field.x+66:field.x+field.w-66,y:field.y+field.h/2,
   z:0,stun:0,down:false,action:'idle',actionTimer:0,diveCooldown:0,
   diveIntentCooldown:0,diveIntentPending:false,keeperPunchFx:0,fatigue:.1,
   aiTimer:0,aiTarget:null,aiParryReboundTarget:false});
  const ballX=keeper.x-dir*8,ballY=keeper.y+5;
  Object.assign(receiver,{x:ballX+dir*90,y:ballY,z:0,stun:0,down:false,
   action:'idle',actionTimer:0,slideTimer:0,moveVX:-dir*300,moveVY:0});
  Object.assign(game.ball,{owner:null,attacker:1-team,lastTouchTeam:1-team,passTeam:1-team,
   pass:true,passTarget:receiver.src.id,x:ballX,y:ballY,z:70,vx:-dir*30,vy:0,
   vz:-20,age:.25,canCollect:0,shot:null,strike:null,ordinaryShot:false,power:0,trail:[]});
  game.updateBall(.016);
  assert.equal(game.events.filter(event=>event.type==='keeperPunch').length,1);
  assert.equal(game.ball.attacker,team);assert.equal(game.ball.lastTouchTeam,team);
  Object.assign(receiver,{down:true,action:'shotDown',actionTimer:1,stun:0});
  Object.assign(keeper,{z:12,action:'keeperDive',actionTimer:.1,diveElapsed:.24,
   diveIntentPending:false,aiTimer:0,aiTarget:null,aiParryReboundTarget:false});
  Object.assign(game.ball,{owner:null,attacker:team,lastTouchTeam:team,
   x:keeper.x+dir*24,y:keeper.y+38,z:60,vx:dir*260,vy:30,vz:-110,
   shot:null,strike:null,ordinaryShot:false,pass:false,age:.6,canCollect:0});
  game.clock=.35;game.driveAI(keeper,.016);
  assert.equal(keeper.aiParryReboundTarget,true);
  assert.ok(keeper.aiTarget&&dir*(keeper.aiTarget.x-keeper.x)>0);
  assert.ok(dir*(keeper.moveVX||0)>0);
  game.take(game.player(team,3));
  assert.equal(keeper.aiParryReboundTarget,false);
  assert.equal(keeper.aiTarget,null);
 }
});
