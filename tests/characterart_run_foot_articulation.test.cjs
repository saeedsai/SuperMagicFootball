// Character-art gait detailing stays ankle-anchored and renderer-only.
const test=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

const modulePath=path.resolve(__dirname,'../src/modules/characterart.js');
const artPromise=import(pathToFileURL(modulePath).href);
const team=Object.freeze({primary:'#2769c0',secondary:'#f5f2e8',trim:'#ffc14b'});
const appearance=Object.freeze({face:1,beard:0,style:2,eyes:3,brows:4,eyeColor:2,nose:1,lips:1,skin:'#af7957',hair:'#503a2b'});

function traceCanvas(){
 const events=[];let depth=0;
 const c={
  createLinearGradient(){return {addColorStop(){}}},
  save(){depth++;events.push(['save'])},restore(){depth--;events.push(['restore'])},
  beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},ellipse(){},roundRect(){},fill(){},stroke(){},closePath(){},clip(){},fillText(){},strokeText(){},
  translate(x,y){events.push(['translate',x,y])},rotate(r){events.push(['rotate',r])},scale(x,y){events.push(['scale',x,y])}
 };
 return {c,events,depth:()=>depth};
}
const player=Object.freeze({src:Object.freeze({num:10}),action:'run',keeper:false,i:4});
const views=[['front',1],['quarterFront',1],['side',1],['front',-1],['quarterFront',-1],['side',-1]];

test('swing toe-off flex alternates across front, quarter and profile and mirrors its facing',async()=>{
 const {CHARACTER_ART:art}=await artPromise;
 for(const [kind,facing] of views){
  for(const phase of [Math.PI/2,Math.PI*1.5]){
   const {c,events,depth}=traceCanvas();
   art.draw(c,player,appearance,team,{kind,side:facing},{run:Math.sin(phase),runPhase:phase,runSpeedRatio:1,locomotion:true,reducedFlash:true});
   assert.equal(depth(),0,`${kind}/${facing}/${phase}: balanced canvas stack`);
   const rotations=events.map((e,i)=>e[0]==='rotate'&&Math.abs(e[1])>.01?{angle:e[1],i}:null).filter(Boolean);
   assert.equal(rotations.length,1,`${kind}/${facing}/${phase}: only the swing shoe flexes`);
   const {angle,i}=rotations[0];
   const before=events[i-1],after=events[i+1],pivot=events[i-2];
   assert.equal(before[0],'translate',`${kind}: rotate around ankle`);
   assert.equal(after[0],'translate',`${kind}: restore local shoe origin`);
   assert.equal(pivot[0],'save',`${kind}: ankle pivot is isolated in a local canvas save`);
   assert.equal(before[1],-after[1],`${kind}: inverse pivot x`);
   assert.equal(before[2],-after[2],`${kind}: inverse pivot y`);
   assert.ok(Math.abs(angle)<=.14+1e-9,'toe flex remains bounded');
   const expected=kind==='side'?-facing:(phase<Math.PI?-facing:facing);
   assert.equal(Math.sign(angle),expected,`${kind}: mirrored facing reverses shoe pitch`);
  }
 }
});

test('planted boots remain level; stationary, action, and invalid phases add no shoe rotation',async()=>{
 const {CHARACTER_ART:art}=await artPromise;
 assert.equal(art.runToePitch(Math.PI*1.5,1,1),0);
 assert.equal(art.runToePitch(Math.PI/2,0,1),0);
 assert.equal(art.runToePitch(NaN,1,1),0);
 for(const opt of [
  {runPhase:Math.PI/2,runSpeedRatio:1,locomotion:false},
  {runPhase:Math.PI/2,runSpeedRatio:1,locomotion:true,kick:true},
 ]){
  const {c,events}=traceCanvas();
  art.draw(c,player,appearance,team,{kind:'front',side:1},opt);
  assert.equal(events.filter(e=>e[0]==='rotate'&&Math.abs(e[1])>.01).length,0);
 }
});

test('running arms counter-swing against their same-side legs and mirror cleanly',async()=>{
 const {CHARACTER_ART:art}=await artPromise;
 for(const stride of [-1,-.5,0,.5,1]){
  assert.equal(art.runArmSwing(stride,1),-stride*12,'near limb counter-swing');
  assert.equal(art.runArmSwing(stride,-1),stride*12,'far limb counter-swing');
  assert.equal(art.runArmSwing(stride,-1),-art.runArmSwing(stride,1),'limbs mirror across the stride');
 }
 for(const invalid of [NaN,Infinity,'not-a-phase',undefined])assert.equal(art.runArmSwing(invalid,1),0);
 assert.equal(art.runArmSwing(9,1),-12,'counter-swing stays bounded at bad caller inputs');
});

test('gait paint leaves frozen player, appearance, team and input options untouched',async()=>{
 const {CHARACTER_ART:art}=await artPromise;
 const options=Object.freeze({run:1,runPhase:Math.PI/2,runSpeedRatio:.8,locomotion:true,reducedFlash:true});
 const {c}=traceCanvas();
 assert.doesNotThrow(()=>art.draw(c,player,appearance,team,{kind:'quarterFront',side:-1},options));
 assert.equal(player.action,'run');
 assert.equal(player.src.num,10);
 assert.equal(options.runPhase,Math.PI/2);
});
