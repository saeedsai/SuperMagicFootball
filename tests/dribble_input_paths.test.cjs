'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');

function makeElement(act){
 const handlers={};
 return {dataset:{act},handlers,style:{},classList:{toggle(){}},
  addEventListener(type,fn){(handlers[type]??=[]).push(fn);},setPointerCapture(){},
  getBoundingClientRect(){return{left:0,top:0,width:100,height:100};},
  emit(type,fields={}){for(const fn of handlers[type]||[])fn({type,pointerId:fields.pointerId??1,
   timeStamp:fields.timeStamp??100,clientX:fields.clientX??50,clientY:fields.clientY??50,preventDefault(){}});}};
}
function browserSurface(){
 const windowHandlers=new Map(),documentHandlers=new Map(),buttons=['pass','shoot','dribble','jump'].map(makeElement);
 const byAction=new Map(buttons.map(button=>[button.dataset.act,button]));
 const zone=makeElement('joyZone'),knob={style:{}},oldWindow=globalThis.window,oldDocument=globalThis.document;
 const oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');let pads=[];
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
function pad(dribble){return [{buttons:Array.from({length:16},(_,i)=>({pressed:dribble&&i===2})),axes:[0,0]}];}

test('Dribble style taps and held Magic Tricks reach the real engine through keyboard, touch, and gamepad',async()=>{
 const oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(url),'utf8'))});
  const {loadAssets}=await import('../src/assets.js');await loadAssets();
  const [{INPUT},{ENGINE},{DATA}]=await Promise.all([
   import('../src/modules/input.js'),import('../src/modules/engine.js'),import('../src/modules/data.js')
  ]);
  for(const source of ['keyboard','touch','gamepad']){
   const surface=browserSurface();
   try{
    const input=new INPUT.Input(),game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},input);
    game.init({home:0,away:9,humans:1,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
    game.cooldown=0;game.clock=5;game.driveAI=()=>{};
    const player=game.player(0,3);
    player.src={...player.src,dribbleType:'rainbow',magicTrick:'banana',dribbling:90,agility:90};
    Object.assign(player,{x:1500,y:700,face:1,dx:0,dy:0,stun:0,z:0,fatigue:0,breath:100,magicReadyAt:0});
    for(const rival of game.players)if(rival!==player){rival.x=rival.t===0?350:3200;rival.y=350;}
    const defender=game.players.find(q=>q.t===1&&!q.keeper);
    Object.assign(defender,{x:player.x+85,y:player.y,stun:0,z:0});
    game.take(player);game.controlled[0]=player.i;
    const tap=(down)=>{
     if(source==='keyboard')surface.key(down?'keydown':'keyup','KeyI');
     else if(source==='touch')surface.byAction.get('dribble').emit(down?'pointerdown':'pointerup',{pointerId:4,timeStamp:100+(down?0:80)});
     else surface.setPads(pad(down));
    };
    tap(true);game.update(1/60);
    assert.equal(player.action,'dribbleTrick',`${source}: one DRIBBLE press executes the equipped dribble style under pressure`);
    assert.equal(player.trickStyleId,'rainbow',`${source}: the equipped dribble style reaches the real trick resolver`);
    tap(false);game.update(1/60);
    player.dribbleCooldown=0;player.trickCd=0;player.cd=0;
    // The first press deliberately proves style activation while a defender
    // is close. The held Magic Trick needs a full second of possession, so
    // move that defender out of steal range to isolate the hold-input path.
    defender.x=player.x+600;
    tap(true);
    for(let frame=0;frame<70;frame++)game.update(1/60);
    const event=game.events.find(e=>e.type==='magicTrick'&&e.trick==='banana');
    assert.ok(event,`${source}: a continuous one-second DRIBBLE hold activates the equipped Magic Trick (hold=${player.dribbleHold}, owner=${game.ball.owner===player}, held=${input.held(0,'dribble')}, breath=${player.breath}, latched=${player.magicHoldLatched}, ready=${player.magicReadyAt}, clock=${game.clock})`);
    assert.equal(player.magicHoldLatched,true,`${source}: held activation fires once without a fifth action`);
    assert.equal(game.ball.owner,player,`${source}: trick activation preserves possession`);
    assert.ok(player.magicReadyAt>game.clock-1,`${source}: cooldown is applied`);
   }finally{surface.restore();}
  }
 }finally{if(oldFetch===undefined)delete globalThis.fetch;else globalThis.fetch=oldFetch;}
});
