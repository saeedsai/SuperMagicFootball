'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
async function loadModules(){const {loadAssetsFromNode}=await import('../src/assets.js');await loadAssetsFromNode();const [{AI},{ENGINE}]=await Promise.all([import('../src/modules/ai.js'),import('../src/modules/engine.js')]);return {AI,ENGINE};}
const bounds={xMin:24,xMax:1976,yMin:24,yMax:1476};
const player=(name,t,x,y,extra={})=>({name,t,keeper:false,x,y,z:0,stun:0,down:false,moveVX:0,moveVY:0,action:'idle',actionTimer:0,firstTouchControlTimer:0,firstTouchPressure:.8,firstTouchOutletReadTimer:.68,src:{id:name},...extra});
function makeRead(team){const attackingTeam=1-team,dir=attackingTeam===0?1:-1,carrier=player('carrier-'+team,attackingTeam,team===0?1500:500,700,{aiFirstTouchTarget:{x:999,y:111,expires:99},aiFirstTouchOutletUntil:0}),primary=player('primary-'+team,team,carrier.x+dir*55,carrier.y-78),support=player('support-'+team,team,carrier.x-dir*150,carrier.y+20),runner=player('runner-'+team,attackingTeam,carrier.x+dir*300,carrier.y+160,{moveVX:dir*24});return {carrier,primary,support,runner,players:[carrier,primary,support,runner],team,dir};}
test('second CPU defender shades a visible forward outlet lane on both goal sides',async()=>{const {AI}=await loadModules();for(const team of [0,1]){const f=makeRead(team),read=AI.defensiveFirstTouchOutletCoverTarget(team,f.carrier,f.players,bounds,f.support,f.primary);assert.ok(read,JSON.stringify({team,read}));assert.equal(read.runner,f.runner);const dx=f.runner.x-f.carrier.x,dy=f.runner.y-f.carrier.y,progress=((read.target.x-f.carrier.x)*dx+(read.target.y-f.carrier.y)*dy)/(dx*dx+dy*dy);assert.ok(progress>.35&&progress<.8,JSON.stringify({team,read,progress}));assert.ok(read.target.x>=bounds.xMin+22&&read.target.x<=bounds.xMax-22);assert.ok(read.target.y>=bounds.yMin+23&&read.target.y<=bounds.yMax-23);}});
test('outlet cover infers from visible players and ignores private AI outlet intent',async()=>{const {AI}=await loadModules(),f=makeRead(1),first=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);f.carrier.aiFirstTouchTarget={x:100,y:1400,expires:999};f.carrier.aiFirstTouchOutletUntil=0;const second=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);assert.ok(first&&second);assert.equal(first.runner,second.runner);assert.deepEqual(second.target,first.target);f.carrier.aiFirstTouchOutletUntil=999999;f.carrier.aiFirstTouchTarget={x:1900,y:30,expires:999999};const third=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);assert.deepEqual(third.target,first.target);});
test('outlet cover yields when the read window is inactive, the receiver is unavailable or already marked',async()=>{const {AI}=await loadModules(),f=makeRead(0),read=()=>AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);assert.ok(read());f.carrier.firstTouchControlTimer=.12;assert.equal(read(),null);f.carrier.firstTouchControlTimer=0;f.carrier.firstTouchOutletReadTimer=0;assert.equal(read(),null);f.carrier.firstTouchOutletReadTimer=.68;f.carrier.firstTouchPressure=.1;assert.equal(read(),null);f.carrier.firstTouchPressure=.8;f.runner.down=true;assert.equal(read(),null);f.runner.down=false;f.runner.x=f.carrier.x-f.dir*260;assert.equal(read(),null);f.runner.x=f.carrier.x+f.dir*300;f.players.push(player('already-covering',f.team,f.runner.x,f.runner.y));assert.equal(read(),null);});
test('outlet cover yields to a human, unavailable or already committed second defender',async()=>{const {AI}=await loadModules();for(const mode of ['human','down','stunned','airborne','assist','give-and-go','first-touch']){const f=makeRead(1);if(mode==='down')f.support.down=true;if(mode==='stunned')f.support.stun=.2;if(mode==='airborne')f.support.z=35;if(mode==='assist')f.support.aiAssistTarget={x:1,y:1,expires:1};if(mode==='give-and-go')f.support.aiGiveAndGoRun={receiverId:'existing'};if(mode==='first-touch')f.support.aiFirstTouchTarget={x:1,y:1,expires:1};assert.equal(AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary,mode==='human'?f.support:null),null,mode);}});
function prepareEngine(ENGINE,defendingTeam){const attackingTeam=1-defendingTeam,dir=attackingTeam===0?1:-1,game=new ENGINE.GameEngine({halfSeconds:120});game.init({home:0,away:1,mode:'quick',humans:0});game.weather='Clear';const field=ENGINE.WORLD.field,x=field.x+field.w*.52,y=field.y+field.h*.5,carrier=game.player(attackingTeam,3),runner=game.player(attackingTeam,4),primary=game.player(defendingTeam,3),support=game.player(defendingTeam,4),passer=game.player(defendingTeam,2),intended=game.player(defendingTeam,5),keep=new Set([carrier,runner,primary,support,passer,intended]);for(const q of game.players)if(!keep.has(q)&&!q.keeper){q.down=true;q.stun=0;q.z=0;}Object.assign(carrier,{x,y,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null});Object.assign(runner,{x:x+dir*300,y:y+160,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:dir*24,moveVY:0,aiTimer:0,aiTarget:null});Object.assign(primary,{x:x+dir*55,y:y-78,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});Object.assign(support,{x:x-dir*150,y:y+20,down:false,stun:0,z:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0,aiTimer:0,aiTarget:null,aiAssistTarget:null,cd:1});Object.assign(passer,{x:x-dir*300,y:y-300,down:true,stun:0,z:0});Object.assign(intended,{x:x-dir*200,y:y+300,down:true,stun:0,z:0});Object.assign(game.ball,{owner:null,pass:true,passFrom:passer.src.id,passTeam:defendingTeam,passTarget:intended.src.id,attacker:defendingTeam,lastTouchTeam:defendingTeam,x,y,z:8,vx:-dir*600,vy:0,vz:0,age:.18,canCollect:0,shot:null,strike:null,ordinaryShot:false});game.clock=10;game.take(carrier);return {game,carrier,runner,primary,support,field,team:defendingTeam};}
test('engine assigns the second defender to the inferred outlet lane after the settling touch while primary keeps pressing',async()=>{const {AI,ENGINE}=await loadModules();for(const team of [0,1]){const f=prepareEngine(ENGINE,team);assert.equal(f.carrier.firstTouchControlTimer,f.carrier.firstTouchControlDuration);assert.ok(f.carrier.firstTouchControlDuration>=.18&&f.carrier.firstTouchControlDuration<=.30);assert.ok(f.carrier.firstTouchOutletReadTimer>0,'a CPU interception publishes a bounded first-touch read window');f.carrier.firstTouchControlTimer=0;const expected=AI.defensiveFirstTouchOutletCoverTarget(team,f.carrier,f.game.players,{xMin:f.field.x+24,xMax:f.field.x+f.field.w-24,yMin:f.field.y+24,yMax:f.field.y+f.field.h-24},f.support,f.primary);assert.ok(expected,JSON.stringify({team,carrier:f.carrier.firstTouchPressure,read:f.carrier.firstTouchOutletReadTimer}));f.game.driveAI(f.support,.016);f.game.driveAI(f.primary,.016);assert.ok(Math.abs(f.support.aiTarget.x-expected.target.x)<1,JSON.stringify({team,expected,actual:f.support.aiTarget}));assert.ok(Math.abs(f.support.aiTarget.y-expected.target.y)<1,JSON.stringify({team,expected,actual:f.support.aiTarget}));assert.ok(Math.hypot(f.primary.aiTarget.x-f.carrier.x,f.primary.aiTarget.y-f.carrier.y)<80,'primary defender must remain on the live carrier');assert.equal(f.game.ball.owner,f.carrier,'cover assignment must not alter possession');}});


test('second-defender outlet cover matches the exact support-PASS receiver lead on both attack directions',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=makeRead(team);
  f.primary.y=f.carrier.y-160;
  f.runner.moveVX=f.dir*220;f.runner.moveVY=-140;f.runner.dx=f.dir;f.runner.dy=-.5;
  const pass=AI.attackingFirstTouchOutlet(f.players,f.carrier.t,f.carrier,bounds);
  assert.ok(pass,JSON.stringify({team,pass}));
  const read=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);
  assert.ok(read,JSON.stringify({team,read}));
  assert.equal(read.runner,pass.runner);
  const expected={x:f.carrier.x+(pass.target.x-f.carrier.x)*.56-f.dir*18,y:f.carrier.y+(pass.target.y-f.carrier.y)*.56};
  assert.ok(Math.abs(read.target.x-expected.x)<1e-9,JSON.stringify({team,read,expected}));
  assert.ok(Math.abs(read.target.y-expected.y)<1e-9,JSON.stringify({team,read,expected}));
  f.runner.moveVX=NaN;f.runner.moveVY=NaN;f.runner.dx=f.dir*.8;f.runner.dy=-.3;
  const fallbackPass=AI.attackingFirstTouchOutlet(f.players,f.carrier.t,f.carrier,bounds);
  const fallbackRead=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);
  assert.ok(fallbackPass&&fallbackRead,JSON.stringify({team,fallbackPass,fallbackRead}));
  const fallbackExpected={x:f.carrier.x+(fallbackPass.target.x-f.carrier.x)*.56-f.dir*18,y:f.carrier.y+(fallbackPass.target.y-f.carrier.y)*.56};
  assert.ok(Math.abs(fallbackRead.target.x-fallbackExpected.x)<1e-9,JSON.stringify({team,fallbackRead,fallbackExpected}));
  assert.ok(Math.abs(fallbackRead.target.y-fallbackExpected.y)<1e-9,JSON.stringify({team,fallbackRead,fallbackExpected}));
 }
});

test('first-touch outlet cover recognizes an already-closing marker at pass arrival but not a retreating one',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=makeRead(team);f.primary.y=f.carrier.y-160;
  f.runner.moveVX=f.dir*220;f.runner.moveVY=-140;
  const pass=AI.attackingFirstTouchOutlet(f.players,f.carrier.t,f.carrier,bounds);
  assert.ok(pass,JSON.stringify({team,pass}));
  const marker=player('closing-marker-'+team,f.team,pass.target.x+f.dir*110,pass.target.y,{moveVX:-f.dir*100});
  f.players.push(marker);
  assert.equal(AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary),null);
  marker.moveVX=f.dir*100;
  const read=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);
  assert.ok(read&&read.runner===f.runner,JSON.stringify({team,read}));
 }
});

test('first-touch outlet marker arrival uses Agility-limited turning before declaring a lane covered',async()=>{
 const {AI}=await loadModules();
 for(const team of [0,1]){
  const f=makeRead(team);f.primary.y=f.carrier.y-160;
  const pass=AI.attackingFirstTouchOutlet(f.players,f.carrier.t,f.carrier,bounds);
  assert.ok(pass,JSON.stringify({team,pass}));
  const marker=player('turn-marker-'+team,f.team,pass.target.x+f.dir*110,pass.target.y-20,{
   moveVX:0,moveVY:150,dx:-f.dir,dy:0,src:{id:'turn-marker-'+team,agility:1}
  });
  f.players.push(marker);
  const lowAgility=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);
  assert.ok(lowAgility,JSON.stringify({team,lowAgility}));
  marker.src.agility=100;
  const highAgility=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);
  assert.equal(highAgility,null,JSON.stringify({team,highAgility}));
  marker.dx=NaN;marker.dy=NaN;
  const noDirectionalInput=AI.defensiveFirstTouchOutletCoverTarget(f.team,f.carrier,f.players,bounds,f.support,f.primary);
  assert.ok(noDirectionalInput,JSON.stringify({team,noDirectionalInput}));
  assert.deepEqual(noDirectionalInput.target,lowAgility.target);
 }
});
