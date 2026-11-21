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
 assert.ok(source.includes("kind=opts.cutback===true?'cutback':'throughBall'"));
 const shot=source.indexOf('if(p.cd<=0&&nearGoal&&Math.random()<finishChance)');
 const early=source.indexOf('else if(p.cd<=0&&supportCutback&&!pressured');
 const pressure=source.indexOf('else if(p.cd<=0&&pressured&&Math.random()<ai.passRate*tactical.pass)');
 assert.ok(shot>=0&&early>shot&&pressure>early,'shooting remains first; safe unpressured cutbacks precede pressure-only passes');
});
