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
const moveAgile=get(' moveAgile(p,dx,dy,maxSpeed,dt){',' staminaTick(p,dt', {Math,stat:(p,k)=>p.src[k],firstTouchControlScale});
const take=get(' take(p){',' // Goalkeepers hold a clean catch', {Math,clamp,distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)});
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
 for(const s of [1,30,60,100])for(const t of [0,.05,.15,.24,1]){
  assert.equal(firstTouchControlScale(t,0,s),1);
  assert.equal(firstTouchControlScale(0,1,s),1);
  const value=firstTouchControlScale(t,1,s);
  assert(value>=.68&&value<=1,JSON.stringify({s,t,value}));
 }
 assert(firstTouchControlScale(.24,1,15)<firstTouchControlScale(.24,1,95));
 for(const bad of [NaN,Infinity,-Infinity,undefined])assert(Number.isFinite(firstTouchControlScale(bad,bad,bad)));
});
test('friendly ground reception under defender pressure triggers timed control, preserves pass event',()=>{
 const {g,p,near,events,recv}=fixture();g.players.push(near);
 recv();
 assert.equal(g.ball.owner,p);assert.equal(g.ball.pass,false);assert.equal(p.action,'receive');
 assert.equal(p.firstTouchControlTimer,.24);
 assert(p.firstTouchPressure>.8);
 assert.equal(events.filter(e=>e.type==='passReceived').length,1);
 assert.equal(events[0].friendly,true);
 assert.equal(events[0].accurate,true);
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
 p.firstTouchControlTimer=.24;p.firstTouchPressure=1;
 moveAgile.call(g,p,1,0,210,.016);
 const slowed=p.x-220;assert(slowed>0);
 const orig={...p,x:220,moveVX:0,moveVY:0,firstTouchControlTimer:0};
 g.ball.owner=orig;moveAgile.call(g,orig,1,0,210,.016);
 assert(slowed<orig.x-220,JSON.stringify({slow:slowed,normal:orig.x-220}));
 p.firstTouchControlTimer=0;assert.equal(firstTouchControlScale(0,1,35),1);
 g.ball.owner=null;
 const loose={...p,x:220,moveVX:0,moveVY:0,firstTouchControlTimer:.24};
 moveAgile.call(g,loose,1,0,210,.016);
 assert(Math.abs(loose.x-orig.x)<1e-9,'loose ball must cancel settling');
});
test('source runs timer down and resets on substitution without restricting four inputs or shot',()=>{
 assert.match(src,/p\.firstTouchControlTimer=Math\.max\(0,\(p\.firstTouchControlTimer\|\|0\)-dt\)/);
 assert.match(src,/p\.firstTouchControlTimer=0;p\.firstTouchPressure=0;/);
 assert.match(src,/if\(this\.ball\.owner===p&&!p\.keeper&&\(p\.firstTouchControlTimer\|\|0\)>0\)/);
 assert.doesNotMatch(src.slice(src.indexOf('function firstTouchControlScale('),src.indexOf('function randomBetween(',src.indexOf('function firstTouchControlScale('))>0?src.indexOf('function randomBetween(',src.indexOf('function firstTouchControlScale(')):src.indexOf('function distance(',src.indexOf('function firstTouchControlScale('))),/\.vx\s*=|\.vy\s*=|Math\.random\(/);
});
