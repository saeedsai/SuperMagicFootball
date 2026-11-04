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
 const input=new INPUT.Input(),game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},input);
 game.init({home:0,away:9,humans:1,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
 game.cooldown=0;
 return {game,WORLD:ENGINE.WORLD,shots:DATA.SHOTS};
}

function prepareContact(game,WORLD,shots,{shotId,attackerTeam,targetTeam,special=true,energy=12,speed=420}){
 const field=WORLD.field,cx=field.x+field.w*.52,cy=field.y+field.h*.5;
 const victim=game.players.find(p=>p.t===targetTeam&&p.i===3);
 const attacker=game.players.find(p=>p.t===attackerTeam&&p.i===4);
 for(const player of game.players){
  player.x=field.x+field.w*.35;player.y=field.y+field.h-36;player.z=player.vz=0;
  player.stun=0;player.shotImpactWeakness=player.shotImpactWeaknessTimer=0;
  player.shotImpactConfusedTimer=player.shotImpactKnockdownPending=0;
  player.shotImpactKnockdownTimer=player.shotImpactRiseTimer=0;
  player.action='idle';player.actionTimer=0;player.fatigue=0;player.breath=100;
 }
 victim.x=cx;victim.y=cy;victim.src.strength=5;victim.src.defence=5;
 const direction=attackerTeam===0?1:-1,originX=cx-direction*214;
 attacker.x=originX;attacker.y=field.y+field.h-90;
 // All contact samples are taken during a surfaced frame. Carp, Dolphin and
 // Wave have distinct underground windows; age .55s is reachable and surfaced
 // for each. At most 32 units of lateral change can occur before this hit.
 const age=.55;
 const shot=special?{...shots[shotId],id:shotId,level:4,direction,
  phase:0,startY:cy,aimY:cy,transformSeconds:1.65,ricochetBounces:0}:null;
 game.ball={x:cx-direction*14,y:cy,z:0,vx:direction*speed,vy:0,vz:0,owner:null,shot,
  strike:{kind:special?'super':'normal',energy,hits:0,originX,originY:cy},
  attacker:attackerTeam,lastTouchTeam:attackerTeam,trail:[],age,power:energy,
  canCollect:0,targetY:cy,pass:false,ordinaryShot:!special};
 return {victim,attacker};
}

test('every catalog Super Shot weakens and slows a hit teammate or opponent in either attack direction',async t=>{
 const {game,WORLD,shots}=await fixture(t);
 const shotIds=Object.keys(shots);
 assert.equal(shotIds.length,32,'matrix follows the whole authored shot catalog');
 let cases=0;
 for(const shotId of shotIds){
  for(const attackerTeam of [0,1]){
   for(const friendly of [true,false]){
    const targetTeam=friendly?attackerTeam:1-attackerTeam;
    const {victim}=prepareContact(game,WORLD,shots,{shotId,attackerTeam,targetTeam});
    const speedBefore=game.playerSpeed(victim);
    game.updateBall(1/60);
    const label=`${shotId}, attack=${attackerTeam}, ${friendly?'friendly':'enemy'}`;
    assert.ok(victim.shotImpactWeakness>0,`${label}: contact applies weakness`);
    assert.ok(victim.shotImpactWeakness<=.4,`${label}: weakness respects stacking cap`);
    assert.ok(victim.shotImpactWeaknessTimer>=3.2,`${label}: weakness is temporary and visible`);
    assert.ok(game.playerSpeed(victim)<speedBefore,`${label}: weakness slows movement`);
    cases++;
   }
  }
 }
 assert.equal(cases,128);
});

test('strong ordinary contact confuses without launching; high-force Super Shot still knocks down',async t=>{
 const {game,WORLD,shots}=await fixture(t);
 const normal=prepareContact(game,WORLD,shots,{attackerTeam:0,targetTeam:1,special:false,energy:420,speed:1350});
 game.updateBall(1/60);
 assert.ok(normal.victim.shotImpactConfusedTimer>=.5&&normal.victim.shotImpactConfusedTimer<=2);
 assert.equal(normal.victim.shotImpactKnockdownPending,0);
 assert.equal(normal.victim.action,'hurt');

 const strong=prepareContact(game,WORLD,shots,{shotId:Object.keys(shots)[0],attackerTeam:1,targetTeam:0,special:true,energy:520,speed:1450});
 game.updateBall(1/60);
 assert.ok(strong.victim.shotImpactKnockdownPending>=.5&&strong.victim.shotImpactKnockdownPending<=3);
 assert.equal(strong.victim.action,'launched');
});
