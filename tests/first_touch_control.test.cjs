'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const get=(begin,end,context={})=>{
 const i=src.indexOf(begin),j=src.indexOf(end,i+begin.length);
 assert(i>=0&&j>i,'actual modular method unavailable: '+begin);
 return vm.runInNewContext('({'+src.slice(i,j)+'}).'+begin.trim().split('(')[0],context);
};
const scaleStart=src.indexOf('function firstTouchControlScale('),scaleEnd=src.indexOf('\n}',scaleStart);
assert(scaleStart>=0&&scaleEnd>scaleStart);
const firstTouchControlScale=vm.runInNewContext('('+src.slice(scaleStart,scaleEnd+2)+')',{clamp});
const durationStart=src.indexOf('function firstTouchControlDuration('),durationEnd=src.indexOf('\n}',durationStart);
assert(durationStart>=0&&durationEnd>durationStart);
const firstTouchControlDuration=vm.runInNewContext('('+src.slice(durationStart,durationEnd+2)+')',{clamp});
const moveAgile=get(' moveAgile(p,dx,dy,maxSpeed,dt){',' staminaTick(p,dt', {Math,stat:(p,k)=>p.src[k],firstTouchControlScale});
const take=get(' take(p){',' // Goalkeepers hold a clean catch', {Math,clamp,stat:(p,k)=>p.src[k],distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),firstTouchControlDuration,attackingFirstTouchEscape:()=>({x:300,y:300}),F:{x:150,y:155,w:2260.8,h:1220},keeperParryRebounds:new WeakMap()});
function fixture(){
 const p={t:0,i:2,keeper:false,stun:0,x:220,y:300,face:1,src:{id:'recv',dribbling:35,agility:65},moveVX:0,moveVY:0};
 const far={t:1,keeper:false,stun:0,x:700,y:700,src:{id:'far'}};
 const near={t:1,keeper:false,stun:0,x:255,y:300,src:{id:'near'}};
 const ball={pass:true,owner:null,passFrom:'sender',passTeam:0,passTarget:'recv',x:p.x,y:p.y,z:9,vx:430,vy:0,strike:null};
 const events=[],g={players:[p,far],ball,controlled:[2,3],inControl:()=>true,
 _auditTake(){},emit:(type,detail)=>events.push({type,...detail})};
 return {g,p,far,near,ball,events,recv:()=>take.call(g,p)};
}
test('control scale is neutral for no pressure or expired trap, bounded for weak/elite touch',()=>{
 for(const s of [1,30,60,100])for(const t of [0,.05,.15,.24,.30,1]){
  assert.equal(firstTouchControlScale(t,0,s,.30),1);
  assert.equal(firstTouchControlScale(0,1,s,.30),1);
  const value=firstTouchControlScale(t,1,s,.30);
  assert(value>=.68&&value<=1,JSON.stringify({s,t,value}));
 }
 assert(firstTouchControlScale(.24,1,15,.30)<firstTouchControlScale(.24,1,95,.30));
 for(const bad of [NaN,Infinity,-Infinity,undefined])assert(Number.isFinite(firstTouchControlScale(bad,bad,bad)));
});
test('directional first-touch cushion rewards skilled movement into space and stays bounded',()=>{
 const highBase=firstTouchControlScale(.24,1,100,.24,0);
 const highAway=firstTouchControlScale(.24,1,100,.24,1);
 const lowBase=firstTouchControlScale(.24,1,1,.24,0);
 const lowAway=firstTouchControlScale(.24,1,1,.24,1);
 assert(Math.abs(highAway-highBase-.08)<1e-9,JSON.stringify({highBase,highAway}));
 assert(Math.abs(lowAway-lowBase-.0008)<1e-9,JSON.stringify({lowBase,lowAway}));
 assert.equal(firstTouchControlScale(.24,1,100,.24,-1),highBase);
 assert.equal(firstTouchControlScale(.24,1,100,.24,2),highAway);
 assert.equal(firstTouchControlScale(.24,0,100,.24,1),1);
 assert.equal(firstTouchControlScale(0,1,100,.24,1),1);
 assert.equal(firstTouchControlScale(.24,1,100,.24,NaN),highBase);
});

test('faster passes lengthen the touch while better Dribbling shortens it',()=>{
 const gentle=firstTouchControlDuration(300,60),fast=firstTouchControlDuration(850,60);
 const weak=firstTouchControlDuration(500,25),skilled=firstTouchControlDuration(500,95);
 assert(fast>gentle,JSON.stringify({gentle,fast}));
 assert(weak>skilled,JSON.stringify({weak,skilled}));
 for(const value of [gentle,fast,weak,skilled])assert(value>=.18&&value<=.30,value);
 for(const bad of [NaN,Infinity,-Infinity,undefined])assert(Number.isFinite(firstTouchControlDuration(bad,bad)));
});
test('Agility shortens the pressured first-touch settle window with neutral fallback',()=>{
 const low=firstTouchControlDuration(500,60,1),neutral=firstTouchControlDuration(500,60,50),high=firstTouchControlDuration(500,60,100);
 assert(low>neutral&&neutral>high,JSON.stringify({low,neutral,high}));
 assert(Math.abs((low-neutral)-.0294)<1e-9);assert(Math.abs((neutral-high)-.03)<1e-9);
 for(const invalid of [NaN,Infinity,-Infinity,undefined,'elite'])assert.equal(firstTouchControlDuration(500,60,invalid),neutral);
 for(const speed of [280,500,900])for(const skill of [1,50,100])for(const agility of [1,50,100]){const value=firstTouchControlDuration(speed,skill,agility);assert(value>=.18&&value<=.30,JSON.stringify({speed,skill,agility,value}));}
});
test('friendly ground reception under defender pressure triggers timed control, preserves pass event',()=>{
 const {g,p,near,events,recv}=fixture();g.players.push(near);
 recv();
 assert.equal(g.ball.owner,p);assert.equal(g.ball.pass,false);assert.equal(p.action,'receive');
 assert.equal(p.firstTouchControlDuration,firstTouchControlDuration(430,35,65));
 assert.equal(p.firstTouchControlTimer,p.firstTouchControlDuration);
 assert(p.firstTouchPressure>.8);
 assert.equal(events.filter(e=>e.type==='passReceived').length,1);
 assert.equal(events[0].friendly,true);
 assert.equal(events[0].accurate,true);
});
test('CPU interception of a targeted low pass uses the receiver Agility for the same settle window',()=>{
 const intercept=agility=>{const {g,p,near,ball,recv}=fixture();g.players.push(near);g.inControl=()=>false;p.src.agility=agility;ball.passTeam=1;ball.passTarget='intended';recv();return {duration:p.firstTouchControlDuration,timer:p.firstTouchControlTimer,target:p.aiFirstTouchTarget};};
 const low=intercept(1),neutral=intercept(50),high=intercept(100);assert(low.duration>neutral.duration&&neutral.duration>high.duration);
 for(const result of [low,neutral,high]){assert.equal(result.timer,result.duration);assert(result.target&&Number.isFinite(result.target.x)&&Number.isFinite(result.target.y));}
});
test('open pass, enemy interception, aerial pass and keeper catch never trigger settling',()=>{
 for(const state of ['open','enemy','airborne','keeper']){
  const {g,p,near,recv}=fixture();
  if(state==='enemy')g.ball.passTeam=1;
  if(state==='airborne'){g.players.push(near);g.ball.z=38;}
  if(state==='keeper'){g.players.push(near);p.keeper=true;}
  recv();
  assert.equal(p.firstTouchControlTimer,0,state);
 }
});
test('actual moveAgile preserves normal speed in open space and temporarily reduces pressured carrier speed',()=>{
 const {g,p}=fixture();
 p.firstTouchControlTimer=.24;p.firstTouchControlDuration=.24;p.firstTouchPressure=1;
 g.ball.owner=p;
 moveAgile.call(g,p,1,0,210,.016);
 const slowed=p.x-220;assert(slowed>0);
 const orig={...p,x:220,moveVX:0,moveVY:0,firstTouchControlTimer:0};
 g.ball.owner=orig;moveAgile.call(g,orig,1,0,210,.016);
 assert(slowed<orig.x-220,JSON.stringify({slow:slowed,normal:orig.x-220}));
 p.firstTouchControlTimer=0;assert.equal(firstTouchControlScale(0,1,35,.24),1);
 g.ball.owner=null;
 const loose={...p,x:220,moveVX:0,moveVY:0,firstTouchControlTimer:.24,firstTouchControlDuration:.24};
 moveAgile.call(g,loose,1,0,210,.016);
 assert(Math.abs(loose.x-orig.x)<1e-9,'loose ball must cancel settling');
});
test('actual moveAgile rewards a high-control first touch away from the nearest active defender only',()=>{
 const {g,p,near}=fixture();
 const active={...near,x:255,y:300,z:0,down:false,stun:0,invuln:0,action:'idle'};
 const run=(defender,dx,dy,dribbling=95)=>{
  const receiver={...p,src:{...p.src,dribbling},x:220,y:300,moveVX:0,moveVY:0,
   firstTouchControlTimer:.24,firstTouchControlDuration:.24,firstTouchPressure:1};
  g.players=defender?[p,defender]:[p];
  g.ball.owner=receiver;
  moveAgile.call(g,receiver,dx,dy,210,.016);
  return Math.hypot(receiver.x-220,receiver.y-300);
 };
 const open=run(null,-1,0);
 const away=run(active,-1,0);
 const toward=run(active,1,0);
 const perpendicular=run(active,0,1);
 assert(away>toward,JSON.stringify({open,away,toward}));
 assert.equal(toward,open);
 assert.equal(perpendicular,open);
 const lowAway=run(active,-1,0,1),lowToward=run(active,1,0,1);
 assert(away-toward>lowAway-lowToward,JSON.stringify({away,toward,lowAway,lowToward}));
 for(const inactive of [
  {down:true},{stun:.1},{invuln:.1},{keeper:true},{z:24},
  {action:'shotGetUp'},{action:'hurt',actionTimer:.2},{x:NaN}
 ]){
  assert.equal(run({...active,...inactive},-1,0),open,JSON.stringify(inactive));
 }
});

test('source runs timer down and resets on substitution without restricting four inputs or shot',()=>{
 assert.match(src,/p\.firstTouchControlTimer=Math\.max\(0,\(p\.firstTouchControlTimer\|\|0\)-dt\)/);
 assert.match(src,/p\.firstTouchControlTimer=0;p\.firstTouchControlDuration=0;p\.firstTouchPressure=0;/);
 assert.match(src,/if\(this\.ball\.owner===p&&!p\.keeper&&\(p\.firstTouchControlTimer\|\|0\)>0\)/);
 const start=src.indexOf('function firstTouchControlScale('),end=src.indexOf('\n}',start);
 assert.doesNotMatch(src.slice(start,end+2),/\.vx\s*=|\.vy\s*=|Math\.random\(/);
});
