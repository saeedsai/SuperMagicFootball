'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');

function button(act){
 const handlers={};return{dataset:{act},handlers,classList:{toggle(){}},style:{},
  addEventListener(name,fn){(handlers[name]??=[]).push(fn);},
  setPointerCapture(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100};},
  fire(name,fields={}){for(const fn of handlers[name]||[])fn({type:name,pointerId:fields.pointerId??1,
   timeStamp:fields.timeStamp??100,clientX:fields.clientX??50,clientY:fields.clientY??50,
   preventDefault(){}});}};
}
function inputSurface(){
 const windowHandlers=new Map(),documentHandlers=new Map(),buttons=['pass','shoot','dribble','jump'].map(button);
 const byAction=new Map(buttons.map(b=>[b.dataset.act,b])),zone=button('joyZone'),knob={style:{}};
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 globalThis.window={addEventListener(name,fn){const a=windowHandlers.get(name)||[];a.push(fn);windowHandlers.set(name,a);}};
 globalThis.document={hidden:false,addEventListener(name,fn){const a=documentHandlers.get(name)||[];a.push(fn);documentHandlers.set(name,a);},
  querySelector(sel){return sel==='#joyZone'?zone:sel==='#joyKnob'?knob:null;},
  querySelectorAll(sel){return sel==='[data-act]'?buttons:[];}};
 let pads=[];Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>pads}});
 return{buttons,byAction,windowHandlers,setPads(v){pads=v;},key(name,code,timeStamp){for(const fn of windowHandlers.get(name)||[])fn({type:name,code,timeStamp,target:{},preventDefault(){}});},
  restore(){if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
   if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
   if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;}};
}
async function runtime(){
 const previousFetch=globalThis.fetch;
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(url),'utf8'))});
 try{
  const {loadAssets}=await import('../src/assets.js');await loadAssets();
  const [{ENGINE},{DATA},{INPUT}]=await Promise.all([import('../src/modules/engine.js'),import('../src/modules/data.js'),import('../src/modules/input.js')]);
  return{ENGINE,DATA,INPUT,restore(){if(previousFetch===undefined)delete globalThis.fetch;else globalThis.fetch=previousFetch;}};
 }catch(error){if(previousFetch===undefined)delete globalThis.fetch;else globalThis.fetch=previousFetch;throw error;}
}

test('keeper Super Defence Jump+Shoot activates through keyboard, touch, and default/remapped gamepad',async()=>{
 const {ENGINE,DATA,INPUT,restore}=await runtime();
 const cases=['keyboard','touch','gamepad','remapped-gamepad'];
 try{
  for(const source of cases){
   const surface=inputSurface();
   try{
    const input=new INPUT.Input(),options={...DATA.DEFAULT_OPTIONS,weather:'Clear'};
    if(source==='remapped-gamepad')assert.equal(input.setBindings({keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:[1,5,2,7],keyboard2:['Period','Comma','NumpadDecimal','ControlRight'],gamepad2:[1,0,2,3]}),true);
    const game=new ENGINE.GameEngine(options,input);game.init({home:0,away:9,humans:1,options});
    game.cooldown=0;game.matchState='play';game.driveAI=()=>{};
    const keeper=game.player(0,0);keeper.src={...keeper.src,gkSuperAbility:{type:'defence',id:'megaPalm',level:1},gkSuperLevel:1};
    Object.assign(keeper,{x:ENGINE.WORLD.field.x+34,y:350,cd:0,stun:0,fatigue:0,breath:100,abilityCd:0,z:0,vz:0});
    game.controlled[0]=keeper.i;
    Object.assign(game.ball,{owner:null,attacker:1,x:keeper.x+55,y:keeper.y,z:18,vx:-350,vy:0,vz:0,power:12,shot:null,canCollect:0});
    for(const p of game.players)if(p!==keeper){p.x=p.t===0?700:2600;p.y=650;}
    if(source==='keyboard'){
     surface.key('keydown','Space',100);surface.key('keydown','KeyJ',101);
    }else if(source==='touch'){
     surface.byAction.get('jump').fire('pointerdown',{pointerId:1,timeStamp:100});
     surface.byAction.get('shoot').fire('pointerdown',{pointerId:2,timeStamp:101});
    }else{
     const pad=Array.from({length:16},(_,i)=>({pressed:i===(source==='remapped-gamepad'?7:3)||i===(source==='remapped-gamepad'?5:0)}));
     surface.setPads([{buttons:pad,axes:[0,0]}]);
    }
    game.update(1/60);
    const event=game.events.find(e=>e.type==='keeperSuper'&&e.player===keeper.src.name);
    assert.ok(event,`${source}: keeper Super Defence should activate from the existing Jump+Shoot action`);
    assert.equal(event.id,'megaPalm');assert.equal(event.manual,true);
    assert.equal(keeper.action,'keeperSuper');assert.ok(keeper.abilityCd>8);
    assert.equal(game.ball.attacker,0);assert.ok(game.ball.vx>0,'clear travels safely away from team 0 goal');
    assert.deepEqual(input.getBindings().keyboard,['KeyK','KeyJ','KeyI','Space']);
    assert.deepEqual(input.getBindings().keyboard2,['Period','Comma','NumpadDecimal','ControlRight']);
   }finally{surface.restore();}
  }
 }finally{restore();}
});
