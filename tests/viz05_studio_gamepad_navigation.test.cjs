'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const ui=fs.readFileSync('src/modules/ui.js','utf8').replace(/\r\n/g,'\n');

function studioGamepadHarness(){
 let active=null,activations=0,backs=0;
 const controls=[
  {tagName:'BUTTON',id:'back',dataset:{action:'navCustomization'},disabled:false,offsetParent:{},getBoundingClientRect:()=>({left:0,top:0,width:80,height:32}),focus(){active=this;},scrollIntoView(){},click(){activations++;}},
  {tagName:'SELECT',id:'customPlayer',dataset:{},disabled:false,value:'0',options:[{value:'0',disabled:false,parentElement:null},{value:'1',disabled:false,parentElement:null},{value:'2',disabled:false,parentElement:null}],events:[],dispatchEvent(event){this.events.push(event.type);},offsetParent:{},getBoundingClientRect:()=>({left:100,top:0,width:100,height:32}),focus(){active=this;},scrollIntoView(){},click(){activations++;}},
  {tagName:'INPUT',type:'range',id:'studioGalleryPhase',dataset:{},disabled:false,value:'1',min:'0',max:'3',step:'1',events:[],stepUp(){this.value=String(Math.min(+this.max,+this.value+(+this.step||1)));},stepDown(){this.value=String(Math.max(+this.min,+this.value-(+this.step||1)));},dispatchEvent(event){this.events.push(event.type);},offsetParent:{},getBoundingClientRect:()=>({left:100,top:45,width:100,height:32}),focus(){active=this;},scrollIntoView(){},click(){activations++;}},
  {tagName:'BUTTON',id:'saveAppearance',dataset:{action:'saveAppearance'},disabled:false,offsetParent:{},getBoundingClientRect:()=>({left:220,top:0,width:100,height:32}),focus(){active=this;},scrollIntoView(){},click(){activations++;}},
  {tagName:'BUTTON',id:'hidden',dataset:{action:'hidden'},disabled:false,offsetParent:null,getBoundingClientRect:()=>({left:220,top:80,width:100,height:32}),focus(){active=this;},scrollIntoView(){},click(){activations++;}},
  {tagName:'BUTTON',id:'disabled',dataset:{action:'disabled'},disabled:true,offsetParent:{},getBoundingClientRect:()=>({left:220,top:160,width:100,height:32}),focus(){active=this;},scrollIntoView(){},click(){activations++;}},
 ];
 const menu={querySelectorAll(selector){return selector==='.navChoice'?controls.slice(0,1):controls;}};
 const pad={buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0]};
 const context={menu,screen:'PLAYER CUSTOMIZATION',menuVisible:()=>true,document:{get activeElement(){return active;}},
  navigator:{getGamepads:()=>[pad]},Event:function(type,options){this.type=type;this.bubbles=options?.bubbles;},primaryNavScreens:new Set(['home']),backFromMenu:()=>{backs++;}};
 const navStart=ui.indexOf('const primaryNavScreens='),navEnd=ui.indexOf('\nfunction closeNestedMenuLayer',navStart);
 const padStart=ui.indexOf('let lastPadNav=0,padWas={};'),padEnd=ui.indexOf("\nmenu.addEventListener('change'",padStart);
 assert.ok(navStart>=0&&navEnd>navStart&&padStart>=0&&padEnd>padStart,'menu focus and polling helpers exist');
 vm.runInNewContext(ui.slice(navStart,navEnd)+'\n'+ui.slice(padStart,padEnd)+'\nthis.pollMenuPad=pollMenuPad;this.menuButtons=menuButtons;',context);
 return {controls,pad,context,active:()=>active,activations:()=>activations,backs:()=>backs,poll:now=>context.pollMenuPad(now),targets:()=>context.menuButtons()};
}

test('VIZ-05 Player Studio gamepad adjusts focused selects and sliders and reaches save buttons',()=>{
 const h=studioGamepadHarness();
 assert.deepEqual(Array.from(h.targets(),item=>item.id),['back','customPlayer','studioGalleryPhase','saveAppearance'],'hidden and disabled form controls are skipped');
 h.poll(0);h.pad.buttons[15].pressed=true;h.poll(220);
 assert.equal(h.active().id,'customPlayer','D-pad navigation can focus a Player Studio selector');
 h.pad.buttons[15].pressed=false;h.poll(250);h.pad.buttons[15].pressed=true;h.poll(470);
 assert.equal(h.active().id,'customPlayer','left/right selection must retain selector focus');
 assert.equal(h.controls[1].value,'1','right changes the focused select value');
 assert.deepEqual(h.controls[1].events,['input','change'],'select changes dispatch the standard input/change events');
 h.pad.buttons[15].pressed=false;h.poll(500);h.pad.buttons[14].pressed=true;h.poll(720);
 assert.equal(h.controls[1].value,'0','left changes the focused select value back');
 h.pad.buttons[14].pressed=false;h.poll(750);h.pad.buttons[15].pressed=true;h.poll(970);
 assert.equal(h.controls[1].value,'1');
 h.pad.buttons[15].pressed=false;h.poll(1000);h.pad.buttons[15].pressed=true;h.poll(1220);
 assert.equal(h.controls[1].value,'2');
 h.pad.buttons[15].pressed=false;h.poll(1250);h.pad.buttons[0].pressed=true;h.poll(1300);
 assert.equal(h.activations(),1,'A activates the focused native selector');
 h.controls[2].focus();h.pad.buttons[0].pressed=false;h.poll(1330);h.pad.buttons[15].pressed=true;h.poll(1550);
 assert.equal(h.controls[2].value,'2','right adjusts the focused range by one step');
 assert.deepEqual(h.controls[2].events,['input','change'],'range updates dispatch standard input/change events');
 h.pad.buttons[15].pressed=false;h.poll(1580);h.pad.buttons[14].pressed=true;h.poll(1800);
 assert.equal(h.controls[2].value,'1','left adjusts the focused range by one step');
 h.pad.buttons[14].pressed=false;h.poll(1830);h.controls[1].focus();h.controls[1].value='2';h.pad.buttons[15].pressed=true;h.poll(2050);
 assert.equal(h.active().dataset.action,'saveAppearance','D-pad navigation can focus the appearance save button');
 h.pad.buttons[15].pressed=false;h.poll(2080);h.pad.buttons[0].pressed=true;h.poll(2300);
 assert.equal(h.activations(),2,'A activates the focused save button');
 h.pad.buttons[0].pressed=false;h.poll(2330);h.pad.buttons[1].pressed=true;h.poll(2550);
 assert.equal(h.backs(),1,'B retains the existing Back/discard flow');
});

test('VIZ-05 gamepad target expansion is limited to Studio screens and leaves match input polling untouched',()=>{
 const start=ui.indexOf('const primaryNavScreens='),end=ui.indexOf('\nfunction closeNestedMenuLayer',start);
 const source=ui.slice(start,end);
 assert.match(source,/studioGamepadScreens\.has\(screen\)/);
 assert.match(source,/button:not\(\[disabled\]\),select:not\(\[disabled\]\),input:not\(\[disabled\]\),textarea:not\(\[disabled\]\),summary/);
 assert.match(source,/return \[\.\.\.menu\.querySelectorAll\(selector\)\]\.filter\(el=>!el\.disabled&&el\.offsetParent!==null\)/);
 assert.ok(ui.includes("if(!menuVisible()){padWas={};return;}const pad=navigator.getGamepads?.()?.[0]"),'gamepad polling remains inside the menu loop and does not edit match input handling');
});
