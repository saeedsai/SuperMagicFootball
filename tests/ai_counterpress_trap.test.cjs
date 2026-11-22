'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const bounds={xMin:0,xMax:2000,yMin:0,yMax:1000};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,z:0,stun:0,down:false,
 moveVX:0,moveVY:0,action:'idle',actionTimer:0,src:{id:name},...extra});
function helperScenario(carrierTeam){
 const defendingTeam=1-carrierTeam,dir=carrierTeam===0?1:-1;
 const carrier=player('carrier-'+carrierTeam,carrierTeam,carrierTeam===0?700:1300,500,{moveVX:dir*80});
 const primary=player('primary-'+carrierTeam,defendingTeam,carrier.x-dir*65,carrier.y);
 const support=player('support-'+carrierTeam,defendingTeam,carrier.x-dir*120,carrier.y+70);
 return {defendingTeam,dir,carrier,primary,support,players:[carrier,primary,support]};
}
test('fresh turnover sends the second defender ahead of the carrier to close the forward outlet on both sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const s=helperScenario(team);
  const target=AI.defensiveCounterpressTrapTarget(s.defendingTeam,s.carrier,s.players,bounds,
   s.primary,s.support,.28);
  assert.ok(target,JSON.stringify({team,target}));
  assert.ok(s.dir*(target.x-s.carrier.x)>=52,'target must block the carrier attack lane');
  assert.ok(Math.abs(target.y-s.carrier.y)>=20,'support shades a side of the forward lane');
  assert.ok(target.x>=24&&target.x<=1976&&target.y>=24&&target.y<=976);
 }
});
test('counterpress is short-lived and rejects remote, unavailable or human-owned defenders',async()=>{
 const {AI}=await loadModules(),s=helperScenario(1);
 const args=[s.defendingTeam,s.carrier,s.players,bounds,s.primary,s.support];
 for(const age of [-.01,.721,NaN,Infinity])assert.equal(AI.defensiveCounterpressTrapTarget(...args,age),null);
 const farPrimary=player('far-primary',s.defendingTeam,s.carrier.x+500,s.carrier.y);
 assert.equal(AI.defensiveCounterpressTrapTarget(s.defendingTeam,s.carrier,
  [s.carrier,farPrimary,s.support],bounds,farPrimary,s.support,.2),null);
 const farSupport=player('far-support',s.defendingTeam,s.carrier.x+500,s.carrier.y);
 assert.equal(AI.defensiveCounterpressTrapTarget(s.defendingTeam,s.carrier,
  [s.carrier,s.primary,farSupport],bounds,s.primary,farSupport,.2),null);
 s.support.down=true;
 assert.equal(AI.defensiveCounterpressTrapTarget(...args,.2),null);
 s.support.down=false;
 assert.equal(AI.defensiveCounterpressTrapTarget(s.defendingTeam,s.carrier,s.players,bounds,
  s.primary,s.support,.2,s.support),null);
});
function prepareGame(ENGINE,carrierTeam){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,humans:0,mode:'quick'});
 const defendingTeam=1-carrierTeam,dir=carrierTeam===0?1:-1;
 const carrier=game.player(carrierTeam,3),primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4);
 const field=ENGINE.WORLD.field,x=field.x+field.w*.5,y=field.y+field.h*.5;
 for(const q of game.players)if(q!==carrier&&q!==primary&&q!==support){q.down=true;q.stun=0;q.z=0;}
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'run',actionTimer:0,
  moveVX:dir*80,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,
  firstTouchControlTimer:0,cd:1,trickCd:1});
 Object.assign(primary,{x:x-dir*65,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
 Object.assign(support,{x:x-dir*120,y:y+70,down:false,stun:0,z:0,action:'idle',actionTimer:0,
  moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
 game.ball.owner=null;game.ball.lastTouchTeam=defendingTeam;game.ball.passTeam=null;
 game.ball.pass=false;game.ball.passTarget=null;game.ball.age=0;game.clock=10;
 game.take(carrier);
 return {game,carrier,primary,support,defendingTeam,dir,field};
}
test('real engine support uses a turnover trap, preserves its original expiry across a teammate pass, then returns to ordinary cover',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const s=prepareGame(ENGINE,team);
  s.game.driveAI(s.support,.016);
  assert.ok(s.support.aiTarget,JSON.stringify({team,target:s.support.aiTarget}));
  assert.ok(s.dir*(s.support.aiTarget.x-s.carrier.x)>50,'support should initially block forward outlet');
  assert.ok(Math.abs(s.support.aiTarget.y-s.carrier.y)<70,'counterpress lane should be tighter than ordinary cover');
  const freshTarget={...s.support.aiTarget};
  const started=s.game._turnoverCounterpress?.started,until=s.game._turnoverCounterpress?.until;
  assert.equal(started,10);assert.equal(until,10.72);
  const receiver=s.game.player(team,4);
  Object.assign(receiver,{down:false,stun:0,z:0,x:s.carrier.x+s.dir*45,y:s.carrier.y+20,
   action:'idle',actionTimer:0,moveVX:s.dir*35,moveVY:0});
  s.game.ball.owner=null;s.game.ball.pass=true;s.game.ball.passTeam=team;
  s.game.ball.passFrom=s.carrier.src.id;s.game.ball.passTarget=receiver.src.id;
  s.game.ball.lastTouchTeam=team;s.game.clock=10.2;s.game.take(receiver);
  assert.equal(s.game._turnoverCounterpress.started,started,'same-team reception must not renew the window');
  assert.equal(s.game._turnoverCounterpress.until,until);
  receiver.firstTouchControlTimer=0;receiver.firstTouchPressure=0;receiver.aiFirstTouchTarget=null;
  s.game.clock=10.8;s.game.driveAI(s.support,.016);
  assert.ok(s.game.clock>s.game._turnoverCounterpress.until);
  assert.ok(Math.hypot(s.support.aiTarget.x-freshTarget.x,s.support.aiTarget.y-freshTarget.y)>18,
   'expired, non-renewed trap must yield to ordinary defensive cover');
 }
});
test('same-team possession and set-piece restarts do not create a counterpress trap',async()=>{
 const {ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
 const field=ENGINE.WORLD.field,carrier=game.player(1,3),primary=game.player(0,3),support=game.player(0,4);
 const x=field.x+field.w*.5,y=field.y+field.h*.5;
 for(const q of game.players)if(q!==carrier&&q!==primary&&q!==support){q.down=true;q.stun=0;q.z=0;}
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'run',actionTimer:0,moveVX:-80,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
 Object.assign(primary,{x:x+65,y,down:false,stun:0,z:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
 Object.assign(support,{x:x+120,y:y+70,down:false,stun:0,z:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
 game.ball.owner=null;game.ball.lastTouchTeam=1;game.ball.passTeam=null;game.clock=5;game.take(carrier);
 game.driveAI(support,.016);
 assert.ok(Math.abs(support.aiTarget.y-carrier.y)>70,'same-team possession must keep ordinary cover');
 game.ball.owner=null;game.ball.lastTouchTeam=0;game.clock=6;game.take(carrier);
 game.driveAI(support,.016);
 assert.ok(Math.abs(support.aiTarget.y-carrier.y)<70,'opponent possession change should activate the short trap');
 assert.equal(game.startFreeKick(0,field.x+200,field.y+200),true);
 const restartCarrier=game.ball.owner,restartPrimary=game.player(1,3),restartSupport=game.player(1,4);
 for(const q of game.players)if(q!==restartCarrier&&q!==restartPrimary&&q!==restartSupport){q.down=true;q.stun=0;q.z=0;}
 Object.assign(restartPrimary,{x:restartCarrier.x-65,y:restartCarrier.y,down:false,stun:0,z:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
 Object.assign(restartSupport,{x:restartCarrier.x-120,y:restartCarrier.y+70,down:false,stun:0,z:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,cd:1});
 game.driveAI(restartSupport,.016);
 assert.ok(Math.abs(restartSupport.aiTarget.y-restartCarrier.y)>70,'set-piece restart must clear the previous turnover window');
});
