'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

function makeElement(act){
 const handlers={};
 return {dataset:{act},handlers,style:{},classList:{toggle(){}},
  addEventListener(type,fn){(handlers[type]??=[]).push(fn);},
  setPointerCapture(){},getBoundingClientRect(){return{left:0,top:0,width:100,height:100};},
  emit(type,fields={}){for(const fn of handlers[type]||[])fn({type,pointerId:fields.pointerId??1,
   timeStamp:fields.timeStamp??100,clientX:fields.clientX??50,clientY:fields.clientY??50,
   preventDefault(){}});}};
}

function browserInputSurface(){
 const windowHandlers=new Map(),documentHandlers=new Map(),buttons=['pass','shoot','dribble','jump'].map(makeElement);
 const byAction=new Map(buttons.map(button=>[button.dataset.act,button]));
 const zone=makeElement('joyZone'),knob={style:{}};let pads=[];
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 globalThis.window={addEventListener(type,fn){const list=windowHandlers.get(type)||[];list.push(fn);windowHandlers.set(type,list);}};
 globalThis.document={hidden:false,addEventListener(type,fn){const list=documentHandlers.get(type)||[];list.push(fn);documentHandlers.set(type,list);},
  querySelector(selector){return selector==='#joyZone'?zone:selector==='#joyKnob'?knob:null;},
  querySelectorAll(selector){return selector==='[data-act]'?buttons:[];}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>pads}});
 return {buttons,byAction,zone,windowHandlers,setPads(value){pads=value;},
  key(type,code,timeStamp=100){for(const fn of windowHandlers.get(type)||[])fn({type,code,timeStamp,target:{},preventDefault(){}});},
  restore(){if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
   if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
   if(oldNavigator)Object.defineProperty(globalThis,'navigator',oldNavigator);else delete globalThis.navigator;}};
}

test('real keyboard, touch and gamepad Jump+Shoot input reaches field Super Defence activation',async()=>{
 const {Input}=await import('../src/input.js');
 const {GameEngine}=await import('../src/engine.js');
 const {DEFAULT_OPTIONS}=await import('../src/data.js');
 for(const source of ['keyboard','touch','gamepad']){
  const surface=browserInputSurface();
  try{
   const input=new Input(),game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
   game.init({home:0,away:9,humans:1,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
   game.cooldown=0;game.driveAI=()=>{};
   const defender=game.player(0,3);
   defender.src={...defender.src,role:'DF',superAbility:{type:'defence',id:'burst',level:2},superDefenceLevel:2};
   Object.assign(defender,{x:1600,y:760,cd:0,stun:0,fatigue:0,abilityCd:0});
   game.controlled[0]=defender.i;
   Object.assign(game.ball,{owner:null,x:2550,y:340,z:0,vx:0,vy:0,vz:0,attacker:1,shot:null,canCollect:0});
   for(const p of game.players)if(p!==defender){p.x=p.t===0?390:3300;p.y=350;}
   const target=game.players.find(p=>p.t===1&&!p.keeper);
   Object.assign(target,{x:defender.x+70,y:defender.y,stun:0,invuln:0,z:0,dashTimer:0});
   if(source==='keyboard'){
    surface.key('keydown','Space',100);surface.key('keydown','KeyJ',101);
   }else if(source==='touch'){
    surface.byAction.get('jump').emit('pointerdown',{pointerId:1,timeStamp:100});
    surface.byAction.get('shoot').emit('pointerdown',{pointerId:2,timeStamp:101});
   }else{
    const buttons=Array.from({length:16},(_,i)=>({pressed:i===0||i===3}));
    surface.setPads([{buttons,axes:[0,0]}]);
   }
   game.update(1/60);
   const activation=game.events.find(event=>event.type==='defenceSuper'&&event.id==='burst');
   assert.ok(activation,`${source}: actual engine must emit the equipped Super Defence event`);
   assert.equal(activation.team,0,`${source}: activation belongs to the human-controlled team`);
   assert.equal(activation.hits,1,`${source}: the bounded burst must hit its nearby target`);
   assert.equal(defender.action,'defenceSuper',`${source}: existing move action is applied`);
   assert.ok(defender.abilityCd>8,`${source}: configured cooldown is applied`);
   assert.ok(defender.fatigue>0,`${source}: existing stamina/fatigue cost is applied`);
   assert.ok(target.stun>0,`${source}: target receives the configured stagger`);
  }finally{surface.restore();}
 }
});
