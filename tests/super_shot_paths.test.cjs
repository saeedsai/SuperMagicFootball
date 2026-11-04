'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
let runtimePromise;
function runtime(){if(!runtimePromise){let bundle=fs.readFileSync(path.join(__dirname,'.generated/game.js'),'utf8');const ui=bundle.indexOf('// Supermagic Football v0.8.25.30 | UI |');if(ui>=0)bundle=bundle.slice(0,ui);bundle+='\nexport {ENGINE,INPUT,DATA};';runtimePromise=import('data:text/javascript;base64,'+Buffer.from(bundle).toString('base64'));}return runtimePromise;}

test('new transformed shots use bounded, mirrored wave and bounded dive paths',async()=>{
 const {SHOTPATHS}=await import('../src/modules/shotpaths.js');
 for(const age of [.1,.3,.55,.9,1.2,1.5]){
  const east=SHOTPATHS.waveSample({id:'wave',direction:1},age),west=SHOTPATHS.waveSample({id:'wave',direction:-1},age);
  assert.ok(Math.abs(east.offset+west.offset)<1e-8);
  assert.ok(Math.abs(east.velocity+west.velocity)<1e-8);
  assert.ok(Math.abs(east.offset)<=70&&Math.abs(east.velocity)<500);
 }
 for(const end of [.18,.37,.8,1.31,1.63]){
  const whole=SHOTPATHS.waveSample({id:'wave',direction:1},end),steps=30;
  let age=0,velocity=0,offset=0;
  for(let i=0;i<steps;i++){
   const next=end*(i+1)/steps,step=SHOTPATHS.waveStep({id:'wave',direction:1},age,next);
   velocity+=step.deltaVy;offset+=velocity*(next-age)+step.correctionY;age=next;
  }
  assert.ok(Math.abs(offset-whole.offset)<.2,`wave path integration matches at ${end}s`);
  assert.ok(Math.abs(velocity-whole.velocity)<.2,`wave velocity matches at ${end}s`);
 }
});

test('Silver Carp, Dolphin and Wave surface patterns include short submerged windows and Dolphin rises near goal',async t=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;globalThis.window={addEventListener(){}};globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 t.after(()=>{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;});
 const {ENGINE,INPUT,DATA}=await runtime();
 const {WORLD}=ENGINE,game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},new INPUT.Input());
 game.init({home:0,away:9,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});game.cooldown=0;
 const F=WORLD.field,center=F.y+F.h*.5;
 function trajectory(id,behavior){
  game.players.forEach((p,i)=>{p.x=F.x+F.w*.5;p.y=F.y+80+i*70;p.z=0;p.stun=0;});
  const start=behavior==='dolphin'?F.x+F.w-800:F.x+F.w*.22;
  game.ball={x:start,y:center,z:28,vx:700,vy:0,vz:45,owner:null,shot:{id,behavior,level:3,direction:1,transformSeconds:1.65},
   strike:{kind:'super',energy:240,hits:0,originX:start-180,originY:center},attacker:0,lastTouchTeam:0,trail:[],age:0,power:240,canCollect:0,targetY:center,pass:false,ordinaryShot:false};
  const samples=[];
  for(let i=0;i<120&&game.ball.shot;i++){game.updateBall(1/120);samples.push({age:game.ball.age,z:game.ball.z,underground:game.ball.shot?.underground||false,x:game.ball.x});}
  return samples;
 }
 const carp=trajectory('silverCarp','silverCarp');
 assert.ok(carp.some(q=>q.underground),'Silver Carp swims under the pitch briefly');
 assert.ok(carp.some(q=>q.z>48),'Silver Carp jumps above the grass between dives');
 const wave=trajectory('wave','wave');assert.ok(wave.some(q=>q.underground));assert.ok(wave.some(q=>q.z>15));
 const dolphin=trajectory('dolphin','dolphin');
 const dive=dolphin.find(q=>q.underground),surface=dolphin.find(q=>!q.underground&&q.z>45);
 assert.ok(dive,'Dolphin starts with a short deep-dive');assert.ok(surface,'Dolphin breaks the surface near the attacking goal');
 assert.ok(surface.x>dive.x,'Dolphin keeps moving toward the goal during its dive');
});

test('Bird shot slows during flight and makes a bounded lane change around an approaching defender',async t=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;globalThis.window={addEventListener(){}};globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 t.after(()=>{if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;});
 const {ENGINE,INPUT,DATA}=await runtime(),{WORLD}=ENGINE;
 const game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},new INPUT.Input());game.init({home:0,away:9,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
 const F=WORLD.field,center=F.y+F.h*.5,defender=game.players.find(p=>p.t===1&&p.i===3);
 game.players.forEach((p,i)=>{p.x=F.x+F.w*.5;p.y=F.y+80+i*68;p.stun=0;});
 const x=F.x+F.w*.27;defender.x=x+165;defender.y=center;
 game.ball={x,y:center,z:18,vx:900,vy:0,vz:0,owner:null,shot:{id:'bird',behavior:'birdDodge',direction:1,transformSeconds:1.65},
  strike:{kind:'super',energy:220,hits:0,originX:x-120,originY:center},attacker:0,trail:[],age:0,power:220,canCollect:0,targetY:center,pass:false,ordinaryShot:false};
 game.updateBall(.2);
 assert.ok(Math.hypot(game.ball.vx,game.ball.vy)<900,'bird eases below cannon-ball flight speed');
 assert.notEqual(game.ball.y,center,'bird makes a readable dodge away from the defender lane');
 assert.ok(Math.abs(game.ball.y-center)<=40,'dodge remains within fair shot bounds');
});
