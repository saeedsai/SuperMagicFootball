'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');

function makeElement(act){
 const handlers={};
 return {dataset:{act},handlers,style:{},classList:{toggle(){}},
  addEventListener(type,fn){(handlers[type]??=[]).push(fn);},
  setPointerCapture(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100};},
  emit(type,fields={}){for(const fn of handlers[type]||[])fn({type,pointerId:fields.pointerId??1,
   timeStamp:fields.timeStamp??100,clientX:fields.clientX??50,clientY:fields.clientY??50,preventDefault(){}});}};
}

function browserInputSurface(){
 const windowHandlers=new Map(),documentHandlers=new Map();
 const buttons=['pass','shoot','dribble','jump'].map(makeElement);
 const byAction=new Map(buttons.map(button=>[button.dataset.act,button]));
 const zone=makeElement('joyZone'),knob={style:{}};let pads=[];
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 globalThis.window={addEventListener(type,fn){const list=windowHandlers.get(type)||[];list.push(fn);windowHandlers.set(type,list);}};
 globalThis.document={hidden:false,addEventListener(type,fn){const list=documentHandlers.get(type)||[];list.push(fn);documentHandlers.set(type,list);},
  querySelector(selector){return selector==='#joyZone'?zone:selector==='#joyKnob'?knob:null;},
  querySelectorAll(selector){return selector==='[data-act]'?buttons:[];}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>pads}});
 return {byAction,windowHandlers,setPads(value){pads=value;},
  key(type,code,timeStamp=100){for(const fn of windowHandlers.get(type)||[])fn({type,code,timeStamp,target:{},preventDefault(){}});},
  restore(){if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
   if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
   if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;}};
}

test('real keyboard DRIBBLE hold reaches equipped Magic Trick after one second',async()=>{
 const surface=browserInputSurface();
 const oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(url),'utf8'))});
  const {loadAssets}=await import('../src/assets.js');
  await loadAssets();
  const [{INPUT},{ENGINE},{DATA}]=await Promise.all([
   import('../src/modules/input.js'),import('../src/modules/engine.js'),import('../src/modules/data.js')
  ]);
  const input=new INPUT.Input(),game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},input);
  game.init({home:0,away:9,humans:1,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
  game.cooldown=0;game.clock=5;game.driveAI=()=>{};
  const player=game.player(0,3);
  player.src={...player.src,magicTrick:'spinBump',statsVerified:true,
   passing:90,crossing:90,dribbling:90,agility:90,stamina:90,speedRating:90};
  Object.assign(player,{x:1450,y:700,face:1,dx:0,dy:0,stun:0,z:0,fatigue:0,breath:100,magicReadyAt:0});
  for(const rival of game.players)if(rival!==player){rival.x=rival.t===0?350:3200;rival.y=350;}
  game.take(player);game.controlled[0]=player.i;
  const countMagic=()=>game.events.filter(event=>event.type==='magicTrick'&&event.trick==='spinBump').length;

  surface.key('keydown','KeyI',100);
  for(let frame=0;frame<28;frame++)game.update(1/30);
  assert.ok(Math.abs(player.dribbleHold-28/30)<1e-9,'held action accumulates continuously from the real Input poll');
  assert.equal(countMagic(),0,'the equipped trick does not activate before one second');
  for(let frame=0;frame<5;frame++)game.update(1/30);
  assert.equal(countMagic(),1,'the real GameEngine activates the equipped trick at the one-second hold threshold');
  assert.equal(player.magicHoldLatched,true,'a continuous hold is latched after one attempt');
  for(let frame=0;frame<20;frame++)game.update(1/30);
  assert.equal(countMagic(),1,'a sustained hold cannot retrigger before release');
  assert.equal(game.ball.owner,player,'Magic Trick activation preserves possession');
  assert.ok(player.magicReadyAt>game.clock,'activation applies the normal Magic Trick cooldown');
  surface.key('keyup','KeyI',1100);
  game.update(1/30);
  assert.equal(input.held(0,'dribble'),false,'keyboard release reaches the real Input state');
  assert.equal(player.magicHoldLatched,false,'release rearms the next deliberate hold');
 }finally{globalThis.fetch=oldFetch;surface.restore();}
});

test('real touch and gamepad DRIBBLE holds reach the same equipped Magic Trick path',async()=>{
 const surface=browserInputSurface(),oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(url),'utf8'))});
  const {loadAssets}=await import('../src/assets.js');await loadAssets();
  const [{INPUT},{ENGINE},{DATA}]=await Promise.all([
   import('../src/modules/input.js'),import('../src/modules/engine.js'),import('../src/modules/data.js')
  ]);
  for(const source of ['touch','gamepad']){
   const input=new INPUT.Input(),game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},input);
   game.init({home:0,away:9,humans:1,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
   game.cooldown=0;game.clock=5;game.driveAI=()=>{};
   const player=game.player(0,3);
   player.src={...player.src,magicTrick:'spinBump',statsVerified:true,
    passing:90,crossing:90,dribbling:90,agility:90,stamina:90,speedRating:90};
   Object.assign(player,{x:1450,y:700,face:1,dx:0,dy:0,stun:0,z:0,fatigue:0,breath:100,magicReadyAt:0});
   for(const rival of game.players)if(rival!==player){rival.x=rival.t===0?350:3200;rival.y=350;}
   game.take(player);game.controlled[0]=player.i;
   if(source==='touch')surface.byAction.get('dribble').emit('pointerdown',{pointerId:21,timeStamp:100});
   else {const buttons=Array.from({length:16},(_,i)=>({pressed:i===2}));surface.setPads([{buttons,axes:[0,0]}]);}
   for(let frame=0;frame<35;frame++)game.update(1/30);
   const events=game.events.filter(event=>event.type==='magicTrick'&&event.trick==='spinBump');
   assert.equal(events.length,1,`${source}: one-second held DRIBBLE activates exactly once`);
   assert.equal(player.magicHoldLatched,true,`${source}: continuous hold stays latched`);
   assert.equal(game.ball.owner,player,`${source}: trick preserves ball possession`);
   if(source==='touch')surface.byAction.get('dribble').emit('pointerup',{pointerId:21,timeStamp:1300});
   else surface.setPads([{buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0]}]);
   game.update(1/30);
   assert.equal(input.held(0,'dribble'),false,`${source}: release reaches real Input state`);
   assert.equal(player.magicHoldLatched,false,`${source}: release rearms deliberate activation`);
   assert.ok(player.magicReadyAt>game.clock,`${source}: normal trick cooldown applies`);
  }
 }finally{globalThis.fetch=oldFetch;surface.restore();}
});
