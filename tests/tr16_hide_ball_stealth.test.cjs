'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8').replace(/\r\n/g,'\n');
const render=fs.readFileSync(path.join(__dirname,'../src/modules/render.js'),'utf8');
function extract(name,next){const at=engine.indexOf(` ${name}(`);assert.ok(at>=0,name);const end=engine.indexOf(next,at);assert.ok(end>at,next);const close=engine.lastIndexOf('\n }',end);assert.ok(close>at,name+' end');return engine.slice(at,close+3).trim();}
const tryMagic=extract('tryMagicTrick','\n updateSpinBumpFx(');
const updateHideBall=extract('updateHideBall','\n updatePlayers(');
const stat=(p,key)=>p?.src?.[key]??50;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const norm=(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m};};
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const methods=Function('stat','distance','norm','clamp',`return ({${tryMagic},${updateHideBall}})`)(stat,distance,norm,clamp);
const F={x:0,y:0,w:1000,h:700};
function setup({action='idle',face=1,dist=52}={}){
 const carrier={t:0,x:500,y:350,dx:0,dy:0,face:1,z:0,stun:0,keeper:false,fatigue:.1,magicReadyAt:0,hideBallTimer:0,hideBallReveal:0,trickGuard:0,src:{id:'c',name:'Carrier',magicTrick:'hideBall',dribbling:80}};
 const defender={t:1,x:500-dist,y:350,dx:0,dy:0,face,z:0,stun:0,keeper:false,action,actionTimer:.25,src:{id:'d',name:'Defender',defence:30}};
 const events=[],game={...methods,clock:4,ball:{owner:carrier},players:[carrier,defender],fatigueLedger:[{},{}],magicHazards:[],events,burst(){},emit(type,data){events.push({type,...data});}};
 return {game,carrier,defender,events};
}
function cast(opts){const q=setup(opts);assert.equal(q.game.tryMagicTrick(q.carrier),true);return q;}
test('TR16 activation creates a bounded conceal window and retains the existing resistance, cooldown and energy cost',()=>{
 const {game,carrier,events}=cast();assert.equal(carrier.hideBallTimer,.65);assert.equal(carrier.trickGuard,.65);assert.equal(carrier.hideBallReveal,0);
 assert.equal(carrier.magicReadyAt,10);assert.equal(carrier.fatigue,.135);assert.equal(game.ball.owner,carrier);
 assert.deepEqual(events.filter(e=>e.type==='hideBallConceal').map(e=>e.seconds),[.65]);
});
test('TR16 keeps the grounded timed facing PASS-poke counter intact and charges its original cost',()=>{
 const {carrier,events}=cast({action:'punch',face:1,dist:52});const trick=events.find(e=>e.type==='magicTrick');
 assert.equal(trick.countered,true);assert.equal(carrier.hideBallTimer,0);assert.equal(carrier.hideBallReveal,0);assert.equal(carrier.trickGuard,0);
 assert.equal(carrier.magicReadyAt,10);assert.equal(carrier.fatigue,.135);
});
for(const fps of [30,60,120])test(`TR16 conceal expires and reveals once deterministically at ${fps} Hz`,()=>{
 const {game,carrier,events}=cast();let elapsed=0;while(elapsed<.65-1e-12){const dt=Math.min(1/fps,.65-elapsed);game.updateHideBall(carrier,dt);elapsed+=dt;}
 assert.equal(carrier.hideBallTimer,0);assert.ok(carrier.hideBallReveal>0&&carrier.hideBallReveal<=.18);
 const reveal=events.filter(e=>e.type==='hideBallReveal');assert.equal(reveal.length,1);assert.equal(reveal[0].reason,'timeout');
 game.updateHideBall(carrier,1/fps);assert.equal(events.filter(e=>e.type==='hideBallReveal').length,1);
});
test('TR16 possession loss reveals the ball immediately and its recovery cue decays cleanly',()=>{
 const {game,carrier,events}=cast();game.updateHideBall(carrier,.1);assert.ok(carrier.hideBallTimer<.65);
 game.ball.owner=null;assert.equal(game.updateHideBall(carrier,1/60),false);assert.equal(carrier.hideBallTimer,0);assert.ok(carrier.hideBallReveal>0);
 assert.equal(events.filter(e=>e.type==='hideBallReveal')[0].reason,'possession-lost');
 for(let i=0;i<20;i++)game.updateHideBall(carrier,1/60);assert.equal(carrier.hideBallReveal,0);
});
test('TR16 render uses a steady owner-side marker and visually attenuates only the owned ball',()=>{
 assert.match(render,/drawHideBallCue\(ctx,p,game\)/);assert.match(render,/game\.ball\?\.owner===p&&\(p\.hideBallTimer\|\|0\)>0/);
 assert.match(render,/concealed=!!\(b\.owner&&!b\.shot&&\(b\.owner\.hideBallTimer\|\|0\)>0\)/);
 assert.match(render,/ctx\.globalAlpha=concealed\?\(reducedFlash\?\.17:\.10\):1/);
 assert.doesNotMatch(render,/drawHideBallCue[\s\S]{0,900}Math\.random/);
});
