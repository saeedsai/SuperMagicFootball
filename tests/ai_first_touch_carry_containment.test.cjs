'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const bounds={xMin:24,xMax:1976,yMin:24,yMax:1476};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,z:0,stun:0,down:false,
 moveVX:0,moveVY:0,face:t===0?1:-1,action:'idle',actionTimer:0,
 firstTouchControlTimer:0,firstTouchPressure:.8,firstTouchOutletReadTimer:.72,
 src:{id:name},...extra});
function scenario(team){
 const carrierTeam=1-team,dir=carrierTeam===0?1:-1,x=team===0?1500:500,y=700;
 const carrier=player('carrier-'+team,carrierTeam,x,y,{moveVX:dir*80,moveVY:18,face:dir,
  aiFirstTouchTarget:{x:1900,y:30,expires:999},aiFirstTouchOutletUntil:999,aiTarget:{x:20,y:20}});
 const primary=player('primary-'+team,team,x+dir*55,y-78);
 const support=player('support-'+team,team,x-dir*150,y+20);
 return {team,dir,carrier,primary,support,players:[carrier,primary,support]};
}
test('second CPU defender shades the visible first-touch carry lane on both goal sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const s=scenario(team),target=AI.defensiveFirstTouchCarryContainTarget(
   team,s.carrier,s.players,bounds,s.support,s.primary);
  assert.ok(target,JSON.stringify({team,target}));
  assert.ok(s.dir*(target.x-s.carrier.x)>34,JSON.stringify({team,target}));
  const gap=Math.hypot(target.x-s.carrier.x,target.y-s.carrier.y);
  assert.ok(gap>=56&&gap<=132,JSON.stringify({team,target,gap}));
  assert.ok(Math.hypot(target.x-s.primary.x,target.y-s.primary.y)>=42,JSON.stringify({team,target}));
  assert.ok(target.x>=bounds.xMin+22&&target.x<=bounds.xMax-22);
  assert.ok(target.y>=bounds.yMin+23&&target.y<=bounds.yMax-23);
 }
});
test('carry containment ignores private AI targets and follows only visible movement',async()=>{
 const {AI}=await loadModules(),s=scenario(1);
 const first=AI.defensiveFirstTouchCarryContainTarget(s.team,s.carrier,s.players,bounds,s.support,s.primary);
 s.carrier.aiFirstTouchTarget={x:24,y:1476,expires:-1};
 s.carrier.aiFirstTouchOutletUntil=-999;
 s.carrier.aiTarget={x:1976,y:24};
 const second=AI.defensiveFirstTouchCarryContainTarget(s.team,s.carrier,s.players,bounds,s.support,s.primary);
 assert.deepEqual(second,first);
 s.carrier.moveVX=-s.dir*80;s.carrier.moveVY=0;
 assert.equal(AI.defensiveFirstTouchCarryContainTarget(s.team,s.carrier,s.players,bounds,s.support,s.primary),null,
  'a backward carrier is not treated as a forward carry escape');
});
test('carry containment expires and yields to pressure, hidden-ball and first-touch state',async()=>{
 const {AI}=await loadModules(),s=scenario(0);
 const read=()=>AI.defensiveFirstTouchCarryContainTarget(s.team,s.carrier,s.players,bounds,s.support,s.primary);
 assert.ok(read());
 s.carrier.firstTouchOutletReadTimer=0;assert.equal(read(),null);
 s.carrier.firstTouchOutletReadTimer=.72;s.carrier.firstTouchControlTimer=.08;assert.equal(read(),null);
 s.carrier.firstTouchControlTimer=0;s.carrier.firstTouchPressure=.1;assert.equal(read(),null);
 s.carrier.firstTouchPressure=.8;s.carrier.hideBallTimer=.2;assert.equal(read(),null);
 s.carrier.hideBallTimer=0;s.carrier.z=24;assert.equal(read(),null);
});
test('carry containment never commandeers a human, unavailable or already committed defender',async()=>{
 const {AI}=await loadModules();
 for(const mode of ['human','down','stunned','airborne','slide','assist','give-and-go','first-touch','primary-down']){
  const s=scenario(1);
  if(mode==='down')s.support.down=true;
  if(mode==='stunned')s.support.stun=.2;
  if(mode==='airborne')s.support.z=35;
  if(mode==='slide'){s.support.action='slide';s.support.actionTimer=.2;}
  if(mode==='assist')s.support.aiAssistTarget={x:1,y:1,expires:1};
  if(mode==='give-and-go')s.support.aiGiveAndGoRun={receiverId:'existing'};
  if(mode==='first-touch')s.support.aiFirstTouchTarget={x:1,y:1,expires:1};
  if(mode==='primary-down')s.primary.down=true;
  assert.equal(AI.defensiveFirstTouchCarryContainTarget(s.team,s.carrier,s.players,bounds,
   s.support,s.primary,mode==='human'?s.support:null),null,mode);
 }
});
function prepareEngine(ENGINE,defendingTeam,withOutlet=false){
 const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1;
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';
 const field=ENGINE.WORLD.field,x=field.x+field.w*.52,y=field.y+field.h*.5;
 const carrier=game.player(attackingTeam,3),primary=game.player(defendingTeam,3),
  support=game.player(defendingTeam,4),runner=game.player(attackingTeam,4),
  passer=game.player(defendingTeam,2),intended=game.player(defendingTeam,5);
 const keep=new Set([carrier,primary,support,runner,passer,intended]);
 for(const q of game.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=0;q.z=0;}
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,face:dir,action:'idle',actionTimer:0,
  moveVX:dir*80,moveVY:18,aiTimer:0,aiTarget:null,aiAssistTarget:null,aiGiveAndGoRun:null,
  cd:0,trickCd:1});
 Object.assign(primary,{x:x+dir*55,y:y-78,down:false,stun:0,z:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
 Object.assign(support,{x:x-dir*150,y:y+20,down:false,stun:0,z:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});
 Object.assign(runner,{x:x+dir*300,y:y+160,down:!withOutlet,stun:0,z:0,action:'idle',
  actionTimer:0,moveVX:dir*24,moveVY:0,aiTimer:0,aiTarget:null});
 Object.assign(passer,{x:x+dir*240,y:y-300,down:true,stun:0,z:0});
 Object.assign(intended,{x:x-dir*200,y:y+300,down:true,stun:0,z:0});
 Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:defendingTeam,
  passTarget:intended.src.id,attacker:defendingTeam,lastTouchTeam:defendingTeam,
  x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});
 game.clock=10;game.take(carrier);
 Object.assign(carrier,{firstTouchControlTimer:0,firstTouchPressure:.8,firstTouchOutletReadTimer:.92,
  aiFirstTouchTarget:null,aiFirstTouchOutletUntil:game.clock+.92,moveVX:dir*80,moveVY:18,face:dir,aiTimer:0,aiTarget:null});
 return {game,carrier,primary,support,runner,field,dir,team:defendingTeam};
}
test('engine assigns carry containment when no safe outlet exists while primary keeps pressing',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const s=prepareEngine(ENGINE,team,false);
  const expected=AI.defensiveFirstTouchCarryContainTarget(team,s.carrier,s.game.players,
   {xMin:s.field.x+24,xMax:s.field.x+s.field.w-24,yMin:s.field.y+24,yMax:s.field.y+s.field.h-24},
   s.support,s.primary);
  assert.ok(expected,JSON.stringify({team,expected,pressure:s.carrier.firstTouchPressure}));
  s.game.driveAI(s.support,.016);s.game.driveAI(s.primary,.016);
  assert.ok(Math.hypot(s.support.aiTarget.x-expected.x,s.support.aiTarget.y-expected.y)<1,
   JSON.stringify({team,expected,actual:s.support.aiTarget}));
  assert.ok(Math.hypot(s.primary.aiTarget.x-s.carrier.x,s.primary.aiTarget.y-s.carrier.y)<80,
   'primary must continue pressing the carrier');
  assert.equal(s.game.ball.owner,s.carrier,'containment cannot change possession');
 }
});
test('an available safe outlet keeps the existing outlet-screen assignment ahead of carry containment',async()=>{
 const {AI,ENGINE}=await loadModules(),s=prepareEngine(ENGINE,0,true);
 const bounds={xMin:s.field.x+24,xMax:s.field.x+s.field.w-24,yMin:s.field.y+24,yMax:s.field.y+s.field.h-24};
 const outlet=AI.defensiveFirstTouchOutletCoverTarget(s.team,s.carrier,s.game.players,bounds,s.support,s.primary);
 assert.ok(outlet,JSON.stringify({outlet,runner:s.runner}));
 const contain=AI.defensiveFirstTouchCarryContainTarget(s.team,s.carrier,s.game.players,bounds,s.support,s.primary);
 assert.ok(contain,'the helper is independently bounded; engine priority must keep outlet cover first');
 s.game.driveAI(s.support,.016);
 assert.ok(Math.hypot(s.support.aiTarget.x-outlet.target.x,s.support.aiTarget.y-outlet.target.y)<1,
  JSON.stringify({outlet,contain,actual:s.support.aiTarget}));
});
