'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

test('a reconnecting held gamepad waits for neutral and does not cancel keyboard input',async t=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldNavigator=globalThis.navigator,oldInput=globalThis.HTMLInputElement,oldSelect=globalThis.HTMLSelectElement;
 const windowEvents=new Map(),buttons=Array.from({length:16},()=>({pressed:false}));
 let pads=[{index:0,buttons,axes:[0,0]}];
 globalThis.HTMLInputElement=class HTMLInputElement{};
 globalThis.HTMLSelectElement=class HTMLSelectElement{};
 globalThis.window={addEventListener(name,callback){windowEvents.set(name,callback)}};
 globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return[]}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>pads}});
 t.after(()=>{
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
  if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
  if(oldNavigator===undefined)delete globalThis.navigator;else Object.defineProperty(globalThis,'navigator',{configurable:true,value:oldNavigator});
  if(oldInput===undefined)delete globalThis.HTMLInputElement;else globalThis.HTMLInputElement=oldInput;
  if(oldSelect===undefined)delete globalThis.HTMLSelectElement;else globalThis.HTMLSelectElement=oldSelect;
 });

 const {INPUT}=await import('../src/modules/input.js');
 const {Input}=INPUT;
 const input=new Input();
 windowEvents.get('keydown')({target:{},code:'Space',timeStamp:1,preventDefault(){}});
 buttons[1].pressed=true; // Default gamepad Pass.
 input.poll();
 assert.equal(input.held(0,'jump'),true);
 assert.equal(input.just(0,'pass'),true);

 windowEvents.get('gamepaddisconnected')({gamepad:{index:0}});
 pads=[null];buttons[1].pressed=false;
 input.poll();
 assert.equal(input.held(0,'pass'),false,'disconnect releases the gamepad action');
 assert.equal(input.held(0,'jump'),true,'disconnect leaves independent keyboard input intact');

 buttons[1].pressed=true;pads=[{index:0,buttons,axes:[0,0]}];
 input.poll();
 assert.equal(input.held(0,'pass'),false,'reconnected held button is not a synthetic fresh press');
 assert.equal(input.just(0,'pass'),false);
 assert.equal(input.held(0,'jump'),true);

 buttons[1].pressed=false;input.poll(); // Neutral poll rearms this controller.
 assert.equal(input.just(0,'pass'),false);
 buttons[1].pressed=true;input.poll();
 assert.equal(input.just(0,'pass'),true,'a fresh press after neutral is accepted');
});
