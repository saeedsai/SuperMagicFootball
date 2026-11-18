'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('src/modules/shotfeel.js','utf8');
const engine=fs.readFileSync('src/modules/engine.js','utf8');
const start=source.indexOf('const SHOTFEEL=(()=>{'),end=source.indexOf('export {SHOTFEEL};');
assert.ok(start>=0&&end>start,'read actual production targeting logic');
const feel=vm.runInNewContext(source.slice(start,end)+';SHOTFEEL');
const from={x:0,y:0},near={x:300,y:0},open={x:380,y:70},marked={x:275,y:0};
const choose=(mates=[near,open],rivals=null)=>feel.teammateInDirection(from,mates,{x:1,y:0},1300,rivals);
test('directed passing prefers open receiver to tightly marked teammate',()=>{
 assert.equal(choose(),near,'legacy target unchanged without opponent context');
 assert.equal(choose(undefined,[marked]),open,'open angled lane beats marked straight lane');
 assert.equal(choose(undefined,[{x:180,y:-160}]),near,'remote defender must not change pass');
 assert.equal(choose(undefined,[{...marked,stun:1}]),near,'stunned defender cannot intercept');
 assert.equal(choose(undefined,[{x:Infinity,y:0}]),near,'invalid rival is ignored');
 assert.equal(choose([near],[marked]),near,'single available receiver remains selectable');
});
test('direction and distance constraints remain authoritative',()=>{
 assert.equal(choose([{x:100,y:350},near]),near);
 assert.equal(choose([{x:-200,y:0}]),null);
 assert.equal(feel.teammateInDirection(from,[near],{x:0,y:0},1300,[marked]),null);
 assert.equal(feel.teammateInDirection(from,[near],{x:1,y:0},28,[marked]),null);
});
test('both human outfield and directed goalkeeper passes provide rival positions',()=>{
 assert.match(engine,/teammateInDirection\(p,mates,heading,long\?1650:1150,this\.players\.filter\(q=>q\.t!==p\.t\)\)/);
 assert.match(engine,/teammateInDirection\(carrier,this\.players\.filter\(q=>q\.t===carrier\.t&&q!==carrier&&q\.stun<=0\),heading,long\?1650:1150,this\.players\.filter\(q=>q\.t!==carrier\.t\)\)/);
 assert.match(engine,/this\.ball\.passTarget=target\?\.src\.id\|\|null/);
});

test('moving defenders influence directed pass interception without changing stationary lanes',()=>{
 const incoming={x:275,y:60,vx:0,vy:-300};
 const departing={x:275,y:60,vx:0,vy:300};
 assert.equal(choose(undefined,[incoming]),open,'closing defender makes straight lane less safe');
 assert.equal(choose(undefined,[departing]),near,'departing defender should not block straight pass');
 assert.equal(choose(undefined,[{...incoming,vx:Infinity,vy:NaN}]),near,'nonfinite motion must be ignored');
});


test('two independent lane blockers add bounded interception risk',()=>{
 const instrumented=source.slice(start,end).replace('teammateInDirection};','teammateInDirection,passingLanePressure};');
 const lanes=vm.runInNewContext(instrumented+';SHOTFEEL');
 const target={x:400,y:0},one={x:180,y:0},two={x:270,y:0};
 const first=lanes.passingLanePressure(from,target,[one]);
 const doubled=lanes.passingLanePressure(from,target,[one,two]);
 assert.ok(doubled>first,'a second distinct blocker raises risk');
 assert.ok(doubled<=.32,'combined pressure remains bounded');
 assert.equal(lanes.passingLanePressure(from,target,[one,{...two,stun:1}]),first,'stunned defender adds no risk');
 assert.equal(lanes.passingLanePressure(from,target,[one,{x:NaN,y:0}]),first,'invalid defender adds no risk');
});


test('defenders near either end of a short pass are real interception threats',()=>{
 const instrumented=source.slice(start,end).replace('teammateInDirection};','teammateInDirection,passingLanePressure};');
 const lanes=vm.runInNewContext(instrumented+';SHOTFEEL');
 const target={x:400,y:0};
 assert.ok(lanes.passingLanePressure(from,target,[{x:30,y:0}])>.1,'defender 7.5% along lane can intercept');
 assert.ok(lanes.passingLanePressure(from,target,[{x:385,y:0}])>.1,'defender near receiver can intercept');
 assert.equal(lanes.passingLanePressure(from,target,[{x:8,y:0}]),0,'defender at passer feet is not a forward lane blocker');
 assert.equal(lanes.passingLanePressure(from,target,[{x:30,y:100}]),0,'wide defender is not a blocker');
});

test('longer passes allow more defender closing time while short passes stay responsive',()=>{
 const instrumented=source.slice(start,end).replace('teammateInDirection};','teammateInDirection,passingLanePressure};');
 const lanes=vm.runInNewContext(instrumented+';SHOTFEEL');
 const approaching={x:160,y:65,vx:0,vy:-130};
 const shortRisk=lanes.passingLanePressure(from,{x:320,y:0},[approaching]);
 const longRisk=lanes.passingLanePressure(from,{x:1100,y:0},[approaching]);
 assert.ok(longRisk>shortRisk,'longer flight lets a moving defender close the passing lane');
 assert.equal(lanes.passingLanePressure(from,{x:1100,y:0},[{...approaching,stun:1}]),0);
 assert.ok(Number.isFinite(lanes.passingLanePressure(from,{x:1100,y:0},[{...approaching,vy:Infinity}])));
});

test('fast defender crossing the whole pass lane remains an interception risk',()=>{
 const instrumented=source.slice(start,end).replace('teammateInDirection};','teammateInDirection,passingLanePressure};');
 const lanes=vm.runInNewContext(instrumented+';SHOTFEEL');
 const target={x:400,y:0};
 const crossing={x:200,y:-20,vx:0,vy:600};
 const risk=lanes.passingLanePressure(from,target,[crossing]);
 assert.ok(risk>=.19,'swept crossing must count even when endpoint sampling underestimates the crossing');
 assert.equal(lanes.passingLanePressure(from,target,[{...crossing,stun:1}]),0);
 assert.equal(lanes.passingLanePressure(from,target,[{...crossing,x:600}]),0,'crossing beyond receiver cannot intercept');
 assert.ok(lanes.passingLanePressure(from,target,[{...crossing,vy:Infinity}])<risk,'invalid velocity cannot create phantom crossing');
});

test('tackles and slides choose forward targets without snapping backwards',()=>{
 const segment=engine.match(/const mx=Number\.isFinite\(p\.dx\)[\s\S]*?const target=inArc\(owner\)\?owner:near\.filter\(inArc\)\.sort\(\(a,b\)=>distance\(p,a\)-distance\(p,b\)\)\[0\];/);
 assert.ok(segment,'production tackle targeting is present');
 const select=vm.runInNewContext('(p,near,owner)=>{const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);'+segment[0]+'return target;}');
 const p={x:0,y:0,face:1,dx:0,dy:0},back={x:-20,y:0},front={x:90,y:0},side={x:80,y:25};
 assert.equal(select(p,[back,front],null),front,'nearer opponent behind is not selected');
 assert.equal(select(p,[back],null),undefined,'no backward auto-lock');
 assert.equal(select(p,[back,side],front),front,'forward carrier is preferred');
 assert.equal(select({...p,face:-1},[back,front],null),back,'left facing selects left');
 assert.equal(select({...p,dx:-1},[back,front],null),back,'movement heading overrides idle facing');
 assert.equal(select(p,[{x:Infinity,y:0},front],null),front,'invalid positions cannot become targets');
});
