'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');

async function setup(t,gamepadBindings){
 const oldWindow=globalThis.window,oldDocument=globalThis.document,oldNavigator=globalThis.navigator;
 const listeners=new Map(),buttons=Array.from({length:16},()=>({pressed:false}));
 globalThis.window={addEventListener:(name,callback)=>listeners.set(name,callback)};
 globalThis.document={addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{getGamepads:()=>[{buttons,axes:[0,0]}]}});
 t.after(()=>{
  if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;
  if(oldDocument===undefined)delete globalThis.document;else globalThis.document=oldDocument;
  if(oldNavigator===undefined)delete globalThis.navigator;
  else Object.defineProperty(globalThis,'navigator',{configurable:true,value:oldNavigator});
 });

 const [{Input},{GameEngine},{DEFAULT_OPTIONS}]=await Promise.all([
  import('../src/input.js'),import('../src/engine.js'),import('../src/data.js'),
 ]);
 const input=new Input();
 if(gamepadBindings)assert.equal(input.setBindings({
  keyboard:['KeyK','KeyJ','KeyI','Space'],gamepad:gamepadBindings,
 }),true,'valid remapped gamepad bindings should apply');
 const game=new GameEngine({...DEFAULT_OPTIONS,weather:'Clear'},input);
 game.init({home:0,away:9,options:{...DEFAULT_OPTIONS,weather:'Clear'}});
 game.cooldown=0;game.driveAI=()=>{};
 const player=game.player(0,3);
 game.take(player);game.controlled[0]=player.i;
 player.z=90;player.vz=140;player.jumpCount=1;player.cd=0;player.stun=0;
 player.fatigue=0;player.specialCd=0;
 const step=()=>{input.poll();game.updatePlayers(1/60);};
 const tap=button=>{buttons[button].pressed=true;step();buttons[button].pressed=false;step();};
 return {game,player,input,tap};
}

test('gamepad Y then A activates an equipped Super Shot through the four-button controls',async t=>{
 const {game,player,input,tap}=await setup(t);

 // Default gamepad actions are A=Shoot, B=Pass, X=Dribble and Y=Jump.
 tap(3);
 assert.equal(player.jumpCount,2,'Y must perform the available second jump');
 tap(0);

 assert.ok(game.ball.shot,'A after the second Y press should launch the equipped transformed shot');
 assert.equal(game.ball.shot.id,player.src.shot);
 assert.equal(player.action,'super');
 assert.equal(input.held(0,'shoot'),false,'released A leaves no stuck Shoot input');
 assert.equal(input.held(0,'jump'),false,'released Y leaves no stuck Jump input');
});

test('remapped gamepad Jump and Shoot still activate the equipped Super Shot',async t=>{
 const {game,player,tap}=await setup(t,[1,5,2,7]);

 // The action profile order is Pass, Shoot, Dribble, Jump.
 tap(7);
 assert.equal(player.jumpCount,2,'remapped Jump button must perform the second jump');
 tap(5);

 assert.ok(game.ball.shot,'remapped Shoot after Jump must use the same Super Shot route');
 assert.equal(game.ball.shot.id,player.src.shot);
 assert.equal(player.action,'super');
});
