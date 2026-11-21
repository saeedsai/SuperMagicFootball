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
test('carrier chooses the opposite diagonal when one side is occupied',async()=>{
 const {AI}=await loadModules(),carrier=player('carrier',0,700,500),upper=player('upper-marker',1,765,430);
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
function prepareCarrierGame(ENGINE,team){
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,humans:0,mode:'quick'});
 const carrier=game.player(team,3),marker=game.player(1-team,3),field=ENGINE.WORLD.field,dir=team===0?1:-1;
 const x=field.x+field.w*.5,y=field.y+field.h*.5;
 for(const q of game.players){if(q===carrier||q===marker)continue;q.down=true;q.stun=0;q.z=0;q.x=field.x+field.w*.15;q.y=field.y+field.h*.12+(q.i%3)*40;}
 Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiFirstTouchTarget:null,firstTouchControlTimer:0,cd:1,trickCd:1});
 Object.assign(marker,{x:x+dir*65,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:-dir*30,moveVY:0});
 game.ball.owner=carrier;game.ball.attacker=team;game.clock=1;return {game,carrier};
}
test('engine applies the escape as actual CPU carrier movement in both attack directions',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,carrier}=prepareCarrierGame(ENGINE,team),originalRandom=Math.random;
  try{Math.random=()=>.99;game.driveAI(carrier,.016);}finally{Math.random=originalRandom;}
  assert.ok(Math.abs(carrier.moveVY)>0,'CPU carry movement should turn into the open diagonal');
  assert.ok((team===0?1:-1)*(carrier.x-(ENGINE.WORLD.field.x+ENGINE.WORLD.field.w*.5))>=0,'carrier must not reverse');
 }
});
