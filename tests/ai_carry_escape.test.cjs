'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
const bounds={xMin:0,xMax:2000,yMin:0,yMax:1000};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,z:0,stun:0,down:false,moveVX:0,moveVY:0,action:'idle',actionTimer:0,src:{id:name},...extra});

test('CPU carrier takes a bounded safer forward diagonal under front pressure on both sides',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('carrier-'+team,team,team===0?700:1300,500);
  const marker=player('marker-'+team,1-team,carrier.x+dir*65,carrier.y,{moveVX:-dir*30});
  const target=AI.attackingCarryEscapeTarget([carrier,marker],team,carrier,bounds);
  assert.ok(target,JSON.stringify({team,target}));assert.ok(dir*(target.x-carrier.x)>=44);
  assert.ok(Math.abs(target.y-carrier.y)>=34);assert.ok(target.x>=24&&target.x<=1976);
  assert.ok(target.y>=24&&target.y<=976);
 }
});
test('Dribbling skill shapes the carry escape cut while neutral and invalid stats preserve the baseline',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,x=team===0?700:1300,y=500;
  const make=(name,dribbling)=>player(name,team,x,y,{src:dribbling===undefined?{id:name}:{id:name,dribbling}});
  const targetFor=dribbling=>{
   const carrier=make('carrier-'+team+'-'+String(dribbling),dribbling);
   const marker=player('marker-'+team,1-team,x+dir*65,y);
   return {carrier,target:AI.attackingCarryEscapeTarget([carrier,marker],team,carrier,bounds)};
  };
  const fallback=targetFor(undefined),neutral=targetFor(50),low=targetFor(1),high=targetFor(100),invalid=targetFor('elite');
  for(const row of [fallback,neutral,low,high,invalid])assert.ok(row.target,JSON.stringify({team,row}));
  assert.deepEqual(neutral.target,fallback.target,'missing Dribbling must retain neutral route geometry');
  assert.deepEqual(invalid.target,fallback.target,'invalid Dribbling must fail safely to neutral geometry');
  const lowForward=dir*(low.target.x-low.carrier.x),highForward=dir*(high.target.x-high.carrier.x);
  const lowLateral=Math.abs(low.target.y-low.carrier.y),highLateral=Math.abs(high.target.y-high.carrier.y);
  assert.ok(lowForward>highForward,'low Dribbling should keep the more forward escape');
  assert.ok(highLateral>lowLateral+20,'high Dribbling should execute a sharper lateral cut');
  assert.ok(lowForward>=44&&highForward>=44,'both routes must continue toward the attacking goal');
  assert.ok(lowLateral>=34&&highLateral<=100,'skill-scaled cuts must remain bounded');
 }
});
test('when both diagonals are safe, carrier momentum breaks the tie without changing attack direction',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1;
  const carrier=player('carrier-'+team,team,team===0?700:1300,500,{moveVX:dir*60,moveVY:240});
  const marker=player('marker-'+team,1-team,carrier.x+dir*65,carrier.y,{moveVX:-dir*30});
  const target=AI.attackingCarryEscapeTarget([carrier,marker],team,carrier,bounds);
  assert.ok(target,JSON.stringify({team,target}));
  assert.ok(target.y>carrier.y,'the safer lower diagonal preserves current lateral momentum');
  assert.ok(dir*(target.x-carrier.x)>=44,'momentum must not reverse the attack');
 }
});
test('carrier chooses the opposite diagonal when one side is occupied',async()=>{
 const {AI}=await loadModules(),carrier=player('carrier',0,700,500,{moveVY:-240}),upper=player('upper-marker',1,765,430);
 const target=AI.attackingCarryEscapeTarget([carrier,upper],0,carrier,bounds);
 assert.ok(target);assert.ok(target.y>carrier.y);
});
test('carrier avoids a crowded teammate lane when the other diagonal is free',async()=>{
 const {AI}=await loadModules(),carrier=player('carrier',0,700,500),marker=player('marker',1,765,500);
 const teammate=player('teammate',0,778,414),target=AI.attackingCarryEscapeTarget([carrier,marker,teammate],0,carrier,bounds);
 assert.ok(target);assert.ok(target.y>carrier.y);
});
test('open space, rear pressure, blocked diagonals, unavailable defenders and first touch do not trigger escape',async()=>{
 const {AI}=await loadModules(),carrier=player('carrier',0,700,500);
 assert.equal(AI.attackingCarryEscapeTarget([carrier],0,carrier,bounds),null);
 assert.equal(AI.attackingCarryEscapeTarget([carrier,player('behind',1,620,500)],0,carrier,bounds),null);
 const upper=player('upper',1,765,430),lower=player('lower',1,765,570);
 assert.equal(AI.attackingCarryEscapeTarget([carrier,upper,lower],0,carrier,bounds),null);
 for(const inactive of [player('down',1,765,500,{down:true}),player('stunned',1,765,500,{stun:.2}),
  player('airborne',1,765,500,{z:45}),player('recovering',1,765,500,{shotImpactRiseTimer:.2}),
  player('knocked',1,765,500,{shotImpactKnockdownTimer:.2}),player('keeper',1,765,500,{keeper:true})])
  assert.equal(AI.attackingCarryEscapeTarget([carrier,inactive],0,carrier,bounds),null,inactive.name);
 carrier.firstTouchControlTimer=.24;
 assert.equal(AI.attackingCarryEscapeTarget([carrier,player('first-touch-marker',1,765,500)],0,carrier,bounds),null);
});
test('CPU carrier sidesteps an active incoming SHOOT slide on both sides and chooses the open diagonal',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const dir=team===0?1:-1,carrier=player('slide-carrier-'+team,team,team===0?700:1300,500);
  const straight=player('straight-slide-'+team,1-team,carrier.x-dir*80,carrier.y,{
   action:'slide',actionTimer:.36,slideTimer:.24,slideRemaining:148,slideSpeed:585,
   slideDX:dir,slideDY:0,moveVX:dir*585
  });
  const target=AI.attackingCarryEscapeTarget([carrier,straight],team,carrier,bounds);
  assert.ok(target,JSON.stringify({team,target}));
  assert.ok(Math.abs(target.y-carrier.y)>=34,'the carrier should leave the straight slide lane');
  const diagonal=player('diagonal-slide-'+team,1-team,carrier.x-dir*80,carrier.y-80,{
   action:'slide',actionTimer:.36,slideTimer:.24,slideRemaining:148,slideSpeed:585,
   slideDX:dir*Math.SQRT1_2,slideDY:Math.SQRT1_2,moveVX:dir*Math.SQRT1_2*585,moveVY:Math.SQRT1_2*585
  });
  const openSide=AI.attackingCarryEscapeTarget([carrier,diagonal],team,carrier,bounds);
  assert.ok(openSide,JSON.stringify({team,openSide}));
  assert.ok(openSide.y<carrier.y,'a slide arriving from the upper lane must be avoided through the upper open diagonal');
 }
});
test('expired, receding, too-short and out-of-lane slides do not trigger a carry escape',async()=>{
 const {AI}=await loadModules(),carrier=player('carrier',0,700,500);
 const base={action:'slide',actionTimer:.36,slideTimer:.24,slideRemaining:148,slideSpeed:585,slideDX:1,slideDY:0};
 for(const [name,extra] of [
  ['expired',{actionTimer:0,slideTimer:0}],
  ['receding',{slideDX:-1}],
  ['too-short',{slideRemaining:12}],
  ['out-of-lane',{y:630}]
 ]){
  const marker=player(name,1,620,name==='out-of-lane'?630:500,{...base,...extra});
  assert.equal(AI.attackingCarryEscapeTarget([carrier,marker],0,carrier,bounds),null,name);
 }
});
function prepareCarrierGame(ENGINE,team){
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
 const carrier=game.player(team,3),marker=game.player(1-team,3),field=ENGINE.WORLD.field,dir=team===0?1:-1;
 const x=field.x+field.w*.5,y=field.y+field.h*.5;
 for(const q of game.players){if(q===carrier||q===marker)continue;q.down=true;q.stun=0;q.z=0;q.x=field.x+field.w*.15;q.y=field.y+field.h*.12+(q.i%3)*40;}
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:dir*60,moveVY:240,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,firstTouchControlTimer:0,cd:1,trickCd:1});
 Object.assign(marker,{x:x+dir*65,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:-dir*30,moveVY:0});
 game.ball.owner=carrier;game.ball.attacker=team;game.clock=1;return {game,carrier};
}
test('engine applies the escape as actual CPU carrier movement in both attack directions',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,carrier}=prepareCarrierGame(ENGINE,team),originalRandom=Math.random;
  try{Math.random=()=>.99;game.driveAI(carrier,.016);}finally{Math.random=originalRandom;}
  assert.ok(carrier.moveVY>0&&carrier.dy>0,'CPU carry movement should preserve the selected lower diagonal');
  assert.ok((team===0?1:-1)*(carrier.x-(ENGINE.WORLD.field.x+ENGINE.WORLD.field.w*.5))>=0,'carrier must not reverse');
 }
});
test('pressured CPU carrier retains possession and uses its safe escape when every validated outlet is closed',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,carrier}=prepareCarrierGame(ENGINE,team),marker=game.player(1-team,3);
  const dir=team===0?1:-1,x=carrier.x,y=carrier.y;
  Object.assign(carrier,{moveVX:0,moveVY:0,cd:0,trickCd:1,aiTimer:0,aiTarget:null,
   action:'run',firstTouchControlTimer:0});
  Object.assign(carrier.src,{dribbling:75});
  Object.assign(marker,{x:x+dir*65,y,down:false,stun:0,z:0,action:'idle',
   actionTimer:0,moveVX:-dir*30,moveVY:0});
  game.ball.owner=carrier;game.ball.attacker=team;game.clock=1;
  let passAttempts=0;
  const originalPass=game.pass,originalRandom=Math.random;
  game.pass=function(...args){passAttempts++;return originalPass.apply(this,args);};
  try{Math.random=()=>0;game.driveAI(carrier,.016);}
  finally{Math.random=originalRandom;game.pass=originalPass;}
  assert.equal(passAttempts,0,'no speculative PASS should be attempted when all validated outlets are closed');
  assert.equal(game.ball.owner,carrier,'the carrier must retain the live ball');
  assert.ok(dir*carrier.dx>0,'the escape must continue toward the attacking goal');
  assert.ok(Math.abs(carrier.dy)>.1,'the carrier must actually cut into the safer diagonal');
 }
});
test('engine carrier movement evades a live incoming slide in both attack directions',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,carrier}=prepareCarrierGame(ENGINE,team),marker=game.player(1-team,3),dir=team===0?1:-1;
  const x=carrier.x,y=carrier.y,originalRandom=Math.random;
  Object.assign(marker,{x:x-dir*80,y,down:false,stun:0,z:0,action:'slide',actionTimer:.36,
   slideTimer:.24,slideRemaining:148,slideSpeed:585,slideDX:dir,slideDY:0,moveVX:dir*585,moveVY:0});
  try{
   Math.random=()=>.99;
   for(let step=0;step<36;step++){carrier.x=x;carrier.y=y;game.clock=1+step*.016;game.driveAI(carrier,.016);}
  }finally{Math.random=originalRandom;}
  assert.ok(Math.abs(carrier.dy)>.3,'actual driveAI movement must leave the incoming slide lane');
 }
});
