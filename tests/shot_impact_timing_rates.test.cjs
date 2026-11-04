'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {fileURLToPath}=require('node:url');

let modulesPromise;
async function modules(){
 if(!modulesPromise){
  const previousFetch=globalThis.fetch;
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(fileURLToPath(url),'utf8'))});
  try{
   const assets=await import('../src/assets.js');await assets.loadAssets();
   modulesPromise=Promise.all([import('../src/modules/engine.js'),import('../src/modules/input.js'),import('../src/modules/data.js')]);
  }finally{if(previousFetch===undefined)delete globalThis.fetch;else globalThis.fetch=previousFetch;}
 }
 return modulesPromise;
}
function fakeInput(){return {state:[{},{}],poll(){},just(){return false},released(){return false},tapDuration(){return 0},canceled(){return false}};}
async function setup(){
 const [{ENGINE},,{DATA}]=await modules();
 const game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},fakeInput());
 game.init({home:0,away:9,humans:0,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
 game.cooldown=0;game.driveAI=()=>{};
 return {game,WORLD:ENGINE.WORLD};
}
function prepare(game,WORLD,{attackerTeam=0,targetTeam=1,special=true,strength=5,energy=special?520:420,speed=special?1450:1350}){
 const field=WORLD.field,cx=field.x+field.w*.52,cy=field.y+field.h*.5;
 const victim=game.players.find(p=>p.t===targetTeam&&p.i===3);
 const shooter=game.players.find(p=>p.t===attackerTeam&&p.i===4);
 for(const p of game.players){
  p.x=field.x+field.w*.35;p.y=field.y+field.h-36;p.z=p.vz=0;p.stun=0;
  p.shotImpactWeakness=p.shotImpactWeaknessTimer=p.shotImpactConfusedTimer=0;
  p.shotImpactKnockdownPending=p.shotImpactKnockdownTimer=p.shotImpactRiseTimer=0;
  p.action='idle';p.actionTimer=0;p.fatigue=0;p.breath=100;
 }
 victim.x=cx;victim.y=cy;victim.src.strength=strength;victim.src.defence=5;
 shooter.x=field.x+field.w*(attackerTeam===0?.2:.8);shooter.y=field.y+field.h-90;
 const direction=attackerTeam===0?1:-1,originX=cx-direction*214;
 game.ball={x:cx-direction*14,y:cy,z:0,vx:direction*speed,vy:0,vz:0,owner:null,
  shot:special?{id:'nuts',behavior:'ricochet',level:4,direction,transformSeconds:1.65}:null,
  strike:{kind:special?'super':'normal',energy,hits:0,originX,originY:cy},attacker:attackerTeam,
  lastTouchTeam:attackerTeam,trail:[],age:.2,power:energy,canCollect:0,targetY:cy,pass:false,ordinaryShot:!special};
 return {victim,shooter};
}

test('ordinary strong shot stun and friend/enemy weakness are stable at 30/60/120 Hz',async()=>{
 for(const hz of [30,60,120])for(const attackerTeam of [0,1])for(const friendly of [false,true]){
  const {game,WORLD}=await setup(),targetTeam=friendly?attackerTeam:1-attackerTeam;
  const {victim}=prepare(game,WORLD,{attackerTeam,targetTeam,special:false,strength:12});
  const speedBefore=game.playerSpeed(victim),dt=1/hz;game.updateBall(dt);
  assert.ok(victim.stun>=.5&&victim.stun<=2,`ordinary stun ${hz}Hz attack=${attackerTeam} friendly=${friendly}`);
  assert.equal(victim.shotImpactKnockdownPending,0,'normal shot never launches a knockdown');
  assert.ok(victim.shotImpactConfusedTimer>=.5&&victim.shotImpactConfusedTimer<=2);
  assert.ok(victim.shotImpactWeakness>0&&victim.shotImpactWeaknessTimer>3);
  assert.ok(game.playerSpeed(victim)<speedBefore,'ordinary shot contact applies the temporary slow');
 }
});

test('Super Shot knockdown preserves the full strength-scaled 0.5–3s on-ground timer at every rate',async()=>{
 for(const hz of [30,60,120]){
  const durations=new Map();
  for(const strength of [5,100])for(const attackerTeam of [0,1]){
   const {game,WORLD}=await setup(),targetTeam=1-attackerTeam;
   const {victim}=prepare(game,WORLD,{attackerTeam,targetTeam,special:true,strength});
   const dt=1/hz;game.updateBall(dt);
   const requested=victim.shotImpactKnockdownPending;
   assert.ok(requested>=.5&&requested<=3,`requested timer at ${hz}Hz strength=${strength}`);
   let frames=0;
   while((victim.shotImpactKnockdownPending>0||victim.z>0)&&frames<hz*4){game.updatePlayers(dt);frames++;}
   assert.ok(frames<hz*4,'player lands before timeout');
   assert.ok(victim.shotImpactKnockdownTimer>=requested-1e-9,
    `first grounded frame must not consume timer early: ${hz}Hz strength=${strength}, requested=${requested}, actual=${victim.shotImpactKnockdownTimer}`);
   assert.ok(victim.shotImpactKnockdownTimer>=.5&&victim.shotImpactKnockdownTimer<=3);
   if(!durations.has(strength))durations.set(strength,victim.shotImpactKnockdownTimer);
  }
  assert.ok(durations.get(5)>durations.get(100),`${hz}Hz: weaker player remains down longer`);
 }
});

test('a lower-force Super Shot confuses rather than throws, at every rate and in either direction',async()=>{
 for(const hz of [30,60,120])for(const attackerTeam of [0,1]){
  const {game,WORLD}=await setup(),targetTeam=1-attackerTeam;
  const {victim}=prepare(game,WORLD,{attackerTeam,targetTeam,special:true,strength:100,energy:90,speed:400});
  game.updateBall(1/hz);
  assert.ok(victim.shotImpactConfusedTimer>=.5&&victim.shotImpactConfusedTimer<=2,
   `bounded confused stun at ${hz}Hz attack=${attackerTeam}`);
  assert.equal(victim.shotImpactKnockdownPending,0,'the bounded hit does not launch a strong player');
 }
});
