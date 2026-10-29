'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'../src/modules/engine.js'),'utf8');
const start=engine.indexOf(' tryMagicTrick(p){'),end=engine.indexOf(' // Consume a Banana Peel',start);
assert.ok(start>0&&end>start,'real Magic Trick method');
const cast=vm.runInNewContext('({'+engine.slice(start,end)+'})',{
 distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),stat:(p,k)=>p.src?.[k]??50,
 clamp:(v,l,h)=>Math.max(l,Math.min(h,v)),
 norm:(x,y)=>{const m=Math.hypot(x,y)||1;return {x:x/m,y:y/m}},
 F:{x:0,y:0,w:1200,h:700},
 placeBananaPeel:()=>{throw Error('unexpected banana')},
 placeIcePatch:()=>{throw Error('unexpected ice')}
}).tryMagicTrick;
function setup({side=0,ahead=50,lateral=0,action='slide',timer=.25,z=0,dx=0,dy=0,id='teleport'}={}){
 const p={t:side,x:side?500:200,y:300,face:side?-1:1,dx,dy,keeper:false,stun:0,fatigue:0,src:{id:'a',name:'Caster',magicTrick:id,dribbling:90}};
 const vx=dx||p.face,vy=dy||0,m=Math.hypot(vx,vy)||1;
 const q={t:1-side,x:p.x+ahead*vx/m-lateral*vy/m,y:p.y+ahead*vy/m+lateral*vx/m,face:p.face,dx:0,dy:0,z,keeper:false,stun:0,action,actionTimer:timer,src:{id:'b',name:'Defender',defence:30}};
 const events=[],game={players:[p,q],ball:{owner:p},clock:2,magicHazards:[],fatigueLedger:[{},{}],burst:()=>{},emit:(kind,data)=>events.push({kind,...data})};
 const origin={x:p.x,y:p.y};return {p,q,events,game,origin,fire:()=>cast.call(game,p)};
}
test('Grounded SHOOT-slide intercepts Teleport from both sides and diagonally',()=>{
 for(const opts of [{side:0},{side:1},{dx:1,dy:1,ahead:70,lateral:20},{side:1,dx:-1,dy:1,ahead:85,lateral:35}]){
  const {p,q,events,game,origin,fire}=setup(opts);
  assert.equal(fire(),true);assert.equal(p.x,origin.x);assert.equal(p.y,origin.y);
  assert.equal(q.action,'slide');assert.equal(events[0].countered,true);
  assert.equal(p.magicReadyAt,8);assert.equal(p.fatigue,.035);
  assert.equal(game.fatigueLedger[opts.side||0].a,.035);assert.equal(fire(),false);
 }
});
test('Behind, wide, expired, non-slide and airborne defenders cannot intercept',()=>{
 for(const opts of [{ahead:-1},{ahead:0},{ahead:85.01},{lateral:35.01},{lateral:-36},{timer:0},{timer:-1},{timer:NaN},{action:'run'},{z:20},{z:NaN}]){
  const {p,origin,events,fire}=setup(opts);assert.equal(fire(),true);
  assert.equal(events[0].countered,false,JSON.stringify(opts));
  assert.equal(Math.hypot(p.x-origin.x,p.y-origin.y),85,JSON.stringify(opts));
 }
});
test('Unblocked diagonal Teleport travels forward with normal cast cost',()=>{
 const {p,origin,events,fire}=setup({dx:1,dy:1,action:'run'});
 assert.equal(fire(),true);assert.ok(p.x>origin.x&&p.y>origin.y);
 assert.ok(Math.abs(Math.hypot(p.x-origin.x,p.y-origin.y)-85)<1e-9);
 assert.equal(events[0].countered,false);assert.equal(p.magicReadyAt,8);assert.equal(p.fatigue,.035);
});
test('Existing high-defence closing counter still stops Teleport',()=>{
 const {p,q,origin,events,fire}=setup({action:'run'});
 q.face=-1;q.dx=-1;q.src.defence=95;
 assert.equal(fire(),true);assert.equal(events[0].countered,true);assert.equal(p.x,origin.x);
});
test('Bat slide parry and Freeze jump remain unaffected',()=>{
 const bat=setup({id:'bat'});assert.equal(bat.fire(),true);assert.equal(bat.events[0].countered,true);
 const freeze=setup({id:'freeze',action:'run',z:20});assert.equal(freeze.fire(),true);assert.equal(freeze.events[0].countered,true);
});
test('Studio guide matches lane counter without a fifth action',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../src/modules/ui.js'),'utf8');
 assert.match(engine,/teleportParried=id==='teleport'&&inRange&&rival.action==='slide'/);
 assert.match(ui,/teleport:'[^']*SHOOT-slide in the forward travel lane intercepts the teleport/);
 assert.match(engine,/p\.magicReadyAt=this\.clock\+6/);
 assert.doesNotMatch(engine,/fifthAction/);
});
