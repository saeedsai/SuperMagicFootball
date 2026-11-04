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
function surface(){
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
function gamepadState(jump,shoot){
 const make=()=>({buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0]});
 const primary=make(),secondary=make();primary.buttons[3].pressed=jump;primary.buttons[0].pressed=shoot;
 secondary.buttons[3].pressed=jump;secondary.buttons[0].pressed=shoot;
 return [primary,secondary];
}

test('Super Shot Jump→Shoot sequence launches exactly once from keyboard, touch and both gamepad slots',async()=>{
 const oldFetch=globalThis.fetch;
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL(url),'utf8'))});
  const {loadAssets}=await import('../src/assets.js');await loadAssets();
  const [{INPUT},{ENGINE},{DATA}]=await Promise.all([
   import('../src/modules/input.js'),import('../src/modules/engine.js'),import('../src/modules/data.js')
  ]);
  const cases=[['keyboard',0],['keyboard',1],['touch',0],['gamepad',0],['gamepad',1]];
  for(const [source,team] of cases){
   const ui=surface();
   try{
    const input=new INPUT.Input(),game=new ENGINE.GameEngine({...DATA.DEFAULT_OPTIONS,weather:'Clear'},input);
    game.init({home:0,away:9,humans:source==='touch'?1:2,options:{...DATA.DEFAULT_OPTIONS,weather:'Clear'}});
    game.cooldown=0;game.clock=5;game.driveAI=()=>{};
    const player=game.player(team,3);
    player.src={...player.src,shot:'nuts',superAbility:{type:'shoot',id:'nuts',level:2},superShotLevel:2};
    Object.assign(player,{x:1600,y:700,z:0,vz:0,jumpCount:0,jumpHold:0,jumpTapPending:false,
     cd:0,stun:0,fatigue:0,breath:100,specialCd:0,charge:0,comboShotHeld:false});
    for(const q of game.players)if(q!==player){q.x=q.t===0?350:3300;q.y=350;}
    game.take(player);game.controlled[team]=player.i;
    const jumpKey=team===0?'Space':'ControlRight',shootKey=team===0?'KeyJ':'Comma';
    const activeActions=new Set();
    const padState=(jump,shoot)=>{
     const slots=Array.from({length:4},()=>({buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0]}));
     slots[team].buttons[3].pressed=jump;slots[team].buttons[0].pressed=shoot;return slots;
    };
    const set=(action,down)=>{
     if(source==='keyboard')ui.key(down?'keydown':'keyup',action==='jump'?jumpKey:shootKey);
     else if(source==='touch')ui.byAction.get(action).emit(down?'pointerdown':'pointerup',{pointerId:action==='jump'?1:2,timeStamp:100});
     else {if(down)activeActions.add(action);else activeActions.delete(action);
      ui.setPads(padState(activeActions.has('jump'),activeActions.has('shoot')));}
    };
    const step=(frames=1)=>{for(let i=0;i<frames;i++)game.update(1/60);};
    set('jump',true);step();set('jump',false);step();
    for(let i=0;i<24&&(player.z<=10||player.vz>275);i++)step();
    assert.equal(player.jumpCount,1,`${source}/team${team}: first Jump tap starts the aerial sequence`);
    assert.ok(player.z>10,`${source}/team${team}: first jump reaches the second-jump window`);
    set('jump',true);step();
    assert.equal(player.jumpCount,2,`${source}/team${team}: second Jump remains the existing four-button action`);
    set('shoot',true);step();
    const launch=game.events.filter(e=>e.type==='kick'&&e.super===true);
    assert.equal(launch.length,1,`${source}/team${team}: second Jump then Shoot launches one Super Shot (z=${player.z}, action=${player.action}, owner=${game.ball.owner===player}, heldJump=${input.held(team,'jump')}, heldShoot=${input.held(team,'shoot')}, events=${game.events.slice(-4).map(e=>e.type).join(',')})`);
    assert.ok(game.ball.shot,`${source}/team${team}: transformed shot exists`);
    assert.equal(game.ball.shot.id,'nuts');
    assert.equal(game.ball.attacker,team,`${source}/team${team}: shot ownership matches the controlling side`);
    assert.equal(game.ball.lastTouchTeam,team);
    assert.equal(game.ball.shooter,player.src.name);
    assert.ok(player.specialCd>=3.3,`${source}/team${team}: the actual Super Shot action applies its 3.4-second cooldown`);
    assert.ok(player.fatigue>0,`${source}/team${team}: the actual Super Shot action charges its existing stamina cost`);
    step(12);
    assert.equal(game.events.filter(e=>e.type==='kick'&&e.super===true).length,1,
     `${source}/team${team}: a held Shoot cannot duplicate the launch`);
    assert.equal(input.held(team,'jump'),true,'held second Jump remains the same existing action');
    assert.equal(input.held(team,'shoot'),true,'the held Shoot is represented by the same existing action');
   }finally{ui.restore();}
  }
  assert.match((await fs.readFile('src/modules/input.js','utf8')),/const REMAPPABLE_ACTIONS=\['pass','shoot','dribble','jump'\]/,
   'Super Shots use only the existing four actions');
 }finally{if(oldFetch===undefined)delete globalThis.fetch;else globalThis.fetch=oldFetch;}
});
