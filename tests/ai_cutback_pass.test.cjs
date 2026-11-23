'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
async function loadModules(){
 const {loadAssetsFromNode}=await import('../src/assets.js');
 await loadAssetsFromNode();
 const {AI}=await import('../src/modules/ai.js');
 const {ENGINE}=await import('../src/modules/engine.js');
 return {AI,ENGINE};
}
const BOUNDS={xMin:50,xMax:950,yMin:40,yMax:640};
function fixture(ENGINE,team=0){
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.players.find(p=>p.t===team&&p.i===3);
 const runner=game.players.find(p=>p.t===team&&p.i===4);
 carrier.x=team===0?760:240;carrier.y=team===0?110:570;
 runner.x=team===0?650:350;runner.y=340;
 runner.moveVX=team===0?160:-160;runner.moveVY=0;
 for(const p of game.players){
  if(p.t===team){p.stun=0;p.down=false;p.z=0;p.action='idle';p.actionTimer=0;
   if(p!==carrier&&p!==runner){p.x=500;p.y=560;}}
  else{p.x=team===0?300:700;p.y=60;p.stun=0;p.down=false;p.z=0;p.action='idle';p.actionTimer=0;p.moveVX=0;p.moveVY=0;}
 }
 game.ball.owner=carrier;
 return {game,carrier,runner,defender:game.players.find(p=>p.t!==team&&!p.keeper)};
}
test('AI selects a driven central cutback from a wide final-third carrier in both attack directions',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const {game,carrier,runner}=fixture(ENGINE,team);
  const option=AI.attackingCutbackPass(game.players,team,carrier,null,BOUNDS);
  assert.equal(option?.runner,runner);
  assert.ok((carrier.x-option.target.x)*(team===0?1:-1)>0,'cutback target must sit behind the carrier');
  assert.ok(Math.abs(option.target.y-340)<=132,'receiver must be in the central lane');
 }
});
test('cutback preference is limited to a wide carrier near goal and a receiver behind in the central lane',async()=>{
 const {AI,ENGINE}=await loadModules();
 const central=fixture(ENGINE);central.carrier.y=340;
 assert.equal(AI.attackingCutbackPass(central.game.players,0,central.carrier,null,BOUNDS),null);
 const distant=fixture(ENGINE);distant.carrier.x=620;
 assert.equal(AI.attackingCutbackPass(distant.game.players,0,distant.carrier,null,BOUNDS),null);
 const ahead=fixture(ENGINE);ahead.runner.x=810;ahead.runner.moveVX=0;
 assert.equal(AI.attackingCutbackPass(ahead.game.players,0,ahead.carrier,null,BOUNDS),null);
 const wideReceiver=fixture(ENGINE);wideReceiver.runner.y=555;
 assert.equal(AI.attackingCutbackPass(wideReceiver.game.players,0,wideReceiver.carrier,null,BOUNDS),null);
});
test('cutback selection skips the human-controlled, downed and recovering receivers',async()=>{
 const {AI,ENGINE}=await loadModules();
 const f=fixture(ENGINE);
 assert.equal(AI.attackingCutbackPass(f.game.players,0,f.carrier,f.runner,BOUNDS),null);
 f.runner.down=true;
 assert.equal(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),null);
 f.runner.down=false;f.runner.action='shotGetUp';
 assert.equal(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),null);
});
test('grounded defenders in the cutback lane or receiving pocket block the pass, but downed and late defenders do not',async()=>{
 const {AI,ENGINE}=await loadModules();
 const f=fixture(ENGINE);
 const option=AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS);
 assert.ok(option);
 f.defender.x=(f.carrier.x+option.target.x)/2;f.defender.y=(f.carrier.y+option.target.y)/2;
 assert.equal(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),null);
 f.defender.down=true;
 assert.ok(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS));
 f.defender.down=false;f.defender.stun=1;
 assert.ok(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS));
 f.defender.stun=0;f.defender.x=option.target.x+12;f.defender.y=option.target.y+8;
 assert.equal(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),null);
});
test('AI cutback uses the existing PASS action, targets the predicted receiver point and stays low',async()=>{
 const {AI,ENGINE}=await loadModules();
 const f=fixture(ENGINE);
 const option=AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS);
 assert.ok(option);
 const originalRandom=Math.random;
 try{
  Math.random=()=>.5;
  assert.equal(f.game.pass(f.carrier,false,false,{preferredTarget:option.runner,supportRun:true,
   cutback:true,preferredPoint:option.target}),true);
 }finally{Math.random=originalRandom;}
 assert.equal(f.game.ball.passTarget,f.runner.src.id);
 assert.equal(f.game.events.at(-1)?.mode,'cutback');
 assert.equal(f.game.events.at(-1)?.loft,'cutback');
 assert.ok(f.game.ball.vz<50,'cutback should use the flatter existing PASS trajectory');
 const slope=f.game.ball.vy/f.game.ball.vx;
 assert.ok(Math.abs(slope-(option.target.y-f.carrier.y)/(option.target.x-f.carrier.x))<1e-9);
});
const MATCH_BOUNDS={xMin:174,xMax:2386.8,yMin:179,yMax:1351};
function unpressuredCutbackFixture(ENGINE){
 const f=fixture(ENGINE);
 // Match coordinates use the 2,260.8-unit field, not the 900-unit helper fixture.
 f.carrier.x=2100;f.carrier.y=450;f.carrier.cd=0;f.carrier.aiTimer=0;f.carrier.aiTarget=null;
 f.carrier.comboActive=false;f.carrier.down=false;f.carrier.stun=0;f.carrier.z=0;
 f.runner.x=1950;f.runner.y=765;f.runner.moveVX=160;f.runner.moveVY=0;
 for(const p of f.game.players)if(p.t!==0&&!p.keeper){
  p.x=300;p.y=300;p.stun=0;p.down=false;p.z=0;p.action='idle';p.actionTimer=0;
  p.moveVX=0;p.moveVY=0;
 }
 f.game.ball.owner=f.carrier;
 return f;
}

test('unpressured CPU carrier can release a clear byline cutback before a defender closes',async()=>{
 const {AI,ENGINE}=await loadModules();
 const f=unpressuredCutbackFixture(ENGINE);
 assert.ok(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,MATCH_BOUNDS),
  'fixture must contain a clear central runner behind the carrier');
 assert.ok(f.game.players.every(p=>p.t!==1||p.keeper||Math.hypot(p.x-f.carrier.x,p.y-f.carrier.y)>=230),
  'fixture must have no immediate defensive pressure');
 const originalRandom=Math.random,draws=[.99,.05];
 try{
  // The first draw declines the shot; the second qualifies for the .066
  // safe-cutback chance but misses the old generic .03 pass fallback.
  Math.random=()=>draws.length?draws.shift():.99;
  f.game.driveAI(f.carrier,1/60);
 }finally{Math.random=originalRandom;}
 assert.equal(f.game.ball.passTarget,f.runner.src.id);
 assert.equal(f.game.events.at(-1)?.mode,'cutback');
 assert.equal(f.game.events.at(-1)?.loft,'cutback');
});

test('unpressured AI does not early-release a cutback into a blocked receiving pocket',async()=>{
 const {AI,ENGINE}=await loadModules();
 const f=unpressuredCutbackFixture(ENGINE);
 const option=AI.attackingCutbackPass(f.game.players,0,f.carrier,null,MATCH_BOUNDS);
 assert.ok(option);
 f.defender.x=option.target.x+10;f.defender.y=option.target.y+10;
 assert.ok(Math.hypot(f.defender.x-f.carrier.x,f.defender.y-f.carrier.y)>230,
  'pocket blocker must remain outside immediate carrier pressure');
 assert.equal(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,MATCH_BOUNDS),null);
 const originalRandom=Math.random;
 try{
  const draws=[.99,.05];Math.random=()=>draws.length?draws.shift():.99;
  f.game.driveAI(f.carrier,1/60);
 }finally{Math.random=originalRandom;}
 assert.equal(f.game.ball.owner,f.carrier);
 assert.equal(f.game.events.some(event=>event.mode==='cutback'),false);
});

test('active opposing goalkeepers block cutbacks through the flight lane or receiving pocket on both sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team);
  const option=AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS);
  assert.ok(option,'fixture must start with an open cutback');
  const keeper=f.game.players.find(p=>p.t!==team&&p.keeper);
  assert.ok(keeper,'opposing goalkeeper must exist');
  const place=(x,y)=>Object.assign(keeper,{x,y,z:0,down:false,stun:0,slideTimer:0,
   shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
   action:'idle',actionTimer:0,moveVX:0,moveVY:0});
  place((f.carrier.x+option.target.x)/2,(f.carrier.y+option.target.y)/2);
  assert.equal(AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS),null,
   'an active keeper crossing the driven flight corridor must block the preference');
  place(option.target.x+10,option.target.y+10);
  assert.equal(AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS),null,
   'an active keeper occupying the predicted collection pocket must block the preference');
 }
});

test('cutback collection pocket scales with opposing goalkeeper skill and fatigue on both sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team);
  const option=AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS);
  assert.ok(option,'fixture must begin with an uncontested cutback');
  const keeper=f.game.players.find(p=>p.t!==team&&p.keeper);
  assert.ok(keeper);
  const place=()=>Object.assign(keeper,{x:option.target.x+(team===0?86:-86),y:option.target.y,
   z:0,down:false,stun:0,slideTimer:0,shotImpactKnockdownPending:0,
   shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,action:'idle',actionTimer:0,
   moveVX:0,moveVY:0,fatigue:0});
  keeper.src={...keeper.src,gkSkill:1,gkDiving:1};
  place();
  assert.ok(AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS),
   'a weak keeper should not claim an 86-unit pocket');
  keeper.src={...keeper.src,gkSkill:100,gkDiving:100};
  assert.equal(AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS),null,
   'a rested elite keeper should claim the same pocket');
  keeper.fatigue=1;
  assert.ok(AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS),
   'fatigue should reduce the elite keeper below the same collection distance');
  keeper.fatigue=0;keeper.keeper=false;
  assert.ok(AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS),
   'outfield defenders retain the existing 74-unit collection pocket');
 }
});

test('downed, recovering, high-airborne or late-recovering goalkeepers do not falsely block a cutback',async()=>{
 const {AI,ENGINE}=await loadModules();
 const f=fixture(ENGINE);
 const option=AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS);
 assert.ok(option);
 const keeper=f.game.players.find(p=>p.t===1&&p.keeper);
 assert.ok(keeper);
 const place=()=>Object.assign(keeper,{x:option.target.x+10,y:option.target.y+10,z:0,
  down:false,stun:0,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,
  shotImpactRiseTimer:0,action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 place();keeper.down=true;
 assert.ok(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),'downed keeper cannot contest');
 place();keeper.stun=.3;
 assert.ok(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),'keeper recovering beyond pass arrival cannot contest');
 place();keeper.z=40;
 assert.ok(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),'high airborne keeper cannot intercept a ground cutback');
 place();keeper.action='shotGetUp';
 assert.ok(AI.attackingCutbackPass(f.game.players,0,f.carrier,null,BOUNDS),'keeper getting up cannot contest');
});

test('driveAI offers cutbacks before through-ball/support fallbacks and after shot selection',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
 assert.ok(source.includes('const supportCutback=owner===p?attackingCutbackPass('));
 assert.ok(source.includes('supportCutback?{preferredTarget:supportCutback.runner,supportRun:true,cutback:true,preferredPoint:supportCutback.target}'));
 assert.ok(source.includes("opts.giveAndGoReturn===true?'giveAndGoReturn':opts.cutback===true?'cutback':'throughBall'"));
 const shot=source.indexOf('if(!firstTouchControl&&p.cd<=0&&nearGoal&&Math.random()<finishChance)');
 const early=source.indexOf('else if(!firstTouchControl&&p.cd<=0&&supportCutback&&!pressured');
 const pressure=source.indexOf('else if(!firstTouchControl&&p.cd<=0&&pressured&&Math.random()<ai.passRate*tactical.pass)');
 assert.ok(shot>=0&&early>shot&&pressure>early,'shooting remains first; safe unpressured cutbacks precede pressure-only passes');
});

test('AI prefers the least-marked central cutback runner on both attacking sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team);
  const mirrorX=x=>team===0?x:1000-x;
  const mirrorY=y=>team===0?y:680-y;
  const secondRunner=f.game.players.find(p=>p.t===team&&p!==f.carrier&&p!==f.runner&&!p.keeper);
  assert.ok(secondRunner,'fixture needs a second outfield receiver');
  Object.assign(f.carrier,{x:mirrorX(760),y:mirrorY(110),down:false,stun:0,z:0,action:'idle',actionTimer:0});
  Object.assign(f.runner,{x:mirrorX(700),y:mirrorY(300),moveVX:0,moveVY:0,down:false,stun:0,z:0,action:'idle',actionTimer:0,aiAssistTarget:null});
  Object.assign(secondRunner,{x:mirrorX(620),y:mirrorY(260),moveVX:0,moveVY:0,down:false,stun:0,z:0,action:'idle',actionTimer:0,aiAssistTarget:null});
  for(const p of f.game.players){
   if(p.t===team&&!p.keeper&&p!==f.carrier&&p!==f.runner&&p!==secondRunner)p.down=true;
   if(p.t!==team)p.down=true;
  }
  f.defender.down=true;
  const unmarked=AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS);
  assert.equal(unmarked?.runner,f.runner,
   'without active pressure, the closer and more central runner should remain preferred');
  Object.assign(f.defender,{x:mirrorX(700),y:mirrorY(380),down:false,stun:0,z:0,
   action:'idle',actionTimer:0,moveVX:0,moveVY:0});
  const marked=AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS);
  assert.equal(marked?.runner,secondRunner,
   'a slightly farther but substantially less-marked runner should win the cutback');
 }
});

test('cutback selection prefers goal-facing receivers but respects forward momentum and sole-outlet fallback on both sides',async()=>{
 const {AI,ENGINE}=await loadModules();
 for(const team of [0,1]){
  const f=fixture(ENGINE,team),dir=team===0?1:-1;
  const alternative=f.game.players.find(p=>p.t===team&&p!==f.carrier&&p!==f.runner&&!p.keeper);
  assert.ok(alternative,'fixture needs a second cutback receiver');
  for(const p of f.game.players){
   if(p.t!==team){p.down=true;continue;}
   if(p!==f.carrier&&p!==f.runner&&p!==alternative)p.down=true;
  }
  const x=f.carrier.x-dir*110;
  Object.assign(f.runner,{x,y:340,face:-dir,moveVX:0,moveVY:0,down:false,stun:0,z:0,
   action:'idle',actionTimer:0,aiAssistTarget:null});
  Object.assign(alternative,{x,y:340,face:dir,moveVX:0,moveVY:0,down:false,stun:0,z:0,
   action:'idle',actionTimer:0,aiAssistTarget:null});
  const oriented=AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS);
  assert.equal(oriented?.runner,alternative,'team '+team+' should prefer the receiver already facing goal');
  alternative.down=true;
  f.runner.moveVX=dir*180;
  const forwardRun=AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS);
  assert.equal(forwardRun?.runner,f.runner,'team '+team+' forward momentum should override stale facing');
  f.runner.moveVX=0;
  const sole=AI.attackingCutbackPass(f.game.players,team,f.carrier,null,BOUNDS);
  assert.equal(sole?.runner,f.runner,'team '+team+' must retain its only safe cutback outlet');
 }
});

test('defensive support shades into the central cutback lane for wide byline carriers on both sides',async()=>{
 const {AI}=await loadModules();
 const center=(MATCH_BOUNDS.yMin+MATCH_BOUNDS.yMax)/2;
 for(const attackingTeam of [0,1]){
  const defendingTeam=1-attackingTeam;
  const carrier={t:attackingTeam,keeper:false,
   x:attackingTeam===0?MATCH_BOUNDS.xMax-186:MATCH_BOUNDS.xMin+186,
   y:attackingTeam===0?MATCH_BOUNDS.yMin+140:MATCH_BOUNDS.yMax-140,
   down:false,stun:0,z:0,action:'idle'};
  const cover=AI.defensiveCutbackCoverTarget(defendingTeam,carrier,MATCH_BOUNDS);
  assert.ok(cover,'wide final-third carrier should trigger central cutback cover');
  const attackDir=attackingTeam===0?1:-1;
  assert.ok((cover.x-carrier.x)*attackDir<0,'cover must sit behind the carrier toward midfield');
  assert.ok(Math.abs(cover.y-center)<Math.abs(carrier.y-center),'cover must shade toward the central receiving lane');
  assert.ok(Math.abs(cover.x-carrier.x)<=110.001,'longitudinal retreat must remain bounded');
 }
});

test('central, distant, keeper, unavailable and invalid carriers retain ordinary support positioning',async()=>{
 const {AI}=await loadModules();
 const carrier={t:1,keeper:false,x:MATCH_BOUNDS.xMin+186,y:MATCH_BOUNDS.yMin+140,
  down:false,stun:0,z:0,action:'idle'};
 const center=(MATCH_BOUNDS.yMin+MATCH_BOUNDS.yMax)/2;
 assert.equal(AI.defensiveCutbackCoverTarget(0,{...carrier,y:center},MATCH_BOUNDS),null);
 assert.equal(AI.defensiveCutbackCoverTarget(0,{...carrier,x:MATCH_BOUNDS.xMin+326},MATCH_BOUNDS),null);
 assert.equal(AI.defensiveCutbackCoverTarget(0,{...carrier,keeper:true},MATCH_BOUNDS),null);
 assert.equal(AI.defensiveCutbackCoverTarget(0,{...carrier,down:true},MATCH_BOUNDS),null);
 assert.equal(AI.defensiveCutbackCoverTarget(0,{...carrier,z:40},MATCH_BOUNDS),null);
 assert.equal(AI.defensiveCutbackCoverTarget(0,{...carrier,t:0},MATCH_BOUNDS),null);
 assert.equal(AI.defensiveCutbackCoverTarget(0,carrier,{xMin:1,xMax:1,yMin:0,yMax:1}),null);
});

test('defensive cover follows the projected central receiver lane on both attacking sides',async()=>{
 const {AI}=await loadModules();
 const center=(MATCH_BOUNDS.yMin+MATCH_BOUNDS.yMax)/2;
 for(const attackingTeam of [0,1]){
  const defendingTeam=1-attackingTeam,attackDir=attackingTeam===0?1:-1;
  const carrier={t:attackingTeam,keeper:false,
   x:attackingTeam===0?MATCH_BOUNDS.xMax-186:MATCH_BOUNDS.xMin+186,
   y:attackingTeam===0?MATCH_BOUNDS.yMin+140:MATCH_BOUNDS.yMax-140,
   down:false,stun:0,z:0,action:'idle'};
  const runner={t:attackingTeam,keeper:false,
   x:carrier.x-attackDir*150,
   y:attackingTeam===0?center-180:center+180,
   moveVX:attackDir*100,moveVY:attackingTeam===0?80:-80,
   down:false,stun:0,z:0,action:'idle',actionTimer:0,
   slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0};
  const cover=AI.defensiveCutbackCoverTarget(defendingTeam,carrier,MATCH_BOUNDS,[carrier,runner]);
  const projectedX=runner.x+runner.moveVX*.12;
  const projectedY=runner.y+runner.moveVY*.12;
  const behind=(projectedX-carrier.x)*attackDir;
  const expectedX=carrier.x-attackDir*Math.max(48,Math.min(110,-behind*.62));
  const expectedY=carrier.y+(projectedY-carrier.y)*.62;
  assert.ok(cover,'eligible central runner should produce a runner-specific screen');
  assert.ok(Math.abs(cover.x-expectedX)<1e-9,'cover should screen the predicted longitudinal lane');
  assert.ok(Math.abs(cover.y-expectedY)<1e-9,'cover should follow the receiver’s predicted lateral movement');
  assert.ok(Math.abs(cover.x-carrier.x)<=110.001,'screen retreat must remain bounded');
  const fallback=AI.defensiveCutbackCoverTarget(defendingTeam,carrier,MATCH_BOUNDS,
   [carrier,{...runner,down:true}]);
  assert.ok(fallback,'no eligible receiver should preserve the generic central cover');
  assert.ok(Math.abs(fallback.x-(carrier.x-attackDir*110))<1e-9);
  assert.ok(Math.abs(fallback.y-(carrier.y+(center-carrier.y)*.62))<1e-9);
 }
});

test('driveAI sends the second defender into the projected receiver screen while the primary still presses',async()=>{
 const {AI,ENGINE}=await loadModules();
 const game=new ENGINE.GameEngine({halfSeconds:120});
 game.init({home:0,away:1,mode:'quick',humans:0});
 const carrier=game.players.find(p=>p.t===1&&!p.keeper);
 const defenders=game.players.filter(p=>p.t===0&&!p.keeper);
 assert.ok(carrier&&defenders.length>=2);
 const [primary,support]=defenders;
 const runner=game.players.find(p=>p.t===1&&!p.keeper&&p!==carrier);
 assert.ok(runner,'fixture needs an active cutback receiver');
 for(const p of defenders)Object.assign(p,{down:true,stun:0,z:0,slideTimer:0,
  shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 for(const p of game.players)if(p.t===1&&!p.keeper&&p!==carrier&&p!==runner)p.down=true;
 Object.assign(carrier,{x:360,y:MATCH_BOUNDS.yMax-140,down:false,stun:0,z:0,slideTimer:0,
  shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,shotImpactRiseTimer:0,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 Object.assign(runner,{x:500,y:(MATCH_BOUNDS.yMin+MATCH_BOUNDS.yMax)/2+180,moveVX:-100,moveVY:-80,
  down:false,stun:0,z:0,slideTimer:0,shotImpactKnockdownPending:0,shotImpactKnockdownTimer:0,
  shotImpactRiseTimer:0,action:'idle',actionTimer:0});
 Object.assign(primary,{x:440,y:carrier.y,down:false,stun:0,z:0,slideTimer:0,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 Object.assign(support,{x:560,y:carrier.y+100,down:false,stun:0,z:0,slideTimer:0,
  action:'idle',actionTimer:0,moveVX:0,moveVY:0});
 game.ball.owner=carrier;
 const expected=AI.defensiveCutbackCoverTarget(0,carrier,MATCH_BOUNDS,game.players);
 assert.ok(expected);
 game.driveAI(support,1/60);
 assert.ok(support.aiTarget,'support defender must receive a positioning target');
 assert.ok(Math.abs(support.aiTarget.x-expected.x)<1e-9);
 assert.ok(Math.abs(support.aiTarget.y-expected.y)<1e-9);
});
