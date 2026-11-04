'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');
function navigationHarness(){
 const centers=[[100,100],[300,100],[100,180],[300,180]];
 let active=0;
 const items=centers.map(([x,y],index)=>({
  getBoundingClientRect:()=>({left:x-40,top:y-20,width:80,height:40}),
  focus:()=>{active=index;},scrollIntoView:()=>{}
 }));
 const context={menuButtons:()=>items,document:{get activeElement(){return items[active];}}};
 const start=ui.indexOf('function navigateMenu('),end=ui.indexOf('\nfunction closeNestedMenuLayer',start);
 assert.ok(start>=0&&end>start,'menu spatial navigation function exists');
 vm.runInNewContext(ui.slice(start,end),context);
 return {items,move:context.navigateMenu,active:()=>active};
}

test('VIZ-02 arrow navigation follows spatial rows and columns in either direction',()=>{
 const nav=navigationHarness();
 nav.move(true,1);assert.equal(nav.active(),1,'Right moves to adjacent card in the same row');
 nav.move(true,-1);assert.equal(nav.active(),0,'Left returns to the card in the same row');
 nav.move(false,1);assert.equal(nav.active(),2,'Down follows the nearer item in the next row');
 nav.move(false,-1);assert.equal(nav.active(),0,'Up returns to the item above');
});

test('VIZ-02 keyboard handler routes all four arrows through spatial focus',()=>{
 assert.match(ui,/e\.code==='ArrowDown'\|\|e\.code==='ArrowUp'\|\|e\.code==='ArrowLeft'\|\|e\.code==='ArrowRight'/);
 assert.match(ui,/navigateMenu\(e\.code==='ArrowLeft'\|\|e\.code==='ArrowRight',e\.code==='ArrowRight'\|\|e\.code==='ArrowDown'\?1:-1\)/);
});

function gamepadHarness(){
 const centers=[[100,100],[300,100],[100,180],[300,180]];
 let active=0,activations=0,backs=0;
 const items=centers.map(([x,y],index)=>({
  getBoundingClientRect:()=>({left:x-40,top:y-20,width:80,height:40}),
  focus:()=>{active=index;},scrollIntoView:()=>{},click:()=>{activations++;}
 }));
 const pad={buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0]};
 const context={menuButtons:()=>items,document:{get activeElement(){return items[active];}},
  navigator:{getGamepads:()=>[pad]},menuVisible:()=>true,screen:'nav-settings',studioGamepadScreens:new Set(),
  primaryNavScreens:new Set(['nav-settings']),backFromMenu:()=>{backs++;}};
 const navStart=ui.indexOf('function navigateMenu('),navEnd=ui.indexOf('\nfunction closeNestedMenuLayer',navStart);
 const padStart=ui.indexOf('let lastPadNav=0,padWas={};'),padEnd=ui.indexOf("\nmenu.addEventListener('change'",padStart);
 assert.ok(navStart>=0&&navEnd>navStart&&padStart>=0&&padEnd>padStart,'navigation and gamepad polling helpers exist');
 vm.runInNewContext(ui.slice(navStart,navEnd)+'\n'+ui.slice(padStart,padEnd)+'\nthis.pollMenuPad=pollMenuPad;',context);
 return {pad,context,active:()=>active,activations:()=>activations,backs:()=>backs,poll:now=>context.pollMenuPad(now)};
}

test('VIZ-02 gamepad D-pad and analog stick move focus in both axes with repeat guard',()=>{
 const h=gamepadHarness();
 h.pad.buttons[15].pressed=true;h.poll(200);assert.equal(h.active(),1,'D-pad Right moves across the row');
 h.poll(300);assert.equal(h.active(),1,'held D-pad does not repeat before 180 ms');
 h.pad.buttons[15].pressed=false;h.pad.buttons[14].pressed=true;h.poll(450);assert.equal(h.active(),0,'D-pad Left returns across the row');
 h.pad.buttons[14].pressed=false;h.pad.axes[0]=.8;h.poll(700);assert.equal(h.active(),1,'right stick axis moves focus right');
 h.pad.axes[0]=-.8;h.poll(950);assert.equal(h.active(),0,'left stick axis moves focus left');
 h.pad.axes[0]=0;h.pad.axes[1]=.8;h.poll(1200);assert.equal(h.active(),2,'down stick axis retains the vertical call signature');
 h.pad.axes[1]=-.8;h.poll(1450);assert.equal(h.active(),0,'up stick axis moves focus back');
 h.pad.axes[1]=0;h.pad.buttons[0].pressed=true;h.poll(1700);assert.equal(h.activations(),1,'gamepad A activates the selected item');
 h.pad.buttons[0].pressed=false;h.poll(1750);h.pad.buttons[1].pressed=true;h.poll(1800);assert.equal(h.backs(),1,'gamepad B retains Back behavior');
});
