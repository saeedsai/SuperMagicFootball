'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

function makeElement(act){
 const listeners=new Map();
 return {
  dataset:{act},listeners,style:{},classList:{toggle(){}},
  addEventListener(type,callback){const handlers=listeners.get(type)||[];handlers.push(callback);listeners.set(type,handlers);},
  closest(selector){return selector==='[data-act]'&&act?this:null;},
  setPointerCapture(){},
  getBoundingClientRect(){return {left:0,top:0,width:100,height:100};},
  emit(type,extra={}){for(const callback of listeners.get(type)||[])callback({type,pointerId:1,timeStamp:0,detail:0,clientX:50,clientY:50,preventDefault(){},...extra});},
 };
}

async function setup(t){
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldNavigator=globalThis.navigator;
 const windowEvents=new Map(),elements=new Map([
  ['joyZone',makeElement()],['joyKnob',makeElement()],
  ...['pass','shoot','dribble','jump'].map(action=>[action,makeElement(action)]),
 ]);
 globalThis.window={addEventListener:(name,callback)=>windowEvents.set(name,callback)};
 globalThis.document={hidden:false,addEventListener(){},querySelector:selector=>elements.get(selector.slice(1))||null,
  querySelectorAll:selector=>selector==='[data-act]'?['pass','shoot','dribble','jump'].map(action=>elements.get(action)):[]};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[]}});
 const {INPUT}=await import('../src/modules/input.js');
 const {Input}=INPUT;
 const input=new Input();
 t.after(()=>{
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
  if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
  if(oldNavigator===undefined)delete globalThis.navigator;
  else Object.defineProperty(globalThis,'navigator',{configurable:true,value:oldNavigator});
 });
 return {input,shoot:elements.get('shoot'),key:(type,code,target)=>windowEvents.get(type)?.({type,code,target,timeStamp:10,preventDefault(){}})};
}

test('keyboard or assistive click on a focused action button reaches the match input once',async t=>{
 const {input,shoot,key}=await setup(t);

 // Space activates a focused native button. It must not also leak through the
 // global default Jump binding; Enter and virtual screen-reader activation
 // likewise emit click with detail 0 and no pointer sequence.
 key('keydown','Space',shoot);
 key('keyup','Space',shoot);
 shoot.emit('click',{detail:0});
 input.poll();
 assert.equal(input.just(0,'shoot'),true);
 assert.equal(input.just(0,'jump'),false,'focused Space activation must not also trigger the global Jump binding');
 assert.equal(input.released(0,'shoot'),true);
 assert.equal(input.held(0,'shoot'),true,'tap pulse is visible for the action frame');
 input.poll();
 assert.equal(input.just(0,'shoot'),false,'one activation dispatches one action pulse');
 assert.equal(input.held(0,'shoot'),false,'activation does not leave a stuck action held');
});

test('pointer taps do not get replayed by their synthesized click event',async t=>{
 const {input,shoot}=await setup(t);

 shoot.emit('pointerdown',{pointerId:7,timeStamp:100,detail:1});
 shoot.emit('pointerup',{pointerId:7,timeStamp:120,detail:1});
 shoot.emit('click',{detail:0});
 input.poll();
 assert.equal(input.just(0,'shoot'),true);
 input.poll();
 assert.equal(input.just(0,'shoot'),false,'pointer plus click remains exactly one action');
});
