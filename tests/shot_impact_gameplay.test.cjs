'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
let runtimePromise;
function runtime(){if(!runtimePromise){let bundle=fs.readFileSync(require('node:path').join(__dirname,'.generated/game.js'),'utf8');const ui=bundle.indexOf('// Supermagic Football v0.8.25.30 | UI |');if(ui>=0)bundle=bundle.slice(0,ui);bundle+='\nexport {ENGINE,INPUT,DATA};';runtimePromise=import('data:text/javascript;base64,'+Buffer.from(bundle).toString('base64'));}return runtimePromise;}

async function fixture(t){
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 globalThis.window={addEventListener(){}};globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 t.after(()=>{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;});
 const {ENGINE,INPUT,DATA}=await runtime();
 const input=new INPUT.Input(),game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},input);
 game.init({home:0,away:9,humans:1,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});game.cooldown=0;
 return {game,WORLD:ENGINE.WORLD};
}
function placeShot(game,WORLD,{special=true,targetTeam=1,attackerTeam=0,energy=360,speed=1200,distance=214}){
 const victim=game.players.find(p=>p.t===targetTeam&&p.i===3),attacker=game.players.find(p=>p.t===attackerTeam&&p.i===4);
 const F=WORLD.field,cx=F.x+F.w*.52,cy=F.y+F.h*.5;
 for(const p of game.players){p.x=F.x+F.w*.35;p.y=F.y+F.h-36;p.z=0;p.vz=0;p.stun=0;p.shotImpactWeakness=0;p.shotImpactWeaknessTimer=0;}
 victim.x=cx;victim.y=cy;victim.src.strength=5;victim.src.defence=5;victim.fatigue=0;victim.breath=100;
 const direction=attackerTeam===0?1:-1,originX=cx-direction*distance;
 attacker.x=F.x+F.w*(attackerTeam===0?.2:.8);attacker.y=F.y+F.h-90;
 game.ball={x:cx-direction*14,y:cy,z:0,vx:direction*speed,vy:0,vz:0,owner:null,shot:special?{id:'nuts',behavior:'ricochet',level:4,direction,transformSeconds:1.65}:null,
  strike:{kind:special?'super':'normal',energy,hits:0,originX,originY:cy},attacker:attackerTeam,lastTouchTeam:attackerTeam,trail:[],age:.2,power:energy,canCollect:0,targetY:cy,pass:false,ordinaryShot:!special};
 return {victim,attacker};
}

test('every ordinary and Super Shot contact briefly weakens and slows a teammate or opponent',async t=>{
 const {game,WORLD}=await fixture(t);
 for(const attackerTeam of [0,1])for(const targetTeam of [attackerTeam,1-attackerTeam])for(const special of [false,true]){
  const {victim}=placeShot(game,WORLD,{attackerTeam,targetTeam,special,energy:12,speed:420});
  const before=game.playerSpeed(victim);
  game.updateBall(1/60);
  assert.ok(victim.shotImpactWeakness>0,`weakness: attacker=${attackerTeam}, target=${targetTeam}, super=${special}`);
  assert.ok(victim.shotImpactWeaknessTimer>3,'each ball contact starts a visible temporary weaken window');
  assert.ok(game.playerSpeed(victim)<before,'weakened players move more slowly');
  assert.ok(victim.shotImpactWeakness<=.4,'repeat impacts have a firm stacking cap');
 }
});

test('a very strong ordinary shot causes a bounded confused stun, never a knockdown launch, even beyond the close-range window',async t=>{
 const {game,WORLD}=await fixture(t),{victim}=placeShot(game,WORLD,{special:false,attackerTeam:1,targetTeam:0,energy:420,speed:1350,distance:820});
 game.updateBall(1/60);
 assert.ok(victim.stun>=.5&&victim.stun<=2,'strong regular shot respects the 0.5–2 s stun range');
 assert.ok(victim.shotImpactConfusedTimer>=.5&&victim.shotImpactConfusedTimer<=2);
 assert.equal(victim.shotImpactKnockdownPending,0,'normal shots cannot throw players');
});

test('a normal-shot stun blocks all four controls and restores movement after expiry',async t=>{
 const {game,WORLD}=await fixture(t),{victim}=placeShot(game,WORLD,{special:false,attackerTeam:1,targetTeam:0,energy:420,speed:1350,distance:820});
 game.updateBall(1/60);
 assert.ok(victim.stun>=.5&&victim.stun<=2,'contact must produce the expected strong-shot stun');
 game.matchState='play';game.cooldown=0;game.controlled[0]=victim.i;game.ball.owner=victim;
 // Feed the same four-action state the live input layer supplies. The engine's
 // real player update must consume none of it while this player is confused.
 game.input.state[0]={x:1,y:0,shoot:1,pass:1,dribble:1,jump:1};
 game.input.pressed[0]={shoot:true,pass:true,dribble:true,jump:true};
 const start={x:victim.x,y:victim.y,z:victim.z,action:victim.action,ball:{...game.ball}};
 game.updatePlayers(1/60);
 assert.deepEqual({x:victim.x,y:victim.y,z:victim.z},{x:start.x,y:start.y,z:start.z},'movement and jumping stay locked');
 assert.equal(victim.action,start.action,'no shot, pass, dribble or jump animation starts');
 assert.equal(game.ball.owner,victim,'shot and pass buttons cannot alter possession');
 assert.equal(game.ball.vx,start.ball.vx);assert.equal(game.ball.vy,start.ball.vy);
 game.input.state[0]={x:1,y:0};game.input.pressed[0]={};victim.stun=0;
 const beforeRecoveryX=victim.x;game.updatePlayers(1/60);
 assert.ok(victim.x>beforeRecoveryX,'movement input works again after stun expiry');
});

test('powerful Super Shots launch the hit player, then keep them down for strength-scaled 0.5–3 s',async t=>{
 const {game,WORLD}=await fixture(t),{victim}=placeShot(game,WORLD,{special:true,energy:520,speed:1450});
 game.updateBall(1/60);
 assert.ok(victim.shotImpactKnockdownPending>=.5&&victim.shotImpactKnockdownPending<=3);
 assert.equal(victim.action,'launched');
 const dt=1/60;let frames=0;
 while((victim.shotImpactKnockdownPending>0||victim.z>0)&&frames<180){game.updatePlayers(dt);frames++;}
 assert.ok(frames<180,'launched player lands');
 assert.ok(victim.shotImpactKnockdownTimer>=.45&&victim.shotImpactKnockdownTimer<=3);
 assert.equal(victim.action,'shotDown');
 const downAtLanding=victim.shotImpactKnockdownTimer;
 while(victim.shotImpactKnockdownTimer>0&&frames<360){game.updatePlayers(dt);frames++;}
 assert.ok(frames<360,'downed player recovers');
 assert.ok(downAtLanding>=.5&&downAtLanding<=3);
 assert.equal(victim.shotImpactRiseTimer,.24,'recovery eases the player upright after the down pose');
});

test('shot weakness changes real tackle stun while active and returns to baseline after expiry',async t=>{
 const tackleOutcome=async({primeShot=false,expireWeakness=false})=>{
  const {game,WORLD}=await fixture(t);
  const {victim}=placeShot(game,WORLD,{special:false,targetTeam:1,attackerTeam:0,energy:1,speed:0});
  victim.src.strength=100;
  if(primeShot){
   game.updateBall(1/60);
   assert.ok(victim.shotImpactWeakness>0,'a real low-force ball contact starts the weakness window');
   assert.equal(victim.stun,0,'the priming contact is not strong enough to stun');
  }
  if(expireWeakness){
   // Use the engine timer tick, not direct state mutation, to model the full
   // temporary weakness window expiring before the follow-up contest.
   for(let i=0;i<65;i++)game.updatePlayers(.05);
   assert.equal(victim.shotImpactWeaknessTimer,0,'engine update expires the temporary weakness');
   assert.equal(victim.shotImpactWeakness,0,'expired weakness clears its effective-strength modifier');
  }
  const tackler=game.players.find(p=>p.t===0&&p.i===2);
  victim.x=WORLD.field.x+WORLD.field.w*.52;victim.y=WORLD.field.y+WORLD.field.h*.5;
  victim.z=0;victim.stun=0;victim.invuln=0;victim.fatigue=0;victim.morale=55;
  tackler.x=victim.x-48;tackler.y=victim.y;tackler.z=0;tackler.stun=0;tackler.cd=0;tackler.fatigue=0;tackler.morale=55;
  game.ball.owner=victim;
  const originalRandom=Math.random;
  try{
   Math.random=()=>0; // deterministically land the same successful tackle in each fixture
   assert.equal(game.tackle(tackler,false),true,'real engine tackle starts');
  }finally{Math.random=originalRandom;}
  const event=game.events.find(entry=>entry.type==='tackleHit'&&entry.victim===victim.src.name);
  assert.ok(event,'engine emits the downstream tackle result');
  return {stun:event.stun,weakness:victim.shotImpactWeakness};
 };
 const baseline=await tackleOutcome({});
 const weakened=await tackleOutcome({primeShot:true});
 const recovered=await tackleOutcome({primeShot:true,expireWeakness:true});
 assert.equal(baseline.weakness,0);
 assert.ok(weakened.weakness>0);
 assert.ok(weakened.stun>baseline.stun,
  'reduced effective strength makes the same successful tackle stun the player longer');
 assert.equal(recovered.stun,baseline.stun,
  'after the engine weakness timer expires, the same tackle returns to baseline strength behavior');
});
