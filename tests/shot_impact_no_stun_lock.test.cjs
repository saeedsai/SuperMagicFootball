'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

let runtimePromise;
function runtime(){
 if(!runtimePromise){
  let bundle=fs.readFileSync(path.join(__dirname,'.generated/game.js'),'utf8');
  const ui=bundle.indexOf('// Supermagic Football v0.8.25.30 | UI |');
  if(ui>=0)bundle=bundle.slice(0,ui);
  bundle+='\nexport {ENGINE,INPUT,DATA};';
  runtimePromise=import('data:text/javascript;base64,'+Buffer.from(bundle).toString('base64'));
 }
 return runtimePromise;
}

async function fixture(t){
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 globalThis.window={addEventListener(){}};
 globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 t.after(()=>{
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
  if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
 });
 const {ENGINE,INPUT,DATA}=await runtime();
 const game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},new INPUT.Input());
 game.init({home:0,away:9,humans:1,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
 game.cooldown=0;
 return {game,WORLD:ENGINE.WORLD};
}

function aimOrdinaryShot(game,WORLD,victim,attacker){
 const field=WORLD.field,direction=attacker.t===0?1:-1;
 attacker.x=victim.x-direction*214;
 const originX=victim.x-direction*214,energy=420;
 game.ball={x:victim.x-direction*14,y:victim.y,z:0,vx:direction*1350,vy:0,vz:0,
  owner:null,shot:null,strike:{kind:'normal',energy,hits:0,originX,originY:victim.y},
  attacker:attacker.t,lastTouchTeam:attacker.t,trail:[],age:0,power:energy,
  canCollect:0,targetY:victim.y,pass:false,ordinaryShot:true};
}

test('shot stun cannot be refreshed by repeated contacts and naturally expires',async t=>{
 const {game,WORLD}=await fixture(t),field=WORLD.field;
 const victim=game.players.find(p=>p.t===1&&p.i===3);
 const attacker=game.players.find(p=>p.t===0&&p.i===4);
 for(const player of game.players){
  player.x=field.x+field.w*.35;player.y=field.y+field.h-36;player.z=player.vz=0;
  player.stun=0;player.shotImpactWeakness=player.shotImpactWeaknessTimer=0;
  player.action='idle';player.actionTimer=0;player.fatigue=0;player.breath=100;
 }
 victim.x=field.x+field.w*.52;victim.y=field.y+field.h*.5;
 victim.src.strength=5;victim.src.defence=5;
 aimOrdinaryShot(game,WORLD,victim,attacker);
 game.updateBall(1/60);
 const initial=victim.stun;
 assert.ok(initial>=.5&&initial<=2,'first strong impact applies bounded stun');
 assert.ok(victim.shotImpactConfusedTimer>0,'first impact shows confusion while stunned');

 game.updatePlayers(.1);
 const remaining=victim.stun;
 const confusionRemaining=victim.shotImpactConfusedTimer;
 assert.ok(remaining>0&&remaining<initial,'stun begins recovering');
 const weaknessBefore=victim.shotImpactWeakness;
 aimOrdinaryShot(game,WORLD,victim,attacker);
 game.updateBall(1/60);
 assert.equal(victim.stun,remaining,'follow-up shot does not refresh stun');
 assert.equal(victim.shotImpactConfusedTimer,confusionRemaining,'follow-up shot does not refresh confusion');
 assert.equal(victim.shotImpactWeakness,weaknessBefore,'stunned player is excluded from repeat contact');

 for(let i=0;i<120&&victim.stun>0;i++)game.updatePlayers(1/60);
 assert.equal(victim.stun,0,'stun expires and control returns');
});
