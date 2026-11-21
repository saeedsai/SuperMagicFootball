'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();
 const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);
 return {AI,ENGINE};
}
function player(name,t,x,y,extra={}){
 return {name,t,keeper:false,x,y,z:0,stun:0,down:false,invuln:0,cd:0,
  moveVX:0,moveVY:0,dx:0,dy:0,face:t===0?1:-1,action:'run',actionTimer:0,
  firstTouchControlTimer:.20,firstTouchPressure:.85,src:{id:name},...extra};
}
function setup(team){
 const carrierTeam=1-team,attackDir=carrierTeam===0?1:-1;
 const carrier=player('receiver-'+team,carrierTeam,500,300,{moveVX:attackDir*160,moveVY:0,face:attackDir,action:'receive'});
 const defender=player('presser-'+team,team,500-attackDir*86,300,{moveVX:attackDir*300,moveVY:0,dx:attackDir,dy:0,face:attackDir});
 return {carrier,defender,attackDir};
}
test('first-touch run-up slide read mirrors both attacking directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const {carrier,defender}=setup(team);
  assert.equal(AI.defensiveFirstTouchSlide(defender,carrier,280),true,JSON.stringify({team,carrier,defender}));
 }
});
test('first-touch run-up slide rejects expired, weak, airborne or protected receivers',async()=>{
 const {AI}=await loadModules();
 const {carrier,defender}=setup(0);
 assert.equal(AI.defensiveFirstTouchSlide(defender,carrier,280),true);
 for(const patch of [
  {firstTouchControlTimer:0},{firstTouchControlTimer:.04},{firstTouchControlTimer:.3},
  {firstTouchPressure:.2},{z:24},{down:true},{stun:.1},{invuln:.2},
  {action:'slide',actionTimer:.2},{action:'hurt',actionTimer:.2}
 ]){
  const sample={...carrier,...patch};
  assert.equal(AI.defensiveFirstTouchSlide(defender,sample,280),false,JSON.stringify(patch));
 }
});
test('first-touch run-up slide requires a fast closing defender in the 74–98 unit window',async()=>{
 const {AI}=await loadModules();
 const {carrier,defender}=setup(0);
 assert.equal(AI.defensiveFirstTouchSlide(defender,carrier,280),true);
 assert.equal(AI.defensiveFirstTouchSlide({...defender,moveVX:0,moveVY:0},carrier,280),false);
 assert.equal(AI.defensiveFirstTouchSlide({...defender,moveVX:300},carrier,280),false);
 assert.equal(AI.defensiveFirstTouchSlide({...defender,x:carrier.x-70},carrier,280),false);
 assert.equal(AI.defensiveFirstTouchSlide({...defender,x:carrier.x-102},carrier,280),false);
 assert.equal(AI.defensiveFirstTouchSlide({...defender,moveVX:300,moveVY:220},carrier,280),false);
});
function prepareGame(ENGINE,team,firstTouch=true,runUp=true){
 const carrierTeam=1-team,attackDir=carrierTeam===0?1:-1;
 const game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.player(carrierTeam,3),primary=game.player(team,3),field=ENGINE.WORLD.field;
 const x=field.x+field.w*.52,y=field.y+field.h*.5;
 for(const q of game.players)if(q!==carrier&&q!==primary&&!q.keeper){q.down=true;q.stun=1;q.invuln=1.1;q.z=0;}
 Object.assign(carrier,{x,y,face:attackDir,down:false,stun:0,invuln:0,z:0,action:'receive',actionTimer:.2,
  moveVX:attackDir*160,moveVY:0,firstTouchControlTimer:firstTouch ? .20 : 0,firstTouchPressure:firstTouch ? .9 : 0});
 Object.assign(primary,{x:x-attackDir*86,y,down:false,stun:0,invuln:0,z:0,cd:0,
  action:'run',actionTimer:0,moveVX:runUp?attackDir*300:0,moveVY:0,dx:attackDir,dy:0,face:attackDir,
  aiTimer:0,aiTarget:null,aiAssistTarget:null});
 Object.assign(game.ball,{owner:carrier,x,y,z:0,vx:0,vy:0,vz:0,pass:false});
 game.clock=.1;
 return {game,carrier,primary,attackDir};
}
test('engine starts the existing SHOOT slide on a qualified long first-touch read',async()=>{
 const {ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,primary,attackDir}=prepareGame(ENGINE,team);
  const original=Math.random;let started=false;
  try{Math.random=()=>0;game.driveAI(primary,.016);started=primary.action==='slide'&&primary.slideTimer>0;}
  finally{Math.random=original;}
  assert.equal(started,true,JSON.stringify({team,action:primary.action,slideTimer:primary.slideTimer,cd:primary.cd}));
  assert.ok(primary.slideRemaining>0);
  assert.equal(Math.sign(primary.slideDX),attackDir);
 }
});
test('engine does not early-slide without a live first-touch window or a run-up',async()=>{
 const {ENGINE}=await loadModules();
 for(const scenario of [{firstTouch:false,runUp:true},{firstTouch:true,runUp:false}]){
  const {game,primary}=prepareGame(ENGINE,0,scenario.firstTouch,scenario.runUp);
  const original=Math.random;
  try{Math.random=()=>0;game.driveAI(primary,.016);}
  finally{Math.random=original;}
  assert.notEqual(primary.action,'slide',JSON.stringify(scenario));
  assert.equal(primary.cd,0,JSON.stringify(scenario));
 }
});
