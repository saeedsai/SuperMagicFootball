'use strict';
/** Existing gameplay: first-touch speed restraint is frame-rate bounded and mirrored. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
function extract(begin,end,context){
 const a=source.indexOf(begin),b=source.indexOf(end,a+begin.length);
 assert(a>=0&&b>a,begin+' missing from actual engine');
 return vm.runInNewContext('({'+source.slice(a,b)+'}).'+begin.trim().split('(')[0],context);
}
const a=source.indexOf('function firstTouchControlScale('),b=source.indexOf('\n}',a);
assert(a>=0&&b>a);
const scale=vm.runInNewContext('('+source.slice(a,b+2)+')',{clamp});
const move=extract(' moveAgile(p,dx,dy,maxSpeed,dt){',' staminaTick(p,dt',{Math,stat:(p,k)=>p.src[k],firstTouchControlScale:scale});
const take=extract(' take(p){',' // Goalkeepers hold a clean catch',{Math,clamp,distance:(p,q)=>Math.hypot(p.x-q.x,p.y-q.y)});
function sample({team=0,fps=60,skill=55,pressure=true,mode='ground'}={}){
 const x=team===0?520:2200,face=team===0?1:-1;
 const player={t:team,i:3,keeper:mode==='keeper',stun:mode==='stunned'?1:0,
  x,y:500,face,src:{id:'recipient',dribbling:skill,agility:65},
  moveVX:0,moveVY:0};
 const enemy={t:1-team,keeper:false,stun:0,x:x+19,y:500,src:{id:'def'}};
 if(!pressure){enemy.x=x+900;enemy.y=1200;}
 const ball={owner:null,pass:true,passFrom:'sender',passTeam:mode==='opposing'?1-team:team,
  passTarget:'recipient',x,y:500,z:mode==='aerial'?60:14,vx:500,vy:0,strike:null};
 const events=[],game={players:[player,enemy],ball,controlled:[3,3],
  inControl:()=>false,_auditTake(){},emit:(type,data)=>events.push({type,...data})};
 take.call(game,player);
 const activated=player.firstTouchControlTimer>0;
 let elapsed=0;
 while(elapsed<.24-1e-8){
  const dt=Math.min(1/fps,.24-elapsed);
  // Real GameEngine.updatePlayers reduces the timer before moving the carrier.
  player.firstTouchControlTimer=Math.max(0,(player.firstTouchControlTimer||0)-dt);
  move.call(game,player,face,0,230,dt);elapsed+=dt;
 }
 return {team,fps,skill,pressure,mode,activated,travel:Math.abs(player.x-x),timer:player.firstTouchControlTimer,
  events,owns:ball.owner===player};
}
test('two teams and 30/60/120 Hz: pressured ground receiver settles, then recovers',()=>{
 for(const team of [0,1])for(const fps of [30,60,120]){
  const pressured=sample({team,fps,skill:40}),free=sample({team,fps,skill:40,pressure:false});
  assert(pressured.activated&&!free.activated,JSON.stringify({team,fps,pressured,free}));
  assert(pressured.owns&&free.owns,'pass ownership preserved');
  assert.equal(pressured.events.filter(e=>e.type==='passReceived').length,1);
  assert(pressured.travel<free.travel&&pressured.travel>0,JSON.stringify({team,fps,pressured,free}));
  assert(pressured.timer>=0&&pressured.timer<1e-9,'settling must end within numerical precision');
 }
});
test('mirrored teams have identical motion with identical attributes and pressure',()=>{
 for(const fps of [30,60,120])for(const skill of [30,80]){
  const left=sample({team:0,fps,skill}),right=sample({team:1,fps,skill});
  assert(Math.abs(left.travel-right.travel)<1e-7,JSON.stringify({fps,skill,left,right}));
 }
});
test('short-window displacement stays within a bounded FPS variance',()=>{
 for(const pressure of [false,true])for(const skill of [30,80]){
  const distances=[30,60,120].map(fps=>sample({fps,skill,pressure}).travel);
  assert(Math.max(...distances)-Math.min(...distances)<7.5,JSON.stringify({pressure,skill,distances}));
 }
});
test('better ball control cushions pressured first touch for both sides at all FPS',()=>{
 for(const team of [0,1])for(const fps of [30,60,120]){
  const low=sample({team,fps,skill:25}),high=sample({team,fps,skill:95});
  assert(high.travel>low.travel,JSON.stringify({team,fps,low,high}));
 }
});
test('no slowdown for keeper, opponent interception, airborne pass, or stunned receiver',()=>{
 for(const mode of ['keeper','opposing','aerial','stunned'])
  for(const team of [0,1]){
   const r=sample({team,mode});
   assert.equal(r.activated,false,JSON.stringify(r));
   assert(r.owns,'possession preserved');
   assert.equal(r.events.filter(e=>e.type==='passReceived').length,1);
  }
});
test('ball, pass, physics, and about-version sources remain independent of acceptance suite',()=>{
 const a=source.indexOf('function firstTouchControlScale('),b=source.indexOf('\n}',a);
 const helper=source.slice(a,b+2);
 assert.doesNotMatch(helper,/Math\.random|\.ball\.vx\s*=|\.ball\.vy\s*=/);
 assert.match(source,/p\.firstTouchControlTimer=Math\.max\(0,\(p\.firstTouchControlTimer\|\|0\)-dt\)/);
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(ui,/version:RELEASE\.version,game/); assert.doesNotMatch(ui,/api\.github\.com\/repos\/saeedsai\/SuperMagicFootball\/commits\/dev/);
});
