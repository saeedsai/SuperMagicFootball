'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.resolve('src/modules/engine.js'),'utf8').replace(/\r\n/g,'\n');
const restartStart=source.indexOf(' startFreeKick(team,x,y){');
const restartEnd=source.indexOf('\n handleEndlineRestart(){',restartStart);
assert(restartStart>=0&&restartEnd>restartStart,'free-kick restart method must exist in GameEngine');
const restart=vm.runInNewContext('({'+source.slice(restartStart,restartEnd).replace(/\n (?=isInPenaltyArea)/g,',\n ')+'})',{
 F:{x:100,y:200,w:2000,h:1000},
 WORLD:{goalTop:620,goalBottom:780},
 clamp:(value,min,max)=>Math.max(min,Math.min(max,value))
});
const slideStart=source.indexOf(' slideContact(p){');
const slideEnd=source.indexOf('\n tackle(p,slide=false){',slideStart);
assert(slideStart>=0&&slideEnd>slideStart,'slide contact method must exist in GameEngine');
const slide=vm.runInNewContext('({'+source.slice(slideStart,slideEnd)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 contest:()=>({knockChance:1,duration:.4}),
 moraleFactor:()=>1,
 stat:()=>50,
 norm:(x,y)=>{const d=Math.hypot(x,y)||1;return {x:x/d,y:y/d}},
 tackleStunDuration:()=>.4,
 Math:Object.assign(Object.create(Math),{random:()=>0})
});

function fixture(){
 const rosters=[0,1].map(t=>Array.from({length:12},(_,i)=>({id:`${t}-${i}`,name:`P${t}-${i}`})));
 const players=[];
 for(let t=0;t<2;t++)for(let i=0;i<6;i++)players.push({t,i,src:rosters[t][i],keeper:i===0,stun:0,invuln:0,
  face:t===0?1:-1,x:500+t*200+i*70,y:500+i*60,dx:0,dy:0,moveVX:0,moveVY:0,z:0,action:'run',actionTimer:.2,
  slideTimer:.3,slideRemaining:70,trickGuard:0,fatigue:0});
 const events=[],game={players,rosters,teamPlans:[{freeKick:3},{freeKick:4}],controlled:[3,3],cooldown:0,
  ball:{owner:null,x:700,y:500,z:0,vx:90,vy:80,vz:20,age:2,shot:{id:'old'},strike:{},ordinaryShot:true,trail:[{}],lastTouchTeam:0},
  magicHazards:[{}],magicWalls:[{}],supernova:{team:0},
  cancelPendingAbilityActions(){},
  take(player){this.ball.owner=player;this.ball.x=player.x+player.face*17;this.ball.y=player.y+10;this.ball.z=0;
   this.ball.vx=this.ball.vy=this.ball.vz=0;this.ball.lastTouchTeam=player.t;if(!player.keeper)this.controlled[player.t]=player.i;},
  burst(){},emit(type,data){events.push({type,...data})},events};
 Object.assign(game,restart,slide);return game;
}

test('free kick uses configured active outfielder, clamps position and preserves ordinary controls',()=>{
 const g=fixture(),taker=g.players.find(p=>p.t===1&&p.src.id==='1-4');
 assert.equal(g.startFreeKick(1,5000,-500),true);
 assert.equal(g.ball.owner,taker);assert.equal(g.controlled[1],taker.i);assert.equal(taker.face,-1);
 assert.equal(taker.x,100+2000-34);assert.equal(taker.y,200+28);
 assert.equal(g.ball.lastTouchTeam,1);assert.equal(g.ball.shot,null);assert.equal(g.ball.strike,null);
 assert.equal(g.cooldown,.45);assert.deepEqual(g.events,[{type:'freeKickRestart',team:1,player:taker.src.name,x:taker.x,y:taker.y}]);
 assert.equal(g.magicHazards.length,0);assert.equal(g.magicWalls.length,0);assert.equal(g.supernova,null);
});

test('invalid restart arguments fail without changing possession',()=>{
 const g=fixture(),owner=g.players[0];g.ball.owner=owner;
 assert.equal(g.startFreeKick(2,400,400),false);assert.equal(g.startFreeKick(0,NaN,400),false);
 assert.equal(g.ball.owner,owner);assert.deepEqual(g.events,[]);
});

test('a slide from behind stays in live play, with no foul or free kick',()=>{
 const g=fixture(),tackler=g.players.find(p=>p.t===0&&p.i===2),carrier=g.players.find(p=>p.t===1&&p.i===3);
 tackler.x=300;tackler.y=350;carrier.x=340;carrier.y=350;carrier.moveVX=100;carrier.moveVY=0;
 g.ball.owner=carrier;
 assert.equal(g.slideContact(tackler),true);
 assert.equal(g.ball.owner,null);assert.equal(tackler.slideTimer,0);assert.equal(tackler.slideRemaining,0);
 assert.deepEqual(g.events.map(e=>e.type),['tackleHit']);
});

test('front or lateral slide contact retains the existing tackle outcome',()=>{
 const g=fixture(),tackler=g.players.find(p=>p.t===0&&p.i===2),carrier=g.players.find(p=>p.t===1&&p.i===3);
 tackler.x=380;tackler.y=500;carrier.x=340;carrier.y=500;carrier.moveVX=100;carrier.moveVY=0;
 g.ball.owner=carrier;
 assert.equal(g.slideContact(tackler),true);
 assert.equal(g.events.some(e=>e.type==='foul'||e.type==='freeKickRestart'),false);
 assert.equal(g.events[0].type,'tackleHit');assert.equal(g.ball.owner,null);
});

test('live slide-contact path never emits a foul or launches a free kick',()=>{
 const method=source.slice(source.indexOf(' slideContact(p){'),source.indexOf('\n tackle(p,slide=false){',source.indexOf(' slideContact(p){')));
 assert.doesNotMatch(method,/this\.emit\('foul'/);
 assert.doesNotMatch(method,/startFreeKick|startPK/);
 assert.match(method,/tackleHit/);
});
